import { PrismaService } from "@app/prisma/prisma.service"
import { Args, Info, Mutation, Resolver } from "@nestjs/graphql"
import { ApolloError } from "apollo-server"
import { kebabCase, pick } from "lodash"
import * as validUrl from "valid-url"

import { PushNotificationInterest } from "../pushNotification.types"
import { PushNotificationService } from "../services/pushNotification.service"

@Resolver()
export class PushNotificationMutationsResolver {
  constructor(
    private readonly pushNotifications: PushNotificationService,
    private readonly prisma: PrismaService
  ) {}

  @Mutation()
  async pushNotifyUser(
    @Args()
    { where, data: { title, body, route, uri, record } },
    @Info() info
  ) {
    await this.validatePushNotifDataInputs(route, record, uri)

    // Validate the user
    const { email } = await this.prisma.client.user(where)
    if (!email) {
      throw new ApolloError(`No user found with data: ${where}`)
    }

    // Send the notif
    const receipts = await this.pushNotifications.pushNotifyUsers({
      emails: [email],
      pushNotifID: "Custom",
      vars: { title, body, route, uri, ...pick(record, ["id", "slug"]) },
    })

    const { id } = receipts[email]

    return await this.prisma.binding.query.pushNotificationReceipt(
      {
        where: { id },
      },
      info
    )
  }

  @Mutation()
  async pushNotifyUsers(
    @Args()
    { where, data: { title, body, route, uri, record } },
    @Info() info
  ) {
    await this.validatePushNotifDataInputs(route, record, uri)

    // Validate the user
    const users = await this.prisma.client.users({ where })
    if (users.length === 0) {
      throw new ApolloError(`No users found on that criteria`)
    }

    // Send the notif
    const receipts = await this.pushNotifications.pushNotifyUsers({
      emails: users.map(a => a.email),
      pushNotifID: "Custom",
      vars: { title, body, route, uri, ...pick(record, ["id", "slug"]) },
    })

    console.log(Object.values(receipts).map((a: any) => a.id))
    console.log(
      await this.prisma.binding.query.pushNotificationReceipts(
        {
          where: { id_in: Object.values(receipts).map((a: any) => a.id) },
        },
        info
      )
    )
    return await this.prisma.binding.query.pushNotificationReceipts(
      {
        where: { id_in: Object.values(receipts).map((a: any) => a.id) },
      },
      info
    )
  }

  @Mutation()
  async pushNotifyInterest(
    @Args()
    { interest, data: { title, body, route, uri, record }, debug = false },
    @Info() info
  ) {
    await this.validatePushNotifDataInputs(route, record, uri)

    // Send the notif
    const { id } = await this.pushNotifications.pushNotifyInterest({
      interest: kebabCase(interest) as PushNotificationInterest,
      pushNotifID: "Custom",
      vars: { title, body, route, uri, ...pick(record, ["id", "slug"]) },
      debug,
    })
    return await this.prisma.binding.query.pushNotificationReceipt(
      {
        where: { id },
      },
      info
    )
  }

  private async validatePushNotifDataInputs(route, record, uri) {
    this.validateWebviewParams(route, uri)
    await this.validateBrandAndProductParams(route, record)
  }
  private isValidURL(url: string): boolean {
    const startsCorrect = url.startsWith("http") || url.startsWith("https")
    return startsCorrect && validUrl.isUri(url)
  }

  private validateWebviewParams(route, uri) {
    if (route === "Webview" && !uri) {
      throw new ApolloError("Must provide a valid uri if routing to a WebView")
    }
    if (route !== "Webview" && !!uri) {
      throw new ApolloError("Must provide route Webview if providing uri")
    }
    if (!!uri && !this.isValidURL(uri)) {
      throw new ApolloError(
        "Invalid uri. Please provide uri of form http(s)://www.{path}.{domain}"
      )
    }
  }

  private async validateBrandAndProductParams(route, record) {
    if (["Brand", "Product"].includes(route) && !record) {
      throw new ApolloError(
        `Must provide record params if routing to a ${route} view`
      )
    }
    if (!!record && !["Brand", "Product"].includes(route)) {
      throw new ApolloError(
        "Must provide route Brand or Product if providing record params"
      )
    }
    if (!!record && route === "Brand") {
      await this.validateRecordIdSlugCombo("brand", record.id, record.slug)
    }
    if (!!record && route === "Product") {
      await this.validateRecordIdSlugCombo("product", record.id, record.slug)
    }
  }

  private async validateRecordIdSlugCombo(
    recordName: "product" | "brand",
    id,
    slug
  ) {
    const recordById = await this.prisma.client[recordName]({ id })
    const recordBySlug = await this.prisma.client[recordName]({
      slug,
    })
    if (!recordById) {
      throw new ApolloError(`no ${recordName} with id ${id} found`)
    }
    if (!recordBySlug) {
      throw new ApolloError(`no ${recordName} with slug ${slug} found`)
    }
    if (recordById.slug !== recordBySlug.slug) {
      throw new ApolloError(
        `id ${id} and slug ${slug} correspond to different ${recordName}s`
      )
    }
  }
}
