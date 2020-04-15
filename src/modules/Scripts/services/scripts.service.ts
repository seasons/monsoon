import {
  UpdateConnectionsInputs,
  UpdateEnvironmentInputs,
} from "../scripts.types"

import AWS from "aws-sdk"
import { AirtableBaseService } from "@app/modules/Airtable"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "@app/prisma/prisma.service"
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
    airtableEnv = "staging",
    moduleRef,
  }: UpdateConnectionsInputs) {
    await this.overrideEnvFromRemoteConfig({
      prismaEnv,
      airtableEnv,
    })
    moduleRef.get(PrismaService, { strict: false }).updateConnection({
      secret: process.env.PRISMA_SECRET,
      endpoint: process.env.PRISMA_ENDPOINT,
    })
    moduleRef.get(AirtableBaseService, { strict: false }).updateConnection({
      id: process.env.AIRTABLE_DATABASE_ID,
    })
  }

  private async overrideEnvFromRemoteConfig({
    prismaEnv = "local",
    airtableEnv = "staging",
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
      if (!!airtableEnv && !["staging", "production"].includes(airtableEnv)) {
        process.env.AIRTABLE_DATABASE_ID = airtableEnv
      } else if (["staging", "production"].includes(airtableEnv)) {
        process.env.AIRTABLE_DATABASE_ID = env.airtable[airtableEnv].baseID
      } else {
        throw new Error(
          "Invalid airtable config options. Must pass airtableEnvironment of 'staging' or 'production' OR a valid airtable base id (e.g app702vE3MaQbzciw)"
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
