import "module-alias/register"

import * as fs from "fs"

import Analytics from "analytics-node"
import csv from "csv-parser"
import { camelCase, mapKeys, pick } from "lodash"
import moment from "moment"

import { BlogService } from "../modules/Blog/services/blog.service"
import { WebflowService } from "../modules/Blog/services/webflow.service"
import { UtilsService } from "../modules/Utils/services/utils.service"
import { PrismaService } from "../prisma/prisma.service"

// Useful Docs: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#identify

const seed = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const webflow = new WebflowService()
  const blog = new BlogService(webflow, utils)

  const allPosts = await blog.getAllItems()
  for (const post of allPosts) {
    const createData = {
      webflowId: post.id,
      webflowCreatedAt: post.createdAt,
      webflowUpdatedAt: post.updatedAt,
      tags: { set: post.tags },
      ...pick(post, [
        "name",
        "body",
        "summary",
        "thumbnailURL",
        "imageURL",
        "imageAlt",
        "url",
        "publishedOn",
        "author",
        "category",
        "slug",
      ]),
    } as any
    console.log(createData)
    await ps.client.createBlogPost(createData)
  }
}

seed()
