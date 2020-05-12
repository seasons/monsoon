import { PaymentService } from "@app/modules/Payment/index"
import {
  BillingAddress,
  Card,
  PlanId,
} from "@app/modules/Payment/payment.types"
import { UtilsService } from "@app/modules/Utils"
import { AirtableService } from "@modules/Airtable"
import { AuthService } from "@modules/User"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { PrismaService } from "@prisma/prisma.service"
import chargebee from "chargebee"
import faker from "faker"
import { head } from "lodash"
import { Command, Option } from "nestjs-command"

import { AirtableIdOption, PrismaEnvOption } from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class UserCommands {
  private readonly logger = new Logger(UserCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly airtable: AirtableService,
    private readonly paymentService: PaymentService,
    private readonly utilsService: UtilsService,
    private moduleRef: ModuleRef
  ) {}

  @Command({
    command: "create:test-user",
    describe: "creates a test user with the given email and password",
    aliases: "ctu",
  })
  async create(
    @PrismaEnvOption()
    prismaEnv,
    @AirtableIdOption({
      describeExtra: "If none given, will use staging",
    })
    abid,
    @Option({
      name: "email",
      describe: "Email of the test user",
      type: "string",
    })
    email,
    @Option({
      name: "password",
      describe: "Password of the test user",
      type: "string",
    })
    password,
    @Option({
      name: "plan",
      describe: "Subscription plan of the user",
      type: "string",
      default: "Essential",
      choices: ["AllAccess", "Essential"],
    })
    plan,
    @Option({
      name: "roles",
      describe: "Roles of the user",
      type: "array",
      default: "Customer",
      choices: ["Customer", "Admin", "Partner"],
    })
    roles
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      airtableEnv: abid,
      moduleRef: this.moduleRef,
    })
    chargebee.configure({
      site: "seasons-test",
      api_key: "test_fmWkxemy4L3CP1ku1XwPlTYQyJVKajXx",
    })

    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const fullName = `${firstName} ${lastName}`
    const slug = `${firstName}-${lastName}`.toLowerCase()
    email = email || `${slug}@seasons.nyc`
    password = password || faker.random.alphaNumeric(6)

    // Fail gracefully if the user is already in the DB
    if (!!(await this.prisma.client.user({ email }))) {
      this.logger.error("User already in DB")
      return
    }

    let user
    let tokenData
    const address: BillingAddress = {
      firstName: firstName,
      lastName: lastName,
      line1: "138 Mulberry St",
      city: "New York",
      state: "NY",
      zip: "10013",
      country: "USA",
    }

    try {
      ;({ user, tokenData } = await this.authService.signupUser({
        email,
        password,
        firstName,
        lastName,
        details: {
          phoneNumber: "(646) 350-2715",
          height: 40 + faker.random.number(32),
          weight: "152lb",
          bodyType: "Athletic",
          shippingAddress: {
            create: {
              slug,
              name: `${firstName} ${lastName}`,
              address1: address.line1,
              city: address.city,
              state: address.state,
              zipCode: address.zip,
            },
          },
        },
      }))
    } catch (err) {
      console.log(err)
      if (err.message.includes("400")) {
        this.logger.error("User already in staging auth0 environment")
      } else {
        throw err
      }
      return
    }

    // Set their status to Active
    const customer = head(
      await this.prisma.client.customers({
        where: { user: { id: user.id } },
      })
    )
    const card: Card = {
      number: "4242424242424242",
      expiryMonth: "04",
      expiryYear: "2022",
      cvv: "222",
    }
    await this.prisma.client.updateCustomer({
      data: {
        plan,
        billingInfo: {
          create: {
            brand: "Visa",
            name: fullName,
            last_digits: card.number.substr(12),
            expiration_month: parseInt(card.expiryMonth, 10),
            expiration_year: parseInt(card.expiryYear, 10),
          },
        },
        status: "Active",
        user: { update: { roles: { set: roles } } },
      },
      where: { id: customer.id },
    })
    await this.airtable.createOrUpdateAirtableUser(user, { status: "Active" })
    await this.paymentService.createSubscription(
      plan,
      this.utilsService.snakeCaseify(address),
      user,
      this.utilsService.snakeCaseify(card)
    )

    this.logger.log(
      `User with email: ${email}, password: ${password} successfully created on ${prismaEnv} prisma and ${
        abid || "staging"
      } airtable`
    )
    this.logger.log(`Access token: ${tokenData.access_token}`)
  }
}
