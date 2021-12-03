import { execSync } from "child_process"
import fs from "fs"

import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable, Logger } from "@nestjs/common"
import chargebee from "chargebee"
import csvsync from "csvsync"
import download from "download"
import { omit, snakeCase, uniq } from "lodash"

const EXPORTS_DIR = "/tmp/chargebeeExports"

interface ChargebeeSyncOptions {
  limitTen: boolean
  startFrom: number
}
@Injectable()
export class ChargebeeSyncService {
  private readonly logger = new Logger(`ChargebeeSyncService`)

  constructor(private readonly timeUtils: TimeUtilsService) {}

  async syncAll(options: ChargebeeSyncOptions) {
    await this.syncCustomers(options)
    await this.syncSubscriptions(options)
  }

  async exportAll() {
    await this.exportCustomers()
    await this.exportSubscriptions()
  }

  async syncSubscriptions({ limitTen, startFrom }: ChargebeeSyncOptions) {
    const exportFile = fs.readFileSync(`${EXPORTS_DIR}/Subscriptions.csv`)
    const subscriptionsToSync = csvsync.parse(exportFile, {
      returnObject: true,
    })

    const undefinedOrUTCTimestamp = dateString =>
      dateString.length > 5 // proxy for having a real value
        ? this.timeUtils.UTCTimestampFromDate(new Date(dateString), "seconds")
        : undefined

    let i = 0
    const total = subscriptionsToSync.length
    const resultDict = { successes: [], errors: [] }
    this.logger.log(`Starting Subscription sync from index: ${startFrom}`)

    const subscriptionsToCreatePostDeletion = []

    for (const sub of subscriptionsToSync) {
      await this.sleep(100)
      if (i++ < startFrom) {
        continue
      }
      if (i % 5 === 0) {
        this.logger.log(`Syncing subscription ${i} of ${total}`)
      }
      if (
        limitTen &&
        resultDict.successes.length + resultDict.errors.length >= 10
      ) {
        break
      }
      const status = snakeCase(sub["subscriptions.status"])
      const subId = sub["subscriptions.id"]

      // Chargebee has a bug in this function wherein if the subscription is paused,
      // it wants a current_term_end that's in the past, even if that's not what the real data is...
      const currentTermEnd =
        status === "paused" &&
        this.timeUtils.isLaterDate(
          new Date(sub["subscriptions.current_term_end"]),
          new Date()
        )
          ? undefinedOrUTCTimestamp(
              this.timeUtils.xDaysBeforeDate(new Date(), 1)
            )
          : undefinedOrUTCTimestamp(sub["subscriptions.current_term_end"])

      // Only include pause_date if the sub is paused
      // TODO: This logic doesn't properly sync subscriptions that are scheduled to pause
      // in the future. To support this in the future, we'd need to add another call
      // after the import that pauses the subscription with a pause date set to the
      // pause_date on the sub. The API docs seem to indicate we could just pass
      // pause_date on an active sub and let it be, but that throws an error when you try it.
      let pauseDatePayload =
        status === "paused"
          ? {
              pause_date: undefinedOrUTCTimestamp(
                sub["subscriptions.pause_date"]
              ),
            }
          : {}

      const payload = {
        id: subId,
        plan_id: sub["subscriptions.plan_id"],
        status,
        started_at: undefinedOrUTCTimestamp(sub["subscriptions.started_at"]),
        ...(["cancelled"].includes(status)
          ? {
              cancelled_at: undefinedOrUTCTimestamp(
                sub["subscriptions.cancelled_at"]
              ),
            }
          : {}),
        ...(!["cancelled"].includes(status)
          ? {
              current_term_start: undefinedOrUTCTimestamp(
                sub["subscriptions.current_term_start"]
              ),
              current_term_end: currentTermEnd,
            }
          : {}),
        ...pauseDatePayload,
      }

      try {
        let chargebeeSubscription
        try {
          const { subscription } = await chargebee.subscription
            .retrieve(subId)
            .request(this.handleChargebeeRequest)
          chargebeeSubscription = subscription
        } catch (err) {
          // noop
        }

        if (!!chargebeeSubscription) {
          // Mark a paused subscription as cancelled so we can then update it below.
          // Chargebee doesn't let you update paused subscriptions...
          if (chargebeeSubscription.status === "paused") {
            await chargebee.subscription
              .delete(subId)
              .request(this.handleChargebeeRequest)
            subscriptionsToCreatePostDeletion.push({
              subId,
              payload,
              created: false,
              sub,
            })
          } else {
            await chargebee.subscription
              .update(subId, payload)
              .request(this.handleChargebeeRequest)
            resultDict.successes.push(sub["customers.email"])
          }
        } else if (sub["subscriptions.plan_id"].includes("gift")) {
          const giftPayload = {
            gift_receiver: {
              customer_id: sub["customers.id"],
              first_name: sub["customers.first_name"],
              last_name: sub["customers.last_name"],
              email: sub["customers.email"],
            },
            subscription: {
              plan_id: sub["subscriptions.plan_id"],
            },
            gifter: {
              customer_id: sub["customers.id"],
              signature: "SeasonsGifter",
              // Spoof this to be the same person who's receiving it.
            },
          }
          await chargebee.gift
            .create(giftPayload)
            .request(this.handleChargebeeRequest)
          resultDict.successes.push(sub["customers.email"])
        } else {
          await chargebee.subscription
            .import_for_customer(sub["customers.id"], payload)
            .request(this.handleChargebeeRequest)

          resultDict.successes.push(sub["customers.email"])
        }
      } catch (err) {
        resultDict.errors.push(sub["customers.email"])
        console.log(err)
        console.log(sub)
      }
    }

    this.logger.log(`Recreating deleted subscriptions`)

    let recreateAttemptIndex = 0
    let recreateLimit = 5
    while (subscriptionsToCreatePostDeletion.some(a => !a.created)) {
      if (recreateAttemptIndex++ > recreateLimit) {
        const failedSubs = subscriptionsToCreatePostDeletion.filter(
          a => !a.created
        )
        resultDict.errors.push(...failedSubs.map(a => a.sub["customers.email"]))
        break
      }

      const numSuccessesSoFar = subscriptionsToCreatePostDeletion.filter(
        a => a.created
      ).length
      this.logger.log(
        `Recreate attempt ${recreateAttemptIndex} of ${recreateLimit}. ${numSuccessesSoFar} successes so far. ${
          subscriptionsToCreatePostDeletion.length - numSuccessesSoFar
        } left\nWaiting 30 seconds to allow other deletions to finish...`
      )
      await this.sleep(30000)
      for (const {
        subId,
        payload,
        created,
        sub,
      } of subscriptionsToCreatePostDeletion) {
        try {
          await chargebee.subscription
            .import_for_customer(subId, payload)
            .request(this.handleChargebeeRequest)
          resultDict.successes.push(sub["customers.email"])
          subscriptionsToCreatePostDeletion.find(
            a => a.subId === subId
          ).created = true
        } catch (err) {}
      }
    }
    this.logger.log(
      `Synced production chargebee customers to staging. ${resultDict.successes.length} successes and ${resultDict.errors.length} errors`
    )
    this.logger.log(resultDict)
  }

