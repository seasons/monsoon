// import { Command, Option } from "nestjs-command"
// import { Injectable, Logger } from "@nestjs/common"

// import { ScriptsService } from "../services/scripts.service"
// import { UtilsService } from "@modules/Utils/index"
// import { compact } from "lodash"
// import {
//   AirtableEnvironmentSetting,
//   PrismaEnvironmentSetting,
// } from "../scripts.types"

// @Injectable()
// export class ProductCommands {
//   private readonly logger = new Logger(ProductCommands.name)

//   constructor(
//     private readonly scriptsService: ScriptsService,
//     private readonly utilsService: UtilsService
//   ) {}

//   @Command({
//     command: "get:reservable-items",
//     describe:
//       "returns an array of product variant ids with status reservable and 1+ available physical products",
//   })
//   async create(
//     @Option({
//       name: "pe",
//       describe: "Prisma environment on which to retrieve reservable items",
//       choices: ["local", "staging"],
//       type: "string",
//       default: "local",
//     })
//     pe
//   ) {
//     const { prisma } = await this.scriptsService.getUpdatedServices({
//       prisma: pe,
//     })

//     const reservableProductVariants = await prisma.client.productVariants({
//       where: {
//         reservable_gt: 0,
//         physicalProducts_some: { inventoryStatus: "Reservable" },
//       },
//     })

//     if (reservableProductVariants.length < 3) {
//       this.logger.error(
//         "Less than 3 reservable product variants. Need to reset counts"
//       )
//       return
//     }

//     this.logger.log(
//       `Reservable product variant ids: [${reservableProductVariants
//         .map(a => `"${a.id}"`)
//         .slice(reservableProductVariants.length - 3)}]` // get the last 3, since CircleCI tests make use of the first 3
//     )
//   }

//   @Command({
//     command: "reset:counts",
//     describe: `Resets all product variant counts and physical product statuses so 95% of things are reservable.
//  Only resets airtable records if a corresponding record exists in prisma.`,
//   })
//   async reset(
//     @Option({
//       name: "prisma",
//       alias: "pe",
//       default: "local",
//       describe: "Prisma environment on which to reset counts",
//       choices: ["local", "staging"],
//       type: "string",
//     })
//     pe,
//     @Option({
//       name: "abid",
//       describe: "Airtable base id. Required if resetting local prisma",
//       type: "string",
//     })
//     abid
//   ) {
//     if (pe === "local" && !abid) {
//       throw new Error(
//         "Must pass desired airtable database id if resetting counts on local prisma"
//       )
//     }

//     const {
//       prisma,
//       airtable,
//     } = await this.scriptsService.getUpdatedServices({
//       prisma: pe as PrismaEnvironmentSetting,
//       airtable: abid as AirtableEnvironmentSetting,
//     })

//     const allPrismaProductVariants = await prisma.binding.query.productVariants(
//       {},
//       `
//       {
//         id
//         sku
//         total
//         physicalProducts {
//           id
//         }
//       }
//       `
//     )
//     const allAirtableProductVariants = await airtable.getAllProductVariants()

//     // Set up a progress bar
//     const pBar = this.utilsService
//       .makeCLIProgressBar()
//       .create(allPrismaProductVariants.length * 2, 0, {
//         modelName: "Product Variants",
//       })
//     console.log("") // for aesthetics of the progress bar

//     for (const pv of allPrismaProductVariants) {
//       if (pv.total !== pv.physicalProducts.length) {
//         console.log(
//           `\nANOMALY: Product variant ${pv.sku} has total count of ${pv.total} but has ${pv.physicalProducts.length} physical products. Skipped reset for this product variant.`
//         )
//         pBar.increment()
//         continue
//       }

//       let {
//         prodVarPrismaResetData,
//         prodVarAirtableResetData,
//         physProdPrismaResetData,
//         physProdAirtableResetData,
//       } = this.scriptsService.getResetCountsData(pv)

//       // Prisma ops
//       await prisma.client.updateProductVariant({
//         where: { id: pv.id },
//         data: prodVarPrismaResetData,
//       })
//       await prisma.client.updateManyPhysicalProducts({
//         where: { id_in: pv.physicalProducts.map(a => a.id) },
//         data: physProdPrismaResetData,
//       })
//       pBar.increment()

//       // Airtable ops
//       const correspondingAirtableProductVariant = airtable.getCorrespondingAirtableProductVariant(
//         allAirtableProductVariants,
//         pv
//       )
//       if (!!correspondingAirtableProductVariant) {
//         await airtable.updateProductVariantCounts(
//           correspondingAirtableProductVariant.id,
//           prodVarAirtableResetData
//         )
//         const airtablePhysicalProducts = compact(
//           correspondingAirtableProductVariant.model.physicalProducts
//         ) as string[]
//         await airtable.updatePhysicalProducts(
//           airtablePhysicalProducts,
//           airtablePhysicalProducts.map(a => physProdAirtableResetData)
//         )
//       }
//       pBar.increment()
//     }
//   }
// }
