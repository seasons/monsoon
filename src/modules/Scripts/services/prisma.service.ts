import { Prisma as PrismaClient } from "@prisma/index"
import { Prisma as PrismaBinding } from "@prisma/prisma.binding"

export class OverrideablePrismaService {
  binding: PrismaBinding
  client: PrismaClient

  constructor({ secret, endpoint, debug = false }) {
    this.binding = new PrismaBinding({
      secret,
      endpoint,
      debug,
    })
    this.client = new PrismaClient({
      endpoint,
      secret,
      debug,
    })
  }
}
