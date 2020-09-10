import "module-alias/register"

import * as Airtable from "airtable"
import { head, identity, isEmpty } from "lodash"

import { AirtableBaseService } from "../modules/Airtable/services/airtable.base.service"
import { AirtableService } from "../modules/Airtable/services/airtable.service"
import { AirtableUtilsService } from "../modules/Airtable/services/airtable.utils.service"
import { ProductUtilsService } from "../modules/Product/services/product.utils.service"
import { PrismaService } from "../prisma/prisma.service"

Airtable.configure({
  endpointUrl: "https://api.airtable.com",
  apiKey: process.env.AIRTABLE_KEY,
})

const copyMissingFieldsToProduct = async () => {
  const abs = new AirtableBaseService()
  const airtableService = new AirtableService(
    abs,
    new AirtableUtilsService(abs)
  )
  const prisma = new PrismaService()
  const productUtils = new ProductUtilsService(prisma)

  const allBrands = await airtableService.getAllBrands()
  const allProducts = await airtableService.getAllProducts()
  const allCategories = await airtableService.getAllCategories()

  for (const record of allProducts) {
    try {
      const { model } = record
      const { name } = model

      const brand = allBrands.findByIds(model.brand)
      const category = allCategories.findByIds(model.category)

      if (
        isEmpty(model) ||
        isEmpty(name) ||
        isEmpty(brand) ||
        isEmpty(category)
      ) {
        continue
      }

      const {
        architecture,
        color,
        barcode,
        description,
        images,
        modelHeight,
        externalURL,
        photographyStatus,
        tags,
        retailPrice,
        innerMaterials,
        outerMaterials,
        status,
        type,
      } = model

      // Get the slug
      const { brandCode } = brand.model
      const slug = productUtils.getProductSlug(brandCode, name, color)

      const data = {
        architecture,
      }

      await prisma.client.updateProduct({
        where: {
          slug,
        },
        data,
      })
    } catch (e) {
      console.error(e)
    }
  }
}

copyMissingFieldsToProduct()
