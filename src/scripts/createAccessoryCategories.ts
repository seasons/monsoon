import "module-alias/register"

import { PrismaService } from "../prisma/prisma.service"

const run = async () => {
  const ps = new PrismaService()

  const newAccessories = [
    {
      name: "Bags",
      slug: "bags",
      visible: false,
      productType: "Accessory",
    },
    {
      name: "Jewelry",
      slug: "jewelry",
      visible: false,
      productType: "Accessory",
      measurementType: "Millimeters",
    },
    {
      name: "Bracelets",
      slug: "bracelets",
      visible: false,
      productType: "Accessory",
      measurementType: "Millimeters",
    },
    {
      name: "Necklaces",
      slug: "necklaces",
      visible: false,
      productType: "Accessory",
      measurementType: "Millimeters",
    },
    {
      name: "Sunglasses",
      slug: "sunglasses",
      visible: false,
      productType: "Accessory",
      measurementType: "Millimeters",
    },
    {
      name: "Crossbody bags",
      slug: "crossbody-bags",
      visible: false,
      productType: "Accessory",
    },
    {
      name: "Totes",
      slug: "totes",
      visible: false,
      productType: "Accessory",
    },
  ]

  // Jewelry -> necklaces, bracelets
  // Eyewear -> sunglasses
  // Bags -> crossbody, tote (for now, as we continue making purchases for ss22 ill keep u updated, but we’ve pretty much only invested in these two bag categories)

  let count = 0
  for (const a of newAccessories) {
    count++
    console.log("count", count)
    await ps.client2.category.create({
      data: a,
    })
  }

  // Add bag children
  const totes = await ps.client2.category.findUnique({
    where: {
      slug: "totes",
    },
  })
  const cb = await ps.client2.category.findUnique({
    where: {
      slug: "crossbody-bags",
    },
  })
  await ps.client2.category.update({
    where: {
      slug: "bags",
    },
    data: {
      children: {
        set: [{ id: cb.id }, { id: totes.id }],
      },
    },
  })

  // Add Jewerly children
  const necklaces = await ps.client2.category.findUnique({
    where: {
      slug: "necklaces",
    },
  })
  const bracelets = await ps.client2.category.findUnique({
    where: {
      slug: "bracelets",
    },
  })
  await ps.client2.category.update({
    where: {
      slug: "jewelry",
    },
    data: {
      children: {
        set: [{ id: bracelets.id }, { id: necklaces.id }],
      },
    },
  })

  // Add eyewear children
  const sunglasses = await ps.client2.category.findUnique({
    where: {
      slug: "sunglasses",
    },
  })
  await ps.client2.category.update({
    where: {
      slug: "eyewear",
    },
    data: {
      children: {
        set: [{ id: sunglasses.id }],
      },
    },
  })

  // Update Accessories
  const jewelry = await ps.client2.category.findUnique({
    where: {
      slug: "jewelry",
    },
  })
  const bags = await ps.client2.category.findUnique({
    where: {
      slug: "bags",
    },
  })
  await ps.client2.category.update({
    where: {
      slug: "accessories",
    },
    data: {
      children: {
        connect: [{ id: jewelry.id }, { id: bags.id }],
      },
    },
  })
}
run()
