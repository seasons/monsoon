import fs from "fs"

import csvsync from "csvsync"

import { PrismaService } from "../prisma/prisma.service"

const addSaleDiscount = async () => {
  const ps = new PrismaService()

  const exportFile = fs.readFileSync(`archive-sales.csv`)
  const products = csvsync.parse(exportFile, {
    returnObject: true,
  })

  const productSUIDs = products
    .map(product => product.SUID)
    .filter(a => a !== "")

  const suidsToProducts = products.reduce((acc, product) => {
    acc[product.SUID] = product
    return acc
  }, {})

  const physicalProducts = await ps.client.physicalProduct.findMany({
    where: {
      seasonsUID: {
        in: productSUIDs,
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
              retailPrice: true,
              rentalPriceOverride: true,
            },
          },
        },
      },
    },
  })

  for (let physicalProduct of physicalProducts) {
    const product = physicalProduct.productVariant.product

    const retailPrice = product.retailPrice

    const csvData = suidsToProducts[physicalProduct.seasonsUID]
    const discountStr = csvData.Discount
    const discount = parseFloat(discountStr)

    const discountedPrice = Math.ceil(retailPrice * (1 - discount / 100))

    console.log(`
        ${physicalProduct.seasonsUID}:

        CSV Data
         - Retail Cost: ${csvData[" Retail Cost "]}
         - Archive Price: ${csvData[" Archive Price "]}
         - Discount: ${discountStr}

        Computed Price
        - Retail Cost: ${retailPrice}
        - Archive Price: ${discountedPrice}
        - Discount: ${discount}


    `)

    try {
      await ps.client.product.update({
        where: {
          id: product.id,
        },
        data: {
          discountPercentage: discount,
        },
      })
    } catch (e) {
      console.log(physicalProduct.seasonsUID, ": ", e)
    }
  }
}

addSaleDiscount()
