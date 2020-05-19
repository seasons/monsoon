import { SyncError } from "@app/errors"
import {
  PushNotificationID,
  PushNotificationsService,
} from "@app/modules/PushNotifications"
import {
  AirtableInventoryStatus,
  AirtableProductVariantCounts,
} from "@modules/Airtable/airtable.types"
import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { EmailService } from "@modules/Email/services/email.service"
import { ErrorService } from "@modules/Error/services/error.service"
import { ShippingService } from "@modules/Shipping/services/shipping.service"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import {
  ID_Input,
  InventoryStatus,
  Product,
  ProductVariant,
  Reservation,
  User,
} from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"
import { head } from "lodash"
import { DateTime, Interval } from "luxon"

type prismaProductVariantCounts = Pick<
  ProductVariant,
  "reservable" | "nonReservable" | "reserved"
>
type productVariantCounts =
  | prismaProductVariantCounts
  | AirtableProductVariantCounts

const MULTIPLE_CHOICE = "MultipleChoice"

@Injectable()
export class ReservationScheduledJobs {
  private readonly logger = new Logger(ReservationScheduledJobs.name)

  constructor(
    private readonly airtableService: AirtableService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly errorService: ErrorService,
    private readonly pushNotifs: PushNotificationsService
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async sendReturnNotifications() {
    this.logger.log("Reservation Return Notifications Job ran")
    const reservations = await this.prisma.client.reservations({
      orderBy: "createdAt_DESC",
    })
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        this.errorService.setExtraContext(reservation, "reservation")

        if (await this.returnNoticeNeeded(reservation)) {
          const user = await this.prisma.client
            .reservation({
              id: reservation.id,
            })
            .customer()
            .user()

          this.emailService.sendReturnReminderEmail(user, reservation)

          await this.pushNotifs.pushNotifyUser({
            email: user.email,
            pushNotifID: PushNotificationID.ReturnDue,
          })
          await this.prisma.client.updateReservation({
            where: { id: reservation.id },
            data: { reminderSentAt: DateTime.local().toString() },
          })

          report.reservationsForWhichRemindersWereSent.push(
            reservation.reservationNumber
          )
        }
      } catch (err) {
        report.errors.push(err)
        this.errorService.captureError(err)
      }
    }

    this.logger.log("Reservation Return Notifications Job results:")
    this.logger.log(report)
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncPhysicalProductAndReservationStatuses(onlyReservation = false) {
    this.logger.log(
      `Sync ${
        !onlyReservation ? "Physical Product and" : ""
      } Reservation Statuses ran`
    )
    let physProdReport = { errors: [] }
    if (!onlyReservation) {
      physProdReport = await this.syncPhysicalProductStatus()
    }
    const reservationReport = await this.syncReservationStatus()
    this.logger.log(
      `Sync ${
        !onlyReservation ? "Physical Product and" : "'"
      } Reservation Statuses results`
    )
    this.logger.log({
      ...physProdReport,
      ...reservationReport,
      errors: [...physProdReport.errors, ...reservationReport.errors],
    })
  }

  private async syncPhysicalProductStatus() {
    // Get relevant data for airtable, setup containers to hold return data
    const updatedPhysicalProducts = []
    const updatedProductVariants = []
    const errors = []
    const allAirtablePhysicalProducts = await this.airtableService.getAllPhysicalProducts()

    // Update relevant products
    for (const airtablePhysicalProduct of allAirtablePhysicalProducts) {
      // Wrap it in a try/catch so individual sync errors don't stop the whole job
      try {
        this.errorService.setExtraContext({
          physicalProductSUID: airtablePhysicalProduct.model.suid.text,
        })
        const prismaPhysicalProduct = await this.prisma.client.physicalProduct({
          seasonsUID: airtablePhysicalProduct.model.suid.text,
        })

        if (!prismaPhysicalProduct) {
          continue
        }

        const newStatusOnAirtable =
          airtablePhysicalProduct.model.inventoryStatus
        const currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus

        // If the status has changed, then update prisma and airtable accordingly
        if (
          this.physicalProductStatusChanged(
            newStatusOnAirtable,
            currentStatusOnPrisma
          )
        ) {
          // Get the associated ProductVariantID, and ProductVariant from prisma
          const prismaProductVariant = await this.prisma.client
            .physicalProduct({ id: prismaPhysicalProduct.id })
            .productVariant()

          await this.updateProductVariantCountAndStatus(
            airtablePhysicalProduct,
            prismaPhysicalProduct,
            prismaProductVariant,
            currentStatusOnPrisma,
            newStatusOnAirtable
          )

          // Store updated ids for reporting
          updatedPhysicalProducts.push(prismaPhysicalProduct.seasonsUID)
          updatedProductVariants.push(prismaProductVariant.sku)
        }
      } catch (error) {
        errors.push(error)
        this.errorService.captureError(error)
      }
    }

    // Remove physicalProductSUID from the sentry scope so it doesn't cloud
    // any errors thrown later
    this.errorService.setExtraContext({
      physicalProductSUID: "",
    })

    return {
      updatedPhysicalProducts,
      updatedProductVariants,
      errors,
    }
  }

