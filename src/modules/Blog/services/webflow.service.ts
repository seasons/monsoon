import { Injectable } from "@nestjs/common"
import Webflow from "webflow-api"

@Injectable()
export class WebflowService {
  client: Webflow = new Webflow({ token: process.env.WEBFLOW_KEY })
}
