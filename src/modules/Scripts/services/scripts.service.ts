import fs from "fs"

import { AirtableBaseService } from "@app/modules/Airtable"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable } from "@nestjs/common"
import AWS from "aws-sdk"
import chargebee from "chargebee"

import {
  UpdateConnectionsInputs,
  UpdateEnvironmentInputs,
} from "../scripts.types"

@Injectable()
export class ScriptsService {
  private s3 = new AWS.S3()

  constructor(private readonly utilsService: UtilsService) {}

  getResetCountsData(prismaProdVar) {
    let prodVarPrismaResetData
    let prodVarAirtableResetData
    let physProdPrismaResetData
    let physProdAirtableResetData

    switch (this.utilsService.weightedCoinFlip(0.95)) {
      // Make 95% of all product variants fully reservable
      case "Heads":
        prodVarPrismaResetData = {
          reservable: prismaProdVar.total,
          reserved: 0,
          nonReservable: 0,
        }
        prodVarAirtableResetData = {
          "Reservable Count": prismaProdVar.total,
          "Non-Reservable Count": 0,
          "Reserved Count": 0,
        }
        physProdPrismaResetData = { inventoryStatus: "Reservable" }
        physProdAirtableResetData = { "Inventory Status": "Reservable" }
        break
      // Make 5% nonReservable
      case "Tails":
        prodVarPrismaResetData = {
          total: prismaProdVar.total,
          reservable: 0,
          reserved: 0,
          nonReservable: prismaProdVar.total,
        }
        prodVarAirtableResetData = {
          "Reservable Count": 0,
          "Non-Reservable Count": prismaProdVar.total,
          "Reserved Count": 0,
        }
        physProdPrismaResetData = { inventoryStatus: "NonReservable" }
        physProdAirtableResetData = { "Inventory Status": "Non Reservable" }
        break
      default:
        throw new Error("Invalid coin flip result")
    }

    return {
      prodVarPrismaResetData,
      prodVarAirtableResetData,
      physProdPrismaResetData,
      physProdAirtableResetData,
    }
  }
  async downloadFromS3(filePath, bucket, key): Promise<string> {
    return new Promise((resolve, reject) => {
      const params = {
        Bucket: bucket,
        Key: key,
      }
      this.s3.getObject(params, (err, data) => {
        if (err) return reject(err)
        fs.writeFileSync(filePath, data.Body.toString())
        resolve(filePath)
      })
    })
  }

  /**
   * Returns prisma and airtable services that point to the specified environments
   */
  async updateConnections({
    prismaEnv = "local",
    moduleRef,
  }: UpdateConnectionsInputs) {
    await this.overrideEnvFromRemoteConfig({
      prismaEnv,
    })
    moduleRef.get(PrismaService, { strict: false }).updateConnection({
      secret: process.env.PRISMA_SECRET,
      endpoint: process.env.PRISMA_ENDPOINT,
    })
  }

  private async overrideEnvFromRemoteConfig({
    prismaEnv = "local",
  }: UpdateEnvironmentInputs) {
    const envFilePath = await this.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.readJSONObjectFromFile(envFilePath)
      const { endpoint, secret } = env.prisma[prismaEnv]
      process.env.PRISMA_ENDPOINT = endpoint
      process.env.PRISMA_SECRET = secret
      chargebee.configure({
        site: env.chargebee.staging.site,
        api_key: env.chargebee.staging.apiKey,
      })
    } catch (err) {
      throw err
    } finally {
      // delete the env file
      fs.unlinkSync(envFilePath)
    }
  }

  readJSONObjectFromFile = (filepath: string) => {
    const rawData = fs.readFileSync(filepath) as any
    return JSON.parse(rawData)
  }
}
