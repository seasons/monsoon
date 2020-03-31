import { Command, Option } from 'nestjs-command';
import { Injectable, Logger } from '@nestjs/common';
import { ScriptsService } from '../services/scripts.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../../User/services/auth.service';
import faker from 'faker';
import { head } from 'lodash';
 
@Injectable()
export class UserCommands { 
  private readonly logger = new Logger(UserCommands.name)

  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
    private readonly scriptsService: ScriptsService
  ) {}

  @Command({
    command: 'create:test-user',
    describe: 'creates a test user with the given email and password',
  })
  async create(
    @Option({
      name: 'e',
      describe: 'Prisma environment on which to create the test user',
      choices: ['local', 'staging'],
      type: 'string'
    }) e,
    @Option({
      name: 'email',
      describe: 'Email of the test user',
      type: 'string'
    }) email,
    @Option({
      name: 'password',
      describe: 'Password of the test user',
      type: 'string'
    }) password
  ) {
    await this.scriptsService.overrideEnvFromRemoteConfig(e)

    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const fullName = `${firstName} ${lastName}`
    const slug = `${firstName}-${lastName}`.toLowerCase()
    email = email || `${slug}@seasons.nyc`
    password = password || faker.random.alphaNumeric(6)

    // Fail gracefully if the user is already in the DB
    if (!!(await this.prisma.client.user({ email }))) {
      this.logger.log("User already in DB")
    }

    const { user, tokenData } = await this.authService.signupUser({
      email,
      password,
      firstName,
      lastName,
      details: {
        phoneNumber: faker.phone.phoneNumber(),
        height: 40 + faker.random.number(32),
        weight: "152lb",
        bodyType: "Athletic",
        shippingAddress: {
          create: {
            slug,
            name: `${firstName} ${lastName}`,
            address1: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            zipCode: faker.address.zipCode(),
          },
        },
      },
    })

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