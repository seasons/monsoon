import slugify from "slugify"
import { prisma, BrandTier } from "../../prisma"
import { isEmpty } from "lodash"
import { getAllBrands } from "../utils"

export const syncBrands = async () => {
  const records = await getAllBrands()

  for (let record of records) {
    try {
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
        isPrimaryBrand: primary,
        brandCode,
      }

      const brand = await prisma.upsertBrand({
        where: {
          slug,
        },
        create: {
          slug,
          ...data,
        },
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(brand)
    } catch (e) {
      console.error(e)
    }
  }
}
