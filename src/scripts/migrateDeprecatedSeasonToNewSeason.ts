import "module-alias/register"

import { head } from "lodash"

import { SeasonCode } from "../prisma"
import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const products = await ps.binding.query.products(
    { where: { seasonDeprecated_not: null } },
    `{
       id
       seasonDeprecated
    }`
  )

  for (const product of products) {
    const seasonDepYear = product.seasonDeprecated.substring(2, 4)
    const seasonCode = product.seasonDeprecated.substring(0, 2) as SeasonCode
    const year = seasonDepYear === "19" ? 2019 : 2020

    const season = head(
      await ps.binding.query.seasons(
        {
          where: { AND: [{ year }, { seasonCode }] },
        },
        `{
          id
      }`
      )
    ) as any

    const productSeason = await ps.client.createProductSeason({
      internalSeason: {
        connect: { id: season.id },
      },
    })

    await ps.client.updateProduct({
      where: { id: product.id },
      data: {
        season: { connect: { id: productSeason.id } },
      },
    })
  }
}

const createSeasons = async () => {
  const ps = new PrismaService()

  const years = [2019, 2020]
  const seasons: SeasonCode[] = ["FW", "SS", "PS", "PF", "HO", "AW"]

  for (const year of years) {
    for (const season of seasons) {
      await ps.client.upsertSeason({
        where: { id: "" },
        create: {
          year,
          seasonCode: season,
        },
        update: {
          year,
          seasonCode: season,
        },
      })
    }
  }
}

// run()

createSeasons()
