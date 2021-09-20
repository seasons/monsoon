import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader } from "@app/prisma/prisma.loader"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"
import moment from "moment"
import urlencode from "urlencode"

@Resolver("User")
export class UserFieldsResolver {
  constructor(
    private readonly pushNotification: PushNotificationService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async beamsToken(@Parent() user) {
    if (!user) {
      return ""
    }
    return this.pushNotification.generateToken(user.email)
  }

  @ResolveField()
  async links(@Parent() user) {
    return {
      mixpanel: `https://mixpanel.com/report/2195096/view/361951/profile#distinct_id=${user.id}`,
      intercom: `https://app.intercom.com/a/apps/dtqi42qh/users/segments/all-users?searchTerm=${user.email}`,
      sendgrid:
        `https://app.sendgrid.com/email_activity?filters=` +
        urlencode(
          `[{"val":["${
            user.email
          }"],"selectedFieldName":"to_email","comparisonType":"Contains"},{"val":["${moment()
            .subtract(30, "days")
            .format(`YYYY/MM/DD`)} - ${moment().format(
            `YYYY/MM/DD`
          )}"],"selectedFieldName":"last_event_time","comparisonType":"Between"}]`
        ) +
        `&isAndOperator=true&page=1`,
      chargebee: `https://seasons.chargebee.com/customers?view_code=all&Customers.search=${user.email}`,
    }
  }

  @ResolveField()
  async fullName(
    @Parent() user,
    @Loader({
      params: {
        model: "User",
        select: { id: true, firstName: true, lastName: true },
        formatData: rec => `${rec.firstName} ${rec.lastName}`,
      },
    })
    userNameLoader: PrismaDataLoader<any>
  ) {
    if (!user) {
      return ""
    }
    return userNameLoader.load(user.id)
  }

  @ResolveField()
  async customer(
    @Parent() user,
    @Loader({
      params: {
        model: "Customer",
        infoFragment: `fragment EnsureUserWithId on Customer {user {id}}`,
        formatWhere: ids => ({ user: { id: { in: ids } } }),
        getKeys: a => [a.user.id],
        fallbackValue: null,
      },
      includeInfo: true,
    })
    customersLoader: PrismaDataLoader<any>
  ) {
    if (!user) {
      return null
    }

    return customersLoader.load(user.id)
  }

  @ResolveField()
  async completeAccountURL() {
    throw new Error(`Deprecated`)
  }
}
