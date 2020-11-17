import "module-alias/register"

import readlineSync from "readline-sync"
import request from "request"

import { PrismaService } from "../prisma/prisma.service"

const ps = new PrismaService()

let requestHeaders = {
  "Content-Type": "application/json",
  apikey: process.env.REBRANDLY_API_KEY,
  workspace: process.env.REBRANDLY_WORKSPACE_ID,
}

const run = async () => {
  await request(
    {
      uri: "https://api.rebrandly.com/v1/links",
      method: "GET",
      headers: requestHeaders,
    },
    async (err, response, body) => {
      let links = JSON.parse(body)
      for (const link of links) {
        const { id, shortUrl } = link
        const shouldProceed = readlineSync.keyInYN(
          `You are about to delete ${shortUrl}. Proceed?`
        )
        if (!shouldProceed) {
          continue
        } else {
          await deleteLink(id)
        }
      }
    }
  )
}

const deleteLink = async id => {
  await request(
    {
      uri: `https://api.rebrandly.com/v1/links/${id}`,
      method: "DELETE",
      headers: requestHeaders,
    },
    async (err, response, body) => {
      console.log(body)
    }
  )
}

run()
