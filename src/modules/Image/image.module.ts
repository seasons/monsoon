import { Module } from "@nestjs/common"

import { Upload } from "./models/Upload.model"
import { ImageMutationsResolver } from "./mutations/image.mutations.resolver"
import { ImageResizeService } from "./services/imageResize.service"

@Module({
  providers: [ImageResizeService, ImageMutationsResolver, Upload],
  exports: [ImageResizeService],
})
export class ImageModule {}
