import { Prisma } from "./prisma"
import { Binding } from "graphql-binding"
import { Request, Response } from "express"

export enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export const seasonsIDFromProductVariant = (product, productVariant) => {}

export const sizeToSizeCode = (size: ProductSize) => {
  switch (size) {
    case ProductSize.XS:
      return "XS"
    case ProductSize.S:
      return "SS"
    case ProductSize.M:
      return "MM"
    case ProductSize.L:
      return "LL"
    case ProductSize.XL:
      return "XL"
  }
  return ""
}

export interface Context {
  prisma: Prisma
  db: Binding
  req: Request & { user: any }
  res: Response
}

const isLoggedIn = ctx => {
  const user = ctxUser(ctx)
  if (!user) throw new Error(`Not logged in`)
  return user
}
