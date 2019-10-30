import { Context } from "../utils"
import { getUserId } from "../auth/utils"
import sgMail from "@sendgrid/mail"
import { ProductVariantUpdateInput, ReservationCreateInput } from "../prisma"
import { getAllProductVariants, createReservation } from "../airtable/utils"
import { base } from "../airtable/config"
import { ApolloError } from "apollo-server"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const Product = {}

export const ProductMutations = {
  async reserveItems(parent, { items }, ctx: Context, info) {
    const user = await getUserId(ctx)
    console.log(user, items)

    // Check if physical product is available for each product variant
    const variants = await ctx.prisma.productVariants({
      where: { id_in: items },
    })

    const physicalProducts = await ctx.prisma.physicalProducts({
      where: {
        productVariant: {
          id_in: items,
        },
      },
    })

    const availablePhysicalProducts = []
    for (let physicalProduct of physicalProducts) {
      if (physicalProduct.inventoryStatus === "Reservable") {
        availablePhysicalProducts.push(physicalProduct)
      }
    }

    if (availablePhysicalProducts.length < 3) {
      // TODO: list out unavailable items
      // throw new Error("the following item are no longer available")
    }

    const allProductVariants = await getAllProductVariants()
    const variantSlugs = variants.map(a => a.sku)
    const productVariants = allProductVariants.filter(a =>
      variantSlugs.includes(a.model.sKU)
    )
    const products = []

    //TODO: convert to transaction
    for (let variant of variants) {
      if (variant.reservable <= 0) {
        throw new ApolloError(
          "The following item is not reservable",
          "510",
          variant
        )
      }
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

      const iProduct = await ctx.prisma
        .productVariant({ id: variant.id })
        .product()

      products.push(iProduct)
      console.log(iProduct, variant)

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

    // Notify user about reservation via email
    // Create reservation record in airtable
    const physicalProductIDs = physicalProducts.map(p => ({ id: p.id }))
    const reservationData = {
      products: {
        connect: physicalProductIDs,
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
      shipped: false,
    } as ReservationCreateInput
    const reservation = await ctx.prisma.createReservation(reservationData)

    console.log(reservation)
    createReservation(reservationData)

    const msg = {
      to: "l2succes@gmail.com",
      from: "luc@seasons.nyc",
      templateId: "d-2f3c87ab19054af4a13c730e3267a2c5",
      dynamic_template_data: {
        items: products,
      },
    }
    sgMail.send(msg)
  },
}
