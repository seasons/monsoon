import fs from "fs"

import csvsync from "csvsync"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const addSaleDiscount = async () => {
  const physicalProducts = await ps.client.physicalProduct.findMany({
    where: {
      productVariant: {
        product: {
          brand: {
            brandCode: "BODE",
          },
        },
      },
    },
    select: {
      id: true,
      seasonsUID: true,
      barcoded: true,
      price: {
        select: {
          buyUsedPrice: true,
        },
      },
      productVariant: {
        select: {
          price: true,
          product: {
            select: {
              id: true,
              brand: true,
              retailPrice: true,
              rentalPriceOverride: true,
            },
          },
        },
      },
    },
  })

  const exportFile = fs.readFileSync(`archive-sales.csv`)
  const products = csvsync.parse(exportFile, {
    returnObject: true,
  })

  const suidsToProducts = products.reduce((acc, product) => {
    acc[product.SUID] = product
    return acc
  }, {})

  console.log(`Updating prices on ${physicalProducts.length} physical products`)
  let i = 1
  for (let physicalProduct of physicalProducts) {
    const product = physicalProduct.productVariant.product
    const retailPrice = product.retailPrice

    let amount = retailPrice
    let discount = 0.4

    const csvData = suidsToProducts[physicalProduct.seasonsUID]
    if (csvData) {
      amount = parseFloat(csvData["Discounted Price"])
    }

    if (product.brand.slug === "bode") {
      discount = 1.0
      amount = retailPrice
    }

    const discountedPrice = Math.ceil(amount * discount)

    amount = discountedPrice
    const discountPercentage = Math.ceil((1 - amount / retailPrice) * 100)

    console.log(`
          Updating ${i++} of ${physicalProducts.length}

          ${physicalProduct.seasonsUID}:

          - Retail Price: ${retailPrice}
          - Discounted Price: ${discountedPrice}
          - Discount Percentage: ${discountPercentage}
      `)

    await ps.client.product.update({
      where: {
        id: product.id,
      },
      data: {
        discountPercentage,
        discountedPrice,
      },
    })

    if (physicalProduct.price === null) {
      await ps.client.physicalProduct.update({
        where: {
          id: physicalProduct.id,
        },
        data: {
          price: {
            create: {
              buyUsedPrice: amount,
              buyUsedEnabled: true,
            },
          },
        },
      })
    }

    try {
      await ps.client.physicalProduct.update({
        where: {
          id: physicalProduct.id,
        },
        data: {
          price: {
            update: {
              buyUsedEnabled: true,
              buyUsedPrice: amount * 100,
            },
          },
        },
      })
    } catch (e) {
      console.log(physicalProduct.seasonsUID, ": ", e)
    }
  }

  console.log("Done")
}

addSaleDiscount()
// createCollections()

// updatePhysicalProducts()
