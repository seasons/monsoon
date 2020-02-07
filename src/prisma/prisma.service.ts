import { Injectable } from "@nestjs/common"
import { Prisma } from "./prisma.binding"

@Injectable()
export class PrismaService extends Prisma {
  constructor() {
    super({
      endpoint: "https://monsoon-prisma-staging.herokuapp.com/monsoon/staging",
      debug: false,
    })
  }
}
