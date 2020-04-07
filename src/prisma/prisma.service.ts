import { Prisma as PrismaClient, prisma } from "./"

import { Injectable } from "@nestjs/common"
import { Prisma as PrismaBinding } from "./prisma.binding"

@Injectable()
export class PrismaService {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma
}
