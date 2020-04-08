import AWS from "aws-sdk"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { AirtableUtilsService } from "../../Airtable/services/airtable.utils.service"
import { Injectable } from "@nestjs/common"
import { OverridableAirtableBaseService } from "./airtable.service"
import { OverrideablePrismaService } from "./prisma.service"
import { UtilsService } from "@modules/Utils/index"
import fs from "fs"

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
        prodVarAirtableResetData = { inventoryStatus: "Reservable" }
        physProdPrismaResetData = {
          "Reservable Count": prismaProdVar.total,
          "Non-Reservable Count": 0,
          "Reserved Count": 0,
        }
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
  async getUpdatedServices({
    prismaEnvironment = "local",
    airtableEnvironment = "staging",
    airtableBaseId = "",
  }): Promise<{
    prisma: OverrideablePrismaService
    airtable: AirtableService
  }> {
    await this.overrideEnvFromRemoteConfig({
      prismaEnvironment,
      airtableEnvironment,
      airtableBaseId,
    })
    const _abs = new OverridableAirtableBaseService(
      process.env.AIRTABLE_DATABASE_ID
    )
    return {
      prisma: new OverrideablePrismaService({
        secret: process.env.PRISMA_SECRET,
        endpoint: process.env.PRISMA_ENDPOINT,
        debug: false,
      }),
      airtable: new AirtableService(_abs, new AirtableUtilsService(_abs)),
    }
  }

  async overrideEnvFromRemoteConfig({
    prismaEnvironment = "local",
    airtableEnvironment = "staging",
    airtableBaseId,
  }) {
    const envFilePath = await this.downloadFromS3(
      "/tmp/__monsoon__env.json",
      "monsoon-scripts",
      "env.json"
    )
    try {
      const env = this.readJSONObjectFromFile(envFilePath)
      const { endpoint, secret } = env.prisma[prismaEnvironment]
      process.env.PRISMA_ENDPOINT = endpoint
      process.env.PRISMA_SECRET = secret
      if (!!airtableBaseId) {
        process.env.AIRTABLE_DATABASE_ID = airtableEnvironment
      } else if (["staging", "production"].includes(airtableEnvironment)) {
        process.env.AIRTABLE_DATABASE_ID =
          env.airtable[airtableEnvironment].baseID
      } else {
        throw new Error(
          "Invalid airtable config options. Must pass airtableEnvironment of 'staging' or 'production' OR pass a valid airtableBaseId"
        )
      }
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
