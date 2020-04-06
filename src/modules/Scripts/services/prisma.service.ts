
import { prisma, Prisma as PrismaClient } from "../../../prisma"
import { Prisma as PrismaBinding} from "../../../prisma/prisma.binding"

export class OverrideablePrismaService {
  binding: Prisma,
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
