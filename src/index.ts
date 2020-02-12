import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import express from "express"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"
import cors from "cors"
import { app as webhooks } from "./webhooks"
import bodyParser from "body-parser"
import { ExpressAdapter } from "@nestjs/platform-express"

// Set up Sentry, which automatically reports on uncaught exceptions
const Sentry = require("@sentry/node")
Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

// Set up the server
const server = express()
server.use(
  Sentry.Handlers.requestHandler(), // must be first middleware on app
  checkJwt,
  createGetUserMiddleware(prisma),
  cors({
    origin: [/\.seasons\.nyc$/, "seedling-staging.herokuapp.com", /localhost/],
    credentials: true,
  }),
  bodyParser.json(),
  webhooks
)

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()

// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
