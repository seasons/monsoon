
import {
  GenerateParams,
  NestDataLoader,
} from "@modules/DataLoader/dataloader.types"
import { Injectable } from "@nestjs/common"
import DataLoader from "dataloader"
import { PrismaService } from "./prisma.service"
import { identity, isNull } from "lodash"
import { addFragmentToInfo } from "graphql-binding"


export type PrismaDataLoader<V=any> = DataLoader<string, V>

@Injectable()
export class PrismaLoader implements NestDataLoader {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(params: GenerateParams): PrismaDataLoader {
    return new DataLoader<string, any>((keys: string[]) =>
      this.fetchData(keys, params)
    )
  }

  private async fetchData(
    keys: string[],
    {
      query,
      info,
      infoFragment = null,
      formatData = identity,
      getKey = a => a.id,
      formatWhere = this.defaultFormatWhere 
    }: GenerateParams
  ) {
    let adjustedInfo = info as any
    if (typeof info === "object" && !isNull(infoFragment)) {
      adjustedInfo = addFragmentToInfo(info, infoFragment)
    }
    const data = await this.prisma.binding.query[query](
        formatWhere(keys),
        adjustedInfo
      )
    const map = {}
    data.forEach(item => {
      const key = getKey(item)
      if (!key) {
        throw new Error(`Key not found: ${key}`)
      }
      map[key] = item
    })

    const result = keys.map(key => formatData(map[key]))
    return Promise.resolve(result)
  }

  private defaultFormatWhere = (keys: string[]) => ({where: {id_in: keys}})
}
