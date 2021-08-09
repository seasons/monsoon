import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  try {
    const fitPics = await ps.binding.query.fitPics(
      {},
      `{
      id
      products {
          id
      }
      }`
    )

    let count = 0
    for (const fitPic of fitPics) {
      count++
      console.log("count", count)
      if (
        fitPic.products === null ||
        fitPic.products?.[0] === null ||
        !fitPic.products?.[0]?.id
      ) {
        console.log("Resetting", fitPic.products)

        await ps.client2.fitPic.update({
          where: { id: fitPic.id },
          data: {
            products: { set: [] },
          },
        })
      }
    }
  } catch (e) {
    console.log(" / ", e)
  }
}
run()
