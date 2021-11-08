import "module-alias/register"

import { format } from "path"

import chargebee from "chargebee"
import { groupBy, orderBy, uniqBy } from "lodash"
import readlineSync from "readline-sync"

import { ErrorService } from "../modules/Error/services/error.service"
import {
  CREATE_RENTAL_INVOICE_LINE_ITEMS_INVOICE_SELECT,
  RentalService,
} from "../modules/Payment/services/rental.service"
import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"
import { Prisma, Product, RentalInvoiceLineItem } from ".prisma/client"

chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

const handle = (err, result) => {
  if (err) {
    return err
  }
  if (result) {
    return result
  }
}

const run = async () => {
  const ps = new PrismaService()
  const timeUtils = new TimeUtilsService()
  const error = new ErrorService()
  const rental = new RentalService(ps, timeUtils, error)

  const rentalInvoicesToBeRebilled = await ps.client.rentalInvoice.findMany({
    where: {
      lineItems: { some: { price: 0, daysRented: { gt: 0 } } },
      billingStartAt: { lt: new Date(2021, 8, 22) },
    },
    select: {
      id: true,
      billingEndAt: true,
      billingStartAt: true,
      status: true,
      lineItems: {
        select: { id: true, daysRented: true, price: true, comment: true },
      },
    },
  })
  const prismaLineItemToChargebeeChargeInput = prismaLineItem => {
    return {
      amount: prismaLineItem.price,
      description: lineItemToDescription(prismaLineItem),
      date_from:
        !!prismaLineItem.rentalStartedAt &&
        timeUtils.secondsSinceEpoch(prismaLineItem.rentalStartedAt),
      date_to:
        !!prismaLineItem.rentalEndedAt &&
        timeUtils.secondsSinceEpoch(prismaLineItem.rentalEndedAt),
    }
  }
  let totalRecoupedUnadjusted = 0
  const successes = []
  const errors = []
  const skips = []
  for (const invoice of rentalInvoicesToBeRebilled) {
    const lineItemsToRebill = invoice.lineItems.filter(
      a => a.price === 0 && a.daysRented > 0
    )
    const lineItemsWithData = await ps.client.rentalInvoiceLineItem.findMany({
      where: { id: { in: lineItemsToRebill.map(a => a.id) } },
      select: {
        id: true,
        price: true,
        name: true,
        rentalStartedAt: true,
        rentalEndedAt: true,
        daysRented: true,
        comment: true,
        rentalInvoice: {
          select: {
            id: true,
            membership: {
              select: {
                subscriptionId: true,
                subscription: {
                  select: { status: true, nextBillingAt: true },
                },
                customer: {
                  select: { user: { select: { id: true, createdAt: true } } },
                },
              },
            },
          },
        },
        physicalProduct: {
          select: {
            id: true,
            productVariant: {
              select: {
                displayShort: true,
                product: {
                  select: {
                    name: true,
                    recoupment: true,
                    wholesalePrice: true,
                    rentalPriceOverride: true,
                    computedRentalPrice: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    const custWithExtraData = await ps.client.customer.findFirst({
      where: {
        membership: {
          rentalInvoices: { some: { id: invoice.id } },
        },
      },
      select: {
        id: true,
        user: {
          select: {
            createdAt: true,
            email: true,
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        membership: {
          select: {
            rentalInvoices: { select: { id: true } },
            creditBalance: true,
          },
        },
      },
    })

    const lineItemsWithUpdatedPrices = await Promise.all(
      lineItemsWithData.map(async li => {
        const unadjustedPrice = rental.calculateUnadjustedPriceForDaysRented(
          li.physicalProduct,
          li.daysRented
        )
        return { ...li, price: unadjustedPrice }
      })
    )
    const lineItemCharges = lineItemsWithUpdatedPrices.map(li =>
      prismaLineItemToChargebeeChargeInput(li)
    )
    try {
      console.log(invoice)
      const totalCharges = lineItemCharges.reduce(
        (acc, curval) => acc + curval.amount,
        0
      )
      const creditsToApply =
        totalCharges > custWithExtraData.membership.creditBalance
          ? custWithExtraData.membership.creditBalance
          : totalCharges
      let warningMessage =
        `Going to charge customer ${custWithExtraData.user.firstName} ${custWithExtraData.user.lastName} the following:` +
        lineItemCharges
          .map(a => `\n${a.amount} -- ${a.description}`)
          .join("\n") +
        `\nTotal charges: ${totalCharges}` +
        `\nCredits to Apply: ${creditsToApply}` +
        `\nhttps://spring-staging.herokuapp.com/members/${custWithExtraData.id}/account`
      const shouldProceed = readlineSync.keyInYN(warningMessage)
      if (!shouldProceed) {
        console.log(`Skip: ${custWithExtraData.user.email}`)
        skips.push(custWithExtraData.user.email)
        continue
      }

      await applyPromoCredits(
        custWithExtraData.user.id,
        totalCharges,
        lineItemsWithData[0].rentalInvoice.id,
        { prisma: ps }
      )
      const invoicePayload = {
        customer_id: custWithExtraData.user.id,
        currency_code: "USD",
        charges: lineItemCharges,
      }
      const { invoice: chargbeeInvoice } = await chargebee.invoice
        .create(invoicePayload)
        .request(handle)
      console.log(
        `invoice: ${chargbeeInvoice.id}. status: ${chargbeeInvoice.status}`
      )
      const promises = []
      for (const li of lineItemsWithUpdatedPrices) {
        promises.push(
          ps.client.rentalInvoiceLineItem.update({
            where: { id: li.id },
            data: { price: li.price },
          })
        )
      }
      let comment = `Rebilled items reserved before migration day (9.20) on invoice: ${chargbeeInvoice.id}.`
      comment += `\nLine items rebilled:`
      for (const li of lineItemsWithData) {
        comment += `\n--${li.id}. (${li.physicalProduct.productVariant.product.name})`
      }
      promises.push(
        ps.client.rentalInvoice.update({
          where: { id: invoice.id },
          data: { comment },
        })
      )
      await ps.client.$transaction(promises)
      successes.push(custWithExtraData.user.email)
      console.log(`SUCCESS: ${custWithExtraData.user.email}`)
    } catch (err) {
      console.log(`Error: ${custWithExtraData.user.email}`)
      errors.push({ email: custWithExtraData.user.email, error: err })
      console.log(custWithExtraData.user.email)
      console.log(err)
    }
  }
  console.log("Successes:")
  console.log(successes)
  console.log("Errors:")
  console.log(errors)
  console.log("Skips:")
  console.log(skips)
  console.log(`total Unadjusted: ${totalRecoupedUnadjusted}.`)
}

type LineItemToDescriptionLineItem = Pick<
  RentalInvoiceLineItem,
  "daysRented" | "name" | "appliedMinimum" | "adjustedForPreviousMinimum"
> & {
  physicalProduct: {
    productVariant: {
      product: Pick<Product, "name" | "computedRentalPrice">
      displayShort: string
    }
  }
}

function lineItemToDescription(lineItem: LineItemToDescriptionLineItem) {
  // Else, it's for an actual item rented
  const productName = lineItem.physicalProduct.productVariant.product.name
  const displaySize = lineItem.physicalProduct.productVariant.displayShort
  const monthlyRentalPrice =
    lineItem.physicalProduct.productVariant.product.computedRentalPrice

  let text = `${productName} (${displaySize}) for ${lineItem.daysRented} days at \$${monthlyRentalPrice} per mo.`

  if (lineItem.appliedMinimum) {
    text += ` Applied minimum charge for 12 days.`
  }

  if (lineItem.adjustedForPreviousMinimum) {
    text += ` Adjusted for previous minimum charge. `
  }

  return text
}
run()

const applyPromoCredits = async (
  userId,
  totalCharges,
  invoiceId,
  { prisma }
) => {
  const prismaCustomer = await prisma.client.customer.findFirst({
    where: { user: { id: userId } },
    select: {
      membership: {
        select: {
          id: true,
          creditBalance: true,
          plan: {
            select: {
              planID: true,
            },
          },
        },
      },
    },
  })

  const existingCreditBalance = prismaCustomer.membership.creditBalance
  if (existingCreditBalance === 0) {
    return
  }

  let totalCreditsToApply

  if (totalCharges > existingCreditBalance) {
    totalCreditsToApply = existingCreditBalance
  } else {
    totalCreditsToApply = totalCharges
  }

  await chargebee.promotional_credit
    .add({
      customer_id: userId,
      amount: totalCreditsToApply,
      // (MONSOON_IGNORE) tells the chargebee webhook to not automatically move these credits to prisma.
      description: `(MONSOON_IGNORE) Grandfathered ${prismaCustomer.membership.plan.planID} credits applied towards rental charges`,
    })
    .request()
  await prisma.client.customerMembership.update({
    where: { id: prismaCustomer.membership.id },
    data: {
      creditBalance: { decrement: totalCreditsToApply },
      creditUpdateHistory: {
        create: {
          amount: -1 * totalCreditsToApply,
          reason: "Transferred to chargebee to apply towards rental charges",
        },
      },
    },
  })

  await prisma.client.rentalInvoice.update({
    where: { id: invoiceId },
    data: {
      creditsApplied: { increment: totalCreditsToApply },
    },
  })
}
