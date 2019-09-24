import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { User } from "./User"

export default {
  Query,
  Mutation: {
    ...auth,
  },
  User,
}
