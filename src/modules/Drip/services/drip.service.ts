import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"
import Drip from "drip-nodejs"

@Injectable()
export class DripService implements UpdatableConnection {
  client = new Drip({
    token: process.env.DRIP_KEY,
    accountId: process.env.DRIP_ACCOUNT_ID,
  })

  updateConnection({
    dripKey,
    accountId,
  }: {
    dripKey: string
    accountId: string
  }) {
    this.client = Drip({
      token: dripKey,
      accountId,
    })
  }
}
