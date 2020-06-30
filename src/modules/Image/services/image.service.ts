import qs from "querystring"

import { Injectable, Logger } from "@nestjs/common"
import { PrismaService } from "@prisma/prisma.service"
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
  fm?: ImageFormat
  updatedAt?: string
}

interface ImageSizeOptions {
  w?: number
  h?: number
  fit?: "clip"
}

type ImageFormat = "webp" | "jpg" | "png" | "gif" | "mp4"

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
  private readonly logger = new Logger(ImageService.name)
  private s3 = new AWS.S3()

  constructor(private readonly prisma: PrismaService) {}

  async resizeImage(
    url: string,
    sizeName: ImageSize,
    passedOptions: ImageResizerOptions
  ) {
    try {
      const updatedAt =
        passedOptions.updatedAt ??
        (await this.prisma.client.image({ url }).updatedAt())
      const updatedAtTimestamp =
        updatedAt && Math.floor(new Date(updatedAt).getTime() / 1000)
      const options: ImageResizerOptions = pickBy(
        {
          fit: "clip",
          retina: true,
          fm: "webp",
          updatedAt: updatedAtTimestamp,
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

      if (/seasons-images\./.test(url)) {
        return (
          url.replace(
            `seasons-images.s3.amazonaws.com`,
            `seasons-s3.imgix.net`
          ) +
          "?" +
          qs.stringify(params)
        )
      }

      return (
        url.replace(
          `seasons-images-staging.s3.amazonaws.com`,
          `seasons-s3-staging.imgix.net`
        ) +
        "?" +
        qs.stringify(params)
      )
    } catch (err) {
      console.error(err)
    }
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
    try {
      await this.purgeS3ImageFromImgix(imageURL)
    } catch (err) {}
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
            try {
              const result = await this.s3.upload(uploadParams).promise()
              const { width, height } = imageSize(body)

              resolve({
                height,
                url: result.Location,
                width,
                title,
              })
            } catch (err) {
              this.logger.error("Error while uploading image")
              this.logger.error(imageName)
              this.logger.error(err)
            }
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
