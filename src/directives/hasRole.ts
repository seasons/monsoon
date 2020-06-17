import { PrismaService } from "@app/prisma/prisma.service"
import { intersection } from "lodash"

import { getEnforcedUser } from "./utils"

export async function hasRole(next, _, { roles: permissibleRoles }, ctx) {
  const userID = getEnforcedUser(ctx).id
  const userRoles = await new PrismaService().client
    .user({ id: userID })
    .roles()

  if (intersection(permissibleRoles, userRoles).length === 0) {
    throw new Error(
      `Unauthorized. Permissible role(s): ${permissibleRoles}. User role(s): ${userRoles}`
    )
  }
  return next()
}
