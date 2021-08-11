import { Injectable } from "@nestjs/common"
import { Prisma } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import { omit } from "lodash"

@Injectable()
export class LaunchService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertLaunch({
    where,
    data,
    select,
  }: {
    where: Prisma.LaunchWhereUniqueInput
    data: any
    select: Prisma.LaunchSelect
  }) {
    const cleanedData = omit(data, ["brandID", "collectionID"])
    let brandData = {}
    let collectionData = {}

    // A launch is either a brand or a collection, it can't have both
    if (data.brandID) {
      brandData = {
        brand: {
          connect: {
            id: data.brandID,
          },
        },
      }
    } else if (data.collectionID) {
      collectionData = {
        collection: {
          connect: {
            id: data.collectionID,
          },
        },
      }
    }

    const upsertdata = {
      ...cleanedData,
      ...brandData,
      ...collectionData,
    }

    return await this.prisma.client.launch.upsert({
      where,
      create: upsertdata,
      update: upsertdata,
      select,
    })
  }
}
