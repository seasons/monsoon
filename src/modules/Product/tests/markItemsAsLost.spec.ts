import { ProductUtilsService } from "@app/modules/Utils/services/product.utils.service"
import { QueryUtilsService } from "@app/modules/Utils/services/queryUtils.service"
import { TestUtilsService } from "@app/modules/Utils/services/test.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaService } from "@app/prisma/prisma.service"
import { Test } from "@nestjs/testing"
import { InventoryStatus } from "@prisma/client"

describe("Mark items as lost", () => {
  let prismaService: PrismaService
  let productService: ProductUtilsService
  /**
   *
   *
   */
})
