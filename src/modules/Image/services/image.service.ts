import qs from "querystring"

import { Injectable } from "@nestjs/common"
import AWS from "aws-sdk"
import { imageSize } from "image-size"
import { identity, pickBy } from "lodash"
import request from "request"

import { ImageData, ImageSize } from "../image.types"

interface ImageResizerOptions {
  fit?: "clip"
  w?: number
  h?: number
  retina?: boolean
}

const IMGIX_BASE = `https://${process.env.IMGIX_NAME}.imgix.net/`
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

  async uploadImage(
    image,
    options: { imageName?: string }
  ): Promise<ImageData> {
    const file = await image
    const { createReadStream, filename, mimetype } = file
    const fileStream = createReadStream()

    const name = options.imageName || filename

    // Here stream it to S3
    const uploadParams = {
      ACL: "public-read",
      Bucket: process.env.AWS_S3_IMAGES_BUCKET,
      Key: name,
      Body: fileStream,
    }
    const result = await this.s3.upload(uploadParams).promise()
    const url = result.Location

    // Get image size
    const { width, height } = await new Promise((resolve, reject) => {
      request({ url, encoding: null }, async (err, res, body) => {
        if (err) {
          reject(err)
        } else {
          const { width, height } = imageSize(body)

          resolve({
            height,
            width,
          })
        }
      })
    })

    fileStream.destroy()

    return {
      height,
      url: result.Location,
      width,
    }
  }

  async uploadImageFromURL(
    imageURL: string,
    imageName: string
  ): Promise<ImageData> {
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
              Bucket: process.env.AWS_S3_IMAGES_BUCKET,
              Key: imageName,
              Body: body,
            }
            const result = await this.s3.upload(uploadParams).promise()
            const { width, height } = imageSize(body)

            resolve({
              height,
              url: result.Location,
              width,
            })
          }
        }
      )
    })
  }
}
