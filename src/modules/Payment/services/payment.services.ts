import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import { get } from "lodash"
import { PaymentUtilsService } from "./payment.utils.service"
import { PrismaClientService } from "../../../prisma/client.service"

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentUtils: PaymentUtilsService,
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
    // make the call to chargebee
    chargebee.configure({
      site: process.env.CHARGEBEE_SITE,
      api_key: process.env.CHARGEE_API_KEY,
    })
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

  async updateChargebeeBillingAddress(
    userID: string,
    billingStreet1: string,
    billingStreet2: string,
    billingCity: string,
    billingState: string,
    billingPostalCode: string
  ) {
    await new Promise((resolve, reject) => {
      chargebee.customer.update_billing_info(userID, {
        billing_address: {
          line1: billingStreet1,
          line2: billingStreet2,
          city: billingCity,
          state: billingState,
          zip: billingPostalCode,
        }
      }).request((error, result) => {
        if (error) {
          reject(JSON.stringify(error))
        } else {
          const chargebeeBillingAddress = get(result, "customer.billing_address")
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
      street2: billingStreet2
    }
    const billingInfoId = await this.prisma.client.customer({ id: customerID })
      .billingInfo()
      .id()
    if (billingInfoId) {
      await this.prisma.client.updateBillingInfo({
        data: billingAddressData,
        where: { id: billingInfoId }
      })
    } else {
      // Get user's card information from chargebee
      const cardInfo = await this.paymentUtils.getChargebeePaymentSource(userID)
      const { brand, expiry_month, expiry_year, first_name, last4, last_name } = cardInfo
  
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
        where: { id: customerID }
      })
    }
  }

}
