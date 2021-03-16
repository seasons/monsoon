<h1>⽲ Monsoon</h1>
<h3>GraphQL API for Seasons</h3>

Monsoon is a Gateway service as its schema is using a GraphQL design pattern called [Schema Stitching](https://www.apollographql.com/docs/graphql-tools/schema-stitching/). Stitching allows us to merge multiple remote services (both GraphQL and RESTful APIs) into a single endpoint.

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

4. Postgres CLI tools.

- Install latest postgres client.
- run `sudo mkdir -p /etc/paths.d && echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp`

## Getting started

```sh
# 1. Installs all required dependencies
yarn install

# 2. Setup an environment variable file
cp .env.example .env

# 3. Create your local Prisma Server and Postgres instances
docker-compose up -d

# 4. Deploy prisma
yarn prisma:deploy

# 4. Install monsoon-cli (command line interface)
yarn global add ts-node && yarn link

# 6. Seed the database
monsoon airtable:prisma all --prisma local

# 7. Start server (runs on http://localhost:4000/playground) and open GraphQL Playground
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

Nota bene: To ensure your local DB is as close as possible to staging and production, go into Postico (a postgres client), and run the following SQL query:

```
ALTER TABLE "monsoon$dev"."ProductVariant"
  ADD CHECK (total >= 0),
  ADD CHECK (reservable >= 0),
  ADD CHECK (reserved >= 0),
  ADD CHECK ("nonReservable" >= 0),
  ADD CHECK (stored >= 0),
  ADD CHECK (offloaded >= 0),
  ADD CHECK (total = reservable + reserved + "nonReservable" + stored + offloaded);
```

## Deployment

All deployments follow the following pattern.

1. Create a Pull Request for your branch code onto master.
2. Once that PR is reviewed and merged, create another PR to merge master to staging. Merge it. Your code will automatically deploy to the staging server.
3. Once your code passes QA on staging, use Heroku's "Promotion" feature on [this page](https://dashboard.heroku.com/pipelines/07c04186-4604-4488-b9bf-4811420933bf) to deploy to production.

Before deploying to production your first time, please check with a senior member of the engineering team.

## Documentation

### Commands

- `yarn start` starts GraphQL server on `http://localhost:3000`
- `yarn prisma:<subcommand>` gives access to local version of Prisma CLI (e.g. `yarn prisma:deploy`)

Monsoon ships with a command line interface. To install it run `yarn link`. Once that's complete, you can use the following commands:

- `monsoon sync:prisma:prisma` to sync the production db to staging/local, or the staging db to local.

For details on the arguments and options for each command, use `--help`. e.g `monsoon sync:prisma:prisma --help`

Note that you may need to run `yarn tsc` to generate the files used by the monsoon cli.

> **Note**: We recommend that you're using `yarn dev` during development as it will give you access to the GraphQL API or your server (defined by the [application schema](./src/schema.graphql)) as well as to the Prisma API directly (defined by the [Prisma database schema](./generated/prisma.graphql)). If you're starting the server with `yarn start`, you'll only be able to access the API of the application schema.

### Testing

#### Generating a random user account

You can generate a random test user using the following command

`monsoon create:test-user --email test@seasons.nyc --password Pass123`

If `--email` and/or `--password` are not specified, those values are also generated. All random values are generated using a library called [faker.js](https://github.com/marak/Faker.js/)

#### Taking over a user's account

Sometimes, you need to take over a user's account and use one of our applications as them in order to debug an issue. Refrain from doing this on production, as it requires the user later needing to update their password.

Instead, you can first sync their data from production to your local database, then takeover their account as follows:

```
monsoon sync:prisma:prisma local
monsoon takeover someguy@gmail.com
```

You can also do this on staging as follows:

```
monsoon sync:prisma:prisma staging
monsoon takeover someguy@gmail.com --pe staging
```

Please note that before syncing prisma production to another environment, you need to ensure the schema's match. The instructions for doing so are in the CLI warning that appears when you run the `sync:prisma:prisma` command.

### Environments

You should have `.env`, `.env.staging`, and `.env.production` that declare the environment variables for your local, and the staging and production environments respectively.

You can copy the staging and production environment variables directly from heroku using the heroku command line tool:

- `heroku config -s --app monsoon-staging > .env.staging`
- `heroku config -s --app monsoon-production > .env.production`.

You can set environment variables on heroku from your CLI with the following command:

- `heroku config:set {ENV_VAR_NAME}={ENV_VAR_VALUE} -a {HEROKU_APP_NAME}

For example, to see the variable HELLO with value WORLD on app monsoon-staging, you'd do:

- `heroku config:set HELLO=WORLD -a monsoon-staging`

You may need to install the CLI and login using `heroku login` first.

### Database security

All prisma services (your local instance, staging, and production) have both their management API and the core service itself protected by secrets. You can learn more about how this works on the [prisma docs for security](https://www.prisma.io/docs/prisma-server/authentication-and-security-kke4/).

To use the prisma manamgent API through the prisma CLI, you need to set the `PRISMA_MANAGEMENT_API_SECRET` environment variable. This will be taken care of if you have pulled the latest environment variables from heroku and are only using the prisma CLI through the associated `yarn` scripts.

To make calls to prisma services on the prisma playground or use the prisma admin, you'll need to add a JWT. To generate that token, use the script `yarn prisma:token-<env>`.

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

## Sending push notifications with routes

- When sending a push notification with a route to Harvest, the data must match Harvest's navigation convention.
  E.g. `navigation.navigate("Modal", { screen: "FiltersModal", params: { sizeFilters } })` would appear as:

```
...
data: {
  route: "Modal",
  screen: "FiltersModal",
  params: {
    sizeFilters: ["Medium"],
  },
},
...
```

## Resources

- [GraphQL Resolvers: Best Practices](https://medium.com/paypal-engineering/graphql-resolvers-best-practices-cd36fdbcef55)
- [The ultimate guide to Schema Stitching in GraphQL](https://blog.hasura.io/the-ultimate-guide-to-schema-stitching-in-graphql-f30178ac0072/)

## If you need to replace the DB

In the event of a DEFCON 5 where we need to drop the current database and replace it with a replica, make sure to do the following afterwards in order to ensure complete the transition:

1. Update the .pgpass and .env files in the [`monsoon-scripts` folder on s3](https://s3.console.aws.amazon.com/s3/buckets/monsoon-scripts?region=us-east-1&tab=objects)
2. Update the [DB connection in looker](https://looker.seasons.nyc/admin/connections)
3. Update the warehouse settings on [segment](https://app.segment.com/seasons/warehouses/96nhBHbiKBpL8JnEbPa99n/overview) to load into the new DB.
4. Update the warehouse settings on [stitch](https://app.stitchdata.com/client/171943/pipeline/v2/destinations/268584/edit) (addresses chargebee, shippo, stripe)
