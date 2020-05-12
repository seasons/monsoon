export type ImageSize = "Thumb" | "Small" | "Medium" | "Large" | "XLarge"

export interface ImageData {
  url: string
  width: number
  height: number
  title?: string
}
