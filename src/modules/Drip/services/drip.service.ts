import { Injectable } from "@nestjs/common"
import Drip from "drip-nodejs"

@Injectable()
export class DripService {
  client = new Drip({
    token: process.env.DRIP_KEY,
    accountId: process.env.DRIP_ACCOUNT_ID,
  })
}
