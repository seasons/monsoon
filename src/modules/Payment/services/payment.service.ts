import { Inject, Injectable, forwardRef } from "@nestjs/common"
import { get, groupBy, union } from "lodash"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { AuthService } from "@modules/User/services/auth.service"
import { EmailService } from "@modules/Email/services/email.service"
import { InvoicesDataLoader } from "../payment.types"
import { PaymentUtilsService } from "./payment.utils.service"
import { PrismaService } from "@prisma/prisma.service"
import { UtilsService } from "@modules/Utils"
import chargebee from "chargebee"

// import { InvoicesLoader } from ".."

@Injectable()
export class PaymentService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly paymentUtils: PaymentUtilsService,
    private readonly utils: UtilsService,
    private readonly prisma: PrismaService
  ) {}

  async getHostedCheckoutPage(
    planId,
    userId,
    email,
    firstName,
    lastName,
    phoneNumber
  ) {
    // translate the passed planID into a chargebee-readable version
    let chargebeePlanId
    if (planId === "AllAccess") {
      chargebeePlanId = "all-access"
    } else if (planId === "Essential") {
      chargebeePlanId = "essential"
    } else {
      throw new Error(`unrecognized planID: ${planId}`)
    }
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: chargebeePlanId,
          },
          customer: {
            id: userId,
            email,
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
  }

  async getHostedUpdatePaymentPage(customerId) {
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .manage_payment_sources({
          customer: {
            id: customerId,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result.hosted_page)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
  }

  async acknowledgeCompletedChargebeeHostedCheckout(hostedPageID) {
    const airtableService = this.airtableService
    const authService = this.authService
    const emailService = this.emailService
    const prisma = this.prisma
    return new Promise(async (resolve, reject) => {
      try {
        await chargebee.hosted_page
          .acknowledge(hostedPageID)
          .request(async function(error, result) {
            if (error) {
              reject(error)
            } else {
              var {
                subscription,
                card,
                customer: chargebeeCustomer,
              } = result.hosted_page.content

              // Retrieve plan and billing data
              let plan = { essential: "Essential", "all-access": "AllAccess" }[
                subscription.plan_id
              ]
              if (!plan) {
                reject(`unexpected plan-id: ${subscription.plan_id}`)
              }
              let billingInfo = this.paymentUtils.createBillingInfoObject(
                card,
                chargebeeCustomer
              )

              // Save it to prisma
              let prismaUser = await prisma.client.user({
                id: subscription.customer_id,
              })
              const prismaCustomer = await authService.getCustomerFromUserID(
                prismaUser.id
              )
              await prisma.client.updateCustomer({
                data: {
                  plan: plan,
                  billingInfo: {
                    create: billingInfo,
                  },
                  status: "Active",
                },
                where: { id: prismaCustomer.id },
              })

              // Save it to airtable
              await airtableService.createOrUpdateAirtableUser(prismaUser, {
                status: "Active",
                plan,
                billingInfo,
              })

              // Send welcome to seasons email
              emailService.sendWelcomeToSeasonsEmail(prismaUser)

              // Return
              resolve({
                userId: prismaUser.id,
                customerId: prismaCustomer.id,
                planId: plan,
              })
            }
          })
      } catch (err) {
        throw err
      }
    })
  }

  async updateChargebeeBillingAddress(
    userID: string,
    billingStreet1: string,
    billingStreet2: string,
    billingCity: string,
    billingState: string,
    billingPostalCode: string
  ) {
    await new Promise((resolve, reject) => {
      chargebee.customer
        .update_billing_info(userID, {
          billing_address: {
            line1: billingStreet1,
            line2: billingStreet2,
            city: billingCity,
            state: billingState,
            zip: billingPostalCode,
          },
        })
        .request((error, result) => {
          if (error) {
            reject(JSON.stringify(error))
          } else {
            const chargebeeBillingAddress = get(
              result,
              "customer.billing_address"
            )
            if (!chargebeeBillingAddress) {
              reject("Failed to update billing address on chargebee.")
            }
            resolve(chargebeeBillingAddress)
          }
        })
    })
  }

  async updateCustomerBillingAddress(
    userID,
    customerID,
    billingStreet1,
    billingStreet2,
    billingCity,
    billingState,
    billingPostalCode
  ) {
    const billingAddressData = {
      city: billingCity,
      postal_code: billingPostalCode,
      state: billingState,
      street1: billingStreet1,
      street2: billingStreet2,
    }
    const billingInfoId = await this.prisma.client
      .customer({ id: customerID })
      .billingInfo()
      .id()
    if (billingInfoId) {
      await this.prisma.client.updateBillingInfo({
        data: billingAddressData,
        where: { id: billingInfoId },
      })
    } else {
      // Get user's card information from chargebee
      const cardInfo = await this.paymentUtils.getChargebeePaymentSource(userID)
      const {
        brand,
        expiry_month,
        expiry_year,
        first_name,
        last4,
        last_name,
      } = cardInfo

      // Create new billing info object
      const billingInfo = await this.prisma.client.createBillingInfo({
        ...billingAddressData,
        brand,
        expiration_month: expiry_month,
        expiration_year: expiry_year,
        last_digits: last4,
        name: `${first_name} ${last_name}`,
      })

      // Connect new billing info to customer object
      await this.prisma.client.updateCustomer({
        data: { billingInfo: { connect: { id: billingInfo.id } } },
        where: { id: customerID },
      })
    }
  }

  async loadInvoicesForCustomers(customerIds: string[]) {
    const x = (async () => {
      const allInvoices = (
        await chargebee.invoice
          .list({ "customer_id[in]": `[${customerIds}]` })
          .request()
      )?.list?.map(a => a.invoice)
      const invoicesByCustomerId = groupBy(allInvoices, a => a.customer_id)
      const invoiceArraysInOrder = []
      customerIds.forEach(id => {
        invoiceArraysInOrder.push(invoicesByCustomerId[id])
      })
      return invoiceArraysInOrder
    })()
    return x
  }

  async getCustomerInvoiceHistory(
    // payment customer_id is equivalent to prisma user id, NOT prisma customer id
    customer_id: string,
    dataLoader: InvoicesDataLoader
  ) {
    const invoices = await dataLoader.load(customer_id)
    // const invoices = []
    if (!invoices) {
      return null
    }

    // Get transaction details for all transactions on all invoices in one go
    // to minimize API calls and reduce risk of hitting chargebee API limit
    // const transactionsForAllInvoices = (
    //   await chargebee.transaction
    //     .list({
    //       "id[in]": `[${invoices.reduce(
    //         (transactionIds, currentInvoice) =>
    //           union(
    //             transactionIds,
    //             this.getInvoiceTransactionIds(currentInvoice)
    //           ),
    //         []
    //       )}]`,
    //     })
    //     .request()
    // )?.list?.map(a => a.transaction)
    // invoices.forEach(a => {
    //   a.transactions = transactionsForAllInvoices?.filter(b =>
    //     this.getInvoiceTransactionIds(a).includes(b.id)
    //   )
    // })

    return invoices.map(a =>
      this.utils.Identity({
        id: a.id,
        subscriptionID: a.subscription_id,
        recurring: a.recurring,
        // @ts-ignore
        status: this.utils.snakeToCapitalizedCamelCase(a.status),
        amount: a.total,
        closingDate: this.utils.secondsSinceEpochToISOString(a.date),
        // @ts-ignore
        dueDate: this.utils.secondsSinceEpochToISOString(a.due_date),
        // transactions: a.transactions?.map(b =>
        //   this.utils.Identity({
        //     id: b.id,
        //     amount: b.amount,
        //     lastFour: b.masked_card_number.replace(/[*]/g, ""),
        //     date: this.utils.secondsSinceEpochToISOString(b.date),
        //     status: this.utils.snakeToCapitalizedCamelCase(b.status),
        //     type: this.utils.snakeToCapitalizedCamelCase(b.type),
        //     settledAt: b.settled_at
        //       ? this.utils.secondsSinceEpochToISOString(b.settled_at)
        //       : null,
        //   })
        // ),
      })
    )
  }

  private getInvoiceTransactionIds(invoice) {
    return invoice.linked_payments.map(a => a.txn_id)
  }
}
