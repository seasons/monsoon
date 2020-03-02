import { Injectable } from "@nestjs/common"
import { DBService } from "../../../prisma/DB.service"
import chargebee from "chargebee"

@Injectable()
export class PaymentService {
  constructor(private readonly db: DBService) {}

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

}
