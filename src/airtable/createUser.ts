import { base } from "./config"
import { CustomerDetailCreateInput, LocationCreateInput } from "../prisma"
import { createLocation } from "./utils"

export const createOrUpdateAirtableUser = async (
  user,
  details: CustomerDetailCreateInput
) => {
  const { email, firstName, lastName } = user

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
  }

  const data = {
    Email: email,
    "First Name": firstName,
    "Last Name": lastName,
  }

  for (let key in details) {
    if (keyMap[key] && details[key]) {
      data[keyMap[key]] = details[key]
    }
  }

  if (details.shippingAddress) {
    const location = await createLocation(user, details.shippingAddress.create)
    data["Shipping Address"] = location.map(l => l.id)
  }
  try {
    return base("Users").create([
      {
        fields: data,
      },
    ])
  } catch (e) {
    console.log(e)
  }
}
