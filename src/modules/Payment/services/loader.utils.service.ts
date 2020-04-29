import { UtilsService } from "@modules/Utils"
import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import { chunk, concat, curry, groupBy, identity } from "lodash"

import {
  LoadAllRecordsWithListInput,
  LoadRecordsWithListInput,
} from "../payment.types"

@Injectable()
export class LoaderUtilsService {
  constructor(private readonly utilsService: UtilsService) {}

  async loadAllRecordsWIthList({
    ids,
    maxIds = 200,
    filterKey = `id[in]`,
    groupFunc = (a) => a.id,
    extractFunc = (valsById, id) => valsById[id],
    transformFunc = identity,
    ...args
  }: LoadAllRecordsWithListInput) {
    return Promise.resolve(
      concat(
        [],
        ...(await Promise.all(
          chunk(ids, maxIds).map(async (ids) =>
            this.loadRecordsWithList({
              ids,
              filterKey,
              groupFunc,
              extractFunc,
              transformFunc,
              ...args,
            })
          )
        ))
      )
    )
  }

  private async loadRecordsWithList({
    filterKey,
    ids,
    recordName,
    groupFunc,
    extractFunc,
    transformFunc,
  }: LoadRecordsWithListInput) {
    let offset = "start"
    const allRecords = []
    while (true) {
      let list
      const listParams = {}
      listParams[filterKey] = this.createInParamVal(ids)
      ;({ next_offset: offset, list } = await chargebee[recordName]
        .list({
          ...listParams,
          limit: 100,
          ...(offset === "start" ? {} : { offset }),
        })
        .request())
      allRecords.push(...list?.map((a) => a[recordName]))
      if (!offset) {
        break
      }
    }

    const recordsById = groupBy(
      allRecords.map(this.utilsService.camelCaseify).map(transformFunc),
      groupFunc
    )
    return ids.map(curry(extractFunc)(recordsById))
  }

  private createInParamVal(list: string[]) {
    return `[${list}]`
  }
}
