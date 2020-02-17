import AWS from "aws-sdk"
import fs from "fs"

const s3 = new AWS.S3()

const downloadFile = (filePath, bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  }
  s3.getObject(params, (err, data) => {
    if (err) throw err
    fs.writeFileSync(filePath, data.Body.toString())
  })
}
