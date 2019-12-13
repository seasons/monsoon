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
          return;
        }
        const $ = cheerio.load(body, { xmlMode: false });
        const ldJSONHTML = $("script[type='application/ld+json']").html();
        const ldJSON = JSON.parse(ldJSONHTML);
        if (!ldJSON) {
          reject("Failed to extract json+ld from URL.");
        }
        console.log(ldJSON);
        const { description, name, sku } = ldJSON;
        const brand = ldJSON.brand ? ldJSON.brand.name : null;
        const imageURL = ldJSON.image ? ldJSON.image[0] : null;
        const price = ldJSON.offers ? ldJSON.offers.price : null;
        const priceCurrency = ldJSON.offers ? ldJSON.offers.priceCurrency : null;
        const productID = ldJSON.productID ? ldJSON.productID.toString() : null;
        if (description && name && productID && sku && brand && imageURL && price && priceCurrency) {
          try {
            const productRequest = await ctx.prisma.createProductRequest({
              brand,
              description,
              imageURL,
              name,
              price,
              priceCurrency,
              productID,
              sku,
              url,
            });
            resolve(productRequest);
          } catch (e) {
            reject(e);
          }
        } else {
          reject("Incorrectly formatted json+ld.");
        }
      });
    });
  },
}
