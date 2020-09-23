import "module-alias/register"

import * as Airtable from "airtable"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { EmailDataProvider } from "../modules/Email/services/email.data.service"
import { EmailService } from "../modules/Email/services/email.service"
import { PhysicalProductUtilsService } from "../modules/Product/services/physicalProduct.utils.service"
import { ProductUtilsService } from "../modules/Product/services/product.utils.service"
import { ProductVariantService } from "../modules/Product/services/productVariant.service"
import { PusherService } from "../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../modules/PushNotification/services/pushNotification.service"
import { ReservationService } from "../modules/Reservation/services/reservation.service"
import { ReservationUtilsService } from "../modules/Reservation/services/reservation.utils.service"
import { ShippingService } from "../modules/Shipping/services/shipping.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_KEY,
  })

  const ps = new PrismaService()
  const pusher = new PusherService()
  const pushNotifData = new PushNotificationDataProvider()
  const productUtils = new ProductUtilsService(ps)
  const airtableBase = new AirtableBaseService()
  const airtableUtils = new AirtableUtilsService(airtableBase)
  const utilsService = new UtilsService(ps)
  const physicalProductUtilsService = new PhysicalProductUtilsService(
    ps,
    productUtils
  )
  const airtableService = new AirtableService(airtableBase, airtableUtils)
  const productVariantService = new ProductVariantService(
    ps,
    productUtils,
    physicalProductUtilsService,
    airtableService
  )
  const emailData = new EmailDataProvider()
  const shippingService = new ShippingService(ps, utilsService)
  const emails = new EmailService(ps, utilsService, emailData)
  const pushNotifs = new PushNotificationService(pusher, pushNotifData, ps)
  const reservationUtils = new ReservationUtilsService(ps, shippingService)
  const reservationService = new ReservationService(
    ps,
    productUtils,
    productVariantService,
    physicalProductUtilsService,
    airtableService,
    shippingService,
    emails,
    pushNotifs,
    reservationUtils
  )

  const productVariantIDs = ["ckewwenqw05lj07707oi3dyy7"]

  const returnedPhysicalProducts = await ps.client.productVariants({
    where: {
      id_in: productVariantIDs,
    },
  })

  const prismaUser = await ps.client.user({ id: "ckfe58vr902990763htfxgve3" })
  const reservation = await ps.client.reservation({
    id: "ckfe71slw04d40763l5mcrzuh",
  })

  await reservationService.createReservationFeedbacksForVariants(
    returnedPhysicalProducts,
    prismaUser,
    reservation
  )
}

run()
