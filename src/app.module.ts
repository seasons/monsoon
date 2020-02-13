import { Module } from "@nestjs/common"
import { GraphQLModule, GqlModuleOptions } from "@nestjs/graphql"
import { UserModule, HomepageModule, ProductModule, CollectionModule } from "./modules"
import { importSchema } from "graphql-import"
import { prisma } from "./prisma"
import { Prisma } from "prisma-binding"

export const db = new Prisma({
  typeDefs: "./src/prisma/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT || "http://localhost:4466",
  secret: process.env.PRISMA_SECRET,
})

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      useFactory: async () => {
        const typeDefs = await importSchema("src/schema.graphql")
        return {
          typeDefs,
          path: "/",
          installSubscriptionHandlers: true,
          resolverValidationOptions: {
            requireResolversForResolveType: false,
          },
          context: ({ req }) => ({
            req,
            prisma,
            db,
          }),
        } as GqlModuleOptions
      },
    }),
    UserModule,
    HomepageModule,
    ProductModule,
    CollectionModule,
  ],
})
export class AppModule {}
