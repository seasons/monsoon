import { isAuthenticated } from "./isAuthenticated"
import { isOwner } from "./isOwner"
import { isOwnerOrHasRole } from "./isOwnerOrHasRole"
import { hasRole } from "./hasRole"

export const directiveResolvers = {
  isAuthenticated,
  isOwner,
  isOwnerOrHasRole,
  hasRole,
}
