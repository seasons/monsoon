import { Injectable } from "@nestjs/common"
import { Prisma } from "./prisma.binding"

@Injectable()
export class DBService extends Prisma {
  constructor() {
    super({
      secret: process.env.PRISMA_SECRET,
      endpoint: process.env.PRISMA_ENDPOINT,
      debug: false,
    });
  }
}
