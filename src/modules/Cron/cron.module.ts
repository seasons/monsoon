import { Module, forwardRef } from '@nestjs/common';
import { CheckAndAuthorizeUsersService } from './services/checkAndAuthorizeUsers.service';
import { AirtableModule, EmailModule, UserModule } from '..';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    forwardRef(() => AirtableModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PrismaModule),
    forwardRef(() => UserModule)
  ],
  providers: [CheckAndAuthorizeUsersService],
})
export class CronModule {}