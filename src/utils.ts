export enum ProductSize {
  XS = "XS",
  S = "S",
  M = "M",
  L = "L",
  XL = "XL",
}

export const seasonsIDFromProductVariant = (product, productVariant) => {}

export const sizeToSizeCode = (size: ProductSize) => {
  switch (size) {
    case ProductSize.XS:
      return "XS"
    case ProductSize.S:
      return "SS"
    case ProductSize.M:
      return "MM"
    case ProductSize.L:
      return "LL"
    case ProductSize.XL:
      return "XL"
  }
  return ""
}
