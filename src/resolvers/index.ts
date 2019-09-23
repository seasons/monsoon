import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { User } from "./User"
import { Product } from "./Product"

export default {
  Query,
  Mutation: {
    ...auth,
  },
  User,
  Product,
}
