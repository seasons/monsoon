import * as Airtable from "airtable"

import { AirtableData, AirtableModelName } from "../airtable.types"
import { AirtableBaseService } from "./airtable.base.service"
import { camelCase } from "lodash"

export class AirtableQueriesService {
  constructor(readonly airtableBase: AirtableBaseService) {
    this.airtableBase = airtableBase
  }

  async getNextPhysicalProductSequenceNumber() {
    const sortedSequenceNumbers = (await this.getAllPhysicalProducts())
      .map(a => parseInt(a.model.sequenceNumber, 10))
      .sort((a, b) => a - b)
    return Math.max(...sortedSequenceNumbers) + 1
  }

  async getAllBrands(airtableBase?) {
    return await this.getAllFromScriptView("Brands", airtableBase)
  }

  async getAllCategories(airtableBase?) {
    return await this.getAllFromScriptView("Categories", airtableBase)
  }

  async getAllCollectionGroups(airtableBase?) {
    return await this.getAllFromScriptView("Collection Groups", airtableBase)
  }

  async getAllCollections(airtableBase?) {
    return await this.getAllFromScriptView("Collections", airtableBase)
  }

  async getAllColors(airtableBase?) {
    return await this.getAllFromScriptView("Colors", airtableBase)
  }

  async getAllHomepageProductRails(airtableBase?) {
    return await this.getAllFromScriptView(
      "Homepage Product Rails",
      airtableBase
    )
  }

  async getAllLocations(airtableBase?) {
    return await this.getAllFromScriptView("Locations", airtableBase)
  }

  async getAllModels(airtableBase?) {
    return await this.getAllFromScriptView("Models", airtableBase)
  }

  async getAllPhysicalProducts(airtableBase?) {
    return await this.getAllFromScriptView("Physical Products", airtableBase)
  }

  getPhysicalProducts(SUIDs: string[]) {
    const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`
    return this.getAll("Physical Products", formula)
  }

  getCorrespondingAirtablePhysicalProduct(
    allAirtablePhysicalProducts,
    prismaPhysicalProduct
  ) {
    return allAirtablePhysicalProducts.find(
      physProd => physProd.model.suid.text === prismaPhysicalProduct.seasonsUID
    )
  }

  async getAllProductVariants(airtableBase?) {
    return await this.getAllFromScriptView("Product Variants", airtableBase)
  }

  getCorrespondingAirtableProductVariant(
    allAirtableProductVariants: AirtableData,
    prismaProductVariant: any
  ) {
    return allAirtableProductVariants.find(
      a => a.model.sku === prismaProductVariant.sku
    )
  }

  async getAllProducts(airtableBase?) {
    return await this.getAllFromScriptView("Products", airtableBase)
  }

  async getAllReservations(airtableBase?) {
    return await this.getAllFromScriptView("Reservations", airtableBase)
  }

  async getReservation(resevationNumber) {
    return await this.getAll("Reservations", `{ID} = '${resevationNumber}'`)
  }

  async getAllTopSizes(airtableBase?) {
    return await this.getAllFromScriptView("Top Sizes", airtableBase)
  }

  async getAllUsers(airtableBase?) {
    return await this.getAllFromScriptView("Users", airtableBase)
  }

  async getAllBottomSizes(airtableBase?) {
    return await this.getAllFromScriptView("Bottom Sizes", airtableBase)
  }

  async getAllSizes(airtableBase?) {
    return await this.getAllFromScriptView("Sizes", airtableBase)
  }

  async getNumRecords(modelName: AirtableModelName) {
    return (await this.getAll(modelName, "", ""))?.length
  }

  getProductionBase = () => {
    if (!process.env._PRODUCTION_AIRTABLE_BASEID) {
      throw new Error("_PRODUCTION_AIRTABLE_BASEID not set")
    }
    return Airtable.base(process.env._PRODUCTION_AIRTABLE_BASEID)
  }

  getStagingBase = () => {
    if (!process.env._STAGING_AIRTABLE_BASEID) {
      throw new Error("_STAGING_AIRTABLE_BASEID not set")
    }
    return Airtable.base(process.env._STAGING_AIRTABLE_BASEID)
  }

  private getAllFromScriptView(modelName: AirtableModelName, airtableBase?) {
    return this.getAll(modelName, "", "Script", airtableBase)
  }

  private getAll: (
    name: string,
    filterFormula?: string,
    view?: string,
    airtableBase?: any
  ) => Promise<AirtableData> = async (
    name,
    filterFormula,
    view = "Script",
    airtableBase
  ) => {
    const data = [] as AirtableData
    const baseToUse = airtableBase || this.airtableBase.base

    data.findByIds = (ids = []) => {
      return data.find(record => ids.includes(record.id))
    }

    data.findMultipleByIds = (ids = []) => {
      return data.filter(record => ids.includes(record.id))
    }

    return new Promise((resolve, reject) => {
      const options: { view: string; filterByFormula?: string } = {
        view,
      }

      if (filterFormula && filterFormula.length) {
        options.filterByFormula = filterFormula
      }

      baseToUse(name)
        .select(options)
        .eachPage(
          (records, fetchNextPage) => {
            records.forEach(record => {
              record.model = this.airtableToPrismaObject(record.fields)
              data.push(record)
            })
            return fetchNextPage()
          },
          function done(err) {
            if (err) {
              console.error(err)
              return reject(err)
            }
            return resolve(data)
          }
        )
    })
  }

  private airtableToPrismaObject(record) {
    const obj = {}
    for (const id of Object.keys(record)) {
      const newKey = camelCase(id)
      obj[newKey] = record[id]
    }
    return obj
  }
}
