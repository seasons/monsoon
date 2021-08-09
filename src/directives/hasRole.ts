import { readClient } from "@app/prisma/prisma.service"
import { UserRole } from "@prisma/client"
import { intersection } from "lodash"

import { getEnforcedUser } from "./utils"

// TODO: We should get the user roles from the context. We shouldn't need to do a DB query here.
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
  const user = await readClient.user.findUnique({
    where: { id: userID },
    select: { id: true, roles: true },
  })
  const roles = (user.roles as unknown) as string[]

  // Set flags so admin-related contextual work can happen. e.g Admin Audit logging
  ctx.isAdminAction = permissibleRoles.includes("Admin")
  ctx.activeUserIsAdmin = roles.includes("Admin")

  if (intersection(permissibleRoles, roles).length === 0) {
    if (nullable) {
      return null
    }
    throw new Error(
      `Unauthorized. Permissible role(s): ${permissibleRoles}. User role(s): ${roles}`
    )
  }
  return next()
}
