import qs from "querystring"
import * as url from "url"

import { Injectable, Logger } from "@nestjs/common"
import { Image, PrismaPromise } from "@prisma/client"
import { PrismaService } from "@prisma1/prisma.service"
import AWS from "aws-sdk"
import { imageSize } from "image-size"
import { identity, pickBy } from "lodash"
import request from "request"

import { ImageData, ImageSize } from "../image.types.d"

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
  XSmall: {
    w: 90,
  },
  Thumb: {
    w: 208,
  },
  Small: {
    w: 288,
  },
  Medium: {
    w: 372,
  },
  Large: {
    w: 560,
  },
  XLarge: {
    w: 702,
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
        (
          await this.prisma.client.image.findUnique({
            where: { url },
            select: { updatedAt: true },
          })
        )?.updatedAt
      const updatedAtTimestamp =
        updatedAt && Math.floor(new Date(updatedAt).getTime() / 1000)
      const options: ImageResizerOptions = pickBy(
        {
          retina: true,
          fm: "webp",
          ...passedOptions,
          updatedAt: updatedAtTimestamp,
        },
        identity
      )

      const { retina, ...remainingOptions } = options
      const selectedSize = sizes[sizeName ?? "Medium"]
      const size = {
        ...selectedSize,
        w: options.w ?? selectedSize.w,
        h: options.h ?? selectedSize.h,
      }
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
    if (!file) {
      this.logger.error("Error uploading image", {
        options,
      } as any)
      throw new Error("Error uploading image")
    }

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

    const data = {
      height,
      url: S3_BASE + uploadParams.Key,
      width,
    }

    this.logger.log("Uploaded image", {
      ...data,
    } as any)

    return data
  }

  async uploadImageFromURL(
    imageURL: string,
    imageName: string,
    title?: string
  ): Promise<ImageData> {
    try {
      await this.purgeS3ImageFromImgix(imageURL)
    } catch (err) {
      console.log("Error purging img ", err)
    }
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
              const url = result.Location
              const { width, height } = imageSize(body)

              resolve({
                height,
                url,
                width,
                title,
              })
            } catch (err) {
              this.logger.error("Error while uploading image", {
                imageName,
                err,
              } as any)
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
          const errors = body.errors
          const noResource = errors?.[0]?.title === "NotFound"
          if (err || (errors?.length > 0 && !noResource)) {
            const error = err || errors?.[0]
            reject(error)
            console.log("Error purging img ", error)
            this.logger.error("Error purging imgix cache", {
              url: imgixImageURL,
              s3Url: s3ImageURL,
              error: JSON.stringify(error),
            } as any)
          } else {
            resolve(body)
            this.logger.log("Purged images from imgix cache", {
              url: imgixImageURL,
              s3Url: s3ImageURL,
            } as any)
          }
        }
      )
    })
  }

  /**
   * Upserts images for a given product or brand, uploading new ones to S3 when needed.
   * The [images] argument is either an imageURL or an image file object
   * @param images of type (string | File)[]
   * @param imageNames: an array of image names
   * @param title: a title for the image, usually the record's slug
   * @param getPromises: if true, will return array of prisma promises to be awaited by parent function
   */
  async upsertImages(
    images: any[],
    imageNames: string[],
    title: string,
    getPromises = false
  ): Promise<
    { id: string }[] | { promise: PrismaPromise<Image>; url: string }[]
  > {
    const imageDatas = await Promise.all(
      images.map(async (image, index) => {
        const data = await image
        if (typeof data === "string") {
          // This means that we  an image URL in which case
          // we just have perfom an upsertImage with the url

          // This URL is sent by the client which means it an Imgix URL.
          // Thus, we need to convert it to s3 format and strip any query params as needed.
          const s3BaseURL = S3_BASE.replace(/\/$/, "") // Remove trailing slash
          const s3ImageURL = `${s3BaseURL}${url.parse(data).pathname}`
          const prismaImagePromise = this.prisma.client.image.upsert({
            create: { url: s3ImageURL, title },
            update: { url: s3ImageURL, title },
            where: { url: s3ImageURL },
          })
          return getPromises
            ? { promise: prismaImagePromise, url: s3ImageURL }
            : { id: (await prismaImagePromise).id }
        } else {
          // This means that we received a new image in the form of
          // a file in which case we have to upload the image to S3

          // Upload to S3 and retrieve metadata
          const imageName = imageNames[index]
          const { height, url, width } = await this.uploadImage(data, {
            imageName,
          })

          try {
            // Purge this image url in imgix cache
            await this.purgeS3ImageFromImgix(url)
          } catch (e) {}

          // Upsert the image with the s3 image url
          const prismaImagePromise = this.prisma.client.image.upsert({
            create: { height, url, width, title },
            update: { height, width, title },
            where: { url },
          })
          return getPromises
            ? { promise: prismaImagePromise, url }
            : { id: (await prismaImagePromise).id }
        }
      })
    )

    this.logger.log("Upserted images", {
      images: imageNames,
    } as any)
    return imageDatas as any
  }
}
