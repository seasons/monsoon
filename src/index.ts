import "module-alias/register"

import "./tracer"

import {
  createExpressWinstonHandler,
  createNestWinstonLogger,
  httpContextMiddleware,
  requestIdHandler,
} from "@minddoc/nest-express-winston"
import { NestFactory } from "@nestjs/core"
import { ExpressAdapter } from "@nestjs/platform-express"
import * as Sentry from "@sentry/node"
import bodyParser from "body-parser"
import compression from "compression"
import express from "express"

import { AppModule } from "./app.module"
// import logger from "./logger"
import { createCorsMiddleware } from "./middleware/cors"
import { checkJwt } from "./middleware/jwt"
import { createGetUserMiddleware } from "./middleware/user"
import { prisma } from "./prisma"

// Set up the server
const server = express()

Sentry.init({
  dsn: process.env.SENTRY_DSN,
})

const handleErrors = (err, req, res, next) => {
  if (err) {
    return res.status(err.status || 500).json(err)
  }
}

async function bootstrap() {
  const cors = await createCorsMiddleware(prisma)
  const nestWinstonLogger = createNestWinstonLogger("monsoon-app")
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
    createGetUserMiddleware(prisma, nestWinstonLogger),
    bodyParser.json(),
    handleErrors
  )

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: nestWinstonLogger,
  })

  await app.listen(process.env.PORT ? process.env.PORT : 4000, () =>
    console.log(`🚀 Server ready at ${process.env.PORT || 4000}`)
  )
}
bootstrap()
