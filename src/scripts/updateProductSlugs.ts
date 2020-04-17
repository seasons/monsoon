import "module-alias/register"

import * as Airtable from "airtable"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { PrismaService } from "../prisma/prisma.service"
import slugify from "slugify"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const updateSlugs = async () => {
  const ps = new PrismaService()
  const abs = new AirtableBaseService()
  const as = new AirtableService(abs, new AirtableUtilsService(abs))

  const allPrismaProducts = await ps.binding.query.products(
    {},
    `
  {
      slug
      brand {
        brandCode
      }
      color {
        name
        colorCode
      }
  }`
  )
  const allAirtableProducts = await as.getAllProducts()
  for (const prismaProd of allPrismaProducts) {
    const correspondingAirtableProduct = allAirtableProducts.find(
      a => a.model.slug === prismaProd.slug
    )
    const newSlug = slugify(
      prismaProd.brand.brandCode + " " + prismaProd.slug
    ).toLowerCase()
    await ps.client.updateProduct({
      where: { slug: prismaProd.slug },
      data: { slug: newSlug },
    })
    try {
      await correspondingAirtableProduct.patchUpdate({
        Slug: newSlug,
      })
    } catch (err) {
      console.log(newSlug)
      console.log(err)
    }
  }
}

updateSlugs()
