import { ImageResizeService } from "./services/imageResize.service"
import { Module } from "@nestjs/common"

@Module({
  providers: [ImageResizeService],
  exports: [ImageResizeService],
})
export class ImageModule {}
