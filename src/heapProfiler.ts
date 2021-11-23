import fs from "fs"

import AWS from "aws-sdk"
import { DateTime } from "luxon"
import * as pprof from "pprof"

const s3 = new AWS.S3()

export const setupHeapProfiler = async logger => {
  if (process.env.IS_TEST_ENV) {
    return
  }
  // The average number of bytes between samples.
  const intervalBytes = 512 * 1024
  // The maximum stack depth for samples collected.
  const stackDepth = 64
  const dynoName = (process.env.DYNO || "unknown").replace(".", "")
  const appName = process.env.HEROKU_APP_NAME || "monsoon-dev"

  await pprof.heap.start(intervalBytes, stackDepth)

  setInterval(async () => {
    try {
      const profile = await pprof.heap.profile()
      const buf = await pprof.encode(profile)

      const filename = `${appName}-${dynoName}/heap-${DateTime.local().toFormat(
        "hh-mm-ss"
      )}.pb.gz`

      console.log(filename)

      fs.writeFile(filename, buf, err => {
        if (err) {
          logger.error(err)
        }
      })

      // Read file and upload to S3
      const uploadParams = {
        // ACL: "public-read",
        Bucket: "monsoon-scripts",
        Key: `heap_profiles/${filename}`,
        Body: buf,
      }

      const result = await s3.upload(uploadParams).promise()
      const url = result.Location

      logger.log(`Heap profile uploaded to s3 at: ${url}`)
    } catch (e) {
      logger.error(e)
    }
  }, 60 * 1000) // every minute
}
