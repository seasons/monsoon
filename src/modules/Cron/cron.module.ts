import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { AirtableModule, EmailModule, UserModule } from '..';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    forwardRef(() => AirtableModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PrismaModule),
    forwardRef(() => UserModule)
  ],
  providers: [UsersService],
})
export class CronModule {}