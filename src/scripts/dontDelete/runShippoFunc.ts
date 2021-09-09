import "module-alias/register"

import shippo from "shippo"

const run = async () => {
  try {
    const shippoClient = shippo(process.env.SHIPPO_API_KEY)
    const packageId = "aadeb4053d424132ac12e7fca6e629c7"
    const shipment = await shippoClient.transaction.retrieve(packageId)
    const rateId = shipment.rate
    const rate = await shippoClient.rate.retrieve(rateId)
    console.dir(shipment, { depth: null })
    console.dir(rate, { depth: null })
  } catch (err) {
    console.log(err)
  }
}
run()
