import { prisma, InventoryStatus } from "../../src/prisma"
import { db } from "../../src/server"

export const updateProductVariantCountsBasedOnReservations = async () => {
  const activeReservations = await db.query.reservations(
    {
      where: {
        status_not_in: ["Completed", "Cancelled"],
      },
    },
    `
    {
        id
        customer {
          id
          user {
            firstName
            lastName
          }
        }
        products {
          id
          seasonsUID
          inventoryStatus
          productVariant {
            sku
            id
            total
            reservable
            reserved
            nonReservable
          }
        }
        status
    }
    `
  )

  const updatedProductVariants: any = {}
  const reservedPhysicalProducts = {}

  const productVariants = await prisma.productVariants()
  const physicalProducts = await prisma.physicalProducts()

  let output = "sku,total,reserved,reservable,non reservable\n"

  for (let productVariant of productVariants) {
    updatedProductVariants[productVariant.sku] = {
      total: productVariant.total,
      reserved: 0,
      reservable: productVariant.total - productVariant.nonReservable,
      nonReservable: productVariant.nonReservable,
    }
  }

  for (let reservation of activeReservations) {
    reservation.products.forEach(product => {
      const sku = product.productVariant.sku
      const productVariant = updatedProductVariants[sku]
      const { reservable, reserved, nonReservable } = productVariant

      reservedPhysicalProducts[product.seasonsUID] = "Reserved"

      updatedProductVariants[sku] = {
        ...productVariant,
        reserved: reservable > 0 ? reserved + 1 : reserved,
        reservable:
          (reservable > 0 ? reservable - 1 : reservable) - nonReservable,
      }
    })
  }

  for (let physicalProduct of physicalProducts) {
    let newStatus: InventoryStatus = "Reservable"
    if (reservedPhysicalProducts[physicalProduct.seasonsUID]) {
      newStatus = "Reserved"
    } else if (physicalProduct.inventoryStatus === "NonReservable") {
      newStatus = "NonReservable"
    }

    await prisma.updatePhysicalProduct({
      data: {
        inventoryStatus: newStatus,
      },
      where: {
        seasonsUID: physicalProduct.seasonsUID,
      },
    })
  }

  for (let sku in updatedProductVariants) {
    const {
      total,
      reserved,
      reservable,
      nonReservable,
    } = updatedProductVariants[sku]
    output += `${sku},${total},${reserved},${reservable},${nonReservable}\n`
    await prisma.updateProductVariant({
      data: {
        reserved,
        reservable,
        nonReservable,
      },
      where: {
        sku,
      },
    })
  }

  //   console.log(JSON.stringify(updatedProductVariants, null, 2))
  console.log(output)
}

updateProductVariantCountsBasedOnReservations()
