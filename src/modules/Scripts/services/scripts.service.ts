import AWS from "aws-sdk"
import { Injectable } from "@nestjs/common"
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
