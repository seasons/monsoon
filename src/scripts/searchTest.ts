import "module-alias/register"

import { SearchService } from "../modules/Search/services/search.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const searchService = new SearchService(ps)

  // await searchService.indexData()
  await searchService.query("Prada")
}

run()
