import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { intersection } from "lodash"

import { ProductModuleDef } from "../product.module"

const ONE_MIN = 60000

describe("getCategoryAndAllChildren", () => {
  let prismaService: PrismaService
  let productUtilsService: ProductUtilsService
  let result
  let originalSlugs

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule(ProductModuleDef).compile()
    prismaService = moduleRef.get<PrismaService>(PrismaService)
    productUtilsService = moduleRef.get<ProductUtilsService>(
      ProductUtilsService
    )
  })

  describe("Functions as Expected", () => {
    afterAll(async () => {
      await prismaService.client.category.deleteMany({
        where: { slug: { in: originalSlugs } },
      })
    })

    beforeAll(async () => {
      const original = await prismaService.client.category.create({
        data: { name: "Original", slug: "original", visible: true },
      })
      const [child1, child2, child3] = await prismaService.client.$transaction([
        prismaService.client.category.create({
          data: {
            name: "Child1",
            slug: "child1",
            parents: { connect: { id: original.id } },
            visible: true,
          },
        }),
        prismaService.client.category.create({
          data: {
            name: "Child2",
            slug: "child2",
            parents: { connect: { id: original.id } },
            visible: true,
          },
        }),
        prismaService.client.category.create({
          data: {
            name: "Child3",
            slug: "child3",
            parents: { connect: { id: original.id } },
            visible: true,
          },
        }),
      ])
      const [
        grandchild21,
        grandchild31,
        grandchild32,
        grandchild33,
      ] = await prismaService.client.$transaction([
        prismaService.client.category.create({
          data: {
            name: "GrandChild2-1",
            slug: "grandchild2-1",
            parents: { connect: { id: child2.id } },
            visible: true,
          },
        }),
        prismaService.client.category.create({
          data: {
            name: "GrandChild3-1",
            slug: "grandchild3-1",
            parents: { connect: { id: child3.id } },
            visible: true,
          },
        }),
        prismaService.client.category.create({
          data: {
            name: "GrandChild3-2",
            slug: "grandchild3-2",
            parents: { connect: { id: child3.id } },
            visible: true,
          },
        }),
        prismaService.client.category.create({
          data: {
            name: "GrandChild3-3",
            slug: "grandchild3-3",
            parents: { connect: { id: child3.id } },
            visible: true,
          },
        }),
      ])
      const greatGrandChild321 = await prismaService.client.category.create({
        data: {
          name: "GrandChild3-2-1",
          slug: "grandchild3-2-1",
          parents: { connect: { id: grandchild32.id } },
          visible: true,
        },
      })

      originalSlugs = [
        original,
        child1,
        child2,
        child3,
        grandchild21,
        grandchild31,
        grandchild32,
        grandchild33,
        greatGrandChild321,
      ].map(a => a.slug)

      // run the function and store the result. Ask for at least one non id, slug field
      result = await productUtilsService.getCategoryAndAllChildren(
        {
          slug: "original",
        },
        { name: true }
      )
    }, ONE_MIN)

    it("correctly retrieves all children", done => {
      expect(result.length).toEqual(9)
      expect(originalSlugs.length).toEqual(9)

      const slugs = result.map(a => a.slug)
      expect(intersection(slugs, originalSlugs).length).toEqual(9)

      done()
    })

    it("has the original category first in the array of results", () => {
      expect(result[0].slug).toEqual("original")
    })

    it("retrieves requested data on each category", () => {
      expect(result.every(a => !!a.name)).toBeTruthy()
    })
  })
})
