import { Module } from "@nestjs/common"
import { GraphQLModule, GqlModuleOptions } from "@nestjs/graphql"
import {
  UserModule,
  HomepageModule,
  ProductModule,
  CollectionModule,
  PaymentModule,
  directiveResolvers
} from "./modules"
import { importSchema } from "graphql-import"
import Analytics from "analytics-node"

const analytics = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

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
          directiveResolvers,
          context: ({ req }) => ({
            analytics,
            req
          }),
        } as GqlModuleOptions
      },
    }),
    UserModule,
    HomepageModule,
    ProductModule,
    CollectionModule,
    PaymentModule,
  ],
})
export class AppModule {}
