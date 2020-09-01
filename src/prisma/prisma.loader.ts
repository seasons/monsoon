
import {
  GenerateParams,
  NestDataLoader,
} from "@modules/DataLoader/dataloader.types"
import { Injectable } from "@nestjs/common"
import DataLoader from "dataloader"
import { PrismaService } from "./prisma.service"
import { identity, isNull, cloneDeep } from "lodash"
import { addFragmentToInfo } from "graphql-binding"


export type PrismaDataLoader<V=any> = DataLoader<string, V>

interface ResolveQueryInput {
  formatData: (any) => any
  data: any[]
}

type ResolveOneToXQueryInput = ResolveQueryInput & {getKey: (obj: any) => string | null}
type ResolveOneToManyQueryInput = ResolveQueryInput & {getKeys: (obj: any) => string[] | null}

@Injectable()
export class PrismaLoader implements NestDataLoader {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(params: GenerateParams): PrismaDataLoader {
    return new DataLoader<string, any>((keys: any[]) =>
      this.fetchData(keys, params)
    )
  }

  private async fetchData(
    keys: any[],
    {
      query,
      info,
      infoFragment = null,
      formatData = identity,
      getKey,
      getKeys,
      formatWhere = this.defaultFormatWhere,
      keyToDataRelationship = "OneToOne"
    }: GenerateParams
  ) {
    this.validateGenerateParams({getKeys, keyToDataRelationship})
    
    let adjustedInfo = info as any
    if (typeof info === "object" && !isNull(infoFragment)) {
      adjustedInfo = addFragmentToInfo(info, infoFragment)
    }
    const data = await this.prisma.binding.query[query](
        formatWhere(keys),
        adjustedInfo
      )

    let map
    let fallbackValue
    switch (keyToDataRelationship) {
      case "OneToOne":
        map = this.createOneToOneKeyDataMap({data, getKey, formatData})
        fallbackValue = {}
        break
      case "OneToMany":
        map = this.createOneToManyKeyDataMap({data, getKey, formatData})
        fallbackValue = []
        break
      case "ManyToMany":
        map = this.createManyToManyKeyDataMap({data, getKeys, formatData})
        fallbackValue = []
        break
      default:
        throw new Error(`Invalid keyToDataRelationship: ${keyToDataRelationship}`)
    }

    const result = keys.map(key => map[key] || fallbackValue)
    return Promise.resolve(result)
  }

  private createOneToOneKeyDataMap({ formatData, data, getKey = a => a.id}: ResolveOneToXQueryInput) {
    const map = {}
    for (const item of data) {
      const key = getKey(item)
      if (!key) {
        throw new Error(`Key not found: ${JSON.stringify(item)}`)
      }
      map[key] = formatData(item)
    }

    return map
  }

  private createOneToManyKeyDataMap({ formatData, data, getKey = a => a.id}: ResolveOneToXQueryInput) {
    const map = {}
    for (const item of data) {
      const key = getKey(item)
      if (!key) {
        throw new Error(`Key not found: ${JSON.stringify(item)}`)
      }
      (map[key] = map[key] || []).push(formatData(item))
    }

    return map
  }

  private createManyToManyKeyDataMap({ formatData, data, getKeys}: ResolveOneToManyQueryInput) {
    const map = {}
    for (const item of data) {
      const keys = getKeys(item)
      if (!keys || keys.length === 0) {
        throw new Error(`No keys found: ${JSON.stringify(item)}`)
      }
      for (const key of keys) {
        (map[key] = map[key] || []).push(formatData(cloneDeep(item))) // clone item to prevent side effects
      }
    }
    return map    
  }

  private defaultFormatWhere = (keys: string[]) => ({where: {id_in: keys}})

  private validateGenerateParams({getKeys, keyToDataRelationship}: Pick<GenerateParams, "getKeys" | "keyToDataRelationship">) {
    switch (keyToDataRelationship) {
      case "ManyToMany":
        if (!getKeys) {
          throw new Error("Must pass in a 'getKeys' func to PrismaDataLoader for ManyToMany loader.")    
        }
        break
      case "OneToMany":
      case "OneToOne":
        if (!!getKeys) {
          throw new Error(`Invalid input: can not use getKeys for a OneToOne or OneToMany prisma loader`)
        }
        break
      default:
        throw new Error(`Invalid keyToDataRelationship: ${keyToDataRelationship}`)
    }
  }
}