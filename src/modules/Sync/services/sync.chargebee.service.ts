import { execSync } from "child_process"
import fs from "fs"

import { TimeUtilsService } from "@app/modules/Utils/services/time.service"
import { Injectable, Logger } from "@nestjs/common"
import chargebee from "chargebee"
import csvsync from "csvsync"
import download from "download"

const EXPORTS_DIR = "/tmp/chargebeeExports"

@Injectable()
export class ChargebeeSyncService {
  private readonly logger = new Logger(`ChargebeeSyncService`)

  constructor(private readonly timeUtils: TimeUtilsService) {}

  async syncAll(limitTen) {
    await this.syncCustomers(limitTen)
    await this.syncSubscriptions(limitTen)
  }

  async exportAll() {
    await this.exportCustomers()
  }

  async syncSubscriptions(limitTen) {
    const exportFile = fs.readFileSync(`${EXPORTS_DIR}/Subscriptions.csv`)
    const subscriptionsToSync = csvsync.parse(exportFile, {
      returnObject: true,
    })

    let numSuccesses = 0
    let numErrors = 0

    const nullOrUTCTimestamp = dateString =>
      dateString.length > 5 // proxy for having a real value
        ? this.timeUtils.UTCTimestampFromDate(new Date(dateString), "seconds")
        : null
    for (const sub of subscriptionsToSync) {
      if (limitTen && numSuccesses + numErrors >= 10) {
        break
      }
      const status = sub["subscriptions.status"]
      const payload = {
        id: sub["subscriptions.id"],
        plan_id: sub["subscriptions.plan_id"],
        status: sub["subscriptions.status"],
        current_term_end: nullOrUTCTimestamp(
          sub["subscriptions.current_term_end"]
        ),
        current_term_start:
          status !== "Cancelled"
            ? nullOrUTCTimestamp(sub["subscriptions.current_term_start"])
            : null,
        cancelled_at: nullOrUTCTimestamp(sub["subscriptions.cancelled_at"]),
        started_at: nullOrUTCTimestamp(sub["subscriptions.started_at"]),
        pause_date: nullOrUTCTimestamp(sub["subscriptions.pause_date"]),
        resume_date: nullOrUTCTimestamp(sub["subscriptions.resume_date"]),
      }
      try {
        // TODO: If the subscription already exists, update it instead
        const result = await chargebee.subscription
          .import_for_customer(sub["customers.id"], payload)
          .request(this.handleChargebeeRequest)
        numSuccesses++
      } catch (err) {
        numErrors++
        console.log(err)
        console.log(sub)
      }
    }

    this.logger.log(
      `Synced production chargebee subscriptions to staging. ${numSuccesses} successes and ${numErrors} errors`
    )
  }

  async exportSubscriptions() {
    await this.exportResource("subscriptions")
  }

  async syncCustomers(limitTen) {
    const exportFile = fs.readFileSync(`${EXPORTS_DIR}/Customers.csv`)
    const customersToSync = csvsync.parse(exportFile, { returnObject: true })

    let numSuccesses = 0
    let numErrors = 0
    for (const cust of customersToSync) {
      if (limitTen && numSuccesses + numErrors >= 10) {
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
          first_name: cust["First Name"],
          last_name: cust["Last Name"],
          email: cust["Email"],
        }
        const billingAddressPayload = {
          first_name: cust["Billing Address First Name"],
          last_name: cust["Billing Address Last Name"],
          line1: cust["Billing Address Line1"],
          city: cust["Billing Address City"],
          state: cust["Billing Address State"],
          zip: cust["Billing Address Zip"],
          country: cust["Billing Address Country"],
        }
        if (!chargebeeCustomer) {
          await chargebee.customer
            .create({
              id: cust["Customer Id"],
              ...commonPayload,
              billing_address: billingAddressPayload,
            })
            .request(this.handleChargebeeRequest)
        } else {
          await chargebee.customer
            .update(chargebeeCustomer.id, {
              ...commonPayload,
            })
            .request(this.handleChargebeeRequest)
          await chargebee.customer
            .update_billing_info(chargebeeCustomer.id, {
              billing_address: billingAddressPayload,
            })
            .request(this.handleChargebeeRequest)
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
        numSuccesses++
      } catch (err) {
        numErrors++
        console.log(err)
        console.log(cust)
      }
    }
    this.logger.log(
      `Synced production chargebee customers to staging. ${numSuccesses} successes and ${numErrors} errors`
    )
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

    while (status !== "completed") {
      await this.sleep(1000)
      if (i++ > limit) {
        throw new Error(`Export not complete after ${limit} checks`)
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
