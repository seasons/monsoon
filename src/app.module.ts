import { Module } from "@nestjs/common"
import { serverOptions } from "./server"
import { ApolloServer } from "apollo-server-express"
import { GraphQLModule, GraphQLFactory } from "@nestjs/graphql"
import { MeModule, HomepageModule, ProductModule } from "./modules"
import { PrismaModule } from "./prisma/prisma.module"
import { schema } from "./schema"

import resolvers from "./resolvers"
import { makeExecutableSchema } from "graphql-tools"
import { importSchema } from "graphql-import"
import { directiveResolvers } from "./auth/directives"

const typeDefs = importSchema("./src/schema.graphql")

@Module({
  imports: [
    MeModule,
    HomepageModule,
    ProductModule,
    PrismaModule,
    GraphQLModule.forRoot({
      typeDefs,
      resolvers,
    }),
  ],
})
export class AppModule {
  // // Inject graphQLFactory as in Nestjs Docs
  // constructor(private readonly graphQLFactory: GraphQLFactory) { }
  // configureGraphQL(app: any) {
  //   const server = new ApolloServer({ schema });
  //   server.applyMiddleware({ app, path: "/" });
  // }
}
