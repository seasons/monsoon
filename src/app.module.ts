import * as url from "url"
import * as util from "util"

import { CustomerModule } from "@modules/Customer/customer.module"
import { DataLoaderInterceptor } from "@modules/DataLoader/interceptors/dataloader.interceptor"
import { Module, forwardRef } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { GqlModuleOptions, GraphQLModule } from "@nestjs/graphql"
import { ScheduleModule } from "@nestjs/schedule"
import { PrismaSelect } from "@paljs/plugins"
import sgMail from "@sendgrid/mail"
import { RedisCache } from "apollo-server-cache-redis"
import responseCachePlugin from "apollo-server-plugin-response-cache"
import chargebee from "chargebee"
import { importSchema } from "graphql-import"
import GraphQLJSON from "graphql-type-json"

import {
  BlogModule,
  CollectionModule,
  CronModule,
  FAQModule,
  FitPicModule,
  HomepageModule,
  ImageModule,
  LocationModule,
  OrderModule,
  PaymentModule,
  ProductModule,
  PushNotificationModule,
  ReservationModule,
  SMSModule,
  SearchModule,
  ShippingModule,
  ShopifyModule,
  SlackModule,
  SyncModule,
  UserModule,
  ViewModule,
  directiveResolvers,
} from "./modules"
import { AdminModule } from "./modules/Admin/admin.module"
import { AnalyticsModule } from "./modules/Analytics/analytics.module"
import { EmailModule } from "./modules/Email/email.module"
import { TwilioModule } from "./modules/Twilio/twilio.module"
import { UtilsModule } from "./modules/Utils/utils.module"
import { PrismaService } from "./prisma/prisma.service"

// make the call to chargebee
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Don't run cron jobs in dev mode, or on web workers. Only on production cron workers
const scheduleModule =
  process.env.NODE_ENV === "production" && process.env.DYNO?.includes("cron")
    ? [ScheduleModule.forRoot()]
    : []

const cache = (() => {
  try {
    const URL = process.env.REDIS_URL
    if (URL.includes("redis://")) {
      return new RedisCache(URL)
    }

    const redis_uri = url.parse(URL)
    const config = {
      port: redis_uri.port,
      host: redis_uri.hostname,
      password: redis_uri.auth.split(":")[1],
      db: 0,
      tls: {
        rejectUnauthorized: false,
        requestCert: true,
        agent: false,
      },
    }
    return new RedisCache(config)
  } catch (e) {
    console.error(e)
  }
})()
@Module({
  imports: [
    ...scheduleModule,
    GraphQLModule.forRootAsync({
      useFactory: async () =>
        ({
          typeDefs: await importSchema("src/schema.graphql"),
          path: "/",
          tracing: true,
          installSubscriptionHandlers: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          directiveResolvers,
          context: ({ req }) => ({
            req,
            dataModel: new PrismaSelect(null).dataModel,
          }),
          plugins: [
            responseCachePlugin({
              sessionId: ({ request }) => {
                const token = request.http.headers.get("authorization")
                return token || null
              },
            }),
          ],
          persistedQueries: {
            cache,
          },
          cacheControl: {
            defaultMaxAge: process.env.CACHE_MAX_AGE || 5,
          },
          uploads: {
            maxFileSize: 125000000, // 125 MB
            maxFiles: 5,
          },
          introspection: true,
          formatError: error => {
            console.error(util.inspect(error, { depth: null }))
            return error
          },
          resolvers: {
            JSON: GraphQLJSON,
          },

          cache,
        } as GqlModuleOptions),
    }),
    AdminModule,
    AnalyticsModule,
    BlogModule,
    OrderModule,
    LocationModule,
    CollectionModule,
    FitPicModule,
    ViewModule,
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
    ShopifyModule,
    SlackModule,
    SyncModule,
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
