import { AirtableIdOption, PrismaEnvOption } from "../scripts.decorators"
import { Command, Option } from "nestjs-command"
import { Injectable, Logger } from "@nestjs/common"

import { AuthService } from "@modules/User"
import { ModuleRef } from "@nestjs/core"
import { PrismaService } from "@prisma/prisma.service"
import { ScriptsService } from "../services/scripts.service"
import faker from "faker"
import { head } from "lodash"

@Injectable()
export class UserCommands {
  private readonly logger = new Logger(UserCommands.name)
  private prisma: PrismaService

  constructor(
    private readonly scriptsService: ScriptsService,
    private readonly authService: AuthService,
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
    password
  ) {
    this.prisma = await this.moduleRef.get(PrismaService, {
      strict: false,
    })
    await this.scriptsService.updateConnections({
      prismaEnv,
      airtableEnv: abid,
      moduleRef: this.moduleRef,
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
              address1: "138 Mulberry St",
              city: "New York",
              state: "NY",
              zipCode: "10013",
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
    await this.prisma.client.updateCustomer({
      data: {
        plan: "Essential",
        billingInfo: {
          create: {
            brand: "Visa",
            name: fullName,
            last_digits: faker.finance.mask(4),
            expiration_month: 0o4,
            expiration_year: 2022,
          },
        },
        status: "Active",
      },
      where: { id: customer.id },
    })

    this.logger.log(
      `User with email: ${email}, password: ${password} successfully created`
    )
    this.logger.log(`Access token: ${tokenData.access_token}`)
  }
}
