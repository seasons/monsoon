import * as fs from "fs"

import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { ImageData } from "@modules/Image/image.types"
import { ImageService } from "@modules/Image/services/image.service"
import { UtilsService } from "@modules/Utils/services/utils.service"
import { Injectable } from "@nestjs/common"
import { ProductCreateInput } from "@prisma/index"
import { head, identity, isEmpty } from "lodash"
import slugify from "slugify"

import { PrismaService } from "../../../prisma/prisma.service"
import { ProductUtilsService } from "../../Product/services/product.utils.service"
import { SyncUtilsService } from "./sync.utils.service"

@Injectable()
export class SyncProductsService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly productUtils: ProductUtilsService,
    private readonly imageService: ImageService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async syncAirtableToPrisma(cliProgressBar?) {
    const allBrands = await this.airtableService.getAllBrands()
    const allProducts = await this.airtableService.getAllProducts()
    const allCategories = await this.airtableService.getAllCategories()
    const allSizes = await this.airtableService.getAllSizes()
    const allMaterials = await this.airtableService.getAllMaterialCategories()

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
        const material = allMaterials.findByIds(model.materialCategory)

        if (
          isEmpty(model) ||
          isEmpty(name) ||
          isEmpty(brand) ||
          isEmpty(category)
        ) {
          continue
        }

        if (
          record.model.photographyStatus !== "Done" &&
          record.model.status === "Available"
        ) {
          continue
        }

        const {
          color,
          barcode,
          description,
          images,
          modelHeight,
          externalURL,
          photographyStatus,
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
        const slug = this.productUtils.getProductSlug(brandCode, name, color)

        const prismaPhotographyStatus = this.getPrismaPhotographyStatus(
          photographyStatus
        )

        const imageIDs = await this.syncImages(
          images,
          slug,
          brandCode,
          color,
          name
        )

        // Sync model size records
        let modelSizeRecord
        if (!!modelSize) {
          const {
            display: modelSizeDisplay,
            type: modelSizeType,
            name: modelSizeName,
          } = modelSize.model
          modelSizeRecord = await this.productUtils.upsertModelSize({
            slug,
            type,
            modelSizeName,
            modelSizeDisplay,
            bottomSizeType: modelSizeType,
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

        // Upsert the category
        const materialCategory = allCategories.findByIds(
          material.model.category
        )
        await this.productUtils.upsertMaterialCategory(
          material,
          materialCategory
        )

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
          photographyStatus: prismaPhotographyStatus,
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
          images: { connect: imageIDs },
          retailPrice,
          externalURL: externalURL || "",
          ...(() => {
            return !!modelSizeRecord
              ? { modelSize: { connect: { id: modelSizeRecord.id } } }
              : {}
          })(),
          modelHeight: head(modelHeight) ?? 0,
          materialCategory: {
            connect: {
              slug: material.model.name,
            },
          },
          status: (status || "Available").replace(" ", ""),
          season: model.season,
        } as ProductCreateInput

        await this.prisma.client.upsertProduct({
          where: {
            slug,
          },
          create: data,
          update: { ...data, images: { set: imageIDs } },
        })
        // Update airtable
        await record.patchUpdate({
          Slug: slug,
        })
      } catch (e) {
        console.log(`Check logs`)
        this.syncUtils.logSyncError(logFile, record, e)
      }
    }
    multibar?.stop()
    fs.closeSync(logFile)
  }

  private async syncImages(
    images: any,
    slug: string,
    brandCode: string,
    colorName: string,
    name: string
  ) {
    // Upload images to S3 and then upsert them as image objects
    const imageDatas: ImageData[] = await Promise.all(
      images.map((image, index) => {
        const s3ImageName = this.productUtils.getProductImageName(
          brandCode,
          name,
          colorName,
          index + 1
        )
        return this.imageService.uploadImageFromURL(
          image.url,
          s3ImageName,
          name
        )
      })
    )
    const imageIDs = this.productUtils.getImageIDs(imageDatas, slug)
    return imageIDs
  }

  private getPrismaPhotographyStatus(airtablePhotographyStatus: string) {
    switch (airtablePhotographyStatus) {
      case "Done":
        return "Done"
      case "In progress":
        return "InProgress"
      case "Ready for editing":
        return "ReadyForEditing"
      case "Ready to shoot":
        return "ReadyToShoot"
      case "Steam":
        return "Steam"
      default:
        return null
    }
  }
}
