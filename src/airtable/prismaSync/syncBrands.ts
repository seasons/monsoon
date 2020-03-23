import slugify from "slugify"
import { prisma, BrandTier } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllBrands } from "../utils"
import { makeSingleSyncFuncMultiBarAndProgressBarIfNeeded } from "./utils"

export const syncBrands = async (cliProgressBar?) => {
  const records = await getAllBrands()

  const [
    multibar,
    _cliProgressBar,
  ] = await makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
    cliProgressBar,
    numRecords: records.length,
    modelName: "Brands",
  })

  for (const record of records) {
    try {
      _cliProgressBar.increment()
      const { model } = record

      const {
        name,
        brandCode,
        description,
        website,
        logo,
        since,
        primary,
        tier,
      } = model

      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        slug,
        name,
        tier: (tier || "").replace(" ", "") as BrandTier,
        websiteUrl: website,
        logo,
        description,
        since: since ? `${since}-01-01` : "2019-01-01",
        isPrimaryBrand: !!primary,
        brandCode,
      }

      await prisma.upsertBrand({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })
    } catch (e) {
      console.log(record)
      console.error(e)
    }
  }
  multibar?.stop()
}
