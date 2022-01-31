import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

const addSaleDiscount = async () => {
  const reservationPhysicalProduct = await ps.client.reservationPhysicalProduct.findMany(
    {
      where: {
        status: {
          in: ["DeliveredToCustomer", "InTransitOutbound", "AtHome"],
        },
      },
      select: {
        physicalProduct: {
          select: {
            id: true,
          },
        },
      },
    }
  )

  const physicalProductsIds = reservationPhysicalProduct.map(
    reservation => reservation.physicalProduct.id
  )

  const physicalProducts = await ps.client.physicalProduct.findMany({
    where: {
      id: {
        in: physicalProductsIds,
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

  console.log(`Updating prices on ${physicalProducts.length} physical products`)
  let i = 1
  for (let physicalProduct of physicalProducts) {
    const product = physicalProduct.productVariant.product
    const retailPrice = product.retailPrice
    const buyUsedPrice = physicalProduct?.price?.buyUsedPrice / 100

    let amount = retailPrice

    let discount = 0.6

    if (product.brand.slug === "bode") {
      discount = 0
    }

    const price = buyUsedPrice || retailPrice
    const discountedPrice = Math.ceil(price * discount)

    console.log(`
          Updating ${i++} of ${physicalProducts.length}

          ${physicalProduct.seasonsUID}:

          Computed Price
          - Retail Cost: ${retailPrice}
          - Buy Used Price: ${buyUsedPrice}
          - Archive Price: ${discountedPrice}
          - Discount: ${discount}

      `)

    amount = discountedPrice

    await ps.client.product.update({
      where: {
        id: product.id,
      },
      data: {
        discountPercentage: 40,
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

const updatePhysicalProducts = async () => {
  await ps.client.physicalProductPrice.updateMany({
    data: {
      buyUsedEnabled: true,
    },
  })
  console.log("Done")
}

addSaleDiscount()
// createCollections()

// updatePhysicalProducts()
