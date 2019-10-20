import { getAllBrands, getAllCategories, getAllProducts } from "./utils"
import { prisma } from "../prisma"
import slugify from "slugify"

export const syncProducts = async () => {
  const allBrands = await getAllBrands()
  const allCategories = await getAllCategories()
  const allProducts = await getAllProducts()

  const brandByAirtableId = brandId =>
    allBrands.find(record => record.id === brandId)

  const categoryByAirtableId = categoryId =>
    allCategories.find(record => record.id === categoryId)

  for (let record of allProducts) {
    try {
      const values = record.fields

      const brands = record.fields.Brand
      const brandId = brands && brands[0]

      const categories = record.fields.Category
      const categoryId = categories && categories[0]

      const brand = brandByAirtableId(brandId)
      const category = categoryByAirtableId(categoryId)

      const slug = slugify(values.Name + " " + values.Color)

      const data = {
        slug,
        name: values.Name,
        description: values.Description,
        brand: !!brand && {
          connect: {
            id: brand.fields["Seasons ID"],
          },
        },
        category: !!category && {
          connect: {
            id: category.fields["Seasons ID"],
          },
        },
        images: values.Images,
        modelSize: values["Model Size"],
        modelHeight: values["Model Height"],
        externalUrl: values.Link,
        tags: values.Tags,
        retailPrice: values.Retail,
        categoryId: category && category.node && category.node.id,
      }

      const product = !!values["Seasons ID"]
        ? await prisma.upsertProduct({
            where: {
              id: values["Seasons ID"],
            },
            create: data,
            update: data,
          })
        : await prisma.createProduct(data)

      await record.patchUpdate({
        "Seasons ID": product.id,
      })

      console.log(product)
    } catch (e) {
      console.error(e)
    }
  }
}
