import { ShippoShipment } from "./createShippoShipment"
import shippo from "shippo"

const activeShippo = shippo(process.env.SHIPPO_API_KEY)

export async function createShippingLabel(
  inputs: ShippoLabelInputs
): Promise<ShippoTransaction> {
  return new Promise(async (resolve, reject) => {
    const transaction = await activeShippo.transaction
      .create(inputs)
      .catch(reject)

    if (
      transaction.object_state === "VALID" &&
      transaction.status === "ERROR"
    ) {
      reject(
        transaction.messages.reduce((acc, curVal) => {
          return `${acc}. Source: ${curVal.source}. Code: ${curVal.code}. Error Message: ${curVal.text}`
        }, "")
      )
    } else if (!transaction.label_url) {
      reject(JSON.stringify(transaction))
    }
    resolve(transaction)
  })
}

export interface ShippoTransaction {
  label_url: string
  tracking_number: string
  tracking_url_provider: string
  messages: Array<any>
  formatted_error?: string
  status: string
}

interface ShippoLabelInputs {
  shipment: ShippoShipment
  carrier_account: string
  servicelevel_token: string
}
