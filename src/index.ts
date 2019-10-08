import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import { checkJwt } from "./middleware/jwt"

const server = new ApolloServer(serverOptions)

const app = express()
app.use(checkJwt)
server.applyMiddleware({ app, path: "/" })

app.listen({ port: process.env.PORT || 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000/`)
)
