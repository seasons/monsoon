import { Injectable } from "@nestjs/common"
import { User, CustomerStatus } from "../../../prisma"
import { PrismaClientService } from "../../../prisma/client.service"
import { AuthService } from "./auth.service"
import { DBService } from "../../../prisma/db.service"
import { AirtableService } from "../../Airtable/services/airtable.service"

@Injectable()
export class CustomerService {
  constructor(
    private readonly airtableService: AirtableService,
    private readonly authService: AuthService,
    private readonly db: DBService,
    private readonly prisma: PrismaClientService
  ) { }

  private async setCustomerPrismaStatus(
    user: User,
    status: CustomerStatus
  ) {
    const customer = await this.authService.getCustomerFromUserID(user.id)
    await this.prisma.client.updateCustomer({
      // @ts-ignore
      data: { status },
      where: { id: customer.id },
    })
  }

  async addCustomerDetails({ details, status }, customer, user, info) {
    const currentCustomerDetail = await this.prisma.client
      .customer({ id: customer.id })
      .detail()
    const detail = await this.prisma.client.upsertCustomerDetail({
      where: { id: currentCustomerDetail.id },
      create: details,
      update: details
    })
    if (detail) {
      await this.prisma.client.updateCustomer({
        data: { detail: { connect: { id: detail.id } } },
        where: { id: customer.id }
      })
    }

    // If a status was passed, update the customer status in prisma
    if (!!status) {
      await this.setCustomerPrismaStatus(user, status)
    }

    // Sync with airtable
    await this.airtableService.createOrUpdateAirtableUser(user, {
      ...currentCustomerDetail,
      ...details,
      status,
    })

    // Return the updated customer object
    const returnData = await this.db.query.customer(
      { where: { id: customer.id } },
      info
    )
    return returnData
  }
}
