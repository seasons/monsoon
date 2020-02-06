import { Context } from "../../utils"
import Shippo from "shippo"
import { locationDataToShippoAddress } from "../Product/createShippoShipment"
import { getUserFromContext } from "../../auth/utils"

const shippo = Shippo(process.env.SHIPPO_API_KEY)

export const address = {
  async validateAddress(obj, { input }, ctx: Context, info) {
    const { location } = input

    const user = await getUserFromContext(ctx)
    const shippoAddress = locationDataToShippoAddress(location)

    const result = await shippo.address.create({
      ...shippoAddress,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
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
  },
}
