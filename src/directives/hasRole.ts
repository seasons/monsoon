import { UserRole } from "@app/prisma"
import { PrismaService } from "@app/prisma/prisma.service"
import { intersection } from "lodash"

import { getEnforcedUser } from "./utils"

const prisma = new PrismaService()

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
  const _user = await prisma.client2.user.findUnique({
    where: { id: userID },
    select: { id: true, roles: true },
  })
  const user = prisma.sanitizePayload(_user, "User")
  const roles = (user.roles as unknown) as string[]

  // Set flags so admin-related contextual work can happen. e.g Admin Audit logging
  ctx.isAdminAction = permissibleRoles.includes("Admin")
  ctx.isMutation = ctx.req.body.query?.includes("mutation")
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
