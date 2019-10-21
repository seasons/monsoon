import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { customer } from "./Mutation/customer"
import { User } from "./User"
import { ProductMutations } from "./Product"

export default {
  Query,
  Mutation: {
    ...auth,
    ...ProductMutations,
    ...customer,
  },
  User,
}
