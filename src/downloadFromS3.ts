import AWS from "aws-sdk"
import fs from "fs"

const s3 = new AWS.S3()

export const downloadFromS3 = async (filePath, bucket, key) => {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS Environment variables")
  }
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucket,
      Key: key,
    }
    s3.getObject(params, (err, data) => {
      if (err) reject(err)
      fs.writeFileSync(filePath, data.Body.toString())
      resolve(filePath)
    })
  })
}
