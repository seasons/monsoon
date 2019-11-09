import { base } from "./config"
import { CustomerDetailCreateInput } from "../prisma"

export const createUser = (user, details: CustomerDetailCreateInput) => {
  const { email, firstName, lastName } = user
  const { phoneNumber } = details

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
    phoneOS: "Phone OS",
  }

  const data = {
    Email: email,
    "First Name": firstName,
    "Last Name": lastName,
    "Phone Number": phoneNumber,
  }

  for (let key in details) {
    data[keyMap[key]] = details[key]
  }

  base("Users").create([
    {
      fields: data,
    },
  ])
}
