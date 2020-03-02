import { isAuthenticated } from "./isAuthenticated"
import { isOwner } from "./isOwner"
import { hasRole } from "./hasRole"

export const directiveResolvers = {
  isAuthenticated,
  isOwner,
  hasRole
}
