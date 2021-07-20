import { NextFunction, Request, Response } from "express"
import * as httpContext from "express-http-context"
import { v4 as uuidv4 } from "uuid"

/**
 * The http context middleware to be called right before the next handler that needs to
 * retrieve information from it.
 */
export const httpContextMiddleware = httpContext.middleware

/**
 * The express handler that injects a random uuid v1 to the context.
 *
 * @param req The express request.
 * @param res The express response.
 * @param next The next function to be called (after generating the uuid).
 */
export const requestIdHandler = (
  _: Request,
  __: Response,
  next: NextFunction
) => {
  httpContext.set("requestId", uuidv4())
  next()
}

/**
 * Retrieve the injected request id.
 *
 * @returns The injected request id retrieved from the http context.
 */
export function getRequestIdContext() {
  const requestId: string | undefined = httpContext.get("requestId")
  return requestId
}
