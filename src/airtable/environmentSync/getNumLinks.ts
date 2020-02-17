import {
  getNumLinksColors,
  getNumLinksModels,
  getNumLinksLocations,
  getNumLinksBrands,
} from "./utils"
import { AirtableModelName } from "../utils"
import {
  getNumLinksProducts,
  getNumLinksCategories,
  getNumLinksHomepageProductRails,
  getNumLinksProductVariants,
  getNumLinksPhysicalProducts,
  getNumLinksUsers,
  getNumLinksReservations,
} from "."

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
  }
  throw new Error("invalid modelName")
}
