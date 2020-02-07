import { Query } from "./Query"
import { auth } from "./Mutation/auth"
import { customer } from "./Mutation/customer"
import { Me } from "./Me"
import { HomepageResult } from "./Homepage"
import { Product, ProductMutations } from "./Product"
import { ProductRequestMutations } from "./ProductRequest"
import { Reservation } from "./Reservation"
import { PhysicalProduct } from "./PhysicalProduct"
import { ProductVariant } from "./ProductVariant"
import { bag } from "./Mutation/bag"
import { address } from "./Mutation/address"

export default {
  Query,
  HomepageResult,
  Mutation: {
    ...auth,
    ...ProductMutations,
    ...ProductRequestMutations,
    ...customer,
    ...bag,
    ...address,
  },
  Me,
  Reservation,
  PhysicalProduct,
  Product,
  ProductVariant,
}
