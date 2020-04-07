import AWS from "aws-sdk"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { AirtableUtilsService } from "../../Airtable/services/airtable.utils.service"
import { Injectable } from "@nestjs/common"
import { OverridableAirtableBaseService } from "./airtable.service"
import { OverrideablePrismaService } from "./prisma.service"
import fs from "fs"

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

  /**
   * Returns prisma and airtable services that point to the specified environments
   */
  async getUpdatedServices({
    prismaEnvironment = "local",
    airtableEnvironment = "staging",
  }): Promise<{
    prisma: OverrideablePrismaService
    airtable: AirtableService
  }> {
    await this.overrideEnvFromRemoteConfig({
      prismaEnvironment,
      airtableEnvironment,
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
