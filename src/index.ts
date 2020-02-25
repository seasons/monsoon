import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import express from "express"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"
import cors from "cors"
import { app as webhooks } from "./webhooks"
import { app as pushNotifications } from "./pushNotifications"
import bodyParser from "body-parser"
import { ExpressAdapter } from "@nestjs/platform-express"
import * as Sentry from "@sentry/node"

// Set up the server
const server = express()

if (process.env.NODE_ENV === "production") {
  // Set up Sentry, which automatically reports on uncaught exceptions
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
  server.use(Sentry.Handlers.requestHandler()) // must be first middleware on app
}

server.use(
  checkJwt,
  createGetUserMiddleware(prisma),
  cors({
    origin: [
      "seedling-staging.herokuapp.com",
      /flare\.now\.sh$/,
      /seasons\.nyc$/,
      /localhost/,
    ],
    credentials: true,
  }),
  bodyParser.json(),
  webhooks,
  pushNotifications
)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server))
  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()

// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
