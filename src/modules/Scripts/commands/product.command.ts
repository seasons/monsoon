import { AirtableService } from "@app/modules/Airtable"
import { PrismaService } from "@app/prisma/prisma.service"
import { UtilsService } from "@modules/Utils/index"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { compact } from "lodash"
import { Command } from "nestjs-command"

import { AirtableIdOption, PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class ProductCommands {
  private readonly logger = new Logger(ProductCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly utilsService: UtilsService,
    private readonly airtableService: AirtableService,
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

  @Command({
    command: "reset:counts",
    describe: `Resets all product variant counts and physical product statuses so 95% of things are reservable.
   Only resets airtable records if a corresponding record exists in prisma.`,
    aliases: "rc",
  })
  async reset(
    @PrismaEnvOption()
    prismaEnv,
    @AirtableIdOption()
    abid
  ) {
    if (prismaEnv === "local" && !abid) {
      throw new Error(
        "Must pass desired airtable database id if resetting counts on local prisma"
      )
    }
    await this.scriptsService.updateConnections({
      prismaEnv,
      airtableEnv: abid,
      moduleRef: this.moduleRef,
    })

    const allPrismaProductVariants = await this.prisma.binding.query.productVariants(
      {},
      `
        {
          id
          sku
          total
          physicalProducts {
            id
          }
        }
        `
    )
    const allAirtableProductVariants = await this.airtableService.getAllProductVariants()

    // Set up a progress bar
    const pBar = this.utilsService
      .makeCLIProgressBar()
      .create(allPrismaProductVariants.length * 2, 0, {
        modelName: "Product Variants",
      })
    console.log("") // for aesthetics of the progress bar

    for (const pv of allPrismaProductVariants) {
      if (pv.total !== pv.physicalProducts.length) {
        console.log(
          `\nANOMALY: Product variant ${pv.sku} has total count of ${pv.total} but has ${pv.physicalProducts.length} physical products. Skipped reset for this product variant.`
        )
        pBar.increment()
        continue
      }

      let {
        prodVarPrismaResetData,
        prodVarAirtableResetData,
        physProdPrismaResetData,
        physProdAirtableResetData,
      } = this.scriptsService.getResetCountsData(pv)

      // Prisma ops
      await this.prisma.client.updateProductVariant({
        where: { id: pv.id },
        data: prodVarPrismaResetData,
      })
      await this.prisma.client.updateManyPhysicalProducts({
        where: { id_in: pv.physicalProducts.map(a => a.id) },
        data: physProdPrismaResetData,
      })
      pBar.increment()

      // Airtable ops
      const correspondingAirtableProductVariant = this.airtableService.getCorrespondingAirtableProductVariant(
        allAirtableProductVariants,
        pv
      )
      if (!!correspondingAirtableProductVariant) {
        await this.airtableService.updateProductVariantCounts(
          correspondingAirtableProductVariant.id,
          prodVarAirtableResetData
        )
        const airtablePhysicalProducts = compact(
          correspondingAirtableProductVariant.model.physicalProducts
        ) as string[]
        await this.airtableService.updatePhysicalProducts(
          airtablePhysicalProducts,
          airtablePhysicalProducts.map(a => physProdAirtableResetData)
        )
      }
      pBar.increment()
    }
  }
}
