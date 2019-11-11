import { Prisma, Customer } from "./prisma"
import { Binding } from "graphql-binding"
import { Request, Response } from "express"
import crypto from "crypto"

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

export function getUserIDHash(userID: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userID}${process.env.HASH_SECRET}`)
    .digest("hex")
}

export async function getCustomerFromUserID(
  ctx: Context,
  userID: string
): Promise<Customer> {
  let customer
  try {
    let customerArray = await ctx.prisma.customers({
      where: { user: { id: userID } },
    })
    customer = customerArray[0]
  } catch (err) {
    throw new Error(err)
  }

  return customer
}

export interface Context {
  prisma: Prisma
  db: Binding
  req: Request & { user: any }
  res: Response
}
