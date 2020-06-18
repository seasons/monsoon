import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { UtilsModule } from "../Utils/utils.module"

@Module({
  controllers: [],
  imports: [UtilsModule, PrismaModule],
})
export class TwilioModule {}
