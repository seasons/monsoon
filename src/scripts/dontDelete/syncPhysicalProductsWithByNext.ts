import "module-alias/register"

import axios from "axios"
import { chunk } from "lodash"

import { PrismaService } from "../../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()
  const allPhysicalProducts = await ps.binding.query.physicalProducts(
    {},
    `
    {
        id
        sequenceNumber
        productVariant {
            internalSize {
                display
            }
            product { 
                color {
                    name
                }
                brand { 
                    name
                }
            }
        }
    }
  `
  )

  console.log(`all physical products retrieved`)
  let i = 0

  const total = allPhysicalProducts.length
  const chunks = chunk(allPhysicalProducts, 100)

  for (const set of chunks) {
    const data = {
      items: set.map(({ id, sequenceNumber, productVariant }) => ({
        id,
        barcode: `SZNS` + `${sequenceNumber}`.padStart(5, "0"),
        brand: productVariant.product.brand.name,
        size: productVariant.internalSize.display,
        colors: productVariant.product.color.name,
      })),
    }
    try {
      const res = await axios.post(
        "https://cleanlyapp.com/seasons/load-items/",
        data,
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "seasons-token": "dB8xv9Qb2Q9MDjkSY6aNuzRthBuHsG",
            "postman-token": "a9d7255f-52b3-2553-82ba-ee4ef699e07a",
          },
        }
      )
      console.log(res)
    } catch (err) {
      console.log(err)
    }
  }
}

run()
