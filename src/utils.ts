import { Prisma, Customer, User, Location, InventoryStatus } from "./prisma"
import { Binding } from "graphql-binding"
import { Request, Response } from "express"
import crypto from "crypto"
import sgMail from "@sendgrid/mail"
import Analytics from "analytics-node"
import { AirtableInventoryStatus } from "./airtable/updatePhysicalProduct"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

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

export async function getUserFromUserIDHash(
  prisma: Prisma,
  userIDHash: string
): Promise<User | null> {
  const allUsers = await prisma.users()
  return new Promise(function(resolve, reject) {
    let targetUser
    for (let user of allUsers) {
      let thisUsersIDHash = getUserIDHash(user.id)
      if (thisUsersIDHash === userIDHash) {
        targetUser = user
      }
    }
    if (targetUser === undefined) {
      resolve(null)
    } else {
      resolve(targetUser)
    }
  })
}

export async function getCustomerFromUserID(
  prisma: Prisma,
  userID: string
): Promise<Customer> {
  let customer
  try {
    let customerArray = await prisma.customers({
      where: { user: { id: userID } },
    })
    customer = customerArray[0]
  } catch (err) {
    throw new Error(err)
  }

  return customer
}

export async function getCustomerFromEmail(
  prisma: Prisma,
  email: string
): Promise<Customer> {
  let customer
  try {
    let customerArray = await prisma.customers({
      where: { user: { email } },
    })
    customer = customerArray[0]
  } catch (err) {
    throw new Error(err)
  }

  return customer
}

// given the corresponding user object, set the customer status on a customer
export async function setCustomerPrismaStatus(
  prisma: Prisma,
  user: User,
  status: String
) {
  const customer = await getCustomerFromUserID(prisma, user.id)
  await prisma.updateCustomer({
    //@ts-ignore
    data: { status: status },
    where: { id: customer.id },
  })
}

export function sendTransactionalEmail(
  to: string,
  templateId: string,
  dynamic_template_data: any,
  otherMsgValues?: any
) {
  const msg = {
    to,
    templateId,
    from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
    dynamic_template_data,
    ...otherMsgValues,
  }
  sgMail.send(msg)
}

export interface Context {
  prisma: Prisma
  db: Binding
  req: Request & { user: any }
  res: Response
  analytics: Analytics
}

export async function getPrismaLocationFromSlug(
  prisma: Prisma,
  slug: string
): Promise<Location> {
  return new Promise(async function(resolve, reject) {
    const prismaLocation = await prisma.location({
      slug: slug,
    })
    if (!prismaLocation) {
      reject(`no location with slug ${slug} found in DB`)
    } else {
      resolve(prismaLocation)
    }
  })
}

export async function calcShipmentWeightFromProductVariantIDs(
  prisma: Prisma,
  itemIDs: Array<string>
): Promise<number> {
  const shippingBagWeight = 1
  const productVariants = await prisma.productVariants({
    where: { id_in: itemIDs },
  })
  console.log(`items returned: ${itemIDs}`)
  return productVariants.reduce(function addProductWeight(acc, curProdVar) {
    return acc + curProdVar.weight
  }, shippingBagWeight)
}

export function airtableToPrismaInventoryStatus(
  airtableStatus: AirtableInventoryStatus
): InventoryStatus {
  let prismaStatus
  if (airtableStatus === "Reservable") {
    prismaStatus = "Reservable"
  }
  if (airtableStatus === "Non Reservable") {
    prismaStatus = "NonReservable"
  }
  if (airtableStatus === "Reserved") {
    prismaStatus = "Reserved"
  }
  return prismaStatus
}
