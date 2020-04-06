import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { SlackModule } from "@modules/Slack/slack.module"
import { UserModule } from "@modules/User/user.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ReservationScheduledJobs } from "./services/reservations.service"
import { UsersScheduledJobs } from "./services/users.service"
import { DataScheduledJobs } from "./services/data.service"

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
  ],
  providers: [ReservationScheduledJobs, UsersScheduledJobs, DataScheduledJobs],
})
export class CronModule {}
