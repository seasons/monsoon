import { isSaved } from "./queries/isSaved"
import { variants } from "./queries/variants"
import { checkItemsAvailability } from "./mutations/checkItemsAvailability"
import { reserveItems } from "./mutations/reserveItems"

export const Product = {
  isSaved,
  variants,
}

export const ProductMutations = {
  checkItemsAvailability,
  reserveItems,
}
