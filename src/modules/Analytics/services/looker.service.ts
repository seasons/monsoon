import { LookerNodeSDK, NodeSettings } from "@looker/sdk/lib/node"
import { Injectable } from "@nestjs/common"

@Injectable()
export class LookerService {
  client = LookerNodeSDK.init31(new NodeSettings())

  baseURL() {
    return "https://seasonsnyc.cloud.looker.com"
  }
}
