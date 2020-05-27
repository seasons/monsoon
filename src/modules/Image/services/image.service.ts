import qs from "querystring"

import { Injectable } from "@nestjs/common"
import AWS from "aws-sdk"
import { imageSize } from "image-size"
import { identity, pickBy } from "lodash"
import request from "request"

import { ImageData, ImageSize } from "../image.types"

const S3_BUCKET = process.env.AWS_S3_IMAGES_BUCKET
export const IMGIX_BASE = `https://${process.env.IMGIX_NAME}.imgix.net/`
export const S3_BASE = `https://${S3_BUCKET}.s3.amazonaws.com/`

interface ImageResizerOptions {
  fit?: "clip"
  w?: number
  h?: number
  retina?: boolean
}
interface ImageSizeOptions {
  w?: number
  h?: number
  fit?: "clip"
}

type ImageSizeMap = {
  [key in ImageSize]: ImageSizeOptions
}

const sizes: ImageSizeMap = {
  Thumb: {
    w: 208,
    fit: "clip",
  },
  Small: {
    w: 288,
    fit: "clip",
  },
  Medium: {
    w: 372,
    fit: "clip",
  },
  Large: {
    w: 560,
    fit: "clip",
  },
  XLarge: {
    w: 702,
    fit: "clip",
  },
}

@Injectable()
export class ImageService {
  private s3 = new AWS.S3()

  resizeImage(
    url: string,
    sizeName: ImageSize,
    passedOptions: ImageResizerOptions
  ) {
    const options: ImageResizerOptions = pickBy(
      {
        fit: "clip",
        retina: true,
        ...passedOptions,
      },
      identity
    )

    const { retina, ...remainingOptions } = options
    const size = sizes[sizeName]
    const params: any = pickBy(
      {
        ...remainingOptions,
        ...sizes[sizeName],
        ...(options.retina && size.w ? { w: size.w * 2 } : {}),
        ...(options.retina && size.h ? { h: size.h * 2 } : {}),
      },
      identity
    )

    return url.replace(S3_BASE, IMGIX_BASE) + "?" + qs.stringify(params)
  }

  async uploadImage(
    image,
    options: { imageName?: string }
  ): Promise<ImageData> {
    const file = await image
    const { createReadStream, filename } = file
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
    imageName: string,
    title?: string
  ): Promise<ImageData> {
    await this.purgeS3ImageFromImgix(imageURL)
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
              title,
            })
          }
        }
      )
    })
  }

  async purgeS3ImageFromImgix(s3ImageURL: string) {
    const imgixImageURL = s3ImageURL.replace(S3_BASE, IMGIX_BASE)
    const authHeaderToken = Buffer.from(
      `${process.env.IMGIX_API_KEY}:`
    ).toString("base64")
    return await new Promise((resolve, reject) => {
      request(
        {
          url: "https://api.imgix.com/v2/image/purger",
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeaderToken}`,
          },
          json: {
            url: imgixImageURL,
          },
        },
        (err, res, body) => {
          if (err) {
            reject(err)
          }
          resolve(body)
        }
      )
    })
  }
}
