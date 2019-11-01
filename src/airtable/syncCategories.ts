import { prisma } from "../prisma"
import { getAllCategories } from "./utils"
import slugify from "slugify"
import { isEmpty, get } from "lodash"

export const syncCategories = async () => {
  const allCategories = await getAllCategories()
  const categories = allCategories.map(category => {
    const parent = allCategories.findByIds(category.model.parent)
    const model = parent && parent.model
    return {
      slug: slugify(category.model.name).toLowerCase(),
      name: category.model.name,
      parent: model && {
        slug: model.slug,
        name: model.name
      }
    }
  })
  const tree = buildHierarchy(categories)
  console.log(tree, null, 2)

  for (let record of allCategories) {
    try {
      const { model } = record
      const { name, description, parent } = model

      if (isEmpty(model) || isEmpty(name)) {
        continue
      }

      const slug = slugify(name).toLowerCase()

      const data = {
        slug,
        name,
        description,
      }

      const children = getLeafNodes([tree[slug]])
      console.log(children)

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
}

const buildHierarchy = (items) => {

  var roots = [], children = {};

  // find the top level nodes and hash the children based on parent
  for (let i in items) {
      const item = items[i]
      const p = item.parent
      const target = !p ? roots : (children[p.slug] || (children[p.slug] = []));

      target.push(item);
  }

  // function to recursively build the tree
  const findChildren = function(parent) {
      if (children[parent.slug]) {
          parent.children = children[parent.slug];
          for (let child of parent.children) {
              findChildren(child);
          }
      }
  };

  // enumerate through to handle the case where there are multiple roots
  const result = {}
  for (let i in roots) {
    const root = roots[i]
    findChildren(roots[i])
    result[root.slug] = roots[i];
  }
  
  return result;
}

function getLeafNodes(nodes, result = []){
  for(var i = 0, length = nodes.length; i < length; i++){
    if(!nodes[i].children){
      result.push(nodes[i]);
    }else{
      result = getLeafNodes(nodes[i].children, result);
    }
  }
  return result;
}

syncCategories()