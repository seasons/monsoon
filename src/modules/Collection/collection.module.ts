import { ImageModule } from "@modules/Image/image.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { CollectionQueriesResolver } from "./"
import { CollectionMutationsResolver } from "./mutations/collection.mutations.resolver"
import { CollectionService } from "./services/collection.service"

@Module({
  imports: [PrismaModule, ImageModule],
  providers: [
    CollectionMutationsResolver,
    CollectionQueriesResolver,
    CollectionService,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
