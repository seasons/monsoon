import "module-alias/register"

import { NestFactory } from "@nestjs/core"

import { AppModule } from "../app.module"
import { ProductVariantService } from "../modules/Product/services/productVariant.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const app = await NestFactory.createApplicationContext(AppModule)

  const ps = new PrismaService()
  const productVariantService = app.get(ProductVariantService)

  const physicalProducts = await ps.client.physicalProduct.findMany({
    where: {
      inventoryStatus: "NonReservable",
      warehouseLocationId: {
        not: null,
      },
    },
    select: {
      id: true,
      inventoryStatus: true,
      warehouseLocationId: true,
      warehouseLocation: {
        select: {
          id: true,
          itemCode: true,
          locationCode: true,
          barcode: true,
        },
      },
      productVariant: {
        select: {
          id: true,
          offloaded: true,
          reservable: true,
          reserved: true,
          nonReservable: true,
          stored: true,
          total: true,
          product: true,
        },
      },
    },
  })

  const promises = []

  for (const physicalProduct of physicalProducts) {
    promises.push(
      ps.client.physicalProduct.update({
        where: {
          id: physicalProduct.id,
        },
        data: {
          inventoryStatus: "Reservable",
          productStatus: "Clean",
        },
      })
    )
    const counts = productVariantService.getCountsForStatusChange({
      productVariant: physicalProduct.productVariant,
      oldInventoryStatus: physicalProduct.inventoryStatus,
      newInventoryStatus: "Reservable",
    })

    promises.push(
      ps.client.productVariant.update({
        where: {
          id: physicalProduct.productVariant.id,
        },
        data: {
          ...counts,
        },
      })
    )
  }

  const result = await ps.client.$transaction(promises)

  console.log(physicalProducts)
}
run()
