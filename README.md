<h1>⽲ Monsoon</h1>
<h3>GraphQL API for Seasons</h3>

Monsoon is a Gateway service as its schema is built on top of the Shopify GraphQL API using a GraphQL design pattern called [Schema Stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching/). Stitching allows us to merge multiple remote services (both GraphQL and RESTful APIs) into a single endpoint.

You can explore the Monsoon API using the staging [GraphQL Playground](https://e7339i1sra.execute-api.us-east-1.amazonaws.com/dev/playground)

![](https://miro.medium.com/max/3200/1*abI3_s-HJJ0cLrT5UM1rfQ.png)

## Features

- **Scalable GraphQL server:** The server uses [`apollo-server`](https://github.com/prisma/graphql-yoga) which is based on Apollo Server & Express
- **Static type generation**: TypeScript types for GraphQL queries & mutations are generated in a build step
- **Authentication**: Signup and login workflows are ready to use for your users
- **GraphQL database:** Includes GraphQL database binding to [Prisma](https://www.prismagraphql.com) (running on Postgres)
- **Tooling**: Out-of-the-box support for [GraphQL Playground](https://github.com/prisma/graphql-playground) & [query performance tracing](https://github.com/apollographql/apollo-tracing)
- **Extensible**: Simple and flexible [data model](./database/datamodel.graphql) – easy to adjust and extend
- **No configuration overhead**: Preconfigured [`graphql-config`](https://github.com/prisma/graphql-config) setup
- **Realtime updates**: Support for GraphQL subscriptions

## Requirements

1. You need to have both the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [Serverless CLI](https://serverless.com/) installed and setup;
```sh
npm install -g serverless
```
2. Docker command line tools. You can get them by visiting the [Docker Website](https://www.docker.com/products/docker-desktop) and downloading the desktop client.
3. Access to the Seasons [Airtable](https://airtable.com/) workspace. 

## Getting started

```sh
# 1. Installs all required dependencies
yarn install

# 2. Setup an environment variable file
cp .env.example .env

# 3. Create your local Prisma Server and Postgres instances
docker-compose up -d

# 4. Seed the database (make sure you've set your airtable API Key in the .env file first. See https://airtable.com/account. You may need to be added to the seasons airtable workspace first.
yarn seed-db

# 3. Start server (runs on http://localhost:4000/playground) and open GraphQL Playground
yarn start
```
To verify the server is setup properly. go open the [playground](http://localhost:4000/playground) and run the following query

```graphql
{
  products(first: 10) {
    edges {
      node {
        id
        title
      }
    }
  }
}
```

## Deployment

To deploy monsoon onto AWS services, you need to configure serverless with AWS AMI credentials.
`serverless config credentials --provider aws --key <AWS_API_KEY> --secret <AWS_USER_SECRET>`

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
