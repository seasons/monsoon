import { UpdatableConnection } from "@app/modules/index.types"
import { Injectable } from "@nestjs/common"

import { Prisma as PrismaClient, prisma, ProductUpdateInput, ProductWhereUniqueInput, Product, ProductPromise } from "./"
import { Prisma as PrismaBinding } from "./prisma.binding"
import { pick } from "lodash"

interface originalFuncs {
  updateProduct?: ({data: ProductUpdateInput, where: ProductWhereUniqueInput}) => ProductPromise
}
@Injectable()
export class PrismaService implements UpdatableConnection {
  binding: PrismaBinding = new PrismaBinding({
    secret: process.env.PRISMA_SECRET,
    endpoint: process.env.PRISMA_ENDPOINT,
    debug: false,
  })
  client: PrismaClient = prisma
  originalFuncs: originalFuncs = {}

  constructor() {
    this.attachLogs()
  }

  updateConnection({ secret, endpoint }: { secret: string; endpoint: string }) {
    this.binding = new PrismaBinding({
      secret,
      endpoint,
      debug: false,
    })
    this.client = new PrismaClient({
      secret,
      endpoint,
      debug: false,
    })

    this.attachLogs()
  }

  private attachLogs() {
    this.originalFuncs = {...pick(this.client, ["updateProduct", "updatePhysicalProduct"])}
    this.logProductStatusChanges()
  }

  private logProductStatusChanges() {
    //@ts-ignore
    this.client.updateProduct = async ({data, where}: {data: ProductUpdateInput, where: ProductWhereUniqueInput}): ProductPromise => {
      const retVal = this.originalFuncs.updateProduct({data, where})
      if (!!data.status) {
        const oldProductStatus = await this.client.product(where).status()
        await this.client.createProductStatusChange({
          old: oldProductStatus,
          new: data.status,
          product: {connect: where}
        })
      }
      return retVal
    }
  }
}
