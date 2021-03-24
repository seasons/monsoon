import { Injectable } from "@nestjs/common"
import { LaunchWhereUniqueInput } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

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
    if (data.brandID) {
      upsertdata = {
        launchAt: data.launchAt,
        brand: {
          connect: {
            id: data.brandID,
          },
        },
      }
    } else {
      upsertdata = {
        launchAt: data.launchAt,
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
