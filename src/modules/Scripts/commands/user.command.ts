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
import { Command, Option, Positional } from "nestjs-command"

import {
  AirtableIdOption,
  EmailOption,
  PasswordOption,
  PrismaEnvOption,
} from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

@Injectable()
export class UserCommands {
  private readonly logger = new Logger(UserCommands.name)

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly utilsService: UtilsService,
    private moduleRef: ModuleRef
  ) {}

  @Command({
    command: "takeover <email>",
    describe:
      "Overrides the indicated user's record with an email and password you can use to use their account",
    aliases: "to",
  })
  async mimick(
    @Positional({
      name: "email",
      type: "string",
      describe: "Email of the user to takeover",
    })
    targetEmail,
    @PrismaEnvOption()
    prismaEnv,
    @EmailOption({
      name: "newEmail",
      describe: "New Email to use on the target record",
    })
    _newEmail,
    @PasswordOption({
      describe: "New Password to use on the target record",
    })
    _password
  ) {
    await this.scriptsService.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })
    let {
      email: newEmail,
      password,
      firstName,
      lastName,
    } = this.createTestUserBasics(_newEmail, _password)
    const auth0Id = await this.authService.createAuth0User(newEmail, password, {
      firstName,
      lastName,
    })

    await this.prisma.client.updateUser({
      where: { email: targetEmail },
      data: { auth0Id, email: newEmail },
    })

    this.logger.log(
      `User with email: ${targetEmail} has had its email and password changed to: ${newEmail}, ${password} on ${prismaEnv} prisma`
    )
    this.logger.log(
      `You may now login with the above credentials to effectively act as the given user`
    )
    this.logger.log(
      `Please note that integrations with third-party services may be reliant on the user's original email, in which case they may not work`
    )
  }

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
    @EmailOption()
    _email,
    @PasswordOption()
    _password,
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
      alias: "r",
      describe: "Roles of the user",
      type: "array",
      default: "Customer",
      choices: ["Customer", "Admin", "Partner"],
    })
    roles,
    @Option({
      name: "status",
      alias: "s",
      describe: "Desired customer status",
      type: "string",
      default: "Customer",
      choices: [
        "Invted",
        "Created",
        "Waitlisted",
        "Authorized",
        "Active",
        "Suspended",
        "Paused",
        "Deactivated",
      ],
    })
    status
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

    let {
      firstName,
      lastName,
      fullName,
      email,
      password,
      slug,
    } = this.createTestUserBasics(_email, _password)

    // Fail gracefully if the user is already in the DB
    if (!!(await this.prisma.client.user({ email }))) {
      this.logger.error("User already in DB")
      return
    }

    let user
    let tokenData
    const address: BillingAddress = {
      firstName,
      lastName,
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
          phoneNumber: "+16463502715",
          height: 40 + faker.random.number(32),
          weight: { set: [150, 160] },
          bodyType: "Athletic",
          shippingAddress: {
            create: {
              name: `${firstName} ${lastName}`,
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

    // Give them valid billing data
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
        status: status || "Active",
        user: { update: { roles: { set: roles } } },
      },
      where: { id: customer.id },
    })
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

  private createTestUserBasics(email, password) {
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const fullName = `${firstName} ${lastName}`
    const slug = `${firstName}-${lastName}`.toLowerCase()
    email = email || `${slug}@seasons.nyc`
    password = password || faker.random.alphaNumeric(6)

    return { firstName, lastName, fullName, email, password, slug }
  }
}
