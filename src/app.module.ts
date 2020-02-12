import { Module } from "@nestjs/common"
import { GraphQLModule } from "@nestjs/graphql"
import { MeModule, HomepageModule, ProductModule } from "./modules"
import { PrismaModule } from "./prisma/prisma.module"
import { importSchema } from "graphql-import"

const typeDefs = importSchema("./src/schema.graphql")

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useFactory: async () => {
        const typeDefs = await importSchema("src/schema.graphql")
        return {
          typeDefs,
          path: "/",
          installSubscriptionHandlers: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
        }
      },
    }),
    MeModule,
    HomepageModule,
    ProductModule,
  ],
})
export class AppModule {}
