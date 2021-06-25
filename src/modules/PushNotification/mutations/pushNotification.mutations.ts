import { Select } from "@app/decorators/select.decorator"
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
  async pushNotifyUser() {
    throw new Error(`Deprecated. Use pushNotifyUsers (plural)`)
  }

  @Mutation()
  async pushNotifyUsers(
    @Args()
    { where, data: { title, body, route, uri, record } },
    @Select() select
  ) {
    await this.validatePushNotifDataInputs(route, record, uri)

    // Validate the user
    const _customers = await this.prisma.client2.customer.findMany({
      where,
      select: { id: true, user: { select: { id: true, email: true } } },
    })
    const customers = this.prisma.sanitizePayload(_customers, "Customer")
    if (customers.length === 0) {
      throw new ApolloError(`No users found on that criteria`)
    }

    // Send the notif
    const receipt = await this.pushNotifications.pushNotifyUsers({
      emails: customers.map(a => a.user.email),
      pushNotifID: "Custom",
      vars: { title, body, route, uri, ...pick(record, ["id", "slug"]) },
      select,
    })

    return receipt
  }

  @Mutation()
  async pushNotifyInterest(
    @Args()
    { interest, data: { title, body, route, uri, record }, debug = false },
    @Select() select
  ) {
    await this.validatePushNotifDataInputs(route, record, uri)

    // Send the notif
    const receipt = await this.pushNotifications.pushNotifyInterest({
      interest: kebabCase(interest) as PushNotificationInterest,
      pushNotifID: "Custom",
      vars: { title, body, route, uri, ...pick(record, ["id", "slug"]) },
      select,
      debug,
    })
    return receipt
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
    const recordById = ((await this.prisma.client2[
      recordName
    ]) as any).findUnique({
      where: { id },
    })
    const recordBySlug = ((await this.prisma.client2[
      recordName
    ]) as any).findUnique({
      where: { slug },
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
