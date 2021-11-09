import { Test, TestingModule } from "@nestjs/testing"

import { ShippingService } from "../services/shipping.service"
import { SHIPPING_MODULE_DEF } from "../shipping.module"

describe("Discount Shipping Rate", () => {
  let moduleRef: TestingModule
  let shippingService: ShippingService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(SHIPPING_MODULE_DEF)
    moduleRef = await moduleBuilder.compile()

    shippingService = moduleRef.get<ShippingService>(ShippingService)
  })

  it("Discounts an outbound select rate by 55%", () => {
    const discountedRate = shippingService.discountShippingRate(
      100,
      "UPSSelect",
      "Outbound"
    )
    expect(discountedRate).toBe(45)
  })

  it("Discounts an inbound select rate by 55%", () => {
    const discountedRate = shippingService.discountShippingRate(
      100,
      "UPSSelect",
      "Inbound"
    )
    expect(discountedRate).toBe(45)
  })

  it("Discounts an inbound ground rate by 38%", () => {
    const discountedRate = shippingService.discountShippingRate(
      100,
      "UPSGround",
      "Inbound"
    )
    expect(discountedRate).toBe(62)
  })

  it("Discounts an outbound ground rate by 30%", () => {
    const discountedRate = shippingService.discountShippingRate(
      100,
      "UPSGround",
      "Outbound"
    )
    expect(discountedRate).toBe(70)
  })
})
