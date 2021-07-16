import { Select } from "@app/decorators/select.decorator"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { PrismaService } from "@modules/Prisma/prisma.service"
import { PhysicalProductService } from "@modules/Product/services/physicalProduct.service"
import { Args, Mutation, Resolver } from "@nestjs/graphql"
import { makeWherePrisma2Compatible } from "@prisma/binding-argument-transform"

@Resolver()
export class PhysicalProductMutationsResolver {
  constructor(
    private readonly physicalProductService: PhysicalProductService,
    private readonly prisma: PrismaService,
    private readonly queryUtils: QueryUtilsService
  ) {}

  @Mutation()
  async updatePhysicalProduct(@Args() { where, data }, @Select() select) {
    if (data.price) {
      data.price = {
        upsert: { update: data.price, create: data.price },
      }
    }

    return await this.physicalProductService.updatePhysicalProduct({
      where,
      data,
      select,
    })
  }

  @Mutation()
  async updateManyPhysicalProducts(@Args() args) {
    const prisma2Where = makeWherePrisma2Compatible(args.where)
    return this.prisma.client2.physicalProduct.updateMany({
      ...args,
      where: prisma2Where,
    })
  }

  @Mutation()
  async createPhysicalProductQualityReport(@Args() { data }, @Select() select) {
    const prisma2Data = this.queryUtils.prismaOneToPrismaTwoMutateData(
      data,
      null,
      "PhysicalProductQualityReport",
      "create"
    )
    return await this.prisma.client2.physicalProductQualityReport.create({
      data: prisma2Data,
      select,
    })
  }

  @Mutation()
  async updatePhysicalProductByBarcode(@Args() args, @Select() select) {
    const { barcode, status } = args
    const sequenceNumber = parseInt(barcode.replace("SZNS", ""), 10)

    const physicalProduct = await this.prisma.client2.physicalProduct.findFirst(
      {
        where: {
          sequenceNumber,
        },
        select: { id: true, seasonsUID: true, productStatus: true },
      }
    )

    let updatedPhysicalProduct

    if (physicalProduct) {
      const _updatedPhysicalProduct = await this.prisma.client2.physicalProduct.update(
        {
          where: {
            seasonsUID: physicalProduct.seasonsUID,
          },
          data: {
            productStatus: status,
          },
          select,
        }
      )
      updatedPhysicalProduct = this.prisma.sanitizePayload(
        _updatedPhysicalProduct,
        "PhysicalProduct"
      )
    }

    return updatedPhysicalProduct
  }
}