  private async syncReservationStatus() {
    const updatedReservations = []
    const errors = []
    const allAirtableReservations = await this.airtableService.getAllReservations()

    for (const airtableReservation of allAirtableReservations) {
      try {
        this.errorService.setExtraContext({
          reservationNumber: airtableReservation.model.id,
        })

        let prismaReservation = await this.getPrismaReservationWithNeededFields(
          airtableReservation.model.id
        )

        if (!prismaReservation) {
          this.errorService.captureError(
            new SyncError("Reservation in airtable but not prisma")
          )
          continue
        }

        // If the reservation has status of "Completed", handle it seperately.
        if (
          airtableReservation.model.status === "Completed" &&
          prismaReservation.status !== "Completed"
        ) {
          for (const physProd of prismaReservation.products) {
            await this.ensurePhysicalProductSynced(physProd)
          }

          // grab it again, in case we had to update any physical products
          prismaReservation = await this.getPrismaReservationWithNeededFields(
            airtableReservation.model.id
          )

          // Handle housekeeping
          updatedReservations.push(prismaReservation.reservationNumber)

          const prismaUser = await this.prisma.client.user({
            email: prismaReservation.user.email,
          })

          const returnedPhysicalProducts = prismaReservation.products.filter(
            p =>
              [
                "Reservable" as InventoryStatus,
                "NonReservable" as InventoryStatus,
              ].includes(p.inventoryStatus)
          )

          await this.prisma.client.updateReservation({
            data: { status: "Completed" },
            where: { id: prismaReservation.id },
          })

          await this.updateUsersBagItemsOnCompletedReservation(
            prismaReservation,
            returnedPhysicalProducts
          )

          await this.updateReturnPackageOnCompletedReservation(
            prismaReservation,
            returnedPhysicalProducts
          )

          // Create reservationFeedback datamodels for the returned product variants
          await this.createReservationFeedbacksForVariants(
            await this.prisma.client.productVariants({
              where: {
                id_in: returnedPhysicalProducts.map(p => p.productVariant.id),
              },
            }),
            prismaUser,
            prismaReservation as Reservation
          )

          await this.emailService.sendYouCanNowReserveAgainEmail(prismaUser)
          await this.pushNotifs.pushNotifyUser({
            email: prismaUser.email,
            pushNotifID: PushNotificationID.ResetBag,
          })

          await this.emailService.sendAdminConfirmationEmail(
            prismaUser,
            returnedPhysicalProducts,
            prismaReservation
          )
        } else if (
          airtableReservation.model.status !== prismaReservation.status
        ) {
          // If the reservation doesn't have a status of "Completed", just check to
          // see if we need to update the prisma reservation status and do so if needed
          updatedReservations.push(prismaReservation.reservationNumber)
          await this.prisma.client.updateReservation({
            data: {
              status: this.airtableService.airtableToPrismaReservationStatus(
                airtableReservation.model.status
              ),
            },
            where: { id: prismaReservation.id },
          })
        }
      } catch (err) {
        errors.push(err)
        this.errorService.captureError(err)
      }
    }

    // Remove the reservation number from the sentry scope
    this.errorService.setExtraContext({ reservationNumber: null })

    return {
      updatedReservations,
      errors,
    }
  }

