import {
  BottomSizeCreateInput,
  ProductType,
  Size,
  TopSizeCreateInput,
} from "../../../prisma"

import { AirtableService } from "../../Airtable/services/airtable.service"
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../../prisma/prisma.service"
import { SyncUtilsService } from "./sync.utils.service"
import { UtilsService } from "../../Utils/services/utils.service"

@Injectable()
export class SyncSizesService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly prisma: PrismaService,
    private readonly syncUtils: SyncUtilsService,
    private readonly utils: UtilsService
  ) {}

  async deepUpsertSize({
    slug,
    type,
    display,
    topSizeData,
    bottomSizeData,
  }: {
    slug: string
    type: ProductType
    display: string
    topSizeData?: TopSizeCreateInput
    bottomSizeData?: BottomSizeCreateInput
  }): Promise<Size> {
    const sizeData = { slug, productType: type, display }
    // Update if needed
    const sizeRecord = await this.prisma.client.upsertSize({
      where: { slug },
      create: { ...sizeData },
      update: { ...sizeData },
    })
    switch (type) {
      case "Top":
        if (!topSizeData) {
          throw new Error("topSizeData must be non null if type is Top")
        }
        const prismaTopSize = await this.prisma.client
          .size({ id: sizeRecord.id })
          .top()
        const topSize = await this.prisma.client.upsertTopSize({
          where: { id: prismaTopSize?.id || "" },
          update: { ...topSizeData },
          create: { ...topSizeData },
        })
        if (!prismaTopSize) {
          await this.prisma.client.updateSize({
            where: { slug },
            data: { top: { connect: { id: topSize.id } } },
          })
        }
        break
      case "Bottom":
        if (!bottomSizeData) {
          throw new Error("bottomSizeData must be non null if type is Bottom")
        }
        const prismaBottomSize = await this.prisma.client
          .size({ id: sizeRecord?.id })
          .bottom()
        const bottomSize = await this.prisma.client.upsertBottomSize({
          where: { id: prismaBottomSize?.id || "" },
          create: { ...bottomSizeData },
          update: { ...bottomSizeData },
        })
        if (!prismaBottomSize) {
          await this.prisma.client.updateSize({
            where: { slug },
            data: { bottom: { connect: { id: bottomSize.id } } },
          })
        }
    }

    return sizeRecord
  }

  getSizeRecordIdentifer = rec => `${rec.fields.Name}${rec.fields.Type}`

  async syncAirtableToAirtable(cliProgressBar?) {
    await this.syncUtils.deleteAllStagingRecords("Sizes", cliProgressBar)
    await this.syncUtils.createAllStagingRecordsWithoutLinks({
      modelName: "Sizes",
      allProductionRecords: await this.airtableService.getAllSizes(
        this.airtableService.getProductionBase()
      ),
      sanitizeFunc: fields =>
        this.utils.Identity({
          ...fields,
          "Top Sizes": [],
          "Bottom Sizes": [],
          "Bottom Sizes 2": [],
          "Related Size": [],
          Products: [],
        }),
      cliProgressBar,
    })
  }
}
