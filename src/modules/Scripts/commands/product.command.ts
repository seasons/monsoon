import { PrismaService } from "@app/prisma/prisma.service"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { Command } from "nestjs-command"

import { PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class ProductCommands {
  private readonly logger = new Logger(ProductCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly prisma: PrismaService,
    private readonly moduleRef: ModuleRef
  ) {}

  @Command({
    command: "get:reservable-items",
    describe:
      "returns an array of product variant ids with status reservable and 1+ available physical products",
    aliases: "gri",
  })
  async create(
    @PrismaEnvOption()
    prismaEnv
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })

    const reservableProductVariants = await this.prisma.client.productVariants({
      where: {
        reservable_gt: 0,
        physicalProducts_some: { inventoryStatus: "Reservable" },
      },
    })

    if (reservableProductVariants.length < 3) {
      this.logger.error(
        "Less than 3 reservable product variants. Need to reset counts"
      )
      return
    }

    this.logger.log(
      `Reservable product variant ids: [${reservableProductVariants
        .map(a => `"${a.id}"`)
        .slice(reservableProductVariants.length - 3)}]` // get the last 3, since CircleCI tests make use of the first 3
    )
  }
}
