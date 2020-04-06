import { Injectable } from "@nestjs/common"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { prisma, Prisma as PrismaClient } from "."

@Injectable()
export class PrismaService {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma
}

export class ManualPrismaService {
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
