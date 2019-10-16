import { Context } from "../auth/utils"

export const Product = {}

export const ProductMutations = {
  reserveItems(parent, { idToken }, ctx: Context, info) {
    console.log("Hello world")
  },
}
