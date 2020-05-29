import { Plan, User } from "@app/prisma"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { EmailService } from "@modules/Email/services/email.service"
import { AuthService } from "@modules/User/services/auth.service"
import { UtilsService } from "@modules/Utils"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import { camelCase, get, identity, snakeCase, upperFirst } from "lodash"

import {
  BillingAddress,
  Card,
  Invoice,
  InvoicesDataLoader,
  RefundInvoiceInput,
  Transaction,
  TransactionsDataLoader,
} from "../payment.types"
import { PaymentUtilsService } from "./payment.utils.service"

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

  async createSubscription(
    plan: Plan,
    billingAddress: BillingAddress,
    user: User,
    card: Card
  ) {
    return await chargebee.subscription
      .create({
        plan_id: this.prismaPlanToChargebeePlanId(plan),
        billingAddress,
        customer: {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          id: user.id,
        },
        card,
      })
      .request()
  }

  async getHostedCheckoutPage(
    planId,
    userId,
    email,
    firstName,
    lastName,
    phoneNumber
  ) {
    return await new Promise((resolve, reject) => {
      chargebee.hosted_page
        .checkout_new({
          subscription: {
            plan_id: this.prismaPlanToChargebeePlanId(planId),
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
          .request(async function (error, result) {
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

  async getCustomerInvoiceHistory(
    // payment customerId is equivalent to prisma user id, NOT prisma customer id
    customerId: string,
    invoicesLoader: InvoicesDataLoader,
    transactionsForCustomerLoader: TransactionsDataLoader
  ) {
    const invoices = this.utils.filterErrors<Invoice>(
      await invoicesLoader.load(customerId)
    )
    if (!invoices) {
      return null
    }

    return Promise.all(
      invoices.map(async invoice =>
        identity({
          ...this.formatInvoice(invoice),
          transactions: this.utils
            .filterErrors<Transaction>(
              await transactionsForCustomerLoader.load(customerId)
            )
            ?.filter(a =>
              this.getInvoiceTransactionIds(invoice)?.includes(a.id)
            )
            ?.map(this.formatTransaction),
        })
      )
    )
  }

  async getCustomerTransactionHistory(
    // payment customerId is equivalent to prisma user id, NOT prisma customer id
    customerId: string,
    transactionsForCustomerloader: TransactionsDataLoader
  ) {
    return this.utils
      .filterErrors<Transaction>(
        await transactionsForCustomerloader.load(customerId)
      )
      ?.map(this.formatTransaction)
  }

  async refundInvoice({
    invoiceId,
    refundAmount,
    comment,
    customerNotes,
    reasonCode,
  }: RefundInvoiceInput) {
    await chargebee.invoice
      .refund(invoiceId, {
        refund_amount: refundAmount,
        credit_note: {
          reason_code: snakeCase(reasonCode),
        },
        comment,
        customer_notes: customerNotes,
      })
      .request()
    return true
  }

  private getInvoiceTransactionIds(invoice): string[] {
    return invoice.linkedPayments.map(a => a.txnId)
  }

  /**
   * Define as arrow func to preserve `this` binding
   */
  private formatInvoice = (invoice: Invoice) =>
    identity({
      ...invoice,
      status: upperFirst(camelCase(invoice.status)),
      amount: invoice.total,
      closingDate: this.utils.secondsSinceEpochToISOString(invoice.date),
      dueDate: this.utils.secondsSinceEpochToISOString(invoice.dueDate, true),
      creditNotes: invoice.issuedCreditNotes.map(a =>
        identity({
          ...a,
          reasonCode: upperFirst(camelCase(a.reasonCode)),
          status: upperFirst(camelCase(a.status)),
          date: this.utils.secondsSinceEpochToISOString(a.date),
        })
      ),
    })

  /**
   * Define as arrow func to preserve `this` binding
   */
  private formatTransaction = (transaction: Transaction) =>
    identity({
      ...transaction,
      status: upperFirst(transaction.status),
      type: upperFirst(transaction.type),
      lastFour: transaction.maskedCardNumber?.replace(/[*]/g, ""),
      date: this.utils.secondsSinceEpochToISOString(transaction.date, true),
      settledAt: this.utils.secondsSinceEpochToISOString(
        transaction.settledAt,
        true
      ),
    })

  private prismaPlanToChargebeePlanId(plan: Plan) {
    let chargebeePlanId
    if (plan === "AllAccess") {
      chargebeePlanId = "all-access"
    } else if (plan === "Essential") {
      chargebeePlanId = "essential"
    } else {
      throw new Error(`unrecognized planID: ${plan}`)
    }
    return chargebeePlanId
  }
}
