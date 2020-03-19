import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"
import cors from "cors"
import { app as webhooks } from "./webhooks"
import bodyParser from "body-parser"
import * as Sentry from "@sentry/node"

// Set up the server
const server = new ApolloServer(serverOptions)
const app = express()

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  })
  app.use(Sentry.Handlers.requestHandler()) // must be first middleware on app
}

app.use(
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
server.applyMiddleware({ app, path: "/" })
app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
)

// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express