import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { AirtableModule, EmailModule, UserModule } from '..';
import { PrismaModule } from '../../prisma/prisma.module';
import { ReservationScheduledJobs } from './services/reservations.service';

@Module({
  imports: [
    forwardRef(() => AirtableModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PrismaModule),
    forwardRef(() => UserModule)
  ],
  providers: [ReservationScheduledJobs, UsersService],
})
export class CronModule {}