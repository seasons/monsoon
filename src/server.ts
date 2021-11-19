import "module-alias/register"

import "./lib/tracer"

import { NestFactory } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import * as Sentry from "@sentry/node"
import bodyParser from "body-parser"
import compression from "compression"
import express from "express"
import httpContext from "express-http-context"

import { AppModule } from "./app.module"
import { setupHeapProfiler } from "./heapProfiler"
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
      logger.error(err.message, err)
      return res.status(err.status || 500).json(err)
    }
  }
}

export const addMiddlewares = async server => {
  const cors = await createCorsMiddleware(readClient)

  const nestWinstonLogger = createNestWinstonLogger()
  const expressWinstonHandler = createExpressWinstonHandler(
    nestWinstonLogger.logger
  )

  setupHeapProfiler(nestWinstonLogger.logger)

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
    httpContext.middleware
  )

  return {
    logger: nestWinstonLogger,
  }
}

export async function bootstrapServer(port = parseInt(process.env.PORT)) {
  const { logger } = await addMiddlewares(server)

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger,
  })

  app.enableShutdownHooks()

  await app.listen(port ? port : 4000, () =>
    console.log(`🚀 Server ready at ${port || 4000}`)
  )

  return {
    app,
    server,
  }
}

bootstrapServer()