  private async ensurePhysicalProductSynced(physicalProduct: any) {
    const correspondingAirtablePhysProd = head(
      await this.airtableService.getPhysicalProducts([
        physicalProduct.seasonsUID,
      ])
    )
    if (!correspondingAirtablePhysProd) {
      throw new Error(
        `Physical product ${physicalProduct.seasonsUID} not found on airtable`
      )
    }

    if (
      this.physicalProductStatusChanged(
        correspondingAirtablePhysProd.model.inventoryStatus,
        physicalProduct.inventoryStatus
      )
    ) {
      await this.updateProductVariantCountAndStatus(
        correspondingAirtablePhysProd,
        physicalProduct,
        await this.prisma.client.productVariant({
          id: physicalProduct.productVariant.id,
        }),
        physicalProduct.inventoryStatus,
        correspondingAirtablePhysProd.model.inventoryStatus
      )
    }
  }

  private async getPrismaReservationWithNeededFields(reservationNumber) {
    const res = await this.prisma.binding.query.reservation(
      {
        where: { reservationNumber },
      },
      `{
          id
          status
          reservationNumber
          products {
              id
              inventoryStatus
              seasonsUID
              productVariant {
                  id
              }
          }
          customer {
              id
              detail {
                  shippingAddress {
                      slug
                  }
              }
          }
          user {
            id
            email
          }
          returnedPackage {
              id
          }
      }`
    )
    return res
  }

  private getUpdatedCounts(
    prismaProductVariant: ProductVariant,
    currentStatusOnPrisma: InventoryStatus,
    newStatusOnAirtable: AirtableInventoryStatus,
    format: "prisma" | "airtable"
  ): productVariantCounts {
    const prismaCounts = {} as prismaProductVariantCounts
    const airtableCounts = {} as AirtableProductVariantCounts

    // Decrement the count for whichever status we are moving away from
    switch (currentStatusOnPrisma) {
      case "NonReservable":
        prismaCounts.nonReservable = prismaProductVariant.nonReservable - 1
        airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable
        break
      case "Reserved":
        prismaCounts.reserved = prismaProductVariant.reserved - 1
        airtableCounts["Reserved Count"] = prismaCounts.reserved
        break
      case "Reservable":
        prismaCounts.reservable = prismaProductVariant.reservable - 1
        airtableCounts["Reservable Count"] = prismaCounts.reservable
        break
    }

    // Increment the count for whichever status we are switching on to
    switch (newStatusOnAirtable) {
      case "Non Reservable":
        prismaCounts.nonReservable = prismaProductVariant.nonReservable + 1
        airtableCounts["Non-Reservable Count"] = prismaCounts.nonReservable
        break
      case "Reserved":
        prismaCounts.reserved = prismaProductVariant.reserved + 1
        airtableCounts["Reserved Count"] = prismaCounts.reserved
        break
      case "Reservable":
        prismaCounts.reservable = prismaProductVariant.reservable + 1
        airtableCounts["Reservable Count"] = prismaCounts.reservable
        break
    }

    // Get the formatting right
    let retVal
    if (format === "prisma") {
      retVal = prismaCounts
    }
    if (format === "airtable") {
      retVal = airtableCounts
    }

    return retVal
  }

  private physicalProductStatusChanged(
    newStatusOnAirtable: AirtableInventoryStatus,
    currentStatusOnPrisma: InventoryStatus
  ): boolean {
    return (
      this.airtableService.airtableToPrismaInventoryStatus(
        newStatusOnAirtable
      ) !== currentStatusOnPrisma
    )
  }

