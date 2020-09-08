import { UserRole } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { intersection } from "lodash"

import { getEnforcedUser } from "./utils"

export async function hasRole(
  next,
  _,
  {
    roles: permissibleRoles,
    nullable = false,
  }: { roles: [UserRole]; nullable?: boolean },
  ctx
) {
  const userID = getEnforcedUser(ctx).id
  const userRoles = await new PrismaService().client
    .user({ id: userID })
    .roles()

  // Set a flag so admin-related contextual work can happen. e.g Admin Audit logging
  ctx.isAdminAction = permissibleRoles.includes("Admin")

  if (intersection(permissibleRoles, userRoles).length === 0) {
    if (nullable) {
      return null
    }
    throw new Error(
      `Unauthorized. Permissible role(s): ${permissibleRoles}. User role(s): ${userRoles}`
    )
  }
  return next()
}
