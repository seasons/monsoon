import { APP_MODULE_DEF } from "@app/app.module"
import { Test, TestingModule } from "@nestjs/testing"
import shippo from "shippo"

import { ShippingService, UPSServiceLevel } from "../services/shipping.service"
import { SHIPPING_MODULE_DEF } from "../shipping.module"

// A generic shippo so we can run shipping service functions without hitting shippo
class ShippoMock {
  __esModule = true

  default = {
    shipment: {
      create: async () => ({
        object_id: "mock-object-id",
        rates: [
          { servicelevel: { token: "ups_ground", amount: 10000 } }, // $100
          { servicelevel: { token: "ups_3_day_select", amount: 20000 } }, // $200
        ],
      }),
    },
  }
}

describe("Get Shipping Rate", () => {
  let moduleRef: TestingModule
  let shippingService: ShippingService

  beforeAll(async () => {
    const moduleBuilder = await Test.createTestingModule(SHIPPING_MODULE_DEF)
    moduleRef = await moduleBuilder.compile()

    shippingService = moduleRef.get<ShippingService>(ShippingService)

    const x = new ShippoMock()
    jest.mock("shippo", () => jest.fn().mockImplementation(() => "yo"))
  })

  it("Discounts an outbound select package by 55%", async () => {
    // const { rate } = await shippingService.getShippingRate({
    //   shipment: { address_from: {}, address_to: {}, parcels: [] },
    //   servicelevel_token: UPSServiceLevel.Select,
    //   shipmentType: "Outbound",
    // })
    // expect(rate.amount).toBe(9000)
    expect(0).toBe(1)
  })

  it("Discounts an inbound select image by 55%", () => {
    expect(0).toBe(1)
  })

  it("Discounts an inbound ground package by 38%", () => {
    expect(0).toBe(1)
  })

  it("Discounts an outbound ground package by 30%", () => {
    expect(0).toBe(1)
  })
})
