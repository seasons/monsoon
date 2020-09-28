import "module-alias/register"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
import { EmailDataProvider } from "../../modules/Email/services/email.data.service"
import { EmailService } from "../../modules/Email/services/email.service"
import { PhysicalProductUtilsService } from "../../modules/Product/services/physicalProduct.utils.service"
import { ProductUtilsService } from "../../modules/Product/services/product.utils.service"
import { ProductVariantService } from "../../modules/Product/services/productVariant.service"
import { PusherService } from "../../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../../modules/PushNotification/services/pushNotification.service"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"
import { ReservationUtilsService } from "../../modules/Reservation/services/reservation.utils.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { ShippingUtilsService } from "../../modules/Shipping/services/shipping.utils.service"
import { AdmissionsService } from "../../modules/User/services/admissions.service"
import { AuthService } from "../../modules/User/services/auth.service"
import { CustomerService } from "../../modules/User/services/customer.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

/*
 *  Use: This script can be used to make a reservation feedback object on a specific user for testing purposes
 *  Reason not to delete: This is helpful for testing the reservation feedback flow
 */
const run = async () => {
  const ps = new PrismaService()
  const pusher = new PusherService()
  const pushNotifData = new PushNotificationDataProvider()
  const pushNotificationService = new PushNotificationService(
    pusher,
    pushNotifData,
    ps
  )
  const shippingUtils = new ShippingUtilsService()
  const authService = new AuthService(
    ps,
    pushNotificationService,
    shippingUtils
  )
  const productUtils = new ProductUtilsService(ps)
  const utilsService = new UtilsService(ps)
  const physicalProductUtilsService = new PhysicalProductUtilsService(
    ps,
    productUtils
  )
  const productVariantService = new ProductVariantService(
    ps,
    productUtils,
    physicalProductUtilsService
  )
  const emailData = new EmailDataProvider()
  const shippingService = new ShippingService(ps, utilsService)
  const admissionsService = new AdmissionsService(ps, utilsService)
  const segmentService = new SegmentService()
  const customerService = new CustomerService(
    authService,
    ps,
    shippingService,
    admissionsService,
    segmentService
  )
  const emails = new EmailService(ps, utilsService, emailData)
  const pushNotifs = new PushNotificationService(pusher, pushNotifData, ps)
  const reservationUtils = new ReservationUtilsService(ps, shippingService)
  const reservationService = new ReservationService(
    ps,
    productUtils,
    productVariantService,
    physicalProductUtilsService,
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
