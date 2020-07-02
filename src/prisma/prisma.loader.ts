
import {
  GenerateParams,
  NestDataLoader,
} from "@modules/DataLoader/dataloader.types"
import { Injectable } from "@nestjs/common"
import DataLoader from "dataloader"
import { PrismaService } from "./prisma.service"
import { identity } from "lodash"

export type PrismaDataLoader<V=any> = DataLoader<string, V>

@Injectable()
export class PrismaLoader implements NestDataLoader {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(params: GenerateParams): PrismaDataLoader {
    //@ts-ignore
    return new DataLoader<string, any>((recordIds: string[]) =>
      this.fetchData(recordIds, params)
    )
  }

  private async fetchData(
    recordIds: string[],
    { query, info, format = identity }: GenerateParams
  ) {

    const data = await this.prisma.binding.query[query](
        {
          where: { id_in: recordIds },
        },
        info
      )

    return data.map(format)
  }
}
