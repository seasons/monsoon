import { Module } from "@nestjs/common"
import { PrismaModule } from "../../prisma/prisma.module"
import { CollectionResolver } from "./collection.resolver"

@Module({
  imports: [PrismaModule],
  providers: [CollectionResolver],
})
export class CollectionModule {}
