import { Context } from "../../utils"
import Shippo from "shippo"
import { locationDataToShippoAddress } from "../Product/createShippoShipment"
import { getUserFromContext } from "../../auth/utils"

const shippo = Shippo(process.env.SHIPPO_API_KEY)

export const shippoValidateAddress = async (address) => {
  const result = await shippo.address.create({
    ...address,
    country: "US",
    validate: true,
  })

  const validationResults = result.validation_results
  const isValid = result.validation_results.is_valid
  const message = validationResults?.messages?.[0]
  return {
    isValid,
    code: message?.code,
    text: message?.text,
  }
}

export const address = {
  async validateAddress(obj, { input }, ctx: Context, info) {
    const { email, location } = input

    const shippoAddress = locationDataToShippoAddress(location)
    return await shippoValidateAddress({
      ...shippoAddress,
      email,
      name: location.name,
    })
  },
}
