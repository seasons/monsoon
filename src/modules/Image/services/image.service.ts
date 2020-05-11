import qs from "querystring"

import { Injectable } from "@nestjs/common"
import AWS from "aws-sdk"
import { identity, pickBy } from "lodash"
import request from "request"

import { ImageSize } from "../image.types"

interface ImageResizerOptions {
  fit?: "clip"
  w?: number
  h?: number
  retina?: boolean
}

const IMGIX_NAME =
  process.env.NODE_ENV === "production" ? "seasons-s3" : "seasons-s3-staging"
const IMGIX_BASE = `https://${IMGIX_NAME}.imgix.net/`
const AIRTABLE_BASE = "https://dl.airtable.com/.attachments/"

const sizes = {
  Thumb: {
    w: 200,
    fit: "clip",
  },
  Small: {
    w: 400,
    fit: "clip",
  },
  Medium: {
    w: 500,
    fit: "clip",
  },
  Large: {
    w: 800,
    fit: "clip",
  },
  XLarge: {
    w: 640,
    fit: "clip",
  },
}

@Injectable()
export class ImageService {
  private s3 = new AWS.S3()

  imageResize(
    url: string,
    sizeName: ImageSize,
    options: ImageResizerOptions = { fit: "clip", retina: true }
  ) {
    const params: any = pickBy(
      {
        ...options,
        ...sizes[sizeName],
      },
      identity
    )

    return url.replace(AIRTABLE_BASE, IMGIX_BASE) + "?" + qs.stringify(params)
  }

  async uploadImage(image, options: { imageName?: string }) {
    const file = await image
    const { createReadStream, filename, mimetype } = file
    const fileStream = createReadStream()

    const name = options.imageName || filename

    const bucketName =
      process.env.NODE_ENV === "production"
        ? "seasons-images"
        : "seasons-images-staging"
    // Here stream it to S3
    // Enter your bucket name here next to "Bucket: "
    const uploadParams = {
      ACL: "public-read",
      Bucket: bucketName,
      Key: name,
      Body: fileStream,
    }
    const result = await this.s3.upload(uploadParams).promise()

    return result.Location
  }

  async uploadImageFromURL(imageURL: string, imageName: string) {
    return new Promise((resolve, reject) => {
      request(
        {
          url: imageURL,
          encoding: null,
        },
        async (err, res, body) => {
          if (err) {
            reject(err)
          } else {
            const uploadParams = {
              ACL: "public-read",
              Bucket: "seasons-images",
              Key: imageName,
              Body: body,
            }
            const result = await this.s3.upload(uploadParams).promise()

            resolve(result.Location)
          }
        }
      )
    })
  }
}
