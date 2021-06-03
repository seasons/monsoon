
import {
    NestDataLoader,
    KeyToDataRelationship,
    PrismaTwoGenerateParams,
  } from "@modules/DataLoader/dataloader.types"
  import { Injectable } from "@nestjs/common"
  import DataLoader from "dataloader"
  import { PrismaService } from "./prisma.service"
  import { identity, cloneDeep, lowerFirst, isEqual } from "lodash"
  
  
  export type PrismaTwoDataLoader<V=any> = DataLoader<string, V>
  
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
  export class PrismaTwoLoader implements NestDataLoader {
    constructor(private readonly prisma: PrismaService) {}
  
    // TODO: Add support for custom `batchScheduleFn`s which we can use to coalesce queries
    // across tickets of the event loop. See https://www.npmjs.com/package/dataloader#batching for details
    // This is applicable, for example, when resolving queries on deeply nested field resolvers (e.g products -> variants -> hasRestockNotification)
    generateDataLoader(params: PrismaTwoGenerateParams): PrismaTwoDataLoader {
      return new DataLoader<string, any>((keys: any[]) =>
          this.fetchData(keys, params)
      )
    }
  
    private async fetchData(
      keys: any[],
      {
        model,
        select,
        orderBy,
        fallbackValue, 
        ctx,
        formatData = identity,
        getKeys = a => [a.id],
        formatWhere = (keys: string[], ctx) => ({id: {in: keys}}),
        keyToDataRelationship = "OneToOne"
      }: PrismaTwoGenerateParams
    ) {
      const where = formatWhere(keys, ctx)
      const _data = await this.prisma.client2[lowerFirst(model)].findMany(
          { where, select, orderBy },
        )
      const data = this.prisma.sanitizePayload(_data, model)
  
      let map = this.createMap({formatData, data, getKeys, keyToDataRelationship})
  
      if (fallbackValue === undefined) {
        fallbackValue = [] // fallback value for OneToMany and ManyToMany
        if (keyToDataRelationship === "OneToOne") {
          fallbackValue = {}
        }
      }     
      const result = keys.map(key => map[key] || fallbackValue)
      
      if (data.length !== 0 && result.every(a => isEqual(a, fallbackValue))) {
        throw new Error(`Dataloader on type ${model} returned ${data.length} results but was unable to map them to keys.` + ` You most likely forgot to enter a value for getKeys`)
      }
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