import { Module } from "@nestjs/common"
import { GraphQLModule, GqlModuleOptions } from "@nestjs/graphql"
import {
  UserModule,
  HomepageModule,
  ProductModule,
  CollectionModule,
  FAQModule,
  PaymentModule,
  directiveResolvers,
} from "./modules"
import { importSchema } from "graphql-import"
import Analytics from "analytics-node"
import * as Airtable from "airtable"
import { EmailModule } from "./modules/Email/email.module"
import { AirtableModule } from "./modules/Airtable/airtable.module"

const analytics = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

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
            req,
          }),
        } as GqlModuleOptions
      },
    }),
    UserModule,
    HomepageModule,
    ProductModule,
    CollectionModule,
    FAQModule,
    PaymentModule,
    EmailModule,
    AirtableModule,
  ],
})
export class AppModule {}