  async exportSubscriptions() {
    await this.exportResource("subscriptions")
  }

  async syncCustomers({ limitTen, startFrom }: ChargebeeSyncOptions) {
    const exportFile = fs.readFileSync(`${EXPORTS_DIR}/Customers.csv`)
    const customersToSync = csvsync.parse(exportFile, { returnObject: true })

    const getSafeValue = val => (val === '"' ? undefined : val)

    let resultDict = { successes: [], errors: [] }
    let i = 0
    const total = customersToSync.length
    this.logger.log(`Starting Customer sync from index: ${startFrom}`)
    for (const cust of customersToSync) {
      await this.sleep(100)
      if (i++ < startFrom) {
        continue
      }
      if (i % 5 === 0) {
        this.logger.log(`Syncing customer ${i} of ${total}`)
      }
      if (
        limitTen &&
        resultDict.successes.length + resultDict.errors.length >= 10
      ) {
        break
      }
      try {
        let chargebeeCustomer
        try {
          const { customer } = await chargebee.customer
            .retrieve(cust["Customer Id"])
            .request(this.handleChargebeeRequest)
          chargebeeCustomer = customer
        } catch (err) {
          // noop
        }

        const commonPayload = {
          first_name: getSafeValue(cust["First Name"]),
          last_name: getSafeValue(cust["Last Name"]),
          email: getSafeValue(cust["Email"]),
        }
        const billingAddressPayload = {
          first_name: getSafeValue(cust["Billing Address First Name"]),
          last_name: getSafeValue(cust["Billing Address Last Name"]),
          line1: getSafeValue(cust["Billing Address Line1"]),
          city: getSafeValue(cust["Billing Address City"]),
          state: getSafeValue(cust["Billing Address State"]),
          zip: getSafeValue(cust["Billing Address Zip"]),
          country: getSafeValue(cust["Billing Address Country"]),
        }
        const billingAddressPayloadIsEmpty = Object.keys(
          billingAddressPayload
        ).every(a => billingAddressPayload[a] === undefined)

        if (!chargebeeCustomer) {
          await chargebee.customer
            .create({
              id: cust["Customer Id"],
              ...commonPayload,
              billing_address: billingAddressPayloadIsEmpty
                ? undefined
                : billingAddressPayload,
            })
            .request(this.handleChargebeeRequest)
        } else {
          await chargebee.customer
            .update(chargebeeCustomer.id, {
              ...commonPayload,
            })
            .request(this.handleChargebeeRequest)
          if (!billingAddressPayloadIsEmpty) {
            await chargebee.customer
              .update_billing_info(chargebeeCustomer.id, {
                billing_address: billingAddressPayload,
              })
              .request(this.handleChargebeeRequest)
          }
        }

        const cardStatus = cust["Card Status"]
        let card
        if (cardStatus === "Valid") {
          card = {
            number: "4242424242424242",
            cvv: "100",
            expiry_year: 2025,
            expiry_month: 12,
          }
        } else {
          card = {
            // Can add this to a customer, but attempts to charge will fail
            // https://stripe.com/docs/testing#cards-responses
            number: "4000000000000341",
            cvv: "100",
            expiry_year: 2025,
            expiry_month: 12,
          }
        }
        await chargebee.payment_source
          .create_card({
            customer_id: cust["Customer Id"],
            card,
            replace_primary_payment_source: true,
          })
          .request(this.handleChargebeeRequest)
        resultDict.successes.push(cust["Email"])
      } catch (err) {
        resultDict.errors.push(cust["Email"])
        console.log(err)
        console.log(cust)
      }
    }
    this.logger.log(
      `Synced production chargebee customers to staging. ${resultDict.successes.length} successes and ${resultDict.errors.length} errors`
    )
    this.logger.log(resultDict)
  }

