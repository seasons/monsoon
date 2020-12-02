import "module-alias/register"

import { SegmentService } from "../../modules/Analytics/services/segment.service"
import { PusherService } from "../../modules/PushNotification/services/pusher.service"
import { PushNotificationDataProvider } from "../../modules/PushNotification/services/pushNotification.data.service"
import { PushNotificationService } from "../../modules/PushNotification/services/pushNotification.service"
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
