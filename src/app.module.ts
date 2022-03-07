import * as fs from "fs"
import * as util from "util"

import { CustomerModule } from "@modules/Customer/customer.module"
import { DataLoaderInterceptor } from "@modules/DataLoader/interceptors/dataloader.interceptor"
import { Logger, Module, forwardRef } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { GqlModuleOptions, GraphQLModule } from "@nestjs/graphql"
import { PrismaSelect } from "@paljs/plugins"
import sgMail from "@sendgrid/mail"
import { ApolloServerPluginInlineTrace } from "apollo-server-core"
import responseCachePlugin from "apollo-server-plugin-response-cache"
import chargebee from "chargebee"
import httpContext from "express-http-context"
import { importSchema } from "graphql-import"
import GraphQLJSON from "graphql-type-json"

import { apolloServerSentryPlugin } from "./apollo/sentryIntegration"
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
import { HealthModule } from "./modules/Health/health.module"
import { TestModule } from "./modules/Test/test.module"
import { TwilioModule } from "./modules/Twilio/twilio.module"
import { UtilsModule } from "./modules/Utils/utils.module"

// make the call to chargebee
chargebee.configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
})

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const dataModel = new PrismaSelect(null).dataModel
const context = {
  dataModel,
  modelFieldsByModelName: dataModel.reduce((accumulator, currentModel) => {
    accumulator[currentModel.name] = currentModel.fields
    return accumulator
  }, {}),
}

const persistedQueryMap = JSON.parse(
  fs.readFileSync(process.cwd() + `/src/tests/complete.queryMap.json`, "utf-8")
)

const addQueryMetadataToContext = (ctx, req, persistedQueryMap) => {
  let queryString
  const isPersistedQuery = !req.body.query
  if (isPersistedQuery) {
    const opName = req.query.operationName
    queryString = persistedQueryMap[opName]
  } else {
    queryString = req.body.query
  }

  // if queryString is undefined, default to saying its mutation so
  // we use the write client and are gauranteed that the app will work.
  const isMutation = queryString?.includes("mutation") ?? true

  ctx["queryString"] = queryString
  ctx["isMutation"] = isMutation

  return ctx
}

export const APP_MODULE_DEF = {
  imports: [
    GraphQLModule.forRootAsync({
      useFactory: async () =>
        (({
          typeDefs: await importSchema("src/schema.graphql"),
          path: "/",
          installSubscriptionHandlers: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          directiveResolvers,
          context: ({ req }) => {
            let ctx = { req, ...context }

            // Add metadata used in routing prisma clients across write/read nodes
            ctx = addQueryMetadataToContext(ctx, req, persistedQueryMap)

            httpContext.set("context", ctx) // make it accessible without NestJS injection

            return ctx
          },
          plugins: [
            responseCachePlugin({
              sessionId: ({ request }) => {
                const token = request.http.headers.get("authorization")
                return token || null
              },
            }),
            ApolloServerPluginInlineTrace(),
            apolloServerSentryPlugin,
          ],
          cacheControl: {
            defaultMaxAge: process.env.CACHE_MAX_AGE || 5,
          },
          uploads: {
            maxFileSize: 500000000, // 500 MB
            maxFiles: 8,
          },
          introspection: true,
          formatError: error => {
            console.error(util.inspect(error, { depth: null }))
            return error
          },
          resolvers: {
            JSON: GraphQLJSON,
          },
        } as unknown) as GqlModuleOptions),
    }),
    AnalyticsModule,
    AdminModule,
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
    HealthModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
    Logger,
  ],
}

@Module(APP_MODULE_DEF)
export class AppModule {}
