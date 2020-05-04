import * as fs from "fs"

import { Injectable } from "@nestjs/common"
import { head, isEmpty, identity } from "lodash"
import slugify from "slugify"

import { BottomSizeType, LetterSize, ProductCreateInput } from "@prisma/index"
import { PrismaService } from "../../../prisma/prisma.service"
import { AirtableData } from "../../Airtable/airtable.types"
import { AirtableService } from "../../Airtable/services/airtable.service"
import { UtilsService } from "../../Utils/services/utils.service"
import { SyncUtilsService } from "./sync.utils.service"
import { SyncCategoriesService } from "./syncCategories.service"
import { SyncSizesService } from "./syncSizes.service"

@Injectable()
export class SyncProductsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncCategoriesService: SyncCategoriesService,
    private readonly syncSizesService: SyncSizesService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  getProductRecordIdentifer = rec => rec.fields.Slug

  async syncAirtableToAirtable(cliProgressBar?: any) {
    const allProductsProduction = await this.airtableService.getAllProducts(
      this.airtableService.getProductionBase()
    )
    await this.syncUtils.deleteAllStagingRecords("Products", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Products",
      allProductionRecords: allProductsProduction,
      sanitizeFunc: fields =>
        this.utils.deleteFieldsFromObject(
          {
            ...fields,
            Brand: [],
            Model: [],
            "Product Variants": [],
            "Physical Products": [],
            Category: [],
            Images: this.syncUtils.sanitizeAttachments(fields.Images),
            "Homepage product rail": [],
            Collections: [],
            "Model Size": [],
          },
          ["Created Date", "Parent", "Model Height", "Type Category"]
        ),
      cliProgressBar,
    })

    const allProductsStaging = await this.airtableService.getAllProducts(
      this.airtableService.getStagingBase()
    )
    await this.addBrandLinks(
      allProductsProduction,
      allProductsStaging,
      cliProgressBar
    )
    await this.addModelLinks(
      allProductsProduction,
      allProductsStaging,
      cliProgressBar
    )
    await this.addCategoryLinks(
      allProductsProduction,
      allProductsStaging,
      cliProgressBar
    )
    await this.addCollectionLinks(
      allProductsProduction,
      allProductsStaging,
      cliProgressBar
    )
    await this.addModelSizeLinks(
      allProductsProduction,
      allProductsStaging,
      cliProgressBar
    )
  }

  async syncAirtableToPrisma(cliProgressBar?) {
    const allBrands = await this.airtableService.getAllBrands()
    const allProducts = await this.airtableService.getAllProducts()
    const allCategories = await this.airtableService.getAllCategories()
    const allSizes = await this.airtableService.getAllSizes()

    const [
      multibar,
      _cliProgressBar,
    ] = await this.syncUtils.makeSingleSyncFuncMultiBarAndProgressBarIfNeeded({
      cliProgressBar,
      numRecords: allProducts.length,
      modelName: "Products",
    })

    const logFile = this.utils.openLogFile("syncProducts")
    for (const record of allProducts) {
      try {
        _cliProgressBar.increment()

        const { model } = record
        const { name } = model

        const brand = allBrands.findByIds(model.brand)
        const category = allCategories.findByIds(model.category)
        const modelSize = allSizes.findByIds(model.modelSize)

        if (
          isEmpty(model) ||
          isEmpty(name) ||
          isEmpty(brand) ||
          isEmpty(category)
        ) {
          continue
        }

        const {
          color,
          description,
          images,
          modelHeight,
          externalURL,
          tags,
          retailPrice,
          innerMaterials,
          outerMaterials,
          status,
          type,
        } = model

        if (isEmpty(images)) {
          continue
        }

        // Get the slug
        const { brandCode } = brand.model
        const slug = slugify(brandCode + " " + name + " " + color).toLowerCase()

        // Sync model size records
        let modelSizeRecord
        if (!!modelSize) {
          const {
            display: modelSizeDisplay,
            type: modelSizeType,
            name: modelSizeName,
          } = modelSize.model
          modelSizeRecord = await this.syncSizesService.deepUpsertSize({
            slug,
            type,
            display: modelSizeDisplay,
            topSizeData: type === "Top" && {
              letter: modelSizeName as LetterSize,
            },
            bottomSizeData: type === "Bottom" && {
              type: modelSizeType as BottomSizeType,
              value: modelSizeName,
            },
          })
        }

        // Upsert the tags
        for (const name of model.tags) {
          await this.prisma.client.upsertTag({
            where: { name },
            create: { name },
            update: { name },
          })
        }

        // Upsert the product
        const data = {
          brand: {
            connect: {
              slug: brand.model.slug,
            },
          },
          category: {
            connect: {
              slug: category.model.slug,
            },
          },
          color: {
            connect: {
              slug: slugify(color).toLowerCase(),
            },
          },
          innerMaterials: {
            set: (innerMaterials || []).map(a => a.replace(/\ /g, "")),
          },
          outerMaterials: {
            set: (outerMaterials || []).map(a => a.replace(/\ /g, "")),
          },
          tags: {
            connect: model.tags.map(name =>
              identity({
                name,
              })
            ),
          },
          name,
          slug,
          type,
          description,
          images,
          retailPrice,
          externalURL: externalURL || "",
          ...(() => {
            return !!modelSizeRecord
              ? { modelSize: { connect: { id: modelSizeRecord.id } } }
              : {}
          })(),
          modelHeight: head(modelHeight) ?? 0,
          status: (status || "Available").replace(" ", ""),
          season: model.season,
        } as ProductCreateInput

        await this.prisma.client.upsertProduct({
          where: {
            slug,
          },
          create: data,
          update: data,
        })

        // Update airtable
        await record.patchUpdate({
          Slug: slug,
        })
      } catch (e) {
        this.syncUtils.logSyncError(logFile, record, e)
      }
    }
    multibar?.stop()
    fs.closeSync(logFile)
  }

  private async addBrandLinks(
    allProductionProducts: AirtableData,
    allStagingProducts: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Products",
      targetFieldNameOnRootRecord: "Brand",
      allRootProductionRecords: allProductionProducts,
      allRootStagingRecords: allStagingProducts,
      allTargetProductionRecords: await this.airtableService.getAllBrands(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllBrands(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductRecordIdentifer,
      getTargetRecordIdentifer: rec => rec.fields.Name,
      cliProgressBar,
    })
  }

  private async addCategoryLinks(
    allProductionProducts: AirtableData,
    allStagingProducts: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Products",
      targetFieldNameOnRootRecord: "Category",
      allRootProductionRecords: allProductionProducts,
      allRootStagingRecords: allStagingProducts,
      allTargetProductionRecords: await this.airtableService.getAllCategories(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllCategories(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductRecordIdentifer,
      getTargetRecordIdentifer: this.syncCategoriesService
        .getCategoryRecordIdentifier,
      cliProgressBar,
    })
  }

  private async addCollectionLinks(
    allProductionProducts: AirtableData,
    allStagingProducts: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Products",
      targetFieldNameOnRootRecord: "Collections",
      allRootProductionRecords: allProductionProducts,
      allRootStagingRecords: allStagingProducts,
      allTargetProductionRecords: await this.airtableService.getAllCollections(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllCollections(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductRecordIdentifer,
      getTargetRecordIdentifer: rec => rec.fields.Slug,
      cliProgressBar,
    })
  }

  private async addModelLinks(
    allProductionProducts: AirtableData,
    allStagingProducts: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Products",
      targetFieldNameOnRootRecord: "Model",
      allRootProductionRecords: allProductionProducts,
      allRootStagingRecords: allStagingProducts,
      allTargetProductionRecords: await this.airtableService.getAllModels(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllModels(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductRecordIdentifer,
      getTargetRecordIdentifer: rec => rec.fields.Name,
      cliProgressBar,
    })
  }

  private async addModelSizeLinks(
    allProductionProducts: AirtableData,
    allStagingProducts: AirtableData,
    cliProgressBar?: any
  ) {
    await this.syncUtils.linkStagingRecords({
      rootRecordName: "Products",
      targetFieldNameOnRootRecord: "Model Size",
      allRootProductionRecords: allProductionProducts,
      allRootStagingRecords: allStagingProducts,
      allTargetProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      allTargetStagingRecords: await this.airtableService.getAllSizes(
        this.airtableService.getStagingBase()
      ),
      getRootRecordIdentifer: this.getProductRecordIdentifer,
      getTargetRecordIdentifer: this.syncSizesService.getSizeRecordIdentifer,
      cliProgressBar,
    })
  }
}
