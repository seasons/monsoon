import { Module } from "@nestjs/common"
import { GraphQLModule, GqlModuleOptions } from "@nestjs/graphql"
import { UserModule, HomepageModule, ProductModule } from "./modules"
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
          context: ({ req }) => ({ req }),
        } as GqlModuleOptions
      },
    }),
    UserModule,
    HomepageModule,
    ProductModule,
  ],
})
export class AppModule {}
