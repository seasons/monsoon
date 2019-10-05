import slugify from "slugify"
import { prisma, BrandTier } from "../prisma"
import { isEmpty } from "lodash"
import { getAllBrands } from "./utils"

interface AirtableBrandInput {
  Name: string
  Tier: string
  Website: string
  Logo: any
  Description: any
  Since: number
  "Product Inventory": string
  "Brand Code": string
  Primary: boolean
}

export const syncBrands = async () => {
  const records = await getAllBrands()

  for (let record of records) {
    try {
      const values: AirtableBrandInput = record.fields
      if (isEmpty(values.Name)) {
        return
      }

      const slug = slugify(values.Name).toLowerCase()

      const data = {
        name: values.Name,
        tier: (values.Tier || "").replace(" ", "") as BrandTier,
        websiteUrl: values.Website,
        logo: values.Logo,
        description: values.Description,
        since: values.Since ? `${values.Since}-01-01` : "2019-01-01",
        isPrimaryBrand: values.Primary,
        brandCode: values["Brand Code"],
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
        "Seasons ID": brand.id,
        Slug: slug,
      })

      console.log(brand)
    } catch (e) {
      console.error(e)
    }
  }
}
