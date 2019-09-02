<h1>⽲ Monsoon</h1>
<h3>GraphQL API for Seasons</h3>

Monsoon is a Gateway service as its schema is built on top of the Shopify GraphQL API using a GraphQL design pattern called [Schema Stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching/). Stitching allows us to merge multiple remote services (both GraphQL and RESTful APIs) into a single endpoint.

You can explore the GraphQL API and Schema in this [GraphQL Playground](https://e7339i1sra.execute-api.us-east-1.amazonaws.com/dev/playground)

(TODO) Talk about Prisma

![](https://blog.hasura.io/content/images/downloaded_images/the-ultimate-guide-to-schema-stitching-in-graphql-f30178ac0072/1-_KqIWctCiD9sJ7BUuHF3vQ.png)

## Features

- **Scalable GraphQL server:** The server uses [`apollo-server`](https://github.com/prisma/graphql-yoga) which is based on Apollo Server & Express
- **Static type generation**: TypeScript types for GraphQL queries & mutations are generated in a build step
- **Authentication**: Signup and login workflows are ready to use for your users
- **GraphQL database:** Includes GraphQL database binding to [Prisma](https://www.prismagraphql.com) (running on MySQL)
- **Tooling**: Out-of-the-box support for [GraphQL Playground](https://github.com/prisma/graphql-playground) & [query performance tracing](https://github.com/apollographql/apollo-tracing)
- **Extensible**: Simple and flexible [data model](./database/datamodel.graphql) – easy to adjust and extend
- **No configuration overhead**: Preconfigured [`graphql-config`](https://github.com/prisma/graphql-config) setup
- **Realtime updates**: Support for GraphQL subscriptions

## Requirements

You need to have both the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [Serverless CLI](https://serverless.com/) installed and setup;

```sh
npm install -g serverless
```

## Getting started

```sh
# 1. Installs all required dependencies
yarn install

# 2. Setup an environment variable file
cp .env.example .env

# 3. Start server (runs on http://localhost:3000) and open GraphQL Playground
yarn start
```

![](https://imgur.com/hElq68i.png)

## Documentation

### Commands

- `yarn start` starts GraphQL server on `http://localhost:3000`
- `yarn prisma <subcommand>` gives access to local version of Prisma CLI (e.g. `yarn prisma deploy`)

> **Note**: We recommend that you're using `yarn dev` during development as it will give you access to the GraphQL API or your server (defined by the [application schema](./src/schema.graphql)) as well as to the Prisma API directly (defined by the [Prisma database schema](./generated/prisma.graphql)). If you're starting the server with `yarn start`, you'll only be able to access the API of the application schema.

### Project structure

| File name 　　　　　　　　　　　　　　 | Description 　　　　　　　　<br><br>                                                                                                                           |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `├── .env`                             | Defines environment variables                                                                                                                                  |
| `├── .graphqlconfig.yml`               | Configuration file based on [`graphql-config`](https://github.com/prisma/graphql-config) (e.g. used by GraphQL Playground).                                    |
| `└── database` (_directory_)           | _Contains all files that are related to the Prisma database service_                                                                                           | \  |
| `├── prisma.yml`                       | The root configuration file for your Prisma database service ([docs](https://www.prismagraphql.com/docs/reference/prisma.yml/overview-and-example-foatho8aip)) |
| `└── datamodel.graphql`                | Defines your data model (written in [GraphQL SDL](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51))                                |
| `└── src` (_directory_)                | _Contains the source files for your GraphQL server_                                                                                                            |
| `├── index.ts`                         | The entry point for your GraphQL server                                                                                                                        |
| `├── schema.graphql`                   | The **application schema** defining the API exposed to client applications                                                                                     |
| `├── resolvers` (_directory_)          | _Contains the implementation of the resolvers for the application schema_                                                                                      |
| `└── generated` (_directory_)          | _Contains generated files_                                                                                                                                     |
| `└── prisma-client` (_directory_)      | The generated Prisma client                                                                                                                                    |

## Resources

- [GraphQL Resolvers: Best Practices](https://medium.com/paypal-engineering/graphql-resolvers-best-practices-cd36fdbcef55)
- [The ultimate guide to Schema Stitching in GraphQL](https://blog.hasura.io/the-ultimate-guide-to-schema-stitching-in-graphql-f30178ac0072/)
