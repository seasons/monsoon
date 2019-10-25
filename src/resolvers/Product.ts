import { Context } from "../utils"
import { getUserId } from "../auth/utils"
import { base } from "../airtable/config"
import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const Product = {}

export const ProductMutations = {
  async reserveItems(parent, { items }, ctx: Context, info) {
    const user = await getUserId(ctx)
    console.log(user, items)

    // Check if physical product is available for each product variant
    const variants = await ctx.prisma.productVariants({
      where: { id_in: items },
    })

    for (let variant of variants) {
    }
    // If they are decrement count and

    // Notify user about reservation via email
    // Create reservation record in airtable

    const msg = {
      to: "test@example.com",
      from: "test@example.com",
      subject: "Sending with Twilio SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    }
    sgMail.send(msg)
  },
}
