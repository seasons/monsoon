import { getUserFromContext } from "../../auth/utils"
import { Context } from "../../utils"

export const UpdateUserPushNotifications = {
  async updateUserPushNotifications(
    parent,
    { pushNotificationsStatus },
    ctx: Context,
    info
  ) {
    const user = await getUserFromContext(ctx)
    if (!user) {
      throw new Error("Missing user from context")
    }

    const updatedUser = await ctx.prisma.updateUser({
      where: {
        id: user.id,
      },
      data: { pushNotifications: pushNotificationsStatus },
    })

    return updatedUser
  },
}
