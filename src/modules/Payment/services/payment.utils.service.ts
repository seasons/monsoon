import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import { get } from "lodash"

@Injectable()
export class PaymentUtilsService {
  createBillingInfoObject(card, chargebeeCustomer) {
    return {
      brand: card.card_type,
      name: `${card.first_name || ""} ${card.last_name || ""}`,
      last_digits: card.last4,
      expiration_month: card.expiry_month,
      expiration_year: card.expiry_year,
      street1: chargebeeCustomer.billing_address.line1,
      street2: chargebeeCustomer.billing_address.line2,
      city: chargebeeCustomer.billing_address.city,
      state: chargebeeCustomer.billing_address.state,
      country: chargebeeCustomer.billing_address.country,
      postal_code: chargebeeCustomer.billing_address.zip,
    }
  }

  async getChargebeePaymentSource(userID: string) {
    const cardInfo: any = await new Promise((resolve, reject) => {
      // Get user's payment information from chargebee
      chargebee.payment_source
        .list({
          limit: 1,
          "customer_id[is]": userID,
          "type[is]": "card",
        })
        .request((error, result) => {
          if (error) {
            reject(error)
          } else {
            const card = get(result, "list[0].payment_source.card")
            if (!card) {
              reject("No card found for customer.")
            }
            resolve(card)
          }
        })
    }).catch(error => {
      throw new Error(JSON.stringify(error))
    })
    return cardInfo
  }
}
