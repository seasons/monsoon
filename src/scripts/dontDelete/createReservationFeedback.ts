import "module-alias/register"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
// import { EmailDataProvider } from "../../modules/Email/services/email.data.service"
import { EmailService } from "../../modules/Email/services/email.service"
import { EmailUtilsService } from "../../modules/Email/services/email.utils.service"
import { ErrorService } from "../../modules/Error/services/error.service"
import { ImageService } from "../../modules/Image/services/image.service"
import { PaymentService } from "../../modules/Payment/services/payment.service"
import { PhysicalProductUtilsService } from "../../modules/Product/services/physicalProduct.utils.service"
import { ProductUtilsService } from "../../modules/Product/services/product.utils.service"
import { ProductVariantService } from "../../modules/Product/services/productVariant.service"
import { PusherService } from "../../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../../modules/PushNotification/services/pushNotification.service"
import { ReservationService } from "../../modules/Reservation/services/reservation.service"
import { ReservationUtilsService } from "../../modules/Reservation/services/reservation.utils.service"
import { ShippingService } from "../../modules/Shipping/services/shipping.service"
import { SMSService } from "../../modules/SMS/services/sms.service"
import { TwilioService } from "../../modules/Twilio/services/twilio.service"
import { TwilioUtils } from "../../modules/Twilio/services/twilio.utils.service"
import { AdmissionsService } from "../../modules/User/services/admissions.service"
import { AuthService } from "../../modules/User/services/auth.service"
import { CustomerService } from "../../modules/User/services/customer.service"
import { PaymentUtilsService } from "../../modules/Utils/services/paymentUtils.service"
import { UtilsService } from "../../modules/Utils/services/utils.service"
import { PrismaService } from "../../prisma/prisma.service"

/*
 *  Use: This script can be used to make a reservation feedback object on a specific user for testing purposes
 *  Reason not to delete: This is helpful for testing the reservation feedback flow
 */
const run = async () => {
  const ps = new PrismaService()
  const error = new ErrorService()
  const segmentService = new SegmentService()
  const twilio = new TwilioService()
  const twilioUtils = new TwilioUtils()
  const image = new ImageService(ps)
  const utils = new UtilsService(ps)
  const utilsService = new UtilsService(ps)
  const emailUtils = new EmailUtilsService(ps, error, image)
  const email = new EmailService(ps, utilsService, emailUtils)
  const paymentUtils = new PaymentUtilsService(ps, segmentService)
  const sms = new SMSService(
    ps,
    twilio,
    twilioUtils,
    paymentUtils,
    error,
    email
  )
  const pusher = new PusherService()
  const pushNotifData = new PushNotificationDataProvider()
  const pushNotificationService = new PushNotificationService(
    pusher,
    pushNotifData,
    ps,
    error
  )
  const productUtils = new ProductUtilsService(ps, utilsService)
  const physicalProductUtilsService = new PhysicalProductUtilsService(
    ps,
    productUtils
  )
  const productVariantService = new ProductVariantService(
    ps,
    productUtils,
    physicalProductUtilsService
  )
  const shippingService = new ShippingService(ps, utilsService)
  const admissionsService = new AdmissionsService(ps, utilsService)
  let payment
  let customerService
  const authService = new AuthService(
    ps,
    pushNotificationService,
    email,
    error,
    utilsService,
    payment
  )
  payment = new PaymentService(
    shippingService,
    authService,
    customerService,
    email,
    paymentUtils,
    ps,
    utils,
    segmentService,
    error
  )
  customerService = new CustomerService(
    authService,
    ps,
    shippingService,
    admissionsService,
    segmentService,
    email,
    pushNotificationService,
    sms,
    utilsService
  )
  const pushNotifs = new PushNotificationService(
    pusher,
    pushNotifData,
    ps,
    error
  )
  const reservationUtils = new ReservationUtilsService(ps, shippingService)
  const reservationService = new ReservationService(
    ps,
    payment,
    productUtils,
    productVariantService,
    physicalProductUtilsService,
    shippingService,
    email,
    pushNotifs,
    reservationUtils,
    error
  )

  const productVariantIDs = [
    "cklh7w038320v0761r527lshm",
    "cklifyhgs3adw0714t93m4xb5",
  ]

  const returnedPhysicalProducts = await ps.client.productVariants({
    where: {
      id_in: productVariantIDs,
    },
  })

  const prismaUser = await ps.client.user({ id: "ckltvlfkx00bg0770u8jyx7vp" })
  const reservation = await ps.client.reservation({
    id: "ckltwj7xp00wy0770ritd6z65",
  })

  await reservationService.createReservationFeedbacksForVariants(
    returnedPhysicalProducts,
    prismaUser,
    reservation
  )
}

run()
