import { ImageResizeService } from "./services/imageResize.service"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"
import { UtilsService } from "./services/utils.service"

@Module({
  imports: [PrismaModule],
  providers: [ImageResizeService, UtilsService],
  exports: [ImageResizeService, UtilsService],
})
export class UtilsModule {}
