import "module-alias/register"

import { AlgoliaService } from "../modules/Search/services/algolia.service"
import { SearchService } from "../modules/Search/services/search.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const search = new SearchService(ps, new AlgoliaService())
  await search.indexPhysicalProducts()
}

run()
