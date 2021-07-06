import { BillingAddress, Card } from "@app/modules/Payment/payment.types"
import { PaymentService } from "@app/modules/Payment/services/payment.service"
import { PaymentUtilsService } from "@app/modules/Utils/services/paymentUtils.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { AuthService } from "@modules/User/services/auth.service"
import { Injectable, Logger } from "@nestjs/common"
import { ModuleRef } from "@nestjs/core"
import { PrismaService } from "@prisma1/prisma.service"
import sgMail from "@sendgrid/mail"
import chargebee from "chargebee"
import faker from "faker"
import { head } from "lodash"
import { DateTime } from "luxon"
import { Command, Option, Positional } from "nestjs-command"

import {
  EmailOption,
  PasswordOption,
  PrismaEnvOption,
} from "../scripts.decorators"
import { ScriptsService } from "../services/scripts.service"

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

@Injectable()
export class UserCommands {
  private readonly logger = new Logger(UserCommands.name)

  constructor(
    private readonly scripts: ScriptsService,
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
    private readonly paymentService: PaymentService,
    private readonly utils: UtilsService,
    private readonly paymentUtils: PaymentUtilsService,
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
    await this.scripts.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
    })
    let {
      email: newEmail,
      password,
      firstName,
      lastName,
    } = this.createTestUserBasics(_newEmail, _password)
    const auth0Id = await this.auth.createAuth0User(newEmail, password, {
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
    @EmailOption()
    _email,
    @PasswordOption()
    _password,
    @Option({
      name: "planID",
      describe: "Subscription plan of the user",
      type: "string",
      default: "essential-2",
      choices: [
        "all-access",
        "essential",
        "all-access-1",
        "essential-1",
        "all-access-2",
        "essential-2",
      ],
    })
    planID,
    @Option({
      name: "roles",
      alias: "r",
      describe: "Roles of the user",
      type: "array",
      default: "Customer",
      choices: ["Customer", "Admin", "Partner", "Marketer"],
    })
    roles,
    @Option({
      name: "status",
      alias: "s",
      describe: "Desired customer status",
      type: "string",
      default: "Active",
      choices: [
        "Invited",
        "Created",
        "Waitlisted",
        "Authorized",
        "PaymentFailed",
        "Active",
        "Suspended",
        "Paused",
        "Deactivated",
      ],
    })
    status,
    @Option({
      name: "allAccessEnabled",
      alias: "aa",
      describe: "Whether or not the customer should have all access enabled",
      type: "boolean",
      default: "true",
    })
    allAccessEnabled,
    @Option({
      name: "phone number",
      describe: `Phone Number for the user`,
      type: "string",
      alias: "pn",
      default: "16463502715",
    })
    phoneNumber,
    @Option({
      name: "auth0 id",
      describe: `Auth0ID`,
      type: "string",
      alias: "aid",
      default: "",
    })
    auth0ID,
    @Option({
      name: "database user only",
      describe: "Create user in DB only, not Auth0",
      type: "boolean",
      alias: "dbo",
      default: false,
      required: false,
    })
    dbo: boolean
  ) {
    await this.scripts.updateConnections({
      prismaEnv,
      moduleRef: this.moduleRef,
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
    const details = {
      phoneNumber: `+${phoneNumber}`,
      height: 40 + faker.random.number(32),
      weight: { set: [150, 160] },
      waistSizes: { set: [28, 29, 20] },
      topSizes: { set: ["XS", "S"] },
      bodyType: "Athletic",
      shippingAddress: {
        create: {
          name: `${firstName} ${lastName}`,
          address1: address.line1,
          city: address.city,
          state: address.state,
          zipCode: address.zip,
        },
      },
    }

    if (dbo) {
      try {
        user = await this.auth.createPrismaUser(
          auth0ID,
          email,
          firstName,
          lastName
        )

        tokenData = { access_token: "***" }

        await this.auth.createPrismaCustomerForExistingUser(
          user.id,
          details,
          "Created",
          firstName.replace(/[^a-z]/gi, ""),
          "",
          ""
        )
      } catch (err) {
        console.log(err)
        throw err
      }
    }

    if (!dbo) {
      try {
        ;({ user, tokenData } = await this.auth.signupUser({
          email,
          password,
          firstName,
          lastName,
          details: details,
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
    }

    // Give them valid billing data if appropriate
    const customer = head(
      await this.prisma.client.customers({
        where: { user: { id: user.id } },
      })
    )
    if (["Active", "Suspended", "Paused"].includes(status)) {
      chargebee.configure({
        site: "seasons-test",
        api_key: "test_fmWkxemy4L3CP1ku1XwPlTYQyJVKajXx",
      })
      const card: Card = {
        number: "4242424242424242",
        expiryMonth: "04",
        expiryYear: "2022",
        cvv: "222",
      }
      this.logger.log("Updating customer")
      const { subscription } = await this.paymentService.createSubscription(
        planID,
        this.utils.snakeCaseify(address),
        user,
        this.utils.snakeCaseify(card)
      )
      await this.prisma.client.updateCustomer({
        data: {
          membership: {
            create: {
              plan: {
                connect: {
                  planID,
                },
              },
              subscriptionId: subscription.id,
              ...(status === "Paused"
                ? {
                    pauseRequests: {
                      create: {
                        pausePending: false,
                        pauseDate: DateTime.local().toISO(),
                        resumeDate: DateTime.local()
                          .plus({ months: 1 })
                          .toISO(),
                      },
                    },
                  }
                : {}),
              subscription: {
                create: this.paymentUtils.getCustomerMembershipSubscriptionData(
                  subscription
                ),
              },
            },
          },
          billingInfo: {
            create: {
              brand: "Visa",
              name: fullName,
              last_digits: card.number.substr(12),
              expiration_month: parseInt(card.expiryMonth, 10),
              expiration_year: parseInt(card.expiryYear, 10),
            },
          },
          status,
          user: { update: { roles: { set: roles } } },
        },
        where: { id: customer.id },
      })
    }

    // Give them a valid admissions record if appropriate
    if (["Active", "Waitlisted", "Paused", "Authorized"].includes(status)) {
      const authorizationsCount = ["Active", "Authorized", "Paused"].includes(
        status
      )
        ? 1
        : 0
      const authorizationWindowClosesAt = DateTime.local()
        .plus({ days: 7 })
        .toISO()
      await this.prisma.client.updateCustomer({
        data: {
          admissions: {
            create: {
              allAccessEnabled,
              admissable: true,
              authorizationsCount,
              inServiceableZipcode: true,
              authorizationWindowClosesAt,
            },
          },
          authorizedAt:
            status !== "Waitlisted" ? DateTime.local().toISO() : null,
        },
        where: { id: customer.id },
      })
    }

    // Make sure we always update these
    await this.prisma.client.updateCustomer({
      where: { id: customer.id },
      data: { status },
    })
    await this.prisma.client.updateUser({
      where: { id: user.id },
      data: { roles: { set: roles } },
    })

    this.logger.log(`Success!`)
    this.logger.log(`Access token: ${tokenData.access_token}`)
    this.logger.log(`Email: ${email}`)
    this.logger.log(`Password: ${password}`)
    this.logger.log(`Roles: ${roles}. Status: ${status}.`)
    this.logger.log(`Env: ${prismaEnv}`)
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
