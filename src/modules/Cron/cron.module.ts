import { PushNotificationModule } from "@app/modules/PushNotification/pushNotification.module"
import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { ReservationModule } from "@modules/Reservation/reservation.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { SlackModule } from "@modules/Slack/slack.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { DripModule } from "../Drip/drip.module"
import { PaymentModule } from "../Payment/payment.module"
import { SearchModule } from "../Search/search.module"
import { AnalyticsScheduledJobs } from "./services/analytics.job.service"
import { DataScheduledJobs } from "./services/data.job.service"
import { MarketingScheduledJobs } from "./services/marketing.job.service"
import { MembershipScheduledJobs } from "./services/membership.service"
import { PaymentScheduledJobs } from "./services/payment.job.service"
import { ReservationScheduledJobs } from "./services/reservations.job.service"
import { SearchScheduledJobs } from "./services/search.job.service"

@Module({
  imports: [
    AirtableModule,
    DripModule,
    EmailModule,
    ErrorModule,
    PrismaModule,
    PaymentModule,
    ShippingModule,
    SlackModule,
    UserModule,
    ReservationModule,
    UtilsModule,
    PushNotificationModule,
    SearchModule,
  ],
  providers: [
    // ReservationScheduledJobs,
    DataScheduledJobs,
    // MarketingScheduledJobs,
    // MembershipScheduledJobs,
    // PaymentScheduledJobs,
    // SearchScheduledJobs,
    AnalyticsScheduledJobs,
  ],
  exports: [DataScheduledJobs],
})
export class CronModule {}
