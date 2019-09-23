import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server"

const server = new ApolloServer(serverOptions)

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
