
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
    keys: string[],
    {
      query,
      info,
      formatData = identity,
      getKey = a => a.id,
      formatWhere = this.defaultFormatWhere }: GenerateParams
  ) {
    const data = await this.prisma.binding.query[query](
        formatWhere(keys),
        info
      )
    const map = {}
    data.forEach(item => {
      const key = getKey(item)
      if (!key) {
        throw new Error(`Key not found: ${key}`)
      }
      map[key] = item
    })

    const result = keys.map(key => {
      return formatData(map[key])
    })
    return result
  }

  private defaultFormatWhere = (recordIds: string[]) => ({where: {id_in: recordIds}})
}
