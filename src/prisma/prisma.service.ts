import { Injectable } from "@nestjs/common"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { Prisma as PrismaClient, prisma } from "./"

@Injectable()
export class PrismaService {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma
}
