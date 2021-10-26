import "module-alias/register"

import chargebee from "chargebee"
import { coerceInputValue } from "graphql"
import { groupBy, orderBy, uniq } from "lodash"

import { GRANDFATHERED_PLAN_IDS } from "../modules/Payment/services/subscription.service"
import { TimeUtilsService } from "../modules/Utils/services/time.service"
import { PrismaService } from "../prisma/prisma.service"

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

  const allPromotionalCredits = []
  let offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.promotional_credit
      .list({
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allPromotionalCredits.push(...list?.map(a => a.promotional_credit))
    if (!offset) {
      break
    }
  }

  const allInvoices = []
  offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.invoice
      .list({
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allInvoices.push(...list?.map(a => a.invoice))
    if (!offset) {
      break
    }
  }

  const creditsGroupedByChargebeeCustomerId = groupBy(
    allPromotionalCredits,
    a => a.customer_id
  )
  const invoicesGroupedByChargebeeCustomerId = groupBy(
    allInvoices,
    a => a.customer_id
  )

  // SPECIFIC FLAGS

  await processSpecificFlags(
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId
  )

  console.log("\n\n")
  await calculateProperPromotionalCreditBalanceForAllCustomers(
    ps,
    timeUtils,
    creditsGroupedByChargebeeCustomerId,
    invoicesGroupedByChargebeeCustomerId
  )

  console.log(` **** AUDIT DONE ****`)
}

const calculateProperPromotionalCreditBalanceForAllCustomers = async (
  ps: PrismaService,
  timeUtils: TimeUtilsService,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const userIdsWithCreditHistoryOnChargebee = Object.keys(
    creditsGroupedByChargebeeCustomerId
  )
  const allRelevantCustomers = await ps.client.customer.findMany({
    where: {
      OR: [
        { status: { in: ["Active", "PaymentFailed", "Deactivated"] } },
        { user: { id: { in: userIdsWithCreditHistoryOnChargebee } } },
        { membership: { creditBalance: { gt: 0 } } },
      ],
    },
    select: {
      user: { select: { id: true } },
      membership: { select: { creditBalance: true } },
    },
  })

  const allChargebeeCustomers = []
  let offset = "start"
  while (true) {
    sleep(500)
    let list
    ;({ next_offset: offset, list } = await chargebee.customer
      .list({
        limit: 100,
        ...(offset === "start" ? {} : { offset }),
      })
      .request())
    allChargebeeCustomers.push(...list?.map(a => a.customer))
    if (!offset) {
      break
    }
  }
  const flags = []
  for (const cust of allRelevantCustomers) {
    const chargebeeCustomer = allChargebeeCustomers.find(
      a => a.id === cust.user.id
    )
    const invoices = invoicesGroupedByChargebeeCustomerId[cust.user.id]
    if (!chargebeeCustomer) {
      continue
    }

    // Calculate proper promotional credit balance
    const chargebeeCreditLogs =
      creditsGroupedByChargebeeCustomerId[cust.user.id]
    if (
      !chargebeeCreditLogs &&
      cust.membership.creditBalance === 0 &&
      chargebeeCustomer.promotional_credits === 0
    ) {
      continue
    }

    if (
      chargebeeCustomer.promotional_credits !== 0 &&
      chargebeeCustomer.unbilled_charges === 0
    ) {
      flags.push({
        failureMode:
          "Nonzero promotional credit balance with no upcoming charges",
        id: cust.user.id,
      })
      continue
    }

    // Does not include membership renewal-based promotional credits
    const mostValidCreditsCreatedOnChargebeeMetadata = []
    const mostValidCreditsCreatedOnChargebee =
      chargebeeCreditLogs
        ?.filter(a => a.type === "increment")
        ?.filter(a => {
          const initialCreditCreation = a.description.includes(
            "Initial grandfathering"
          )
          const teamMemberAddedIt = a.done_by?.includes("seasons.nyc")
          const createdDuringReturn = a.description.includes(
            "Returned while deleting the invoice"
          )
          const createdDuringCreditNote = a.description.includes(
            "Returned while creating the Credit Note"
          )
          const isValid =
            initialCreditCreation ||
            createdDuringReturn ||
            createdDuringCreditNote ||
            teamMemberAddedIt
          if (isValid) {
            mostValidCreditsCreatedOnChargebeeMetadata.push({
              validBecause: initialCreditCreation
                ? "Initial Credit Creation"
                : createdDuringReturn
                ? "Created on Return"
                : createdDuringCreditNote
                ? "Created on Credit Note"
                : teamMemberAddedIt
                ? "Team Member Added"
                : null,
              creditsAdded: Math.round(a.amount),
            })
          }
          return isValid
        })
        ?.reduce((acc, curval) => Math.round(curval.amount + acc), 0) || 0
    const membershipRenewalCreditsMetadata = []
    const membeshipRenewalPromotionalCredits = Math.round(
      invoices.reduce((acc, curval) => {
        const chargeDate = timeUtils.dateFromUTCTimestamp(
          curval.date,
          "seconds"
        )
        const isAfterSeptemberTwenty = timeUtils.isLaterDate(
          chargeDate,
          new Date(2021, 8, 20)
        )
        if (!isAfterSeptemberTwenty) {
          return acc
        }
        if (curval.status !== "paid") {
          return acc
        }
        const grandfatheredPlanCharge = curval.line_items.find(a =>
          GRANDFATHERED_PLAN_IDS.includes(a.entity_id)
        )
        if (grandfatheredPlanCharge) {
          const creditsAdded = grandfatheredPlanCharge.amount * 1.15
          membershipRenewalCreditsMetadata.push({
            invoiceNumber: curval.id,
            date: timeUtils.dateFromUTCTimestamp(curval.date, "seconds"),
            planId: grandfatheredPlanCharge.entity_id,
            creditsAdded: Math.round(creditsAdded),
          })
          return acc + creditsAdded
        }

        return Math.round(acc)
      }, 0)
    )
    const totalCreditsAppliedTowardsInvoices =
      chargebeeCreditLogs
        ?.filter(a => a.type === "decrement")
        ?.filter(b => {
          return b.description.includes("Applied to the invoice")
        })
        ?.reduce((acc, curval) => acc + curval.amount, 0) || 0
    const totalCreditsCreated = Math.round(
      membeshipRenewalPromotionalCredits + mostValidCreditsCreatedOnChargebee
    )
    const expectedCredits =
      totalCreditsCreated - totalCreditsAppliedTowardsInvoices
    if (expectedCredits !== cust.membership.creditBalance) {
      flags.push({
        failureMode:
          "Current credit balance not equal to expected credit balance",
        id: cust.user.id,
        meta: {
          totalCreditsCreated,
          membeshipRenewalPromotionalCredits: Math.round(
            membeshipRenewalPromotionalCredits
          ),
          membershipRenewalCreditsMetadata,
          mostValidCreditsCreatedOnChargebee,
          mostValidCreditsCreatedOnChargebeeMetadata,
          expectedCredits,
          totalCreditsAppliedTowardsInvoices,
          creditBalance: cust.membership.creditBalance,
        },
      })
      continue
    }
  }

  await printFlags(ps, flags)
}

const processSpecificFlags = async (
  ps,
  timeUtils,
  creditsGroupedByChargebeeCustomerId,
  invoicesGroupedByChargebeeCustomerId
) => {
  const flags = []
  for (const chargebeeCustomerId of Object.keys(
    creditsGroupedByChargebeeCustomerId
  )) {
    const credits = creditsGroupedByChargebeeCustomerId[chargebeeCustomerId]
    const sortedCredits = orderBy(credits, ["created_at", "desc"])
    const sortedCreditDescriptions = sortedCredits.map(a => a.description)
    const invoices = invoicesGroupedByChargebeeCustomerId[chargebeeCustomerId]

    // flag if a grandfathered customer had promo credits apply towards a membership due
    const receivedInitialCredits = sortedCredits.some(a =>
      a.description.includes("Initial grandfathering")
    )
    const invoicesWithCreditsAppliedTowardGrandfatheredPlan = invoices.filter(
      a => {
        const grandfatheredPlanCharge = a.line_items.find(a =>
          GRANDFATHERED_PLAN_IDS.includes(a.entity_id)
        )
        const includesGrandFatheredPlanCharge = !!grandfatheredPlanCharge // TODO:
        if (!includesGrandFatheredPlanCharge) {
          return false
        }

        const chargeDate = timeUtils.dateFromUTCTimestamp(a.date, "seconds")
        const isAfterSeptemberTwenty = timeUtils.isLaterDate(
          chargeDate,
          new Date(2021, 8, 20)
        )
        if (!isAfterSeptemberTwenty) {
          return false
        }

        const creditsAppliedTowardPlanCharge =
          grandfatheredPlanCharge.discount_amount > 0 &&
          grandfatheredPlanCharge.discount_amount >
            grandfatheredPlanCharge.item_level_discount_amount
        return creditsAppliedTowardPlanCharge
      }
    )
    if (
      receivedInitialCredits &&
      invoicesWithCreditsAppliedTowardGrandfatheredPlan.length > 0
    ) {
      flags.push({
        failureMode: "Applied credits to a grandfathered plan charge",
        id: chargebeeCustomerId,
        meta: { invoicesWithCreditsAppliedTowardGrandfatheredPlan },
      })
    }

    // If the credit is too large, flag it
    // Inspied by Justin P Olivierre, who received a $1160 credit: https://seasons.chargebee.com/customers/14345261/details#promotional-credits
    // We choose 22500 as the threshold because the highest known "expected" credit to be added is 27814, in response to an essential-6 charge
    if (sortedCredits.some(a => a.type === "increment" && a.amount > 27814)) {
      flags.push({
        failureMode: "Excessive credit added",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Received initial credits but then switched to an access plan before 10.01.
    // Most likely had duplicate credits.
    const movedToAccessPlanBeforeOctoberFirst = invoices.some(a => {
      const chargeDate = timeUtils.dateFromUTCTimestamp(a.date, "seconds")
      const beforeOctoberFirst = timeUtils.isLaterDate(
        new Date(2021, 9, 2),
        chargeDate
      )
      const hasAccessCharge = a.line_items.some(
        a =>
          a.description.includes("Access Monthly") ||
          a.description.includes("Access Yearly")
      )
      return beforeOctoberFirst && hasAccessCharge
    })
    if (receivedInitialCredits && movedToAccessPlanBeforeOctoberFirst) {
      flags.push({
        failureMode:
          "Grandfathered but moved to access plan before October 1st",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Switched to access-yearly and received undue credits
    const undueAccessYearlyCredits = sortedCredits.some(
      a =>
        a.description.includes("Grandfathered access-yearly credits") &&
        a.amount === 22425
    )
    if (undueAccessYearlyCredits) {
      flags.push({
        failureMode: "Given promotional credits for access yearly charge",
        id: chargebeeCustomerId,
      })
      continue
    }

    // Flag: Switched to access-yearly and received undue credits
    const undueAccessMonthlyCredits = sortedCredits.some(
      a =>
        a.description.includes("Grandfathered access-monthly credits") &&
        a.amount === 2300
    )
    if (undueAccessMonthlyCredits) {
      flags.push({
        failureMode: "Given promotional credits for access monthly charge",
        id: chargebeeCustomerId,
      })
      continue
    }

    // If total credits created is less than total credits deducated on chargebee,
    // flag
    const totalValidCreditsCreatedOnChargebee = credits
      .filter(a => a.type === "increment")
      .filter(a => {
        const initialCreditCreation = a.description.includes(
          "Initial grandfathering"
        )
        const subscriptionDueCreditCreation =
          a.description.includes("Grandfathered") &&
          a.description.includes("credits") &&
          !a.description.includes("access-monthly") &&
          !a.description.includes("access-yearly")
        const teamMemberAddedIt = a.done_by?.includes("seasons.nyc")
        const createdDuringReturn = a.description.includes(
          "Returned while deleting the invoice"
        )
        const createdDuringCreditNote = a.description.includes(
          "Returned while creating the Credit Note"
        )
        return (
          initialCreditCreation ||
          subscriptionDueCreditCreation ||
          createdDuringReturn ||
          createdDuringCreditNote ||
          teamMemberAddedIt
        )
      })
      .reduce((acc, curval) => curval.amount + acc, 0)

    const totalCreditsDeductedOnChargebee = credits
      .filter(a => a.type === "decrement")
      .reduce((acc, curval) => curval.amount + acc, 0)

    if (totalValidCreditsCreatedOnChargebee < totalCreditsDeductedOnChargebee) {
      flags.push({
        failureMode: "More credits deducted than created",
        id: chargebeeCustomerId,
      })
      continue
    }

    // flag if two descriptions in a row are the same
    let lastDescription = null
    for (const description of sortedCreditDescriptions) {
      if (
        description
          .toLowerCase()
          .includes("grandfathered access-yearly credits") ||
        description
          .toLowerCase()
          .includes("grandfathered access-monthly credits")
      ) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      }

      if (lastDescription === description) {
        flags.push({
          failureMode: "Credits may have been given to access customer",
          id: chargebeeCustomerId,
        })
        break
      } else {
        lastDescription = description
      }
    }
  }
  await printFlags(ps, flags)
}
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const printFlags = async (ps: PrismaService, flags) => {
  const knownNonFlags = [
    "cksq66als339522fwvbhchva94",
    "ck68f2mxrltgl0777a3vnfx8z",
    "ck8p84yrm12dz07230kyeggwq",
    "ckcqloze31z8u0702190vtm9t", // Daniel Pollis.
    "cki6z6sjq17jk0759vh9qlrto", // Luke Rivera
    "ckq65me7k2cak0701xumuesf8", // Ujjwal Gupta
    "ckhpn3z4m2ai20772ee2biy3f", // Chima Acholonu
    "ckkne2e2d0mka0781xu1c22yx", // Robert Mckinley
    "ck7ow1pyx058o0732ag31h6f2", // Robert Kelly
    "ckjt4s4qh0s6a0729i6rnu1hz", // Krischan Singh
    "ck68fll2tm2o207775mbenhrn", // Justin P Ollivierre
    "ck576lgrie73407346ff3u2p7", // Adam Fraser
    "ckufsl3qz15260872eri8jny9j3o", // Marc Asuncion
    "ckp06r4cb0oki05969f2m843m", // Ross Mcleod
    "ckjuwd0go2pqh0738huttrfez", // Noah Schriefer
    "ckhw78f7t31y10712i34bv5y6", // Freddy Carbajal
    "ckolp71vl1uvf0720o5150qsm", // Scott Baretta
    "ck6u4se7gjq6l07323meaiypx", // Nick Bognar
    "cks51jooq2590392e06vhias58x", // Ausar Mundra
    "ckm9e9i9n298x0768by24ektx", // Pawel Wronowski
    "ck30r7rw2043f0797orhjs8me", // Ankit Vij
    "ckge5lxmd0gax0718iloxyoht", // Zeff Zenarosa
    "ckghedkkh0ax70773rqr0dvb7", // Jeremy Leung
    "ckknj14uv15610781wrfk109m", // Jerin Varghese"
    "ckhpk6xpc1qet07729p88svng", // Dale Stephens
    "ckh1fn5db04s107823ugb9ae8",
    "ckgiijpvx16kj07732mrx2qxr",
    "ck386iul21mc90765tfo7i64j",
    "ck2zsdm7p01k307481ax71xmr",
    "ckf8meide0e5k0729p5tvrtvy",
    "ckezzcmki04170717s8mdjcvl",
  ]
  const knownToBeInProcess = [
    "cksrs1j3n13574712fty3eyx01fm", // Thomas Doe
  ]

  const filteredFlags = flags
    .filter(a => !knownNonFlags.includes(a.id))
    .filter(b => !knownToBeInProcess.includes(b.id))
  const filteredFlagsByReason = groupBy(filteredFlags, a => a.failureMode)
  for (const failureMode of Object.keys(filteredFlagsByReason)) {
    console.log(
      `-- ${failureMode}: ${filteredFlagsByReason[failureMode]?.length || 0}`
    )
    for (const flag of filteredFlagsByReason[failureMode]) {
      const prismaUser = await ps.client.user.findUnique({
        where: { id: flag.id },
      })
      console.log(
        `https://seasons.chargebee.com/customers?view_code=all&Customers.search=${flag.id}`,
        prismaUser.email
      )
      if (flag.meta) {
        console.dir(flag.meta, { depth: null })
        console.log("\n")
      }
    }
  }
}

run()

/*
FAILURE MODES AND CORRECTION STEPS

:: Customer switched to access-yearly and was incorrectly granted promotional credits
    -> Remove all undue credits from Chargebee without adding back to prisma
    -> If credits have been applied towards an invoice already, charge them for that invoice
*/

/*
// Add a more explicit failure mode for receiving promotional credits in response to access-monthly payment
// Add a failure mode for having been given ad hoc credits prior to the migration (0ct 1, 2021) and not being grandfathered
// TODO: Add a failure mode for having promotional credits apply towards a grandfathered plan while still receiving promotional credits
*/

/*
Case to look at https://seasons.chargebee.com/customers/61973235/details#promotional-credits

He seems to have gotten initial credits, but then none afterwards. He also had promotional credits apply towards membership charges.

*/
