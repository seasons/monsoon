import { PushNotificationModule } from "@app/modules/PushNotification/pushNotification.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { ReservationModule } from "@modules/Reservation/reservation.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { ShopifyModule } from "@modules/Shopify/shopify.module"
import { SlackModule } from "@modules/Slack/slack.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { AnalyticsModule } from "../Analytics/analytics.module"
import { DripModule } from "../Drip/drip.module"
import { PaymentModule } from "../Payment/payment.module"
import { SearchModule } from "../Search/search.module"
import { SMSModule } from "../SMS/sms.module"
import { AdmissionsScheduledJobs } from "./services/admissions.job.service"
import { DataScheduledJobs } from "./services/data.job.service"
import { LogsScheduledJobs } from "./services/logs.job.service"
import { MarketingScheduledJobs } from "./services/marketing.job.service"
import { MembershipScheduledJobs } from "./services/membership.job.service"
import { ReservationScheduledJobs } from "./services/reservations.job.service"
import { SearchScheduledJobs } from "./services/search.job.service"
import { ShopifyScheduledJobs } from "./services/shopify.job.service"
import { SubscriptionsScheduledJobs } from "./services/subscriptions.job.service"

@Module({
  imports: [
    DripModule,
    EmailModule,
    ErrorModule,
    PrismaModule,
    PaymentModule,
    ShippingModule,
    ShopifyModule,
    SlackModule,
    UserModule,
    ReservationModule,
    UtilsModule,
    PushNotificationModule,
    SearchModule,
    SMSModule,
    AnalyticsModule,
  ],
  providers: [
    SubscriptionsScheduledJobs,
    ReservationScheduledJobs,
    DataScheduledJobs,
    MarketingScheduledJobs,
    MembershipScheduledJobs,
    SearchScheduledJobs,
    AdmissionsScheduledJobs,
    ShopifyScheduledJobs,
    LogsScheduledJobs,
  ],
  exports: [DataScheduledJobs],
})
export class CronModule {}
