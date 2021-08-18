import "module-alias/register"

import { NestFactory } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import * as Sentry from "@sentry/node"
import bodyParser from "body-parser"
import compression from "compression"
import express from "express"
import httpContext from "express-http-context"
import { graphqlUploadExpress } from "graphql-upload"

import { AppModule } from "./app.module"
import {
  createExpressWinstonHandler,
  createNestWinstonLogger,
  httpContextMiddleware,
  requestIdHandler,
} from "./lib/logger"
import { createCorsMiddleware } from "./middleware/cors"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { readClient } from "./prisma/prisma.service"

// Set up the server
const server = express()

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

function handleErrors(logger) {
  return (err, req, res, next) => {
    if (err) {
      logger.error(err)
      return res.status(err.status || 500).json(err)
    }
  }
}

async function bootstrap() {
  const cors = await createCorsMiddleware(readClient)
  const nestWinstonLogger = createNestWinstonLogger()
  const expressWinstonHandler = createExpressWinstonHandler(
    nestWinstonLogger.logger
  )

  server.use(
    expressWinstonHandler,
    httpContextMiddleware,
    requestIdHandler,
    compression(),
    cors,
    checkJwt,
    createGetUserMiddleware(readClient, nestWinstonLogger),
    bodyParser.json(),
    handleErrors(nestWinstonLogger),
    httpContext.middleware,
    graphqlUploadExpress({
      maxFileSize: 1250000000, // 1.2 GB
      maxFiles: 8,
    })
  )

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: nestWinstonLogger,
  })

  app.enableShutdownHooks()

  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()
