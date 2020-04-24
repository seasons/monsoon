import {
  LoadAllRecordsWithListInput,
  LoadRecordsWithListInput,
} from "../payment.types"
import { chunk, concat, curry, groupBy } from "lodash"

import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import { UtilsService } from "@modules/Utils"

@Injectable()
export class LoaderUtilsService {
  constructor(private readonly utilsService: UtilsService) {}

  async loadAllRecordsWIthList({
    ids,
    recordName,
    maxIds = 200,
    filterKey = `id[in]`,
    groupFunc = a => a.id,
    extractFunc = (valsById, id) => valsById[id],
  }: LoadAllRecordsWithListInput) {
    return Promise.resolve(
      concat(
        [],
        ...(await Promise.all(
          chunk(ids, maxIds).map(async ids =>
            this.loadRecordsWithList({
              filterKey,
              ids,
              recordName,
              groupFunc,
              extractFunc,
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
      allRecords.push(...list?.map(a => a[recordName]))
      if (!offset) {
        break
      }
    }

    const recordsById = groupBy(
      allRecords.map(this.utilsService.camelCaseify),
      groupFunc
    )
    return ids.map(curry(extractFunc)(recordsById))
  }

  private createInParamVal(list: string[]) {
    return `[${list}]`
  }
}
