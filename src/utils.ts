import * as jwt from "jsonwebtoken"
import { Prisma } from "./prisma"
import { Binding } from "graphql-binding"
import { Request } from "express"

export interface Context {
  prisma: Prisma
  db: Binding
  request: Request
}

export function getUserId(ctx: Context) {
  const Authorization = ctx.request.get("Authorization")
  if (Authorization) {
    const token = Authorization.replace("Bearer ", "")
    const { userId } = jwt.verify(token, process.env.APP_SECRET) as {
      userId: string
    }
    return userId
  }

  throw new AuthError()
}

export class AuthError extends Error {
  constructor() {
    super("Not authorized")
  }
}
