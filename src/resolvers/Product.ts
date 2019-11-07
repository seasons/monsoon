import { Context } from "../utils"
import { getUserId, getCustomerFromContext } from "../auth/utils"
import sgMail from "@sendgrid/mail"
import { ProductVariantUpdateInput, ReservationCreateInput } from "../prisma"
import { getAllProductVariants, createReservation } from "../airtable/utils"
import { ApolloError } from "apollo-server"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const Product = {}

export const ProductMutations = {
  async reserveItems(
    parent,
    { items, options = { dryRun: false } },
    ctx: Context,
    info
  ) {
    const user = await getUserId(ctx)
    const customer = await getCustomerFromContext(ctx)
    console.log(user, items)

    const physicalProducts = await ctx.prisma.physicalProducts({
      where: {
        productVariant: {
          id_in: items,
        },
      },
    })

    const products = await updateProductVariantCounts(
      items,
      physicalProducts,
      ctx,
      options
    )

    // Notify user about reservation via email
    // Create reservation record in airtable

    if (!options.dryRun) {
      const physicalProductSUIDs = physicalProducts.map(p => ({
        seasonsUID: p.seasonsUID,
      }))
      const reservationData = {
        products: {
          connect: physicalProductSUIDs,
        },
        customer: {
          connect: {
            id: customer.id,
          },
        },
        user: {
          connect: {
            id: user.id,
          },
        },
        shippingLabel: {
          create: {
            image: "",
            name: "USPS",
          },
        },
        reservationNumber: Math.floor(Math.random() * 90000) + 10000,
        shipped: false,
        status: "InQueue",
      } as ReservationCreateInput

      const reservation = await ctx.prisma.createReservation(reservationData)

      console.log(reservation)
      createReservation(user, reservationData)
    }

    // await ctx.prisma.updateCustomer({
    //   data: {

    //   }
    // })

    // TODO: swap static email with recipiant email
    // const msg = {
    //   to: "l2succes@gmail.com",
    //   from: "luc@seasons.nyc",
    //   templateId: "d-2f3c87ab19054af4a13c730e3267a2c5",
    //   dynamic_template_data: {
    //     items: products,
    //   },
    // }
    // sgMail.send(msg)
  },
}

const updateProductVariantCounts = async (
  items,
  physicalProducts,
  ctx,
  { dryRun = false }
) => {
  // Check if physical product is available for each product variant
  const variants = await ctx.prisma.productVariants({
    where: { id_in: items },
  })

  const unavailableVariants = variants.filter(v => v.reservable <= 0)
  if (unavailableVariants.length > 0) {
    throw new ApolloError(
      "The following item is not reservable",
      "511",
      unavailableVariants
    )
  }

  const availablePhysicalProducts = []
  for (let physicalProduct of physicalProducts) {
    if (true) {
      // if (physicalProduct.inventoryStatus === "Reservable") {
      availablePhysicalProducts.push(physicalProduct)
    }
  }

  if (availablePhysicalProducts.length < 3) {
    // TODO: list out unavailable items
    throw new ApolloError("The following item is not reservable", "510")
  }

  const allProductVariants = await getAllProductVariants()
  const variantSlugs = variants.map(a => a.sku)
  const productVariants = allProductVariants.filter(a =>
    variantSlugs.includes(a.model.sKU)
  )
  const products = []

  //TODO: convert to transaction
  for (let variant of variants) {
    const iProduct = await ctx.prisma
      .productVariant({ id: variant.id })
      .product()

    products.push(iProduct)
    console.log(iProduct, variant)

    if (!dryRun) {
      const data = {
        reservable: variant.reservable - 1,
        reserved: variant.reserved + 1,
      } as ProductVariantUpdateInput

      const update = ctx.prisma.updateProductVariant({
        where: {
          id: variant.id,
        },
        data,
      })

      const { reservable, reserved, nonReservable } = await update

      // Airtable record of product variant
      const aProductVariant = productVariants.find(
        a => a.model.sKU === variant.sku
      )

      aProductVariant.patchUpdate({
        "Reservable Count": reservable,
        "Reserved Count": reserved,
        "Non-Reservable Count": nonReservable,
      })
    }
  }

  return products
}
