import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const color = await ps.client.color({ slug: "gray" })

  await ps.client.updateProduct({
    where: { slug: "aura-suri-alpaca-shaggy-check-blouson-yellow" },
    data: {
      slug: "aura-suri-alpaca-shaggy-check-blouson-gray",
    },
  })

  await ps.client.updateProductVariant({
    where: { sku: "AURA-YLW-LL-008" },
    data: {
      sku: "AURA-GRY-LL-008",
      color: { connect: { id: color.id } },
    },
  })

  await ps.client.updateProductVariant({
    where: { sku: "AURA-YLW-MM-008" },
    data: {
      sku: "AURA-GRY-MM-008",
      color: { connect: { id: color.id } },
    },
  })

  await ps.client.updateProductVariant({
    where: { sku: "AURA-YLW-SS-008" },
    data: {
      sku: "AURA-GRY-SS-008",
      color: { connect: { id: color.id } },
    },
  })

  await ps.client.updatePhysicalProduct({
    where: { seasonsUID: "AURA-YLW-SS-008-01" },
    data: {
      seasonsUID: "AURA-GRY-SS-008-01",
    },
  })

  await ps.client.updatePhysicalProduct({
    where: { seasonsUID: "AURA-YLW-MM-008-01" },
    data: {
      seasonsUID: "AURA-GRY-MM-008-01",
    },
  })

  await ps.client.updatePhysicalProduct({
    where: { seasonsUID: "AURA-YLW-LL-008-01" },
    data: {
      seasonsUID: "AURA-GRY-LL-008-01",
    },
  })
}

run()

// Update the slug product
// Update SKU variants and the physical products
// Link to color on variant