  async exportCustomers() {
    await this.exportResource("customers")
  }

  async deleteExports() {
    execSync(`rm -rf ${EXPORTS_DIR}`)
  }

  private async exportResource(resourceName: "customers" | "subscriptions") {
    let { export: resourceExport } = await chargebee.export[
      resourceName
    ]().request(this.handleChargebeeRequest)

    let status = resourceExport.status
    let i = 0
    let limit = 100
    const initialLimit = 50
    let waitInterval = 1000

    while (status !== "completed") {
      i++
      await this.sleep(waitInterval)
      if (i > limit) {
        throw new Error(`Export not complete after ${limit} checks`)
      }
      if (i === initialLimit) {
        this.logger.log(
          `Resource export not done after 50 seconds. Will try for another ${Math.round(
            ((limit - initialLimit) * waitInterval) / 1000 / 60
          )} minutes`
        )
        waitInterval = 2000
      }
      ;({ export: resourceExport } = await chargebee.export
        .retrieve(resourceExport.id)
        .request(this.handleChargebeeRequest))
      status = resourceExport.status
    }
    const downloadURL = resourceExport.download.download_url
    await download(downloadURL, EXPORTS_DIR, { extract: true })
  }

  private handleChargebeeRequest = (err, result) => {
    if (err) {
      return err
    }
    if (result) {
      return result
    }
  }

  private async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
