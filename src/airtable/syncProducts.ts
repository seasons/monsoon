import { base } from "./config"
import { getAllBrands, getAllCategories } from "./utils"
import { prisma } from "../prisma"

export const syncProducts = async () => {
  const allBrands = await getAllBrands()
  const allCategories = await getAllCategories()

  const brandByAirtableId = brandId =>
    allBrands.find(record => record.id === brandId)

  const categoryByAirtableId = categoryId =>
    allCategories.find(record => record.id === categoryId)

  base("Products")
    .select({
      view: "Grid view",
    })
    .eachPage(function(records, fetchNextPage) {
      records.forEach(
        async function(record) {
          try {
            const values = record.fields

            const brands = record.fields.Brand
            const brandId = brands && brands[0]

            const categories = record.fields.Category
            const categoryId = categories && categories[0]

            const brand = brandByAirtableId(brandId)
            const category = categoryByAirtableId(categoryId)

            const data = {
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

            record.patchUpdate({
              "Seasons ID": product.id,
            })

            console.log(product)
            return fetchNextPage()
          } catch (e) {
            console.error(e)
          }
        },
        err => {
          console.error(err)
          return
        }
      )
    })
}

syncProducts()
