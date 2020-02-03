import { isSaved } from "./queries/isSaved"
import { checkItemsAvailability } from "./mutations/checkItemsAvailability"
import { reserveItems } from "./mutations/reserveItems"

export const Product = {
  isSaved,
}

export const ProductMutations = {
  checkItemsAvailability,
  reserveItems,
}
