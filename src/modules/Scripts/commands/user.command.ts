import { AirtableIdOption, PrismaEnvOption } from "../scripts.decorators"
import {
  BillingAddress,
  Card,
  PlanId,
} from "@app/modules/Payment/payment.types"
import { Command, Option } from "nestjs-command"
import { Injectable, Logger } from "@nestjs/common"

import { AirtableService } from "@modules/Airtable"
import { AuthService } from "@modules/User"
import { ModuleRef } from "@nestjs/core"
import { PaymentService } from "@app/modules/Payment/index"
import { PrismaService } from "@prisma/prisma.service"
import { ScriptsService } from "../services/scripts.service"
import chargebee from "chargebee"
import faker from "faker"
import { head } from "lodash"

@Injectable()
export class UserCommands {
  private readonly logger = new Logger(UserCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly airtable: AirtableService,
    private readonly paymentService: PaymentService,
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
    plan
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
      first_name: firstName,
      last_name: lastName,
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
      expiry_month: "04",
      expiry_year: "2022",
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
            expiration_month: parseInt(card.expiry_month, 10),
            expiration_year: parseInt(card.expiry_year, 10),
          },
        },
        status: "Active",
      },
      where: { id: customer.id },
    })
    await this.airtable.createOrUpdateAirtableUser(user, { status: "Active" })
    await this.paymentService.createSubscription(plan, address, user, card)

    this.logger.log(
      `User with email: ${email}, password: ${password} successfully created on ${prismaEnv} prisma and ${abid ||
        "staging"} airtable`
    )
    this.logger.log(`Access token: ${tokenData.access_token}`)
  }
}