  private async returnNoticeNeeded(reservation: Reservation) {
    const now = DateTime.local()
    const twentyEightToTwentyNineDaysAgo = Interval.fromDateTimes(
      now.minus({ days: 29 }),
      now.minus({ days: 28 })
    )
    const customer = await this.prisma.client
      .reservation({
        id: reservation.id,
      })
      .customer()

    return (
      twentyEightToTwentyNineDaysAgo.contains(
        DateTime.fromISO(reservation.createdAt)
      ) &&
      !reservation.reminderSentAt &&
      customer.plan === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }

  private async updateProductVariantCountAndStatus(
    airtablePhysicalProduct,
    prismaPhysicalProduct,
    prismaProductVariant,
    currentStatusOnPrisma,
    newStatusOnAirtable
  ) {
    // Update the counts on the corresponding product variant in prisma
    await this.prisma.client.updateProductVariant({
      data: this.getUpdatedCounts(
        prismaProductVariant,
        currentStatusOnPrisma,
        newStatusOnAirtable,
        "prisma"
      ) as prismaProductVariantCounts,
      where: {
        id: prismaProductVariant.id,
      },
    })

    // Update the status of the corresponding physical product in prisma
    await this.prisma.client.updatePhysicalProduct({
      data: {
        inventoryStatus: this.airtableService.airtableToPrismaInventoryStatus(
          newStatusOnAirtable
        ),
      },
      where: { id: prismaPhysicalProduct.id },
    })

    // Update the counts on the corresponding product variant in airtable
    await this.airtableService.updateProductVariantCounts(
      head(airtablePhysicalProduct.model.productVariant),
      this.getUpdatedCounts(
        prismaProductVariant,
        currentStatusOnPrisma,
        newStatusOnAirtable,
        "airtable"
      ) as AirtableProductVariantCounts
    )

    return prismaProductVariant
  }

  private async updateReturnPackageOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    const returnedPhysicalProductIDs: {
      id: ID_Input
    }[] = returnedPhysicalProducts.map(p => {
      return { id: p.id }
    })
    const returnedProductVariantIDs: string[] = prismaReservation.products
      .filter(p => p.inventoryStatus === "Reservable")
      .map(prod => prod.productVariant.id)
    const weight = await this.shippingService.calcShipmentWeightFromProductVariantIDs(
      returnedProductVariantIDs
    )

    if (prismaReservation.returnedPackage != null) {
      await this.prisma.client.updatePackage({
        data: {
          items: { connect: returnedPhysicalProductIDs },
          weight,
        },
        where: { id: prismaReservation.returnedPackage.id },
      })
    } else {
      await this.prisma.client.updateReservation({
        data: {
          returnedPackage: {
            create: {
              items: { connect: returnedPhysicalProductIDs },
              weight,
              shippingLabel: {
                create: {},
              },
              fromAddress: {
                connect: {
                  slug: prismaReservation.customer.detail.shippingAddress.slug,
                },
              },
              toAddress: {
                connect: {
                  slug: process.env.SEASONS_CLEANER_LOCATION_SLUG,
                },
              },
            },
          },
        },
        where: {
          id: prismaReservation.id,
        },
      })
    }
  }

  private async updateUsersBagItemsOnCompletedReservation(
    prismaReservation: any,
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    return await this.prisma.client.deleteManyBagItems({
      customer: { id: prismaReservation.customer.id },
      saved: false,
      productVariant: {
        id_in: returnedPhysicalProducts.map(p => p.productVariant.id),
      },
      status: "Reserved",
    })
  }

  private async createReservationFeedbacksForVariants(
    productVariants: ProductVariant[],
    user: User,
    reservation: Reservation
  ) {
    const variantInfos = await Promise.all(
      productVariants.map(async variant => {
        const products: Product[] = await this.prisma.client.products({
          where: {
            variants_some: {
              id: variant.id,
            },
          },
        })
        if (!products || products.length === 0) {
          throw new Error(
            `createReservationFeedback error: Unable to find product for product variant id ${variant.id}.`
          )
        }
        return {
          id: variant.id,
          name: products[0].name,
          retailPrice: products[0].retailPrice,
        }
      })
    )
    await this.prisma.client.createReservationFeedback({
      feedbacks: {
        create: variantInfos.map(variantInfo => ({
          isCompleted: false,
          questions: {
            create: [
              {
                question: `How many times did you wear this ${variantInfo.name}?`,
                options: {
                  set: [
                    "More than 6 times",
                    "3-5 times",
                    "1-2 times",
                    "0 times",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Would you buy it at retail for $${variantInfo.retailPrice}?`,
                options: {
                  set: [
                    "Would buy at a discount",
                    "Buy below retail",
                    "Buy at retail",
                    "Would only rent",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
              {
                question: `Did it fit as expected?`,
                options: {
                  set: [
                    "Fit too big",
                    "Fit true to size",
                    "Ran small",
                    "Didn’t fit at all",
                  ],
                },
                type: MULTIPLE_CHOICE,
              },
            ],
          },
          variant: { connect: { id: variantInfo.id } },
        })),
      },
      user: {
        connect: {
          id: user.id,
        },
      },
      reservation: {
        connect: { id: reservation.id },
      },
    })
  }
}
