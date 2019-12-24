import * as cheerio from "cheerio";
import request from "request";
import { getUserFromContext } from "../auth/utils"
import { Context } from "../utils"

export const ProductRequestMutations = {
  async addProductRequest(parent, { reason, url }, ctx: Context, info) {
    return new Promise(function (resolve, reject) {
      // Set jar: true to avoid possible redirect loop
      request({ jar: true, url }, async (error, response, body) => {
        // Handle a generic error
        if (error) {
          reject(error);
        }
        const $ = cheerio.load(body, { xmlMode: false });

        // First try looking for ld+json
        let productRequest = await scrapeLDJSON($, reason, url, ctx);
        if (productRequest) {
          resolve(productRequest);
        }

        // Then try looking for og (open graph) meta tags
        productRequest = await scrapeOGTags($, reason, url, ctx);
        if (productRequest) {
          resolve(productRequest);
        }

        // Otherwise, means we failed to scrape URL
        reject("Failed to scrape product information from URL");
      });
    });
  },

  async deleteProductRequest(parent, { requestID }, ctx: Context, info) {
    return new Promise(async function (resolve, reject) {
      try {
        const productRequest = await ctx.prisma.deleteProductRequest({ id: requestID });
        resolve(productRequest);
      } catch (e) {
        reject(e);
      }
    });
  }
}

const scrapeLDJSON = async ($, reason: string, url: string, ctx: Context) => {
  // Search for json+ld in HTML body
  const ldJSONHTML = $("script[type='application/ld+json']").html();
  const ldJSON = JSON.parse(ldJSONHTML);
  if (!ldJSON) {
    // Failed to extract json+ld from URL
    return null;
  }

  // Extract fields from json+ld
  const { description, name, sku } = ldJSON;
  const brand = ldJSON.brand ? ldJSON.brand.name : null;
  const images = ldJSON.image ? ldJSON.image : null;
  const price = ldJSON.offers ? ldJSON.offers.price : null;
  const priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null;
  const productID = ldJSON.productID ? ldJSON.productID.toString() : null;
  if (description && name && productID && sku && brand && images && price && priceCurrency) {
    return await createProductRequest(
      ctx,
      brand,
      description,
      images,
      name,
      price,
      priceCurrency,
      productID,
      reason,
      sku,
      url
    );
  } else {
    // Incorrectly formatted json+ld
    return null;
  }
};

const scrapeOGTags = async ($, reason: string, url: string, ctx: Context) => {
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogPriceAmount = parseInt($('meta[property="og:price:amount"]').attr('content'));
  const ogPriceCurrency = $('meta[property="og:price:currency"]').attr('content');
  const ogSKU = $('meta[property="product:retailer_item_id"]').attr('content');
  const ogSiteName = $('meta[property="og:site_name"]').attr('content');
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const productID = $('meta[itemprop="productID"]').attr('content');

  let ogImages: string[] = []
  $('meta[property="og:image"]').each((index, elem) => {
    ogImages.push($(elem).attr('content'));
  });

  if (ogDescription && ogPriceAmount && ogPriceCurrency && ogSKU && ogSiteName && ogTitle && productID && ogImages) {
    return await createProductRequest(
      ctx,
      ogSiteName,
      ogDescription,
      ogImages,
      ogTitle,
      ogPriceAmount,
      ogPriceCurrency,
      productID,
      reason,
      ogSKU,
      url
    );
  } else {
    return null;
  }
}

const createProductRequest = async (
  ctx: Context,
  brand: string,
  description: string,
  images: string[],
  name: string,
  price: number,
  priceCurrency: string,
  productID: string,
  reason: string,
  sku: string,
  url: string,
) => {
  const user = await getUserFromContext(ctx);
  if (!user) {
    return null;
  }

  try {
    const productRequest = await ctx.prisma.createProductRequest({
      brand,
      description,
      images: { set: images },
      name,
      price,
      priceCurrency,
      productID,
      reason,
      sku,
      url,
      user: {
        connect: {
          id: user.id,
        }
      },
    });
    return productRequest;
  } catch (e) {
    return null;
  }
}