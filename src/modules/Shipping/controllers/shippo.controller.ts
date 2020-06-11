import { Body, Controller, Post } from "@nestjs/common"

/**
 *
 * @Example POST http://localhost:4000/shippo_events
 */

@Controller("shippo_events")
export class ShippoController {
  @Post()
  handlePost(@Body() data) {
    console.log(data)

    // 1. Process events from shippo
  }
}
