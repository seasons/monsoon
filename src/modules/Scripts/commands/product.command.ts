import { Injectable, Logger } from "@nestjs/common"
import faker from "faker"
import { head } from "lodash"
import { Command, Option } from "nestjs-command"
import { PrismaService } from "../../../prisma/prisma.service"
import { AuthService } from "../../User/services/auth.service"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class ProductCommands {
  private readonly logger = new Logger(ProductCommands.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly scriptsService: ScriptsService
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
    e,
    password
  ) {
    await this.scriptsService.overrideEnvFromRemoteConfig({
      prismaEnvironment: e,
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
        .slice(0, 3)}]`
    )
  }
}
