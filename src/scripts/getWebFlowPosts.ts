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

  const post = await blog.getItem("5ee266d74191977b66167fb4")
  const content = post["post-content"]

  //   const html2json = e => JSON.stringify(Elem(e), null, "  ")

  //   console.log(html2json(content))
  console.log("content", content)
}

seed()
