
import {
  PrismaOneGenerateParams,
  NestDataLoader,
  KeyToDataRelationship,
} from "@modules/DataLoader/dataloader.types"
import { Injectable } from "@nestjs/common"
import DataLoader from "dataloader"
import { PrismaService } from "./prisma.service"
import { identity, isNull, cloneDeep } from "lodash"
import { addFragmentToInfo } from "graphql-binding"


export type PrismaDataLoader<V=any> = DataLoader<string, V>

interface CreateMapInput {
  formatData: (any) => any
  data: any[]
  getKeys: (obj: any) => string[]
  keyToDataRelationship: KeyToDataRelationship
}

interface UpdateMapInput { 
  map: any 
  keys: string[] 
  item: any 
  formatData: (any) => any
  keyToDataRelationship: KeyToDataRelationship
}

@Injectable()
export class PrismaLoader implements NestDataLoader {
  constructor(private readonly prisma: PrismaService) {}

  generateDataLoader(params: PrismaOneGenerateParams): PrismaDataLoader {
    return new DataLoader<string, any>((keys: any[]) =>
      this.fetchData(keys, params)
    )
  }

  private async fetchData(
    keys: any[],
    {
      query,
      info,
      fallbackValue, 
      orderBy = null,
      infoFragment = null,
      formatData = identity,
      getKeys = a => [a.id],
      formatWhere = (keys: string[]) => ({id_in: keys}),
      keyToDataRelationship = "OneToOne"
    }: PrismaOneGenerateParams
  ) {
    
    let adjustedInfo = info as any
    if (typeof info === "object" && !isNull(infoFragment)) {
      adjustedInfo = addFragmentToInfo(info, infoFragment)
    }
    
    const data = await this.prisma.binding.query[query](
        { where: formatWhere(keys), orderBy},
        adjustedInfo
      )

    let map = this.createMap({formatData, data, getKeys, keyToDataRelationship})

    if (fallbackValue === undefined) {
      fallbackValue = [] // fallback value for OneToMany and ManyToMany
      if (keyToDataRelationship === "OneToOne") {
        fallbackValue = {}
      }
    }     
    const result = keys.map(key => map[key] || fallbackValue)
    
    return Promise.resolve(result)
  }

  private createMap({ formatData, data, getKeys, keyToDataRelationship}: CreateMapInput) {
    let map = {}
    for (const item of data) {
      const keys = getKeys(item)
      map = this.updateMapForItem({ map, formatData, keys, item, keyToDataRelationship })
    }
    return map
  }

  private updateMapForItem({ map: oldMap, keys, item, formatData, keyToDataRelationship }: UpdateMapInput ) {
    const newMap = cloneDeep(oldMap) // clone it to keep the function pure
    switch (keyToDataRelationship) {
      case "OneToOne":
        if (keys?.length !== 1) {
          throw new Error(`OneToOne loader should return a length 1 array from getKeys. Object: ${JSON.stringify(item)}`)
        }
        newMap[keys[0]] = formatData(item)
        break
      case "OneToMany":
        if (keys?.length !== 1) {
          throw new Error(`OneToMany loader should return a length 1 array from getKeys. Objec: ${JSON.stringify(item)}`)
        }
        (newMap[keys[0]] = newMap[keys[0]] || []).push(formatData(item))
        break
      case "ManyToMany":
        if (!keys || keys.length === 0) {
          throw new Error(`No keys found: ${JSON.stringify(item)}`)
        }
        for (const key of keys) {
          (newMap[key] = newMap[key] || []).push(formatData(cloneDeep(item))) // clone item to prevent side effects
        }
        break
      default:
        throw new Error(`Invalid keyToDataRelationship: ${keyToDataRelationship}`)
    }

    return newMap
  }
}