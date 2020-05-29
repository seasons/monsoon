import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { PushNotificationsModule } from "@modules/PushNotifications/pushNotifications.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { SlackModule } from "@modules/Slack/slack.module"
import { UserModule } from "@modules/User/user.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { DataScheduledJobs } from "./services/data.service"
import { ReservationScheduledJobs } from "./services/reservations.service"
import { UsersScheduledJobs } from "./services/users.service"

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    PrismaModule,
    ShippingModule,
    SlackModule,
    UserModule,
    ErrorModule,
    UtilsModule,
    PushNotificationsModule,
  ],
  providers: [ReservationScheduledJobs, UsersScheduledJobs, DataScheduledJobs],
  exports: [DataScheduledJobs],
})
export class CronModule {}
