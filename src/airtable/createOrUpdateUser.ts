import { base } from "./config"
import { CustomerDetailCreateInput, LocationCreateInput, CustomerStatus, User } from "../prisma"
import { createLocation } from "./utils"

export const createOrUpdateAirtableUser = async (
    user: User,
    details: CustomerDetailCreateInput,
    status?: CustomerStatus,
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
        status: "Status"
    }

    const data = {
        Email: email,
        "First Name": firstName,
        "Last Name": lastName,
    }

    const allDetails = !!status ? { ...details, status } : details
    for (let key in allDetails) {
        if (keyMap[key] && allDetails[key]) {
            data[keyMap[key]] = allDetails[key]
        }
    }

    if (allDetails.shippingAddress) {
        const location = await createLocation(user, allDetails.shippingAddress.create)
        data["Shipping Address"] = location.map(l => l.id)
    }
    base("Users")
        .select({
            view: "Grid view",
            filterByFormula: `{Email}='${email}'`,
        })
        .firstPage((err, records) => {
            if (err) {
                throw (err)
            }
            if (records.length > 0) {
                const user = records[0]
                base("Users").update(user.id, data, function (err, record) {
                    if (err) {
                        throw (err)
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
