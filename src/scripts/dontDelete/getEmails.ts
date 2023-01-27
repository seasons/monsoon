import axios from "axios"
import * as cheerio from "cheerio"
import * as addrs from "email-addresses"
const isEmail = require("isemail")
const emailRegex = require("email-regex")

// Set the base URL of the website to crawl
const baseUrl: string = "https://mizzucho.com"

// Create an empty set to store the email addresses found
const emails: Set<string> = new Set<string>()
const visitedUrls: Set<string> = new Set<string>([baseUrl])

// Create a function to crawl the website
async function crawl(url: string): Promise<void> {
  console.log("crawling ", url)
  try {
    // Make a request to the website
    const response = await axios.get(url)
    // Load the HTML content using cheerio
    const $ = cheerio.load(response.data)

    // Search for all the email addresses on the page
    const pageEmails = response.data
      .match(/\S+@\S+\.\S+/gi)
      .map(a => {
        const possibleEmail = a.match(emailRegex())?.[0]
        const valid = isEmail.validate(possibleEmail)
        if (valid) {
          return possibleEmail
        } else {
          const emailSansHTMLBrackets =
            possibleEmail.match(/(?<=>)[^<]+/gi)?.[0] || ""
          const valid = isEmail.validate(emailSansHTMLBrackets)
          if (valid) {
            return emailSansHTMLBrackets
          }
        }
      })
      .filter(Boolean)
    if (pageEmails) {
      console.log("page emails on ", url, pageEmails)
      pageEmails.forEach(email => emails.add(email))
    }

    // Search for all the anchor tags on the page
    $("a").each((i: number, link: any) => {
      // Get the href attribute of the anchor tag
      let linkUrl: string = $(link).attr("href") as string
      if (!linkUrl) {
        return
      }

      // Check if the link is a relative link or an absolute link
      if (!linkUrl.startsWith("http")) {
        // If it's a relative link, convert it to an absolute link
        linkUrl = baseUrl + linkUrl
      }
      // Check if the link is from the same website
      if (linkUrl.startsWith(baseUrl) && visitedUrls.has(linkUrl) === false) {
        visitedUrls.add(linkUrl)
        // If it's from the same website, crawl the link
        crawl(linkUrl)
      }
    })
  } catch (error) {
    console.log("encountered error crawling ", url)
  }
}

// Start crawling the website
crawl(baseUrl)

console.log(emails)

// TODO: Score each email based on the number of times it showed up in the crawl. Then return the one that was seen most.
