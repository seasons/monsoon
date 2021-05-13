import { ImageModule } from "@modules/Image/image.module"
import { ProductModule } from "@modules/Product/product.module"
import { UtilsModule } from "@modules/Utils/utils.module"
import { Module } from "@nestjs/common"
import { PrismaModule } from "@prisma/prisma.module"

import { ProductService } from "../Product/services/product.service"
import { CollectionQueriesResolver } from "./"
import { CollectionFieldsResolver } from "./collection.fields.resolver"
import { CollectionMutationsResolver } from "./mutations/collection.mutations.resolver"
import { CollectionService } from "./services/collection.service"

@Module({
  imports: [PrismaModule, ImageModule, ProductModule, UtilsModule],
  providers: [
    CollectionFieldsResolver,
    CollectionMutationsResolver,
    CollectionQueriesResolver,
    CollectionService,
    ProductService,
  ],
  exports: [CollectionService],
})
export class CollectionModule {}
