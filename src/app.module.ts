import * as Airtable from "airtable"
import Analytics from "analytics-node"
import chargebee from "chargebee"
import { importSchema } from "graphql-import"

import { Module, forwardRef } from "@nestjs/common"
import { GqlModuleOptions, GraphQLModule } from "@nestjs/graphql"
import { ScheduleModule } from "@nestjs/schedule"
import sgMail from "@sendgrid/mail"

import {
  AirtableModule,
  CollectionModule,
  CronModule,
  directiveResolvers,
  EmailModule,
  FAQModule,
  HomepageModule,
  PaymentModule,
  ProductModule,
  ReservationModule,
  SearchModule,
  SlackModule,
  UserModule,
} from "./modules"

const analytics = new Analytics(process.env.SEGMENT_MONSOON_WRITE_KEY)

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

// make the call to chargebee
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEE_API_KEY,
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Don't run cron jobs in dev mode, to keep the console clean
const scheduleModule =
  process.env.NODE_ENV !== "development" ? [ScheduleModule.forRoot()] : []

@Module({
  imports: [
    ...scheduleModule,
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
    SearchModule,
    SlackModule,
    ReservationModule,
    forwardRef(() => CronModule),
  ],
})
export class AppModule {}
