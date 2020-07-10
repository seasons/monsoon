import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import slugify from "slugify"

import { CategoryCreateInput, CategoryUpdateInput } from "../../../prisma"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncCategoriesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService
  ) {}

  getCategoryRecordIdentifier = rec => rec.fields.Name

  async syncAirtableToPrisma(cliProgressBar?) {
    const allCategories = await this.airtableService.getAllCategories()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allCategories.length * 2,
      modelName: "Categories",
    })

    // First create or update all categories
    for (const record of allCategories) {
      try {
        _cliProgressBar.increment()
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

        await this.prisma.client.upsertCategory({
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
    const [_tree, childrenMap] = this.buildHierarchy(categories)

    // Then link them to each other
    for (const record of categories) {
      try {
        _cliProgressBar.increment()

        const slug = record.slug
        const children = childrenMap[slug]
          ? this.getLeafNodes([childrenMap[slug]])[0]
          : []

        const data = {
          slug,
          children: {
            connect: children.map(({ slug }) => ({ slug })),
          },
        } as CategoryUpdateInput

        await this.prisma.client.updateCategory({
          where: {
            slug,
          },
          data,
        })
      } catch (e) {
        console.error(e)
      }
    }

    multibar?.stop()
  }

  private buildHierarchy(items) {
    const roots = []
    const children = {}

    // find the top level nodes and hash the children based on parent
    for (let i in items) {
      const item = items[i]
      const p = item.parent
      const target = !p ? roots : children[p.slug] || (children[p.slug] = [])

      target.push(item)
    }

    // function to recursively build the tree
    const findChildren = function (parent) {
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

  private getLeafNodes(nodes, result = []) {
    for (let node of nodes) {
      if (!node.children) {
        result.push(node)
      } else {
        result = this.getLeafNodes(node.children, result)
      }
    }
    return result
  }
}
