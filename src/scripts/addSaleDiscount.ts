import fs from "fs"

import csvsync from "csvsync"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const addSaleDiscount = async () => {
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
    const discount = parseFloat(discountStr) * 100

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
      await ps.client.physicalProduct.update({
        where: {
          id: physicalProduct.id,
        },
        data: {
          price: {
            update: {
              buyUsedEnabled: true,
            },
          },
        },
      })

      await ps.client.product.update({
        where: {
          id: product.id,
        },
        data: {
          discountPercentage: discount,
          discountedPrice,
        },
      })
    } catch (e) {
      console.log(physicalProduct.seasonsUID, ": ", e)
    }
  }

  console.log("Done")
}

const createCollections = async () => {
  const groups = {
    under100: [],
    under200: [],
    under500: [],
    under1000: [],
  }

  const products = await ps.client.product.findMany({})

  for (let product of products) {
    const retailPrice = product.retailPrice
    const discountPercentage = product.discountPercentage
    const discountedPrice = Math.ceil(
      retailPrice * (1 - discountPercentage / 100)
    )

    if (discountedPrice < 100) {
      groups.under100.push(product)
    } else if (discountedPrice < 200) {
      groups.under200.push(product)
    } else if (discountedPrice < 500) {
      groups.under500.push(product)
    } else if (discountedPrice < 1000) {
      groups.under1000.push(product)
    }
  }

  const under100 = await ps.client.collection.create({
    data: {
      title: "Under $100",
      slug: "under-100",
      published: false,
      displayTextOverlay: false,
      products: {
        connect: groups.under100.map(product => ({ id: product.id })),
      },
    },
  })

  const under200 = await ps.client.collection.create({
    data: {
      title: "Under $200",
      slug: "under-200",
      published: false,
      displayTextOverlay: false,
      products: {
        connect: groups.under200.map(product => ({ id: product.id })),
      },
    },
  })

  const under500 = await ps.client.collection.create({
    data: {
      title: "Under $500",
      slug: "under-500",
      published: false,
      displayTextOverlay: false,
      products: {
        connect: groups.under500.map(product => ({ id: product.id })),
      },
    },
  })

  const under1000 = await ps.client.collection.create({
    data: {
      title: "Under $1000",
      slug: "under-1000",
      published: false,
      displayTextOverlay: false,
      products: {
        connect: groups.under1000.map(product => ({ id: product.id })),
      },
    },
  })

  console.log(under100)
  console.log(under200)
  console.log(under500)
  console.log(under1000)
}

addSaleDiscount()
// createCollections()
