import { getNumLinksLocations } from "./syncLocations"
import { getNumLinksModels } from "./syncModels"
import { getNumLinksColors } from "./syncColors"
import { getNumLinksBrands } from "./syncBrands"
import { AirtableModelName } from "../utils"
import {
  getNumLinksProducts,
  getNumLinksCategories,
  getNumLinksHomepageProductRails,
  getNumLinksProductVariants,
  getNumLinksPhysicalProducts,
  getNumLinksUsers,
  getNumLinksReservations,
  getNumLinksSizes,
  getNumLinksTopSizes
} from "."
import { getNumLinksBottomSizes } from "./syncBottomSizes"

export const getNumLinks = (modelName: AirtableModelName) => {
  switch (modelName) {
    case "Colors":
      return getNumLinksColors()
    case "Models":
      return getNumLinksModels()
    case "Locations":
      return getNumLinksLocations()
    case "Brands":
      return getNumLinksBrands()
    case "Products":
      return getNumLinksProducts()
    case "Categories":
      return getNumLinksCategories()
    case "Homepage Product Rails":
      return getNumLinksHomepageProductRails()
    case "Product Variants":
      return getNumLinksProductVariants()
    case "Physical Products":
      return getNumLinksPhysicalProducts()
    case "Users":
      return getNumLinksUsers()
    case "Reservations":
      return getNumLinksReservations()
    case "Sizes":
      return getNumLinksSizes()
    case "Top Sizes":
      return getNumLinksTopSizes()
    case "Bottom Sizes":
      return getNumLinksBottomSizes()
  }
  throw new Error("invalid modelName")
}
