import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import * as Sentry from "@sentry/node"
import bodyParser from "body-parser"
import cors from "cors"
import express from "express"

import { AppModule } from "./app.module"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
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

const handleErrors = (err, req, res, next) => {
  if (err) {
    return res.status(err.status).json(err)
  }
}

server.use(
  cors({
    origin: [
      "seedling-staging.herokuapp.com",
      /flare\.now\.sh$/,
      /seasons\.nyc$/,
      /localhost/,
    ],
    credentials: true,
  }),
  checkJwt,
  createGetUserMiddleware(prisma),
  bodyParser.json(),
  webhooks,
  handleErrors
)

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server))
  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()
