import "module-alias/register"

import * as Sentry from "@sentry/node"

import { AppModule } from "./app.module"
import { ExpressAdapter } from "@nestjs/platform-express"
import { NestFactory } from "@nestjs/core"
import bodyParser from "body-parser"
import { checkJwt } from "./middleware/jwt"
import cors from "cors"
import { createGetUserMiddleware } from "./middleware/user"
import express from "express"
import { prisma } from "./prisma"
import { app as webhooks } from "./webhooks"

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
  webhooks
)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server))
  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()
