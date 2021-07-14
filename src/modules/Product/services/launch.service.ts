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
    const _launch = await this.prisma.client2.launch.upsert({
      where,
      create: upsertdata,
      update: upsertdata,
      select,
    })

    return this.prisma.sanitizePayload(_launch, "Launch")
  }
}
