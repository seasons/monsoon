import { elasticsearch } from "../search"
import { Context } from "../utils"

export const Search = {
  async search(parent, args, ctx: Context, info) {
    const { query, options } = args
    const indexes = ["brands", "products"]
    const result = await elasticsearch.search({
      index: indexes
        .map(a => `${a}-${process.env.NODE_ENV ?? "staging"}`)
        .join(","),
      body: {
        query: {
          query_string: {
            query,
          },
        },
      },
    })

    const data = result.body.hits.hits.map(({ _score, _source }) => {
      return {
        data: _source,
        score: _score,
      }
    })

    return data
  },
}

export const SearchResultType = {
  __resolveType(obj, context, info) {
    if (obj.brand) {
      return "Product"
    }
    return "Brand"
  },
}
