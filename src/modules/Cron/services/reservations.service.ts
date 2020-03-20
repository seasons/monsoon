import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as Sentry from "@sentry/node"
import { PrismaClientService } from '../../../prisma/client.service'
import { EmailService } from '../../Email/services/email.service'
import { DateTime, Interval } from 'luxon'
import { Reservation, InventoryStatus, ProductVariant, ID_Input } from '../../../prisma'
import { AirtableService, AirtableInventoryStatus, AirtableProductVariantCounts } from '../../Airtable/services/airtable.service'
import { SyncError } from '../../../errors'
import { DBService } from '../../../prisma/db.service'
import { ShippingService } from '../../Shipping/services/shipping.service'

type prismaProductVariantCounts = Pick<
  ProductVariant,
  "reservable" | "nonReservable" | "reserved"
>
type productVariantCounts =
  | prismaProductVariantCounts
  | AirtableProductVariantCounts

@Injectable()
export class ReservationScheduledJobs {
  private readonly logger = new Logger(`CRON: ${ReservationScheduledJobs.name}`)
  private readonly shouldReportErrorsToSentry = process.env.NODE_ENV === "production"

  constructor(
    private readonly airtableService: AirtableService,
    private readonly db: DBService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaClientService,
    private readonly shippingService: ShippingService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendReturnNotifications() {
    const reservations = await this.prisma.client.reservations({
      orderBy: "createdAt_DESC",
    })
    const report = {
      reservationsForWhichRemindersWereSent: [],
      errors: [],
    }
    for (const reservation of reservations) {
      try {
        if (this.shouldReportErrorsToSentry) {
          Sentry.configureScope(scope => {
            scope.setExtra("reservationNumber", reservation.reservationNumber)
            scope.setExtra("reservation createdAt", reservation.createdAt)
            scope.setExtra("reservation status", reservation.status)
          })
        }
        if (await this.returnNoticeNeeded(reservation)) {
          //   Remind customer to return items
          const user = await this.prisma.client
            .reservation({
              id: reservation.id,
            })
            .customer()
            .user()
  
          this.emailService.sendReturnReminderEmail(user, reservation)
  
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
        if (this.shouldReportErrorsToSentry) {
          Sentry.captureException(err)
        }
      }
    }
  
    this.logger.log(report)
  }

  // TODO: Handle 1 minute timeout (if necessary)
  @Cron(CronExpression.EVERY_MINUTE)
  async syncPhysicalProductAndReservationStatus() {
    const physProdReport = await this.syncPhysicalProductStatus()
    const reservationReport = await this.syncReservationStatus()
    const allErrors = [...physProdReport.errors, ...reservationReport.errors]
    console.log({ ...physProdReport, ...reservationReport, errors: allErrors })
    return { ...physProdReport, ...reservationReport, errors: allErrors }
  }

  private async syncPhysicalProductStatus() {
    // Get relevant data for airtable, setup containers to hold return data
    const updatedPhysicalProducts = []
    const updatedProductVariants = []
    const errors = []
    const physicalProductsInAirtableButNotPrisma = []
    const allAirtablePhysicalProducts = await this.airtableService.getAllPhysicalProducts()
  
    // Update relevant products
    for (const airtablePhysicalProduct of allAirtablePhysicalProducts) {
      // Wrap it in a try/catch so individual sync errors don't stop the whole job
      try {
        if (this.shouldReportErrorsToSentry) {
          Sentry.configureScope(scope => {
            scope.setExtra(
              "physicalProductSUID",
              airtablePhysicalProduct.fields.SUID.text
            )
          })
        }
  
        const prismaPhysicalProduct = await this.prisma.client.physicalProduct({
          seasonsUID: airtablePhysicalProduct.fields.SUID.text,
        })
  
        if (!!prismaPhysicalProduct) {
          const newStatusOnAirtable =
            airtablePhysicalProduct.fields["Inventory Status"]
          const currentStatusOnPrisma = prismaPhysicalProduct.inventoryStatus
  
          // If the status has changed, then update prisma and airtable accordingly
          if (
            this.physicalProductStatusChanged(
              newStatusOnAirtable,
              currentStatusOnPrisma
            )
          ) {
            // Pause a second, to avoid hitting the 5 requests/sec airtable rate limit
            await new Promise(resolve => setTimeout(resolve, 1000))
  
            // Get the associated ProductVariantID, and ProductVariant from prisma
            const prismaProductVariantID = await this.prisma.client
              .physicalProduct({ id: prismaPhysicalProduct.id })
              .productVariant()
              .id()
            const prismaProductVariant = await this.prisma.client.productVariant({
              id: prismaProductVariantID,
            })
  
            // Update the counts on the corresponding product variant in prisma
            await this.prisma.client.updateProductVariant({
              data: this.getUpdatedCounts(
                prismaProductVariant,
                currentStatusOnPrisma,
                newStatusOnAirtable,
                "prisma"
              ) as prismaProductVariantCounts,
              where: {
                id: prismaProductVariantID,
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
              airtablePhysicalProduct.fields["Product Variant"][0],
              this.getUpdatedCounts(
                prismaProductVariant,
                currentStatusOnPrisma,
                newStatusOnAirtable,
                "airtable"
              ) as AirtableProductVariantCounts
            )
  
            // Store updated ids for reporting
            updatedPhysicalProducts.push(prismaPhysicalProduct.seasonsUID)
            updatedProductVariants.push(prismaProductVariant.sku)
          }
        } else {
          physicalProductsInAirtableButNotPrisma.push(
            airtablePhysicalProduct.fields.SUID
          )
        }
      } catch (error) {
        console.log(airtablePhysicalProduct)
        console.log(error)
        errors.push(error)
        if (this.shouldReportErrorsToSentry) {
          Sentry.captureException(error)
        }
      }
    }
  
    // Remove physicalProductSUID from the sentry scope so it doesn't cloud
    // any errors thrown later
    if (this.shouldReportErrorsToSentry) {
      Sentry.configureScope(scope => {
        scope.setExtra("physicalProductSUID", "")
      })
    }
  
    return {
      updatedPhysicalProducts,
      updatedProductVariants,
      physicalProductsInAirtableButNotPrisma,
      errors,
    }
  }
  
  private async syncReservationStatus() {
    const updatedReservations = []
    const errors = []
    const reservationsInAirtableButNotPrisma = []
    const allAirtableReservations = await this.airtableService.getAllReservations()
  
    for (const airtableReservation of allAirtableReservations) {
      try {
        if (this.shouldReportErrorsToSentry) {
          Sentry.configureScope(scope => {
            scope.setExtra("reservationNumber", airtableReservation.fields.ID)
          })
        }
  
        const prismaReservation = await this.getPrismaReservationWithNeededFields(
          airtableReservation.fields.ID
        )
  
        if (!prismaReservation) {
          reservationsInAirtableButNotPrisma.push(airtableReservation.fields.ID)
          if (this.shouldReportErrorsToSentry) {
            Sentry.captureException(
              new SyncError("Reservation in airtable but not prisma")
            )
          }
          continue
        }
  
        // If the reservation has status of "Completed", handle it seperately.
        if (airtableReservation.fields.Status === "Completed") {
          if (prismaReservation.status !== "Completed") {
            // Handle housekeeping
            updatedReservations.push(prismaReservation.reservationNumber)
            const prismaUser = await this.prisma.client.user({
              email: airtableReservation.fields["User Email"][0],
            })
            const returnedPhysicalProducts = prismaReservation.products.filter(
              p =>
                [
                  "Reservable" as InventoryStatus,
                  "NonReservable" as InventoryStatus,
                ].includes(p.inventoryStatus)
            )
  
            // Update the status
            await this.prisma.client.updateReservation({
              data: { status: "Completed" },
              where: { id: prismaReservation.id },
            })
  
            // Email the user
            this.emailService.sendYouCanNowReserveAgainEmail(prismaUser)
  
            //   Update the user's bag
            await this.updateUsersBagItemsOnCompletedReservation(
              prismaReservation,
              returnedPhysicalProducts
            )
  
            // Update the returnPackage on the shipment
            await this.updateReturnPackageOnCompletedReservation(
              prismaReservation,
              returnedPhysicalProducts
            )
  
            // Email an admin a confirmation email
            this.emailService.sendAdminConfirmationEmail(
              prismaUser,
              returnedPhysicalProducts,
              prismaReservation
            )
          }
        } else if (
          airtableReservation.fields.Status !== prismaReservation.status
        ) {
          // If the reservation doesn't have a status of "Completed", just check to
          // see if we need to update the prisma reservation status and do so if needed
          updatedReservations.push(prismaReservation.reservationNumber)
          await this.prisma.client.updateReservation({
            data: {
              status: this.airtableService.airtableToPrismaReservationStatus(
                airtableReservation.fields.Status
              ),
            },
            where: { id: prismaReservation.id },
          })
        }
      } catch (err) {
        console.log(airtableReservation)
        console.log(err)
        errors.push(err)
        if (this.shouldReportErrorsToSentry) {
          Sentry.captureException(err)
        }
      }
    }
  
    return {
      updatedReservations,
      errors,
      reservationsInAirtableButNotPrisma,
    }
  }

  async getPrismaReservationWithNeededFields(reservationNumber) {
    const res = await this.db.query.reservation(
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
          returnedPackage {
              id
          }
      }`
    )
    return res
  }

  getUpdatedCounts(
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
      this.airtableService.airtableToPrismaInventoryStatus(newStatusOnAirtable) !==
      currentStatusOnPrisma
    )
  }  

  private async returnNoticeNeeded(reservation: Reservation) {
    const now = DateTime.local()
    const reservationCreatedAt = DateTime.fromISO(reservation.createdAt)
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
      twentyEightToTwentyNineDaysAgo.contains(reservationCreatedAt) &&
      !reservation.reminderSentAt &&
      customer.plan === "Essential" &&
      !["Cancelled", "Completed"].includes(reservation.status)
    )
  }

  async updateUsersBagItemsOnCompletedReservation(
    prismaReservation: any, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
    returnedPhysicalProducts: any[] // fields specified in getPrismaReservationWithNeededFields
  ) {
    const returnedPhysicalProductsProductVariantIDs: {
      id: ID_Input
    }[] = returnedPhysicalProducts.map(p => p.productVariant.id)
  
    const customerBagItems = await this.db.query.bagItems(
      {
        where: { customer: { id: prismaReservation.customer.id } },
      },
      `{ 
          id
          productVariant {
              id
          }
      }`
    )
  
    for (let prodVarId of returnedPhysicalProductsProductVariantIDs) {
      const bagItem = customerBagItems.find(
        val => val.productVariant.id === prodVarId.id
      )
  
      if (!bagItem) {
        throw new Error(
          `bagItem with productVariant id ${prodVarId} not found for customer w/id ${prismaReservation.customer.id}`
        )
      }
      await this.prisma.client.deleteBagItem({ id: bagItem.id })
    }
  }
  
  async updateReturnPackageOnCompletedReservation(
    prismaReservation: any, // actually a Prisma Reservation with fields specified in getPrismaReservationWithNeededFields
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
}