import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { customer } from "./Mutation/customer"
import { Me } from "./Me"
import { HomepageResult } from "./Homepage"
import { Product, ProductMutations } from "./Product"
import { Reservation } from "./Reservation"
import { PhysicalProduct } from "./PhysicalProduct"

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
  PhysicalProduct,
  Product,
}
