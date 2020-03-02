import { isAuthenticated } from "./isAuthenticated"
import { isOwner } from "./isOwner"

export const directiveResolvers = {
  isAuthenticated,
  isOwner
}
