import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { customer } from "./Mutation/customer"
import { User } from "./User"

export default {
  Query,
  Mutation: {
    ...auth,
    ...customer,
  },
  User,
}
