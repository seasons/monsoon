import { ApolloError } from "apollo-server"
import * as cheerio from "cheerio";
import request from "request";
import { Context } from "../utils"

export const ProductRequestMutations = {
  async addProductRequest(parent, { url }, ctx: Context, info) {
    return new Promise(function (resolve, reject) {
      // Set jar: true to avoid possible redirect loop
      request({ jar: true, url }, async (error, response, body) => {
        // Handle a generic error
        if (error) {
          reject(error);
        }
        const $ = cheerio.load(body, { xmlMode: false });

        // Search for json+ld in HTML body
        const ldJSONHTML = $("script[type='application/ld+json']").html();
        const ldJSON = JSON.parse(ldJSONHTML);
        if (!ldJSON) {
          reject("Failed to extract json+ld from URL.");
        }

        // Extract fields from json+ld
        const { description, name, sku } = ldJSON;
        const brand = ldJSON.brand ? ldJSON.brand.name : null;
        const images = ldJSON.image ? ldJSON.image : null;
        const price = ldJSON.offers ? ldJSON.offers.price : null;
        const priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null;
        const productID = ldJSON.productID ? ldJSON.productID.toString() : null;
        if (
          description &&
          name &&
          productID &&
          sku &&
          brand &&
          images &&
          price &&
          priceCurrency
        ) {
          try {
            const productRequest = await ctx.prisma.createProductRequest({
              brand,
              description,
              images: { set: images },
              name,
              price,
              priceCurrency,
              productID,
              sku,
              url,
            });
            resolve(productRequest);
          } catch (e) {
            // Check to see if a product request for this item has already been made
            const productRequest = ctx.prisma.productRequest({ sku });
            if (productRequest) {
              resolve(productRequest)
            } else {
              reject(e);
            }
          }
        } else {
          reject("Incorrectly formatted json+ld.");
        }
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
