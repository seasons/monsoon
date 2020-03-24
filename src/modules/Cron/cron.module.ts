import { Module } from '@nestjs/common';
import { UsersScheduleJob } from './services/users.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReservationScheduledJobs } from './services/reservations.service';
import { AirtableModule } from '../Airtable/airtable.module';
import { EmailModule } from '../Email/email.module';
import { UserModule } from '../User/user.module';
import { ShippingModule } from '../Shipping/shipping.module';

@Module({
  imports: [
    AirtableModule,
    EmailModule,
    PrismaModule,
    ShippingModule,
    UserModule
  ],
  providers: [ReservationScheduledJobs, UsersScheduleJob],
})
export class CronModule {}