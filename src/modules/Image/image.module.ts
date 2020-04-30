import { Module } from "@nestjs/common"

import { ImageResizeService } from "./services/imageResize.service"

@Module({
  providers: [ImageResizeService],
  exports: [ImageResizeService],
})
export class ImageModule {}
