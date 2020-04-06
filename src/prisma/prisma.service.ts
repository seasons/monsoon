import { Prisma as PrismaClient, prisma } from "./"

import { Injectable } from "@nestjs/common"
import { Prisma } from "./prisma.binding"

@Injectable()
export class PrismaService {
  binding: Prisma = new Prisma({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma
}
