import { Injectable } from "@nestjs/common"
import { Prisma, prisma } from "."

export interface PrismaClientService {
  client: Prisma
}

@Injectable()
export class PrismaClientService {
  constructor() {
    this.client = prisma
  }
}
