import { AirtableModule } from "@modules/Airtable/airtable.module"
import { EmailModule } from "@modules/Email/email.module"
import { ErrorModule } from "@modules/Error/error.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { ReservationScheduledJobs } from "./services/reservations.service"
import { ShippingModule } from "@modules/Shipping/shipping.module"
import { SlackModule } from "@modules/Slack/slack.module"
import { UserModule } from "@modules/User/user.module"
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
  ],
  providers: [ReservationScheduledJobs, UsersScheduledJobs],
})
export class CronModule {}
