import { Module } from "@nestjs/common"
import { UsersScheduledJobs } from "./services/users.service"
import { PrismaModule } from "../../prisma/prisma.module"
import { ReservationScheduledJobs } from "./services/reservations.service"
import { AirtableModule } from "../Airtable/airtable.module"
import { EmailModule } from "../Email/email.module"
import { UserModule } from "../User/user.module"
import { ShippingModule } from "../Shipping/shipping.module"
import { SlackModule } from "../Slack/slack.module"
import { ErrorModule } from "../Error/error.module"
import { DataScheduledJobs } from "./services/data.service"
import { UtilsModule } from "../Utils/utils.module"

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
