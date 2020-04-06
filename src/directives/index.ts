import { hasRole } from "./hasRole"
import { isAuthenticated } from "./isAuthenticated"
import { isOwner } from "./isOwner"
import { isOwnerOrHasRole } from "./isOwnerOrHasRole"

export const directiveResolvers = {
  isAuthenticated,
  isOwner,
  isOwnerOrHasRole,
  hasRole,
}
