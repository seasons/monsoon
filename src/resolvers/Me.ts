import { Context } from "../utils"
import { head } from "lodash"
import { getUserRequestObject, getCustomerFromContext } from "../auth/utils"
import * as cheerio from "cheerio";
import request from "request";

export const Me = {
  user: async (parent, args, ctx: Context) => {
    const { id } = await getUserRequestObject(ctx)
    console.log("GOT ME");
    const url = 'https://www.ssense.com/en-us/men/product/reebok-by-pyer-moss/white-and-red-collection-3-nylon-windbreaker-jacket/4460711';
    const origin = (new URL(url)).origin;
    console.log("ORIGIN");
    console.log(origin);
    request(url, async (error, response, body) => {
      // Handle a generic error
      console.log("IN HERE");
      if (error) {
        console.log("ERROR");
        console.log(error);
        return;
      }
      const $ = cheerio.load(body);
      const ldJSONHTML = $("[type='application/ld+json']").html();
      console.log("HTML");
      console.log(ldJSONHTML);
      const ldJSON = JSON.parse(ldJSONHTML);
      console.log("JSON");
      console.log(ldJSON);
      console.log(ldJSON.name);
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
}
