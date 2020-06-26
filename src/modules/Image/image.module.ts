import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { Upload } from "./models/Upload.model"
import { ImageMutationsResolver } from "./mutations/image.mutations.resolver"
import { ImageService } from "./services/image.service"

@Module({
  imports: [PrismaModule],
  providers: [ImageService, ImageMutationsResolver, Upload],
  exports: [ImageService],
})
export class ImageModule {}
