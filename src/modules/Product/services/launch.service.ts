import { Injectable } from "@nestjs/common"
import { LaunchWhereUniqueInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { omit } from "lodash"

@Injectable()
export class LaunchService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertLaunch({
    where,
    data,
  }: {
    where: LaunchWhereUniqueInput
    data: any
  }) {
    let upsertdata
    const cleanedData = omit(data, ["brandID", "collectionID"])

    if (data.brandID) {
      upsertdata = {
        ...cleanedData,
        brand: {
          connect: {
            id: data.brandID,
          },
        },
      }
    } else {
      upsertdata = {
        ...cleanedData,
        collection: {
          connect: {
            id: data.collectionID,
          },
        },
      }
    }
    return await this.prisma.client.upsertLaunch({
      where,
      create: upsertdata,
      update: upsertdata,
    })
  }
}
