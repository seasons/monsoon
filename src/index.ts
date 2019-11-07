import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"
import cors from "cors"
import { app as webhooks } from "./webhooks"
import bodyParser from "body-parser"

const server = new ApolloServer(serverOptions)

const app = express()
app.use(
  checkJwt,
  createGetUserMiddleware(prisma),
  cors({
    origin: [/\.seasons\.nyc$/, "seedling-staging.herokuapp.com"],
    credentials: true,
  })
)
app.use(bodyParser.json())
app.use(webhooks)
server.applyMiddleware({ app, path: "/" })
app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000/`)
)

// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
