import { Injectable } from "@nestjs/common"
import AWS from "aws-sdk"
import fs from "fs"
import { ManualPrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { ManualAirtableBaseService } from "../../Airtable/services/airtable.base.service"
import { AirtableUtilsService } from "../../Airtable/services/airtable.utils.service"

@Injectable()
export class ScriptsService {
  private s3 = new AWS.S3()

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

  // Returns [PrismaService, AirtableService]
  async overrideEnvFromRemoteAndGetUpdatedServices({
    prismaEnvironment = "local",
    airtableEnvironment = "staging",
  }): Promise<(ManualPrismaService | AirtableService)[]> {
    await this.overrideEnvFromRemoteConfig({
      prismaEnvironment,
      airtableEnvironment,
    })
    const _abs = new ManualAirtableBaseService(process.env.AIRTABLE_DATABASE_ID)
    return [
      new ManualPrismaService({
        endpoint: process.env.PRISMA_ENDPOINT,
        secret: process.env.PRISMA_SECRET,
      }),
      new AirtableService(_abs, new AirtableUtilsService(_abs)),
    ]
  }

  async overrideEnvFromRemoteConfig({
    prismaEnvironment = "local",
    airtableEnvironment = "staging",
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
      process.env.AIRTABLE_DATABASE_ID =
        env.airtable[airtableEnvironment].baseID
    } catch (err) {
      console.log(err)
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
