import { base } from "./config"
import {
  CustomerDetailCreateInput,
  Plan,
  LocationCreateInput,
  BillingInfoCreateInput,
  CustomerStatus,
  User,
} from "../prisma"
import { createLocation, createBillingInfo } from "./utils"

interface AirtableUserFields extends CustomerDetailCreateInput {
  plan?: string
  status?: CustomerStatus
  billingInfo?: BillingInfoCreateInput
}

const keyMap = {
  phoneNumber: "Phone Number",
  birthday: "Birthday",
  height: "Height",
  weight: "Weight",
  bodyType: "Body Type",
  averageTopSize: "Average Top Size",
  averageWaistSize: "Average Waist Size",
  averagePantLength: "Average Pant Length",
  preferredPronouns: "Preferred Pronouns",
  profession: "Profession",
  partyFrequency: "Party Frequency",
  travelFrequency: "Travel Frequency",
  shoppingFrequency: "Shopping Frequency",
  averageSpend: "Average Spend",
  style: "Style",
  commuteStyle: "Commute Style",
  shippingAddress: "Shipping Address",
  phoneOS: "Platform OS",
  status: "Status",
  plan: "Plan",
}

export const createOrUpdateAirtableUser = async (
  user: User,
  fields: AirtableUserFields
) => {
  // Create the airtable data
  const { email, firstName, lastName } = user
  const data = {
    Email: email,
    "First Name": firstName,
    "Last Name": lastName,
  }
  for (let key in fields) {
    if (keyMap[key]) {
      data[keyMap[key]] = fields[key]
    }
  }
  // WARNING: shipping address and billingInfo code are still "create" only.
  if (!!fields.shippingAddress) {
    const location = await createLocation(user, fields.shippingAddress.create)
    data["Shipping Address"] = location.map(l => l.id)
  }
  if (!!fields.billingInfo) {
    const airtableBillingInfoRecord = await createBillingInfo(
      fields.billingInfo
    )
    data["Billing Info"] = [airtableBillingInfoRecord.getId()]
  }

  // Create or update the record
  base("Users")
    .select({
      view: "Grid view",
      filterByFormula: `{Email}='${email}'`,
    })
    .firstPage((err, records) => {
      if (err) {
        throw err
      }
      if (records.length > 0) {
        const user = records[0]
        base("Users").update(user.id, data, function(err, record) {
          if (err) {
            throw err
          }
        })
      } else {
        base("Users").create([
          {
            fields: data,
          },
        ])
      }
    })
}
