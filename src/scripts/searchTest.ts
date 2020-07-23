import "module-alias/register"

import { ImageService } from "../modules/Image/services/image.service"
import { SearchService } from "../modules/Search"
import { AlgoliaService } from "../modules/Search/services/algolia.service"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const searchService = new SearchService(
    ps,
    new AlgoliaService(),
    new ImageService(ps)
  )
  searchService.indexProducts()
}

run()
