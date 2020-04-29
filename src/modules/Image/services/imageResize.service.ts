import { Injectable } from "@nestjs/common"
import qs from "querystring"
import { pickBy, identity } from "lodash"

interface ImageResizerOptions {
  fit?: "clip"
  w?: number
  h?: number
}

export enum ImageSize {
  Thumb = "thumb",
  Small = "small",
  Medium = "medium",
  Large = "large",
  XLarge = "x-large",
}

const IMGIX_BASE = "https://seasons-nyc.imgix.net/"
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
export class ImageResizeService {
  imageResize(
    url: string,
    sizeName: ImageSize,
    options: ImageResizerOptions = { fit: "clip" }
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
}
