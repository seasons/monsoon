import { execSync } from "child_process"
import fs from "fs"

import { Injectable } from "@nestjs/common"
import chargebee from "chargebee"
import csvsync from "csvsync"
import download from "download"

const EXPORTS_DIR = "/tmp/chargebeeExports"

@Injectable()
export class ChargebeeSyncService {
  constructor() {}

  async syncAll() {
    await this.syncCustomers()
  }

  async exportAll() {
    await this.exportCustomers()
  }

  async syncCustomers() {
    const exportFile = fs.readFileSync(`${EXPORTS_DIR}/Customers.csv`)
    const customersToSync = csvsync.parse(exportFile, { returnObject: true })

    let i = 0
    for (const cust of customersToSync) {
      if (i++ >= 10) {
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
      } catch (err) {
        console.log(err)
      }
    }
  }

  async exportCustomers() {
    let { export: customerExport } = await chargebee.export
      .customers()
      .request(this.handleChargebeeRequest)

    let status = customerExport.status
    let i = 0
    let limit = 100

    while (status !== "completed") {
      await this.sleep(100)
      if (i++ > limit) {
        throw new Error(`Export not complete after ${limit} checks`)
      }
      ;({ export: customerExport } = await chargebee.export
        .retrieve(customerExport.id)
        .request(this.handleChargebeeRequest))
      status = customerExport.status
    }
    const downloadURL = customerExport.download.download_url
    await download(downloadURL, EXPORTS_DIR, { extract: true })
  }

  async deleteExports() {
    execSync(`rm -rf ${EXPORTS_DIR}`)
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
