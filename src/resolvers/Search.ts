import { elasticsearch } from "../search"
import { Context } from "../utils"

export const search = {
  async search(parent, args, ctx: Context, info) {
    const { query, options } = args
    const indexes = ["brands", "products"]
    const result = await elasticsearch.search({
      index: indexes
        .map(a => `${a}-${process.env.NODE_ENV ?? "staging"}`)
        .join(","),
      body: {
        multi_match: {},
      },
    })

    console.log(result)
  },
}
