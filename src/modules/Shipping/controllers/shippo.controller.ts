import { Body, Controller, Post } from "@nestjs/common"

@Controller("shippo")
export class ShippoController {
  @Post()
  handlePost(@Body() data) {
    console.log(data)
  }
}
