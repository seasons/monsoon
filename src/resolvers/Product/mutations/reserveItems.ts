import {
  Context,
  calcShipmentWeightFromProductVariantIDs,
  calcTotalRetailPriceFromProductVariantIDs,
} from "../../../utils"
import { ApolloError } from "apollo-server"
import {
  getUserRequestObject,
  getCustomerFromContext,
} from "../../../auth/utils"
import { getLatestReservation } from "../getLatestReservation"
import { checkLastReservation, createPrismaReservation } from "../utils"
import { getHeldPhysicalProducts } from "../getHeldPhysicalProducts"
import { updateProductVariantCounts } from "../updateProductVariantCounts"
import { markPhysicalProductsReservedOnAirtable } from "../markPhysicalProductsReservedOnAirtable"
import { createShippoShipment } from "../createShippoShipment"
import { createReservationData } from "../createReservationData"
import { createAirtableReservation } from "../../../airtable/utils"
import { sendReservationConfirmationEmail } from "../sendReservationConfirmationEmail"
import { RollbackError } from "../../../errors"
import * as Sentry from "@sentry/node"
import { getNewProductVariantsBeingReserved } from "../getNewProductVariantsBeingReserved"
import { markPhysicalProductsReservedOnPrisma } from "../markPhysicalProductsReservedOnPrisma"
import { createShippingLabel, ShippoTransaction } from "../createShippingLabel"
import { markBagItemsReserved } from "../updateAddedBagItems"

export async function reserveItems(parent, { items }, ctx: Context, info) {
  let reservationReturnData
  let rollbackFuncs = []

  try {
    // Do a quick validation on the data
    if (items.length < 3) {
      throw new ApolloError(
        "Must supply at least three product variant ids",
        "515"
      )
    }

    // Get user data
    const userRequestObject = await getUserRequestObject(ctx)
    const customer = await getCustomerFromContext(ctx)

    // Figure out which items the user is reserving anew and which they already have
    const lastReservation = await getLatestReservation(
      ctx.prisma,
      ctx.db,
      customer
    )
    checkLastReservation(lastReservation)
    const newProductVariantsBeingReserved = await getNewProductVariantsBeingReserved(
      lastReservation,
      items
    )
    const heldPhysicalProducts = await getHeldPhysicalProducts(
      ctx,
      lastReservation
    )

    // Get product data, update variant counts, update physical product statuses
    const [
      productsBeingReserved,
      physicalProductsBeingReserved,
      rollbackUpdateProductVariantCounts,
    ] = await updateProductVariantCounts(newProductVariantsBeingReserved, ctx)
    rollbackFuncs.push(rollbackUpdateProductVariantCounts)
    const rollbackPrismaPhysicalProductStatuses = await markPhysicalProductsReservedOnPrisma(
      ctx.prisma,
      physicalProductsBeingReserved
    )
    rollbackFuncs.push(rollbackPrismaPhysicalProductStatuses)
    const rollbackAirtablePhysicalProductStatuses = await markPhysicalProductsReservedOnAirtable(
      physicalProductsBeingReserved
    )
    rollbackFuncs.push(rollbackAirtablePhysicalProductStatuses)

    // Create shipping labels.
    const shipmentWeight = await calcShipmentWeightFromProductVariantIDs(
      ctx.prisma,
      newProductVariantsBeingReserved as string[]
    )
    const insuranceAmount = await calcTotalRetailPriceFromProductVariantIDs(
      ctx.prisma,
      newProductVariantsBeingReserved as string[]
    )
    const [
      seasonsToShippoShipment,
      customerToSeasonsShipment,
    ] = await createShippoShipment(
      ctx.prisma,
      userRequestObject,
      customer,
      shipmentWeight,
      insuranceAmount
    )
    let seasonsToCustomerTransaction = await createShippingLabel({
      shipment: seasonsToShippoShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: "ups_ground",
    })
    let customerToSeasonsTransaction = await createShippingLabel({
      shipment: customerToSeasonsShipment,
      carrier_account: process.env.UPS_ACCOUNT_ID,
      servicelevel_token: "ups_ground",
    })

    // Update relevant BagItems
    const rollbackBagItemsUpdate = await markBagItemsReserved(
      ctx.prisma,
      customer.id,
      newProductVariantsBeingReserved
    )
    rollbackFuncs.push(rollbackBagItemsUpdate)

    // Create reservation records in prisma and airtable
    const reservationData = await createReservationData(
      ctx.prisma,
      seasonsToCustomerTransaction,
      customerToSeasonsTransaction,
      userRequestObject,
      customer,
      shipmentWeight,
      physicalProductsBeingReserved,
      heldPhysicalProducts
    )
    const [
      prismaReservation,
      rollbackPrismaReservationCreation,
    ] = await createPrismaReservation(ctx.prisma, reservationData)
    rollbackFuncs.push(rollbackPrismaReservationCreation)
    const [
      ,
      rollbackAirtableReservationCreation,
    ] = await createAirtableReservation(
      userRequestObject.email,
      reservationData,
      (seasonsToCustomerTransaction as ShippoTransaction).formatted_error,
      (customerToSeasonsTransaction as ShippoTransaction).formatted_error
    )
    rollbackFuncs.push(rollbackAirtableReservationCreation)

    // Send confirmation email
    await sendReservationConfirmationEmail(
      ctx.prisma,
      userRequestObject,
      productsBeingReserved,
      prismaReservation
    )

    // Get return data
    reservationReturnData = await ctx.db.query.reservation(
      { where: { id: prismaReservation.id } },
      info
    )
  } catch (err) {
    for (let rollbackFunc of rollbackFuncs) {
      try {
        await rollbackFunc()
      } catch (err2) {
        Sentry.configureScope(function(scope) {
          scope.setTag("flag", "data-corruption")
          scope.setExtra(`item ids`, `${items}`)
          scope.setExtra(`original error`, err)
        })
        Sentry.captureException(new RollbackError(err2))
      }
    }
    throw err
  }

  return reservationReturnData
}
