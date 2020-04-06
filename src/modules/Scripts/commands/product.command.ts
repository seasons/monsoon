import { Injectable, Logger } from "@nestjs/common"
import { Command, Option } from "nestjs-command"
import { ScriptsService } from "../services/scripts.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { PrismaService } from "../../../prisma/prisma.service"

@Injectable()
export class ProductCommands {
  private readonly logger = new Logger(ProductCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly utilsService: UtilsService
  ) {}

  @Command({
    command: "get:reservable-items",
    describe:
      "returns an array of product variant ids with status reservable and 1+ available physical products",
  })
  async create(
    @Option({
      name: "e",
      describe: "Prisma environment on which to retrieve reservable items",
      choices: ["local", "staging"],
      type: "string",
      default: "local",
    })
    e
  ) {
    const [
      _prisma,
      _,
    ] = await this.scriptsService.overrideEnvFromRemoteAndGetUpdatedServices({
      prismaEnvironment: e,
    })
    const prisma = _prisma as PrismaService

    const reservableProductVariants = await prisma.client.productVariants({
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
    describe:
      "resets all product variant counts and physical product statuses so 90% of things are reservable",
  })
  async reset(
    @Option({
      name: "e",
      describe: "Prisma environment on which to reset counts",
    })
    e
  ) {
    // Get environment-specific prisma connection
    const [
      _prisma,
      _,
    ] = await this.scriptsService.overrideEnvFromRemoteAndGetUpdatedServices({
      prismaEnvironment: e,
    })
    const prisma = _prisma as PrismaService

    const allProductVariants = await prisma.binding.query.productVariants(
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

    // Set up a progress bar
    const pBar = this.utilsService
      .makeCLIProgressBar()
      .create(allProductVariants.length, 0, {
        modelName: "Product Variants",
      })
    console.log("") // for aesthetics of the progress bar

    for (const pv of allProductVariants) {
      if (pv.total !== pv.physicalProducts.length) {
        console.log(
          `\nANOMALY: Product variant ${pv.sku} has total count of ${pv.total} but has ${pv.physicalProducts.length} physical products. Skipped reset for this product variant.`
        )
        pBar.increment()
        continue
      }

      let newPVData
      let newPPData
      switch (this.utilsService.weightedCoinFlip(0.95)) {
        // Make 95% of all product variants fully reservable
        case "Heads":
          newPVData = {
            total: pv.total,
            reservable: pv.total,
            reserved: 0,
            nonReservable: 0,
          }
          newPPData = { inventoryStatus: "Reservable" }
          break
        // Make 5% nonReservable
        case "Tails":
          newPVData = {
            total: pv.total,
            reservable: 0,
            reserved: 0,
            nonReservable: pv.total,
          }
          newPPData = { inventoryStatus: "NonReservable" }
          break
        default:
          throw new Error("Invalid coin flip result")
      }

      await prisma.client.updateProductVariant({
        where: { id: pv.id },
        data: newPVData,
      })
      await prisma.client.updateManyPhysicalProducts({
        where: { id_in: pv.physicalProducts.map(a => a.id) },
        data: newPPData,
      })
      pBar.increment()
    }
  }
}
