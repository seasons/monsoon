import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import { PrismaClientService } from "../../../prisma/client.service"
import { AuthService } from "../../User/services/auth.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { EmailService } from "../../Email/services/email.service"

@Injectable()
export class PaymentService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaClientService
  ) {}

  async getHostedCheckoutPage(
    planId,
    userId,
    email,
    firstName,
    lastName,
    phoneNumber,
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
              let billingInfo = this.paymentUtils.createBillingInfoObject(card, chargebeeCustomer)

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
                planId: plan
              })
            }
          })
      } catch (err) {
        throw err
      }
    }) 
  }
}
