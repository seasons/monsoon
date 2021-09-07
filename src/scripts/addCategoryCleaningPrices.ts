import "module-alias/register"

import { Prisma } from "@prisma/client"
import { flatten, merge } from "lodash"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const getCategoryAndAllChildren = async (
    where: Prisma.CategoryWhereUniqueInput
  ) => {
    const categoryWithChildren = await ps.client.category.findUnique({
      where,
      select: {
        id: true,
        slug: true,
        children: { select: { id: true, slug: true } },
      },
    })
    let allChildrenWithData = []
    if (categoryWithChildren?.children?.length > 0) {
      allChildrenWithData = await Promise.all(
        categoryWithChildren.children.map(
          async a => await getCategoryAndAllChildren({ id: a.id })
        )
      )
    }
    return [categoryWithChildren, ...flatten(allChildrenWithData)] as any
  }

  const updateCategory = async (id, price) => {
    await ps.client.category.update({
      where: {
        id,
      },
      data: {
        dryCleaningFee: price,
      },
    })
  }

  const tops = await getCategoryAndAllChildren({
    slug: "tops",
  })

  const bottoms = await getCategoryAndAllChildren({
    slug: "bottoms",
  })

  const outerwear = await getCategoryAndAllChildren({
    slug: "outerwear",
  })

  const accessories = await getCategoryAndAllChildren({
    slug: "accessories",
  })

  for (const category of tops) {
    if (category?.id) {
      await updateCategory(category.id, 375)
    } else {
      console.log("tops", tops)
    }
  }

  for (const category of bottoms) {
    if (category?.id) {
      await updateCategory(category.id, 375)
    } else {
      console.log("bottoms", bottoms)
    }
  }

  for (const category of outerwear) {
    if (category?.id) {
      await updateCategory(category.id, 850)
    } else {
      console.log("outerwear", outerwear)
    }
  }

  for (const category of accessories) {
    if (category?.id) {
      await updateCategory(category.id, 75)
    } else {
      console.log("accessories ", accessories)
    }
  }

  console.log("finished")
}

run()
