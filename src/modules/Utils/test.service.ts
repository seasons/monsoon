import { AirtableService } from "@modules/Airtable/services/airtable.service"
import { Customer, User } from "@prisma/index"
import { PrismaService } from "@prisma/prisma.service"

export class TestUtilsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly airtableService: AirtableService
  ) {}

  async createNewTestingCustomer(): Promise<{
    user: User
    customer: Customer
  }> {
    let newCustomer = await this.prisma.client.createCustomer({
      user: {
        create: {
          email: `membership+${Date.now()}@seasons.nyc`,
          firstName: "SamTest",
          lastName: "JohnsonTest",
          role: "Customer",
          auth0Id: `auth|${Date.now()}`,
        },
      },
      status: "Active",
      detail: {
        create: {
          shippingAddress: {
            create: {
              slug: `sam-johnson-test-sq${Date.now()}`,
              name: "Sam Johnson Test",
              company: "",
              address1: "138 Mulberry St",
              city: "New York",
              state: "New York",
              zipCode: "10013",
              locationType: "Customer",
            },
          },
        },
      },
    })
    newCustomer = await this.prisma.client.customer({ id: newCustomer.id })
    const newUser = await this.prisma.client.user({
      id: await this.prisma.client
        .customer({ id: newCustomer.id })
        .user()
        .id(),
    })
    this.airtableService.createOrUpdateAirtableUser(newUser, {})

    return { user: newUser, customer: newCustomer }
  }
}
