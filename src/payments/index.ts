import chargebee from "chargebee"
import { UserCreateInput, CustomerDetailCreateInput, User } from "../prisma"

chargebee.configure({
  site: "seasons-test",
  api_key: "test_fmWkxemy4L3CP1ku1XwPlTYQyJVKajXx",
})

export const createCustomerSubscription = (
  user: UserCreateInput | User,
  details: CustomerDetailCreateInput
) => {
  const { firstName, lastName, email } = user
  const { phoneNumber, shippingAddress } = details
  const {
    create: { address1, address2, city, company, state, zipCode },
  } = shippingAddress
  return new Promise((resolve, reject) => {
    chargebee.subscription
      .create({
        plan_id: "all-access",
        auto_collection: "off",
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          line1: address1,
          line2: address2,
          city: city,
          state: state,
          zip: zipCode,
          country: "US",
        },
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
      })
      .request(function(error, result) {
        if (error) {
          //handle error
          console.log(error)
          reject(error)
        } else {
          resolve(result)
          console.log(result)
          //   var subscription = result.subscription
          //   var customer = result.customer
          //   var card = result.card
          //   var invoice = result.invoice
          //   var unbilled_charges = result.unbilled_charges
        }
      })
  })
}
