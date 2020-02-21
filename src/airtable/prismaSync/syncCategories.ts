import { prisma, CategoryCreateInput, CategoryUpdateInput } from "../../prisma"
import { getAllCategories } from "../utils"
import slugify from "slugify"
import { isEmpty } from "lodash"

export const syncCategories = async () => {
  const allCategories = await getAllCategories()

  // First create or update all categories
  for (let record of allCategories) {
    try {
      const { model } = record
      const { name, description, visible, image } = model

      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        slug,
        name,
        description,
        visible,
        image,
      } as CategoryCreateInput

      const category = await prisma.upsertCategory({
        where: {
          slug,
        },
        create: data,
        update: data,
      })

      await record.patchUpdate({
        Slug: slug,
      })

      console.log(category)
    } catch (e) {
      console.error(e)
    }
  }

  const categories = allCategories.map(category => {
    const parent = allCategories.findByIds(category.model.parent)
    const model = parent && parent.model
    return {
      slug: slugify(category.model.name).toLowerCase(),
      name: category.model.name,
      parent: model && {
        slug: model.slug,
        name: model.name,
      },
    }
  })
  const [_tree, childrenMap] = buildHierarchy(categories)

  // Then link them to each other
  for (let record of categories) {
    try {
      const slug = record.slug
      const children = childrenMap[slug]
        ? getLeafNodes([childrenMap[slug]])[0]
        : []

      const data = {
        slug,
        children: {
          connect: children.map(({ slug }) => ({ slug })),
        },
      } as CategoryUpdateInput

      const updatedCategory = await prisma.updateCategory({
        where: {
          slug,
        },
        data,
      })

      console.log(slug, updatedCategory)
    } catch (e) {
      console.error(e)
    }
  }
}

function buildHierarchy(items) {
  let roots = [],
    children = {}

  // find the top level nodes and hash the children based on parent
  for (let i in items) {
    const item = items[i]
    const p = item.parent
    const target = !p ? roots : children[p.slug] || (children[p.slug] = [])

    target.push(item)
  }

  // function to recursively build the tree
  const findChildren = function(parent) {
    if (children[parent.slug]) {
      parent.children = children[parent.slug]
      for (let child of parent.children) {
        findChildren(child)
      }
    }
  }

  // enumerate through to handle the case where there are multiple roots
  const result = {}
  for (let i in roots) {
    const root = roots[i]
    findChildren(roots[i])
    result[root.slug] = roots[i]
  }

  return [result, children]
}

function getLeafNodes(nodes, result = []) {
  for (let node of nodes) {
    if (!node.children) {
      result.push(node)
    } else {
      result = getLeafNodes(node.children, result)
    }
  }
  return result
}
