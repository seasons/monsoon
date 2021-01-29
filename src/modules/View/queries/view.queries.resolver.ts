import fs from "fs"

import { Args, Query, Resolver } from "@nestjs/graphql"

@Resolver()
export class ViewQueriesResolver {
  @Query()
  async view(@Args() { viewID }) {
    return JSON.parse(
      fs.readFileSync(process.cwd() + "/src/modules/View/data.json", "utf-8")
    )[viewID]
  }
}
