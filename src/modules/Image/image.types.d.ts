export type ImageSize =
  | "XSmall"
  | "Thumb"
  | "Small"
  | "Medium"
  | "Large"
  | "XLarge"

export interface ImageData {
  url: string
  width: number
  height: number
  title?: string
}

export interface ImageOptions {
  retina?: boolean
}
