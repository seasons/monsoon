import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { customer } from "./Mutation/customer"
import { Me } from "./Me"
import { HomepageResult } from "./Homepage"
import { ProductMutations } from "./Product"
import { Reservation } from "./Reservation"

export default {
  Query,
  HomepageResult,
  Mutation: {
    ...auth,
    ...ProductMutations,
    ...customer,
  },
  Me,
  Reservation,
}
