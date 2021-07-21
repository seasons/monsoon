import { Request } from "express"
import * as expressWinston from "express-winston"
import { utilities as nestWinstonModuleUtilities } from "nest-winston"
import { Logger, createLogger, format, transports } from "winston"
import * as Transport from "winston-transport"

import { getRequestIdContext } from "../middleware/http-context.middleware"
import { WinstonLogger } from "./winston.logger"

const logLevel = process.env.NODE_ENV === "development" ? "info" : "error"

/**
 * The custom formatter that manages winston meta.
 * - Retrieve uuid and role information from express-winston meta.
 * - Add global information like deployed version, environment...
 */
/* istanbul ignore next */
// tslint:disable-next-line: ter-arrow-parens
const injectMeta = format(info => {
  const requestId = getRequestIdContext()
  info.requestId = requestId

  // Add extra metadata from the config
  info.environment = process.env.NODE_ENV

  // const currentSpan = tracer.scope().active()
  // currentSpan.setTag("request-id", requestId)

  return info
})

/* istanbul ignore next */
function serializeError(error: Error) {
  const { stack, message, name } = error
  const serializedStack = !!stack ? stack.split("/n") : null
  return {
    ...error,
    message,
    name,
    stack: serializedStack,
  }
}

/* istanbul ignore next */
// tslint:disable-next-line: ter-arrow-parens
const errorsFormat = format(info => {
  if (info.level === "error" && info.error) {
    info.error = serializeError(info.error)
  }
  return info
})

/**
 * Create a labelled `winston` logger instance.
 *

 * @returns The Logger instance with transports attached by environment.
 */
export function createNestWinstonLogger() {
  const httpTransportOptions = {
    host: "http-intake.logs.datadoghq.com",
    path: `/v1/input/${process.env.DATADOG_KEY}?ddsource=nodejs&service=monsoon-${process.env.NODE_ENV}`,
    ssl: true,
  }

  const finalTransports: Transport[] = [
    new transports.Console({
      format: format.combine(
        format.combine(injectMeta(), errorsFormat()),
        nestWinstonModuleUtilities.format.nestLike()
      ),
    }),
    new transports.Http(httpTransportOptions),
  ]

  return new WinstonLogger(
    createLogger({
      level: logLevel,
      exitOnError: false,
      format: format.json(),
      transports: finalTransports,
    })
  )
}

/**
 * Redact secret data that might come from a header, like the JWT in the Authorization header.
 *
 * @param req The logged request by express-winston.
 * @param propName The property of the logged request that will be adapted.
 * @returns The express request property, sanitized if it is 'headers'.
 */
function sanitizeHeaders(req: Request, propName: string) {
  if (propName === "headers") {
    // The 'if-none-match' header can break logstash JSON format
    if ("if-none-match" in req.headers)
      req.headers["if-none-match"] = "EXCLUDED"
    // The 'authorization' header has the plaintext jwt token, we should never log it
    if (req.headers.authorization)
      req.headers.authorization = "Bearer [REDACTED]"
    // The 'cookie' header could contain jwt tokens
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split("; ")
      req.headers.cookie = cookies
        .map(cookie => {
          if (cookie.startsWith("AccessToken=")) {
            return "AccessToken=REDACTED"
          }
          if (cookie.startsWith("RefreshToken=")) {
            return "RefreshToken=REDACTED"
          }
          return cookie
        })
        .join("; ")
    }
  }
  return (req as any)[propName]
}

/**
 * Retrieve the express winston logger handler middleware.
 *
 * @param logger The winston logger handler to be injected to express-winston.
 * @returns The express winston logger handler that serves as middleware.
 */
export function createExpressWinstonHandler(logger: Logger) {
  return expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    level: logLevel,
    metaField: "express",
    msg: "{{req.method}} {{req.url}}",
    expressFormat: false,
    colorize: process.env.NODE_ENV === "development",
    requestFilter: sanitizeHeaders,
    headerBlacklist: ["cookie"],
    ignoreRoute: () => false,
  })
}
