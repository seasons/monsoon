import { PrismaModule } from "@modules/Prisma/prisma.module"
import { Module } from "@nestjs/common"

import { Upload } from "./models/Upload.model"
import { ImageMutationsResolver } from "./mutations/image.mutations.resolver"
import { ImageResolver } from "./queries/image.resolver"
import { ImageService } from "./services/image.service"

@Module({
  imports: [PrismaModule],
  providers: [ImageService, ImageMutationsResolver, ImageResolver, Upload],
  exports: [ImageService],
})
export class ImageModule {}
