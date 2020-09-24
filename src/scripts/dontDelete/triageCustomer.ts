import "module-alias/register"

import * as Airtable from "airtable"

import { AirtableBaseService } from "../../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../../modules/Airtable/services/airtable.utils.service"
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
  Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_KEY,
  })

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
  const utilsService = new UtilsService(ps)
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

  await customerService.triageCustomer(
    { id: "ckf8meipx0e6f07296x61ory9" },
    "harvest",
    true
  )
}

run()
