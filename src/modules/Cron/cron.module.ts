import { Module, forwardRef } from '@nestjs/common';
import { UsersScheduledJobs } from './services/users.service';
import { AirtableModule, EmailModule, UserModule } from '..';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    forwardRef(() => AirtableModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PrismaModule),
    forwardRef(() => UserModule)
  ],
  providers: [UsersScheduledJobs],
})
export class CronModule {}