import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"
import cors from "cors"
import { app as webhooks } from "./webhooks"
import { app as pushNotifications } from "./pushNotifications"
import bodyParser from "body-parser"
import Sentry from "@sentry/node"

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
}

// Set up the server
const server = new ApolloServer(serverOptions)
const app = express()
app.use(
  Sentry.Handlers.requestHandler(), // must be first middleware on app
  checkJwt,
  createGetUserMiddleware(prisma),
  cors({
    origin: [/\.seasons\.nyc$/, "seedling-staging.herokuapp.com", /localhost/],
    credentials: true,
  }),
  bodyParser.json(),
  webhooks,
  pushNotifications
)
server.applyMiddleware({ app, path: "/" })
app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
)

// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
