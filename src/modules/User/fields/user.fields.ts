import { Loader } from "@app/modules/DataLoader/decorators/dataloader.decorator"
import { PushNotificationService } from "@app/modules/PushNotification/services/pushNotification.service"
import { UtilsService } from "@app/modules/Utils/services/utils.service"
import { PrismaDataLoader, PrismaLoader } from "@app/prisma/prisma.loader"
import { PrismaService } from "@app/prisma/prisma.service"
import { Parent, ResolveField, Resolver } from "@nestjs/graphql"

@Resolver("User")
export class UserFieldsResolver {
  constructor(
    private readonly pushNotification: PushNotificationService,
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService
  ) {}

  @ResolveField()
  async beamsToken(
    @Parent() user,
    @Loader({
      params: {
        query: "users",
        info: `{id email}`,
        formatData: a => a.email,
      },
    })
    userEmailLoader: PrismaDataLoader<string>
  ) {
    if (!user) {
      return ""
    }
    const userEmail = await userEmailLoader.load(user.id)
    return this.pushNotification.generateToken(userEmail)
  }

  @ResolveField()
  async fullName(
    @Parent() user,
    @Loader({
      params: {
        query: "users",
        info: `{id firstName lastName}`,
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
        query: "customers",
        infoFragment: `fragment EnsureUserWithId on Customer {user {id}}`,
        formatWhere: ids => ({ user: { id_in: ids } }),
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
  async completeAccountURL(@Parent() user) {
    const idHash = this.utils.encryptUserIDHash(user.id)
    return `${process.env.SEEDLING_URL}/complete?idHash=${idHash}`
  }
}
