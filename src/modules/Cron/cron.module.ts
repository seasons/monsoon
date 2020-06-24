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

import { PaymentModule } from "../Payment/payment.module"
import { DataScheduledJobs } from "./services/data.job.service"
import { MembershipScheduledJobs } from "./services/membership.service"
import { ReservationScheduledJobs } from "./services/reservations.job.service"

@Module({
  imports: [
    AirtableModule,
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
  ],
  providers: [
    ReservationScheduledJobs,
    DataScheduledJobs,
    MembershipScheduledJobs,
  ],
  exports: [DataScheduledJobs],
})
export class CronModule {}
