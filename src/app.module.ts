import * as util from "util"

import { DataLoaderInterceptor } from "@modules/DataLoader/index"
import { Module, forwardRef } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { GqlModuleOptions, GraphQLModule } from "@nestjs/graphql"
import { ScheduleModule } from "@nestjs/schedule"
import sgMail from "@sendgrid/mail"
import * as Airtable from "airtable"
import chargebee from "chargebee"
import { importSchema } from "graphql-import"

import {
  AirtableModule,
  BlogModule,
  CollectionModule,
  CronModule,
  CustomerModule,
  EmailModule,
  FAQModule,
  FitPicModule,
  HomepageModule,
  ImageModule,
  PaymentModule,
  ProductModule,
  PushNotificationModule,
  ReservationModule,
  SMSModule,
  SearchModule,
  ShippingModule,
  SlackModule,
  UserModule,
  directiveResolvers,
} from "./modules"
import { AdminModule } from "./modules/Admin/admin.module"
import { AnalyticsModule } from "./modules/Analytics/analytics.module"
import { TwilioModule } from "./modules/Twilio/twilio.module"
import { UtilsModule } from "./modules/Utils/utils.module"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

// make the call to chargebee
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Don't run cron jobs in dev mode, to keep the console clean
const scheduleModule =
  process.env.NODE_ENV === "production" ? [ScheduleModule.forRoot()] : []
// const scheduleModule =
//   process.env.NODE_ENV === "development" ? [ScheduleModule.forRoot()] : []

@Module({
  imports: [
    ...scheduleModule,
    GraphQLModule.forRootAsync({
      useFactory: async () =>
        ({
          typeDefs: await importSchema("src/schema.graphql"),
          path: "/",
          installSubscriptionHandlers: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          directiveResolvers,
          context: ({ req }) => ({
            req,
          }),
          uploads: {
            maxFileSize: 125000000, // 125 MB
            maxFiles: 5,
          },
          introspection: true,
          formatError: error => {
            console.error(util.inspect(error, { depth: null }))
            return error
          },
        } as GqlModuleOptions),
    }),
    AdminModule,
    AnalyticsModule,
    AirtableModule,
    BlogModule,
    CollectionModule,
    FitPicModule,
    CustomerModule,
    EmailModule,
    FAQModule,
    forwardRef(() => CronModule),
    HomepageModule,
    ImageModule,
    PaymentModule,
    ProductModule,
    PushNotificationModule,
    ReservationModule,
    SearchModule,
    ShippingModule,
    SlackModule,
    SMSModule,
    TwilioModule,
    UserModule,
    UtilsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
})
export class AppModule {}
