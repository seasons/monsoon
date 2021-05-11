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

const timeout = async ms => new Promise(resolve => setTimeout(resolve, ms))

const seed = async () => {
  const ps = new PrismaService()
  const utils = new UtilsService(ps)
  const webflow = new WebflowService()
  const blog = new BlogService(webflow, utils)

  const allPosts = await ps.client.blogPosts({ where: { published: true } })
  // const allPosts = await blog.getAllItems()

  let count = 0
  let currentPost
  try {
    for (const post of allPosts) {
      currentPost = post
      if (!post.content && post.published) {
        await timeout(2000)
        const item = await blog.getItem(post.webflowId)
        const content = item["post-content"]
        await ps.client.updateBlogPost({
          where: { id: post.id },
          data: {
            content,
          },
        })
      }
      count++
      console.log(`Updated ${count} of ${allPosts.length}`)
    }
  } catch (e) {
    console.log("e", e, " / post: ", currentPost)
  }
}

seed()