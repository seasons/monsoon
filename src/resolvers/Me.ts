import { Context } from "../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../auth/utils"
import * as cheerio from "cheerio";
import request from "request";

export const Me = {
  user: async (parent, args, ctx: Context) => {
    console.log("GETTING ME!!!");
    const { id } = await getUserRequestObject(ctx)
    console.log("GOT ME");
    // const url = 'https://www.ssense.com/en-us/men/product/reebok-by-pyer-moss/white-and-red-collection-3-nylon-windbreaker-jacket/4460711';
    const url = 'https://www.ssense.com/en-us/men/product/marni/white-and-multicolor-graphic-t-shirt/4539601';
    const origin = (new URL(url)).origin;
    console.log("ORIGIN");
    console.log(origin);
    // Set jar: true to avoid possible redirect loop
    request({ jar: true, url }, async (error, response, body) => {
      // Handle a generic error
      console.log("IN HERE");
      if (error) {
        console.log("ERROR");
        console.log(error);
        return;
      }
      // console.log(body);
      const $ = cheerio.load(body, { xmlMode: false });
      const ldJSONHTML = $("script[type='application/ld+json']").html();
      // console.log("HTML");
      // console.log(ldJSONHTML);
      const ldJSON = JSON.parse(ldJSONHTML);
      console.log(ldJSON);
      console.log(ldJSON.name);
      // console.log(ldJSON);
      // const types = new Set();
      // ldJSON.forEach(ld => {
      //   console.log(ld['@type']);
      //   types.add(ld['@type']);
      // });
      // const productJSON = ldJSON.filter(ld => ld['@type'] === 'Product');
      // console.log("JSON");
      // console.log(productJSON);
      // console.log(productJSON.name);
    });
    return ctx.prisma.user({ id })
  },
  customer: async (parent, args, ctx: Context, info) => {
    const customer = await getCustomerFromContext(ctx)
    return await ctx.db.query.customer(
      {
        where: { id: customer.id },
      },
      info
    )
  },
  activeReservation: async (parent, args, ctx: Context, info) => {
    const customer = await getCustomerFromContext(ctx)
    const reservations = await ctx.prisma
      .customer({ id: customer.id })
      .reservations({
        orderBy: "createdAt_DESC",
      })

    const latestReservation = head(reservations)
    return latestReservation.status === "Completed" ? null : latestReservation
  },

  async bag(parent, args, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const bagItems = await ctx.db.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: false,
        },
      },
      info
    )

    return bagItems
  },

  async savedItems(parent, args, ctx: Context, info) {
    const customer = await getCustomerFromContext(ctx)

    const savedItems = await ctx.db.query.bagItems(
      {
        where: {
          customer: {
            id: customer.id,
          },
          saved: true,
        },
      },
      info
    )

    return savedItems
  },
}
