import {
  InventoryStatus,
  PhysicalProductStatus,
  ProductCreateInput,
} from "@app/prisma"
import { Product } from "@app/prisma/prisma.binding"
import { PrismaService } from "@prisma/prisma.service"

import { UtilsService } from "./utils.service"

interface CreateTestPhysicalProductInput {
  inventoryStatus: InventoryStatus
}

interface CreateTestProductVariantInput {
  physicalProducts: CreateTestPhysicalProductInput[]
}
interface CreateTestProductInput {
  variants: CreateTestProductVariantInput[]
  info: string
}

interface CreateTestProductOutput {
  cleanupFunc: () => void
  product: Product
}

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  /* 
    Creates a test product according to the constraints passed in. 
    
    Note that much of the data here is fudged. As use cases arise that
    require things to be more fleshed out, we'll need to update this 
    method accordingly
  */
  async createTestProduct({
    variants,
    info = `{id}`,
  }: CreateTestProductInput): Promise<CreateTestProductOutput> {
    const color = await this.prisma.client.createColor({
      slug: this.utils.randomString(),
      name: this.utils.randomString(),
      colorCode: this.utils.randomString(),
      hexCode: this.utils.randomString(),
    })
    const brand = await this.prisma.client.createBrand({
      slug: this.utils.randomString(),
      brandCode: this.utils.randomString(),
      name: "",
      tier: "Tier0",
    })
    const category = await this.prisma.client.createCategory({
      slug: this.utils.randomString(),
      name: this.utils.randomString(),
    })

    const data = {
      slug: this.utils.randomString(),
      brand: { connect: { id: brand.id } },
      category: { connect: { id: category.id } },
      color: { connect: { id: color.id } },
      images: {},
      variants: {
        create: variants.map((v: CreateTestProductVariantInput) => ({
          color: {
            connect: {
              id: color.id,
            },
          },
          productID: this.utils.randomString(),
          total: v.physicalProducts.length,
          reservable: this.getInventoryStatusCount(v, "Reservable"),
          reserved: this.getInventoryStatusCount(v, "Reserved"),
          nonReservable: this.getInventoryStatusCount(v, "NonReservable"),
          offloaded: this.getInventoryStatusCount(v, "Offloaded"),
          stored: this.getInventoryStatusCount(v, "Stored"),
          physicalProducts: {
            create: v.physicalProducts.map(
              (pp: CreateTestPhysicalProductInput) => ({
                seasonsUID: this.utils.randomString(),
                inventoryStatus: pp.inventoryStatus,
                productStatus: "New" as PhysicalProductStatus,
                sequenceNumber: 0,
              })
            ),
          },
        })),
      },
      name: "",
    } as ProductCreateInput

    const product = await this.prisma.binding.mutation.createProduct(
      { data },
      info
    )

    const cleanupFunc = async () => {
      await this.prisma.client.deleteProduct({ id: product.id })
      await this.prisma.client.deleteColor({ id: color.id })
      await this.prisma.client.deleteBrand({ id: brand.id })
      await this.prisma.client.deleteCategory({ id: category.id })
    }

    return {
      cleanupFunc,
      product,
    }
  }

  // returns the number of physical products with the given inventory status
  // to create on this product variant
  private getInventoryStatusCount(
    input: CreateTestProductVariantInput,
    inventoryStatus: InventoryStatus
  ) {
    return input.physicalProducts.filter(
      pp => pp.inventoryStatus === inventoryStatus
    ).length
  }
}
