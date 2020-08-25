import { Injectable } from "@nestjs/common"
import Analytics from "analytics-node"

@Injectable()
export class SegmentService {
  client = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)
}
