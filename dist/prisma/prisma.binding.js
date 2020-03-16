"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_binding_1 = require("prisma-binding");
/**
 * Type Defs
*/
const typeDefs = `type AggregateBagItem {
  count: Int!
}

type AggregateBillingInfo {
  count: Int!
}

type AggregateBrand {
  count: Int!
}

type AggregateCategory {
  count: Int!
}

type AggregateCollection {
  count: Int!
}

type AggregateCollectionGroup {
  count: Int!
}

type AggregateColor {
  count: Int!
}

type AggregateCustomer {
  count: Int!
}

type AggregateCustomerDetail {
  count: Int!
}

type AggregateHomepageProductRail {
  count: Int!
}

type AggregateImage {
  count: Int!
}

type AggregateLabel {
  count: Int!
}

type AggregateLocation {
  count: Int!
}

type AggregateOrder {
  count: Int!
}

type AggregatePackage {
  count: Int!
}

type AggregatePhysicalProduct {
  count: Int!
}

type AggregateProduct {
  count: Int!
}

type AggregateProductFunction {
  count: Int!
}

type AggregateProductRequest {
  count: Int!
}

type AggregateProductVariant {
  count: Int!
}

type AggregateRecentlyViewedProduct {
  count: Int!
}

type AggregateReservation {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type BagItem implements Node {
  id: ID!
  customer: Customer!
  productVariant: ProductVariant!
  position: Int
  saved: Boolean
  status: BagItemStatus!
}

"""A connection to a list of items."""
type BagItemConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [BagItemEdge]!
  aggregate: AggregateBagItem!
}

input BagItemCreateInput {
  id: ID
  position: Int
  saved: Boolean
  status: BagItemStatus!
  customer: CustomerCreateOneInput!
  productVariant: ProductVariantCreateOneInput!
}

"""An edge in a connection."""
type BagItemEdge {
  """The item at the end of the edge."""
  node: BagItem!

  """A cursor for use in pagination."""
  cursor: String!
}

enum BagItemOrderByInput {
  id_ASC
  id_DESC
  position_ASC
  position_DESC
  saved_ASC
  saved_DESC
  status_ASC
  status_DESC
}

type BagItemPreviousValues {
  id: ID!
  position: Int
  saved: Boolean
  status: BagItemStatus!
}

enum BagItemStatus {
  Added
  Reserved
  Received
}

type BagItemSubscriptionPayload {
  mutation: MutationType!
  node: BagItem
  updatedFields: [String!]
  previousValues: BagItemPreviousValues
}

input BagItemSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [BagItemSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [BagItemSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BagItemSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: BagItemWhereInput
}

input BagItemUpdateInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
  customer: CustomerUpdateOneRequiredInput
  productVariant: ProductVariantUpdateOneRequiredInput
}

input BagItemUpdateManyMutationInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
}

input BagItemWhereInput {
  """Logical AND on all given filters."""
  AND: [BagItemWhereInput!]

  """Logical OR on all given filters."""
  OR: [BagItemWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BagItemWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  position: Int

  """All values that are not equal to given value."""
  position_not: Int

  """All values that are contained in given list."""
  position_in: [Int!]

  """All values that are not contained in given list."""
  position_not_in: [Int!]

  """All values less than the given value."""
  position_lt: Int

  """All values less than or equal the given value."""
  position_lte: Int

  """All values greater than the given value."""
  position_gt: Int

  """All values greater than or equal the given value."""
  position_gte: Int
  saved: Boolean

  """All values that are not equal to given value."""
  saved_not: Boolean
  status: BagItemStatus

  """All values that are not equal to given value."""
  status_not: BagItemStatus

  """All values that are contained in given list."""
  status_in: [BagItemStatus!]

  """All values that are not contained in given list."""
  status_not_in: [BagItemStatus!]
  customer: CustomerWhereInput
  productVariant: ProductVariantWhereInput
}

input BagItemWhereUniqueInput {
  id: ID
}

type BatchPayload {
  """The number of nodes that have been affected by the Batch operation."""
  count: Long!
}

type BillingInfo implements Node {
  id: ID!
  brand: String!
  name: String
  last_digits: String!
  expiration_month: Int!
  expiration_year: Int!
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

"""A connection to a list of items."""
type BillingInfoConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [BillingInfoEdge]!
  aggregate: AggregateBillingInfo!
}

input BillingInfoCreateInput {
  id: ID
  brand: String!
  name: String
  last_digits: String!
  expiration_month: Int!
  expiration_year: Int!
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

input BillingInfoCreateOneInput {
  create: BillingInfoCreateInput
  connect: BillingInfoWhereUniqueInput
}

"""An edge in a connection."""
type BillingInfoEdge {
  """The item at the end of the edge."""
  node: BillingInfo!

  """A cursor for use in pagination."""
  cursor: String!
}

enum BillingInfoOrderByInput {
  id_ASC
  id_DESC
  brand_ASC
  brand_DESC
  name_ASC
  name_DESC
  last_digits_ASC
  last_digits_DESC
  expiration_month_ASC
  expiration_month_DESC
  expiration_year_ASC
  expiration_year_DESC
  street1_ASC
  street1_DESC
  street2_ASC
  street2_DESC
  city_ASC
  city_DESC
  state_ASC
  state_DESC
  country_ASC
  country_DESC
  postal_code_ASC
  postal_code_DESC
}

type BillingInfoPreviousValues {
  id: ID!
  brand: String!
  name: String
  last_digits: String!
  expiration_month: Int!
  expiration_year: Int!
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

type BillingInfoSubscriptionPayload {
  mutation: MutationType!
  node: BillingInfo
  updatedFields: [String!]
  previousValues: BillingInfoPreviousValues
}

input BillingInfoSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [BillingInfoSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [BillingInfoSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BillingInfoSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: BillingInfoWhereInput
}

input BillingInfoUpdateDataInput {
  brand: String
  name: String
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

input BillingInfoUpdateInput {
  brand: String
  name: String
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

input BillingInfoUpdateManyMutationInput {
  brand: String
  name: String
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1: String
  street2: String
  city: String
  state: String
  country: String
  postal_code: String
}

input BillingInfoUpdateOneInput {
  create: BillingInfoCreateInput
  connect: BillingInfoWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: BillingInfoUpdateDataInput
  upsert: BillingInfoUpsertNestedInput
}

input BillingInfoUpsertNestedInput {
  update: BillingInfoUpdateDataInput!
  create: BillingInfoCreateInput!
}

input BillingInfoWhereInput {
  """Logical AND on all given filters."""
  AND: [BillingInfoWhereInput!]

  """Logical OR on all given filters."""
  OR: [BillingInfoWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BillingInfoWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  brand: String

  """All values that are not equal to given value."""
  brand_not: String

  """All values that are contained in given list."""
  brand_in: [String!]

  """All values that are not contained in given list."""
  brand_not_in: [String!]

  """All values less than the given value."""
  brand_lt: String

  """All values less than or equal the given value."""
  brand_lte: String

  """All values greater than the given value."""
  brand_gt: String

  """All values greater than or equal the given value."""
  brand_gte: String

  """All values containing the given string."""
  brand_contains: String

  """All values not containing the given string."""
  brand_not_contains: String

  """All values starting with the given string."""
  brand_starts_with: String

  """All values not starting with the given string."""
  brand_not_starts_with: String

  """All values ending with the given string."""
  brand_ends_with: String

  """All values not ending with the given string."""
  brand_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  last_digits: String

  """All values that are not equal to given value."""
  last_digits_not: String

  """All values that are contained in given list."""
  last_digits_in: [String!]

  """All values that are not contained in given list."""
  last_digits_not_in: [String!]

  """All values less than the given value."""
  last_digits_lt: String

  """All values less than or equal the given value."""
  last_digits_lte: String

  """All values greater than the given value."""
  last_digits_gt: String

  """All values greater than or equal the given value."""
  last_digits_gte: String

  """All values containing the given string."""
  last_digits_contains: String

  """All values not containing the given string."""
  last_digits_not_contains: String

  """All values starting with the given string."""
  last_digits_starts_with: String

  """All values not starting with the given string."""
  last_digits_not_starts_with: String

  """All values ending with the given string."""
  last_digits_ends_with: String

  """All values not ending with the given string."""
  last_digits_not_ends_with: String
  expiration_month: Int

  """All values that are not equal to given value."""
  expiration_month_not: Int

  """All values that are contained in given list."""
  expiration_month_in: [Int!]

  """All values that are not contained in given list."""
  expiration_month_not_in: [Int!]

  """All values less than the given value."""
  expiration_month_lt: Int

  """All values less than or equal the given value."""
  expiration_month_lte: Int

  """All values greater than the given value."""
  expiration_month_gt: Int

  """All values greater than or equal the given value."""
  expiration_month_gte: Int
  expiration_year: Int

  """All values that are not equal to given value."""
  expiration_year_not: Int

  """All values that are contained in given list."""
  expiration_year_in: [Int!]

  """All values that are not contained in given list."""
  expiration_year_not_in: [Int!]

  """All values less than the given value."""
  expiration_year_lt: Int

  """All values less than or equal the given value."""
  expiration_year_lte: Int

  """All values greater than the given value."""
  expiration_year_gt: Int

  """All values greater than or equal the given value."""
  expiration_year_gte: Int
  street1: String

  """All values that are not equal to given value."""
  street1_not: String

  """All values that are contained in given list."""
  street1_in: [String!]

  """All values that are not contained in given list."""
  street1_not_in: [String!]

  """All values less than the given value."""
  street1_lt: String

  """All values less than or equal the given value."""
  street1_lte: String

  """All values greater than the given value."""
  street1_gt: String

  """All values greater than or equal the given value."""
  street1_gte: String

  """All values containing the given string."""
  street1_contains: String

  """All values not containing the given string."""
  street1_not_contains: String

  """All values starting with the given string."""
  street1_starts_with: String

  """All values not starting with the given string."""
  street1_not_starts_with: String

  """All values ending with the given string."""
  street1_ends_with: String

  """All values not ending with the given string."""
  street1_not_ends_with: String
  street2: String

  """All values that are not equal to given value."""
  street2_not: String

  """All values that are contained in given list."""
  street2_in: [String!]

  """All values that are not contained in given list."""
  street2_not_in: [String!]

  """All values less than the given value."""
  street2_lt: String

  """All values less than or equal the given value."""
  street2_lte: String

  """All values greater than the given value."""
  street2_gt: String

  """All values greater than or equal the given value."""
  street2_gte: String

  """All values containing the given string."""
  street2_contains: String

  """All values not containing the given string."""
  street2_not_contains: String

  """All values starting with the given string."""
  street2_starts_with: String

  """All values not starting with the given string."""
  street2_not_starts_with: String

  """All values ending with the given string."""
  street2_ends_with: String

  """All values not ending with the given string."""
  street2_not_ends_with: String
  city: String

  """All values that are not equal to given value."""
  city_not: String

  """All values that are contained in given list."""
  city_in: [String!]

  """All values that are not contained in given list."""
  city_not_in: [String!]

  """All values less than the given value."""
  city_lt: String

  """All values less than or equal the given value."""
  city_lte: String

  """All values greater than the given value."""
  city_gt: String

  """All values greater than or equal the given value."""
  city_gte: String

  """All values containing the given string."""
  city_contains: String

  """All values not containing the given string."""
  city_not_contains: String

  """All values starting with the given string."""
  city_starts_with: String

  """All values not starting with the given string."""
  city_not_starts_with: String

  """All values ending with the given string."""
  city_ends_with: String

  """All values not ending with the given string."""
  city_not_ends_with: String
  state: String

  """All values that are not equal to given value."""
  state_not: String

  """All values that are contained in given list."""
  state_in: [String!]

  """All values that are not contained in given list."""
  state_not_in: [String!]

  """All values less than the given value."""
  state_lt: String

  """All values less than or equal the given value."""
  state_lte: String

  """All values greater than the given value."""
  state_gt: String

  """All values greater than or equal the given value."""
  state_gte: String

  """All values containing the given string."""
  state_contains: String

  """All values not containing the given string."""
  state_not_contains: String

  """All values starting with the given string."""
  state_starts_with: String

  """All values not starting with the given string."""
  state_not_starts_with: String

  """All values ending with the given string."""
  state_ends_with: String

  """All values not ending with the given string."""
  state_not_ends_with: String
  country: String

  """All values that are not equal to given value."""
  country_not: String

  """All values that are contained in given list."""
  country_in: [String!]

  """All values that are not contained in given list."""
  country_not_in: [String!]

  """All values less than the given value."""
  country_lt: String

  """All values less than or equal the given value."""
  country_lte: String

  """All values greater than the given value."""
  country_gt: String

  """All values greater than or equal the given value."""
  country_gte: String

  """All values containing the given string."""
  country_contains: String

  """All values not containing the given string."""
  country_not_contains: String

  """All values starting with the given string."""
  country_starts_with: String

  """All values not starting with the given string."""
  country_not_starts_with: String

  """All values ending with the given string."""
  country_ends_with: String

  """All values not ending with the given string."""
  country_not_ends_with: String
  postal_code: String

  """All values that are not equal to given value."""
  postal_code_not: String

  """All values that are contained in given list."""
  postal_code_in: [String!]

  """All values that are not contained in given list."""
  postal_code_not_in: [String!]

  """All values less than the given value."""
  postal_code_lt: String

  """All values less than or equal the given value."""
  postal_code_lte: String

  """All values greater than the given value."""
  postal_code_gt: String

  """All values greater than or equal the given value."""
  postal_code_gte: String

  """All values containing the given string."""
  postal_code_contains: String

  """All values not containing the given string."""
  postal_code_not_contains: String

  """All values starting with the given string."""
  postal_code_starts_with: String

  """All values not starting with the given string."""
  postal_code_not_starts_with: String

  """All values ending with the given string."""
  postal_code_ends_with: String

  """All values not ending with the given string."""
  postal_code_not_ends_with: String
}

input BillingInfoWhereUniqueInput {
  id: ID
}

type Brand implements Node {
  id: ID!
  slug: String!
  brandCode: String!
  description: String
  isPrimaryBrand: Boolean!
  logo: Json
  name: String!
  basedIn: String
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
  since: DateTime
  tier: BrandTier!
  websiteUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type BrandConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [BrandEdge]!
  aggregate: AggregateBrand!
}

input BrandCreateInput {
  id: ID
  slug: String!
  brandCode: String!
  description: String
  isPrimaryBrand: Boolean
  logo: Json
  name: String!
  basedIn: String
  since: DateTime
  tier: BrandTier!
  websiteUrl: String
  products: ProductCreateManyWithoutBrandInput
}

input BrandCreateOneWithoutProductsInput {
  create: BrandCreateWithoutProductsInput
  connect: BrandWhereUniqueInput
}

input BrandCreateWithoutProductsInput {
  id: ID
  slug: String!
  brandCode: String!
  description: String
  isPrimaryBrand: Boolean
  logo: Json
  name: String!
  basedIn: String
  since: DateTime
  tier: BrandTier!
  websiteUrl: String
}

"""An edge in a connection."""
type BrandEdge {
  """The item at the end of the edge."""
  node: Brand!

  """A cursor for use in pagination."""
  cursor: String!
}

enum BrandOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  brandCode_ASC
  brandCode_DESC
  description_ASC
  description_DESC
  isPrimaryBrand_ASC
  isPrimaryBrand_DESC
  logo_ASC
  logo_DESC
  name_ASC
  name_DESC
  basedIn_ASC
  basedIn_DESC
  since_ASC
  since_DESC
  tier_ASC
  tier_DESC
  websiteUrl_ASC
  websiteUrl_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type BrandPreviousValues {
  id: ID!
  slug: String!
  brandCode: String!
  description: String
  isPrimaryBrand: Boolean!
  logo: Json
  name: String!
  basedIn: String
  since: DateTime
  tier: BrandTier!
  websiteUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type BrandSubscriptionPayload {
  mutation: MutationType!
  node: Brand
  updatedFields: [String!]
  previousValues: BrandPreviousValues
}

input BrandSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [BrandSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [BrandSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BrandSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: BrandWhereInput
}

enum BrandTier {
  Tier0
  Tier1
  Tier2
  Niche
  Upcoming
  Retro
  Boutique
  Local
  Discovery
}

input BrandUpdateInput {
  slug: String
  brandCode: String
  description: String
  isPrimaryBrand: Boolean
  logo: Json
  name: String
  basedIn: String
  since: DateTime
  tier: BrandTier
  websiteUrl: String
  products: ProductUpdateManyWithoutBrandInput
}

input BrandUpdateManyMutationInput {
  slug: String
  brandCode: String
  description: String
  isPrimaryBrand: Boolean
  logo: Json
  name: String
  basedIn: String
  since: DateTime
  tier: BrandTier
  websiteUrl: String
}

input BrandUpdateOneRequiredWithoutProductsInput {
  create: BrandCreateWithoutProductsInput
  connect: BrandWhereUniqueInput
  update: BrandUpdateWithoutProductsDataInput
  upsert: BrandUpsertWithoutProductsInput
}

input BrandUpdateWithoutProductsDataInput {
  slug: String
  brandCode: String
  description: String
  isPrimaryBrand: Boolean
  logo: Json
  name: String
  basedIn: String
  since: DateTime
  tier: BrandTier
  websiteUrl: String
}

input BrandUpsertWithoutProductsInput {
  update: BrandUpdateWithoutProductsDataInput!
  create: BrandCreateWithoutProductsInput!
}

input BrandWhereInput {
  """Logical AND on all given filters."""
  AND: [BrandWhereInput!]

  """Logical OR on all given filters."""
  OR: [BrandWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BrandWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  brandCode: String

  """All values that are not equal to given value."""
  brandCode_not: String

  """All values that are contained in given list."""
  brandCode_in: [String!]

  """All values that are not contained in given list."""
  brandCode_not_in: [String!]

  """All values less than the given value."""
  brandCode_lt: String

  """All values less than or equal the given value."""
  brandCode_lte: String

  """All values greater than the given value."""
  brandCode_gt: String

  """All values greater than or equal the given value."""
  brandCode_gte: String

  """All values containing the given string."""
  brandCode_contains: String

  """All values not containing the given string."""
  brandCode_not_contains: String

  """All values starting with the given string."""
  brandCode_starts_with: String

  """All values not starting with the given string."""
  brandCode_not_starts_with: String

  """All values ending with the given string."""
  brandCode_ends_with: String

  """All values not ending with the given string."""
  brandCode_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  isPrimaryBrand: Boolean

  """All values that are not equal to given value."""
  isPrimaryBrand_not: Boolean
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  basedIn: String

  """All values that are not equal to given value."""
  basedIn_not: String

  """All values that are contained in given list."""
  basedIn_in: [String!]

  """All values that are not contained in given list."""
  basedIn_not_in: [String!]

  """All values less than the given value."""
  basedIn_lt: String

  """All values less than or equal the given value."""
  basedIn_lte: String

  """All values greater than the given value."""
  basedIn_gt: String

  """All values greater than or equal the given value."""
  basedIn_gte: String

  """All values containing the given string."""
  basedIn_contains: String

  """All values not containing the given string."""
  basedIn_not_contains: String

  """All values starting with the given string."""
  basedIn_starts_with: String

  """All values not starting with the given string."""
  basedIn_not_starts_with: String

  """All values ending with the given string."""
  basedIn_ends_with: String

  """All values not ending with the given string."""
  basedIn_not_ends_with: String
  since: DateTime

  """All values that are not equal to given value."""
  since_not: DateTime

  """All values that are contained in given list."""
  since_in: [DateTime!]

  """All values that are not contained in given list."""
  since_not_in: [DateTime!]

  """All values less than the given value."""
  since_lt: DateTime

  """All values less than or equal the given value."""
  since_lte: DateTime

  """All values greater than the given value."""
  since_gt: DateTime

  """All values greater than or equal the given value."""
  since_gte: DateTime
  tier: BrandTier

  """All values that are not equal to given value."""
  tier_not: BrandTier

  """All values that are contained in given list."""
  tier_in: [BrandTier!]

  """All values that are not contained in given list."""
  tier_not_in: [BrandTier!]
  websiteUrl: String

  """All values that are not equal to given value."""
  websiteUrl_not: String

  """All values that are contained in given list."""
  websiteUrl_in: [String!]

  """All values that are not contained in given list."""
  websiteUrl_not_in: [String!]

  """All values less than the given value."""
  websiteUrl_lt: String

  """All values less than or equal the given value."""
  websiteUrl_lte: String

  """All values greater than the given value."""
  websiteUrl_gt: String

  """All values greater than or equal the given value."""
  websiteUrl_gte: String

  """All values containing the given string."""
  websiteUrl_contains: String

  """All values not containing the given string."""
  websiteUrl_not_contains: String

  """All values starting with the given string."""
  websiteUrl_starts_with: String

  """All values not starting with the given string."""
  websiteUrl_not_starts_with: String

  """All values ending with the given string."""
  websiteUrl_ends_with: String

  """All values not ending with the given string."""
  websiteUrl_not_ends_with: String
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
}

input BrandWhereUniqueInput {
  id: ID
  slug: String
  brandCode: String
}

type Category implements Node {
  id: ID!
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
  children(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Category!]
}

"""A connection to a list of items."""
type CategoryConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [CategoryEdge]!
  aggregate: AggregateCategory!
}

input CategoryCreateInput {
  id: ID
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean
  products: ProductCreateManyWithoutCategoryInput
  children: CategoryCreateManyInput
}

input CategoryCreateManyInput {
  create: [CategoryCreateInput!]
  connect: [CategoryWhereUniqueInput!]
}

input CategoryCreateOneWithoutProductsInput {
  create: CategoryCreateWithoutProductsInput
  connect: CategoryWhereUniqueInput
}

input CategoryCreateWithoutProductsInput {
  id: ID
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean
  children: CategoryCreateManyInput
}

"""An edge in a connection."""
type CategoryEdge {
  """The item at the end of the edge."""
  node: Category!

  """A cursor for use in pagination."""
  cursor: String!
}

enum CategoryOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
  image_ASC
  image_DESC
  description_ASC
  description_DESC
  visible_ASC
  visible_DESC
}

type CategoryPreviousValues {
  id: ID!
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean!
}

input CategoryScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [CategoryScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [CategoryScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CategoryScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  visible: Boolean

  """All values that are not equal to given value."""
  visible_not: Boolean
}

type CategorySubscriptionPayload {
  mutation: MutationType!
  node: Category
  updatedFields: [String!]
  previousValues: CategoryPreviousValues
}

input CategorySubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [CategorySubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CategorySubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CategorySubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: CategoryWhereInput
}

input CategoryUpdateDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  products: ProductUpdateManyWithoutCategoryInput
  children: CategoryUpdateManyInput
}

input CategoryUpdateInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  products: ProductUpdateManyWithoutCategoryInput
  children: CategoryUpdateManyInput
}

input CategoryUpdateManyDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
}

input CategoryUpdateManyInput {
  create: [CategoryCreateInput!]
  connect: [CategoryWhereUniqueInput!]
  set: [CategoryWhereUniqueInput!]
  disconnect: [CategoryWhereUniqueInput!]
  delete: [CategoryWhereUniqueInput!]
  update: [CategoryUpdateWithWhereUniqueNestedInput!]
  updateMany: [CategoryUpdateManyWithWhereNestedInput!]
  deleteMany: [CategoryScalarWhereInput!]
  upsert: [CategoryUpsertWithWhereUniqueNestedInput!]
}

input CategoryUpdateManyMutationInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
}

input CategoryUpdateManyWithWhereNestedInput {
  where: CategoryScalarWhereInput!
  data: CategoryUpdateManyDataInput!
}

input CategoryUpdateOneRequiredWithoutProductsInput {
  create: CategoryCreateWithoutProductsInput
  connect: CategoryWhereUniqueInput
  update: CategoryUpdateWithoutProductsDataInput
  upsert: CategoryUpsertWithoutProductsInput
}

input CategoryUpdateWithoutProductsDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  children: CategoryUpdateManyInput
}

input CategoryUpdateWithWhereUniqueNestedInput {
  where: CategoryWhereUniqueInput!
  data: CategoryUpdateDataInput!
}

input CategoryUpsertWithoutProductsInput {
  update: CategoryUpdateWithoutProductsDataInput!
  create: CategoryCreateWithoutProductsInput!
}

input CategoryUpsertWithWhereUniqueNestedInput {
  where: CategoryWhereUniqueInput!
  update: CategoryUpdateDataInput!
  create: CategoryCreateInput!
}

input CategoryWhereInput {
  """Logical AND on all given filters."""
  AND: [CategoryWhereInput!]

  """Logical OR on all given filters."""
  OR: [CategoryWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CategoryWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  visible: Boolean

  """All values that are not equal to given value."""
  visible_not: Boolean
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  children_every: CategoryWhereInput
  children_some: CategoryWhereInput
  children_none: CategoryWhereInput
}

input CategoryWhereUniqueInput {
  id: ID
  slug: String
  name: String
}

type Collection implements Node {
  id: ID!
  slug: String!
  images: Json!
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

"""A connection to a list of items."""
type CollectionConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [CollectionEdge]!
  aggregate: AggregateCollection!
}

input CollectionCreateInput {
  id: ID
  slug: String!
  images: Json!
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
  products: ProductCreateManyInput
}

input CollectionCreateManyInput {
  create: [CollectionCreateInput!]
  connect: [CollectionWhereUniqueInput!]
}

"""An edge in a connection."""
type CollectionEdge {
  """The item at the end of the edge."""
  node: Collection!

  """A cursor for use in pagination."""
  cursor: String!
}

type CollectionGroup implements Node {
  id: ID!
  slug: String!
  title: String
  collectionCount: Int
  collections(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Collection!]
}

"""A connection to a list of items."""
type CollectionGroupConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [CollectionGroupEdge]!
  aggregate: AggregateCollectionGroup!
}

input CollectionGroupCreateInput {
  id: ID
  slug: String!
  title: String
  collectionCount: Int
  collections: CollectionCreateManyInput
}

"""An edge in a connection."""
type CollectionGroupEdge {
  """The item at the end of the edge."""
  node: CollectionGroup!

  """A cursor for use in pagination."""
  cursor: String!
}

enum CollectionGroupOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  title_ASC
  title_DESC
  collectionCount_ASC
  collectionCount_DESC
}

type CollectionGroupPreviousValues {
  id: ID!
  slug: String!
  title: String
  collectionCount: Int
}

type CollectionGroupSubscriptionPayload {
  mutation: MutationType!
  node: CollectionGroup
  updatedFields: [String!]
  previousValues: CollectionGroupPreviousValues
}

input CollectionGroupSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [CollectionGroupSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CollectionGroupSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CollectionGroupSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: CollectionGroupWhereInput
}

input CollectionGroupUpdateInput {
  slug: String
  title: String
  collectionCount: Int
  collections: CollectionUpdateManyInput
}

input CollectionGroupUpdateManyMutationInput {
  slug: String
  title: String
  collectionCount: Int
}

input CollectionGroupWhereInput {
  """Logical AND on all given filters."""
  AND: [CollectionGroupWhereInput!]

  """Logical OR on all given filters."""
  OR: [CollectionGroupWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CollectionGroupWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  title: String

  """All values that are not equal to given value."""
  title_not: String

  """All values that are contained in given list."""
  title_in: [String!]

  """All values that are not contained in given list."""
  title_not_in: [String!]

  """All values less than the given value."""
  title_lt: String

  """All values less than or equal the given value."""
  title_lte: String

  """All values greater than the given value."""
  title_gt: String

  """All values greater than or equal the given value."""
  title_gte: String

  """All values containing the given string."""
  title_contains: String

  """All values not containing the given string."""
  title_not_contains: String

  """All values starting with the given string."""
  title_starts_with: String

  """All values not starting with the given string."""
  title_not_starts_with: String

  """All values ending with the given string."""
  title_ends_with: String

  """All values not ending with the given string."""
  title_not_ends_with: String
  collectionCount: Int

  """All values that are not equal to given value."""
  collectionCount_not: Int

  """All values that are contained in given list."""
  collectionCount_in: [Int!]

  """All values that are not contained in given list."""
  collectionCount_not_in: [Int!]

  """All values less than the given value."""
  collectionCount_lt: Int

  """All values less than or equal the given value."""
  collectionCount_lte: Int

  """All values greater than the given value."""
  collectionCount_gt: Int

  """All values greater than or equal the given value."""
  collectionCount_gte: Int
  collections_every: CollectionWhereInput
  collections_some: CollectionWhereInput
  collections_none: CollectionWhereInput
}

input CollectionGroupWhereUniqueInput {
  id: ID
  slug: String
}

enum CollectionOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  images_ASC
  images_DESC
  title_ASC
  title_DESC
  subTitle_ASC
  subTitle_DESC
  descriptionTop_ASC
  descriptionTop_DESC
  descriptionBottom_ASC
  descriptionBottom_DESC
}

type CollectionPreviousValues {
  id: ID!
  slug: String!
  images: Json!
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
}

input CollectionScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [CollectionScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [CollectionScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CollectionScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  title: String

  """All values that are not equal to given value."""
  title_not: String

  """All values that are contained in given list."""
  title_in: [String!]

  """All values that are not contained in given list."""
  title_not_in: [String!]

  """All values less than the given value."""
  title_lt: String

  """All values less than or equal the given value."""
  title_lte: String

  """All values greater than the given value."""
  title_gt: String

  """All values greater than or equal the given value."""
  title_gte: String

  """All values containing the given string."""
  title_contains: String

  """All values not containing the given string."""
  title_not_contains: String

  """All values starting with the given string."""
  title_starts_with: String

  """All values not starting with the given string."""
  title_not_starts_with: String

  """All values ending with the given string."""
  title_ends_with: String

  """All values not ending with the given string."""
  title_not_ends_with: String
  subTitle: String

  """All values that are not equal to given value."""
  subTitle_not: String

  """All values that are contained in given list."""
  subTitle_in: [String!]

  """All values that are not contained in given list."""
  subTitle_not_in: [String!]

  """All values less than the given value."""
  subTitle_lt: String

  """All values less than or equal the given value."""
  subTitle_lte: String

  """All values greater than the given value."""
  subTitle_gt: String

  """All values greater than or equal the given value."""
  subTitle_gte: String

  """All values containing the given string."""
  subTitle_contains: String

  """All values not containing the given string."""
  subTitle_not_contains: String

  """All values starting with the given string."""
  subTitle_starts_with: String

  """All values not starting with the given string."""
  subTitle_not_starts_with: String

  """All values ending with the given string."""
  subTitle_ends_with: String

  """All values not ending with the given string."""
  subTitle_not_ends_with: String
  descriptionTop: String

  """All values that are not equal to given value."""
  descriptionTop_not: String

  """All values that are contained in given list."""
  descriptionTop_in: [String!]

  """All values that are not contained in given list."""
  descriptionTop_not_in: [String!]

  """All values less than the given value."""
  descriptionTop_lt: String

  """All values less than or equal the given value."""
  descriptionTop_lte: String

  """All values greater than the given value."""
  descriptionTop_gt: String

  """All values greater than or equal the given value."""
  descriptionTop_gte: String

  """All values containing the given string."""
  descriptionTop_contains: String

  """All values not containing the given string."""
  descriptionTop_not_contains: String

  """All values starting with the given string."""
  descriptionTop_starts_with: String

  """All values not starting with the given string."""
  descriptionTop_not_starts_with: String

  """All values ending with the given string."""
  descriptionTop_ends_with: String

  """All values not ending with the given string."""
  descriptionTop_not_ends_with: String
  descriptionBottom: String

  """All values that are not equal to given value."""
  descriptionBottom_not: String

  """All values that are contained in given list."""
  descriptionBottom_in: [String!]

  """All values that are not contained in given list."""
  descriptionBottom_not_in: [String!]

  """All values less than the given value."""
  descriptionBottom_lt: String

  """All values less than or equal the given value."""
  descriptionBottom_lte: String

  """All values greater than the given value."""
  descriptionBottom_gt: String

  """All values greater than or equal the given value."""
  descriptionBottom_gte: String

  """All values containing the given string."""
  descriptionBottom_contains: String

  """All values not containing the given string."""
  descriptionBottom_not_contains: String

  """All values starting with the given string."""
  descriptionBottom_starts_with: String

  """All values not starting with the given string."""
  descriptionBottom_not_starts_with: String

  """All values ending with the given string."""
  descriptionBottom_ends_with: String

  """All values not ending with the given string."""
  descriptionBottom_not_ends_with: String
}

type CollectionSubscriptionPayload {
  mutation: MutationType!
  node: Collection
  updatedFields: [String!]
  previousValues: CollectionPreviousValues
}

input CollectionSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [CollectionSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CollectionSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CollectionSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: CollectionWhereInput
}

input CollectionUpdateDataInput {
  slug: String
  images: Json
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
  products: ProductUpdateManyInput
}

input CollectionUpdateInput {
  slug: String
  images: Json
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
  products: ProductUpdateManyInput
}

input CollectionUpdateManyDataInput {
  slug: String
  images: Json
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
}

input CollectionUpdateManyInput {
  create: [CollectionCreateInput!]
  connect: [CollectionWhereUniqueInput!]
  set: [CollectionWhereUniqueInput!]
  disconnect: [CollectionWhereUniqueInput!]
  delete: [CollectionWhereUniqueInput!]
  update: [CollectionUpdateWithWhereUniqueNestedInput!]
  updateMany: [CollectionUpdateManyWithWhereNestedInput!]
  deleteMany: [CollectionScalarWhereInput!]
  upsert: [CollectionUpsertWithWhereUniqueNestedInput!]
}

input CollectionUpdateManyMutationInput {
  slug: String
  images: Json
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
}

input CollectionUpdateManyWithWhereNestedInput {
  where: CollectionScalarWhereInput!
  data: CollectionUpdateManyDataInput!
}

input CollectionUpdateWithWhereUniqueNestedInput {
  where: CollectionWhereUniqueInput!
  data: CollectionUpdateDataInput!
}

input CollectionUpsertWithWhereUniqueNestedInput {
  where: CollectionWhereUniqueInput!
  update: CollectionUpdateDataInput!
  create: CollectionCreateInput!
}

input CollectionWhereInput {
  """Logical AND on all given filters."""
  AND: [CollectionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CollectionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CollectionWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  title: String

  """All values that are not equal to given value."""
  title_not: String

  """All values that are contained in given list."""
  title_in: [String!]

  """All values that are not contained in given list."""
  title_not_in: [String!]

  """All values less than the given value."""
  title_lt: String

  """All values less than or equal the given value."""
  title_lte: String

  """All values greater than the given value."""
  title_gt: String

  """All values greater than or equal the given value."""
  title_gte: String

  """All values containing the given string."""
  title_contains: String

  """All values not containing the given string."""
  title_not_contains: String

  """All values starting with the given string."""
  title_starts_with: String

  """All values not starting with the given string."""
  title_not_starts_with: String

  """All values ending with the given string."""
  title_ends_with: String

  """All values not ending with the given string."""
  title_not_ends_with: String
  subTitle: String

  """All values that are not equal to given value."""
  subTitle_not: String

  """All values that are contained in given list."""
  subTitle_in: [String!]

  """All values that are not contained in given list."""
  subTitle_not_in: [String!]

  """All values less than the given value."""
  subTitle_lt: String

  """All values less than or equal the given value."""
  subTitle_lte: String

  """All values greater than the given value."""
  subTitle_gt: String

  """All values greater than or equal the given value."""
  subTitle_gte: String

  """All values containing the given string."""
  subTitle_contains: String

  """All values not containing the given string."""
  subTitle_not_contains: String

  """All values starting with the given string."""
  subTitle_starts_with: String

  """All values not starting with the given string."""
  subTitle_not_starts_with: String

  """All values ending with the given string."""
  subTitle_ends_with: String

  """All values not ending with the given string."""
  subTitle_not_ends_with: String
  descriptionTop: String

  """All values that are not equal to given value."""
  descriptionTop_not: String

  """All values that are contained in given list."""
  descriptionTop_in: [String!]

  """All values that are not contained in given list."""
  descriptionTop_not_in: [String!]

  """All values less than the given value."""
  descriptionTop_lt: String

  """All values less than or equal the given value."""
  descriptionTop_lte: String

  """All values greater than the given value."""
  descriptionTop_gt: String

  """All values greater than or equal the given value."""
  descriptionTop_gte: String

  """All values containing the given string."""
  descriptionTop_contains: String

  """All values not containing the given string."""
  descriptionTop_not_contains: String

  """All values starting with the given string."""
  descriptionTop_starts_with: String

  """All values not starting with the given string."""
  descriptionTop_not_starts_with: String

  """All values ending with the given string."""
  descriptionTop_ends_with: String

  """All values not ending with the given string."""
  descriptionTop_not_ends_with: String
  descriptionBottom: String

  """All values that are not equal to given value."""
  descriptionBottom_not: String

  """All values that are contained in given list."""
  descriptionBottom_in: [String!]

  """All values that are not contained in given list."""
  descriptionBottom_not_in: [String!]

  """All values less than the given value."""
  descriptionBottom_lt: String

  """All values less than or equal the given value."""
  descriptionBottom_lte: String

  """All values greater than the given value."""
  descriptionBottom_gt: String

  """All values greater than or equal the given value."""
  descriptionBottom_gte: String

  """All values containing the given string."""
  descriptionBottom_contains: String

  """All values not containing the given string."""
  descriptionBottom_not_contains: String

  """All values starting with the given string."""
  descriptionBottom_starts_with: String

  """All values not starting with the given string."""
  descriptionBottom_not_starts_with: String

  """All values ending with the given string."""
  descriptionBottom_ends_with: String

  """All values not ending with the given string."""
  descriptionBottom_not_ends_with: String
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
}

input CollectionWhereUniqueInput {
  id: ID
  slug: String
}

type Color implements Node {
  id: ID!
  slug: String!
  name: String!
  colorCode: String!
  hexCode: String!
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant!]
}

"""A connection to a list of items."""
type ColorConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ColorEdge]!
  aggregate: AggregateColor!
}

input ColorCreateInput {
  id: ID
  slug: String!
  name: String!
  colorCode: String!
  hexCode: String!
  productVariants: ProductVariantCreateManyWithoutColorInput
}

input ColorCreateOneInput {
  create: ColorCreateInput
  connect: ColorWhereUniqueInput
}

input ColorCreateOneWithoutProductVariantsInput {
  create: ColorCreateWithoutProductVariantsInput
  connect: ColorWhereUniqueInput
}

input ColorCreateWithoutProductVariantsInput {
  id: ID
  slug: String!
  name: String!
  colorCode: String!
  hexCode: String!
}

"""An edge in a connection."""
type ColorEdge {
  """The item at the end of the edge."""
  node: Color!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ColorOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
  colorCode_ASC
  colorCode_DESC
  hexCode_ASC
  hexCode_DESC
}

type ColorPreviousValues {
  id: ID!
  slug: String!
  name: String!
  colorCode: String!
  hexCode: String!
}

type ColorSubscriptionPayload {
  mutation: MutationType!
  node: Color
  updatedFields: [String!]
  previousValues: ColorPreviousValues
}

input ColorSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ColorSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ColorSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ColorSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ColorWhereInput
}

input ColorUpdateDataInput {
  slug: String
  name: String
  colorCode: String
  hexCode: String
  productVariants: ProductVariantUpdateManyWithoutColorInput
}

input ColorUpdateInput {
  slug: String
  name: String
  colorCode: String
  hexCode: String
  productVariants: ProductVariantUpdateManyWithoutColorInput
}

input ColorUpdateManyMutationInput {
  slug: String
  name: String
  colorCode: String
  hexCode: String
}

input ColorUpdateOneInput {
  create: ColorCreateInput
  connect: ColorWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: ColorUpdateDataInput
  upsert: ColorUpsertNestedInput
}

input ColorUpdateOneRequiredInput {
  create: ColorCreateInput
  connect: ColorWhereUniqueInput
  update: ColorUpdateDataInput
  upsert: ColorUpsertNestedInput
}

input ColorUpdateOneRequiredWithoutProductVariantsInput {
  create: ColorCreateWithoutProductVariantsInput
  connect: ColorWhereUniqueInput
  update: ColorUpdateWithoutProductVariantsDataInput
  upsert: ColorUpsertWithoutProductVariantsInput
}

input ColorUpdateWithoutProductVariantsDataInput {
  slug: String
  name: String
  colorCode: String
  hexCode: String
}

input ColorUpsertNestedInput {
  update: ColorUpdateDataInput!
  create: ColorCreateInput!
}

input ColorUpsertWithoutProductVariantsInput {
  update: ColorUpdateWithoutProductVariantsDataInput!
  create: ColorCreateWithoutProductVariantsInput!
}

input ColorWhereInput {
  """Logical AND on all given filters."""
  AND: [ColorWhereInput!]

  """Logical OR on all given filters."""
  OR: [ColorWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ColorWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  colorCode: String

  """All values that are not equal to given value."""
  colorCode_not: String

  """All values that are contained in given list."""
  colorCode_in: [String!]

  """All values that are not contained in given list."""
  colorCode_not_in: [String!]

  """All values less than the given value."""
  colorCode_lt: String

  """All values less than or equal the given value."""
  colorCode_lte: String

  """All values greater than the given value."""
  colorCode_gt: String

  """All values greater than or equal the given value."""
  colorCode_gte: String

  """All values containing the given string."""
  colorCode_contains: String

  """All values not containing the given string."""
  colorCode_not_contains: String

  """All values starting with the given string."""
  colorCode_starts_with: String

  """All values not starting with the given string."""
  colorCode_not_starts_with: String

  """All values ending with the given string."""
  colorCode_ends_with: String

  """All values not ending with the given string."""
  colorCode_not_ends_with: String
  hexCode: String

  """All values that are not equal to given value."""
  hexCode_not: String

  """All values that are contained in given list."""
  hexCode_in: [String!]

  """All values that are not contained in given list."""
  hexCode_not_in: [String!]

  """All values less than the given value."""
  hexCode_lt: String

  """All values less than or equal the given value."""
  hexCode_lte: String

  """All values greater than the given value."""
  hexCode_gt: String

  """All values greater than or equal the given value."""
  hexCode_gte: String

  """All values containing the given string."""
  hexCode_contains: String

  """All values not containing the given string."""
  hexCode_not_contains: String

  """All values starting with the given string."""
  hexCode_starts_with: String

  """All values not starting with the given string."""
  hexCode_not_starts_with: String

  """All values ending with the given string."""
  hexCode_ends_with: String

  """All values not ending with the given string."""
  hexCode_not_ends_with: String
  productVariants_every: ProductVariantWhereInput
  productVariants_some: ProductVariantWhereInput
  productVariants_none: ProductVariantWhereInput
}

input ColorWhereUniqueInput {
  id: ID
  slug: String
  colorCode: String
}

type Customer implements Node {
  id: ID!
  user: User!
  status: CustomerStatus
  detail: CustomerDetail
  billingInfo: BillingInfo
  plan: Plan
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation!]
}

"""A connection to a list of items."""
type CustomerConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [CustomerEdge]!
  aggregate: AggregateCustomer!
}

input CustomerCreateInput {
  id: ID
  status: CustomerStatus
  plan: Plan
  user: UserCreateOneInput!
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  reservations: ReservationCreateManyWithoutCustomerInput
}

input CustomerCreateOneInput {
  create: CustomerCreateInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateOneWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateWithoutReservationsInput {
  id: ID
  status: CustomerStatus
  plan: Plan
  user: UserCreateOneInput!
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
}

type CustomerDetail implements Node {
  id: ID!
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  shippingAddress: Location
  phoneOS: String
  insureShipment: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type CustomerDetailConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [CustomerDetailEdge]!
  aggregate: AggregateCustomerDetail!
}

input CustomerDetailCreateInput {
  id: ID
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  phoneOS: String
  insureShipment: Boolean
  shippingAddress: LocationCreateOneInput
}

input CustomerDetailCreateOneInput {
  create: CustomerDetailCreateInput
  connect: CustomerDetailWhereUniqueInput
}

"""An edge in a connection."""
type CustomerDetailEdge {
  """The item at the end of the edge."""
  node: CustomerDetail!

  """A cursor for use in pagination."""
  cursor: String!
}

enum CustomerDetailOrderByInput {
  id_ASC
  id_DESC
  phoneNumber_ASC
  phoneNumber_DESC
  birthday_ASC
  birthday_DESC
  height_ASC
  height_DESC
  weight_ASC
  weight_DESC
  bodyType_ASC
  bodyType_DESC
  averageTopSize_ASC
  averageTopSize_DESC
  averageWaistSize_ASC
  averageWaistSize_DESC
  averagePantLength_ASC
  averagePantLength_DESC
  preferredPronouns_ASC
  preferredPronouns_DESC
  profession_ASC
  profession_DESC
  partyFrequency_ASC
  partyFrequency_DESC
  travelFrequency_ASC
  travelFrequency_DESC
  shoppingFrequency_ASC
  shoppingFrequency_DESC
  averageSpend_ASC
  averageSpend_DESC
  style_ASC
  style_DESC
  commuteStyle_ASC
  commuteStyle_DESC
  phoneOS_ASC
  phoneOS_DESC
  insureShipment_ASC
  insureShipment_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type CustomerDetailPreviousValues {
  id: ID!
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  phoneOS: String
  insureShipment: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type CustomerDetailSubscriptionPayload {
  mutation: MutationType!
  node: CustomerDetail
  updatedFields: [String!]
  previousValues: CustomerDetailPreviousValues
}

input CustomerDetailSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [CustomerDetailSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CustomerDetailSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CustomerDetailSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: CustomerDetailWhereInput
}

input CustomerDetailUpdateDataInput {
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  phoneOS: String
  insureShipment: Boolean
  shippingAddress: LocationUpdateOneInput
}

input CustomerDetailUpdateInput {
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  phoneOS: String
  insureShipment: Boolean
  shippingAddress: LocationUpdateOneInput
}

input CustomerDetailUpdateManyMutationInput {
  phoneNumber: String
  birthday: DateTime
  height: Int
  weight: String
  bodyType: String
  averageTopSize: String
  averageWaistSize: String
  averagePantLength: String
  preferredPronouns: String
  profession: String
  partyFrequency: String
  travelFrequency: String
  shoppingFrequency: String
  averageSpend: String
  style: String
  commuteStyle: String
  phoneOS: String
  insureShipment: Boolean
}

input CustomerDetailUpdateOneInput {
  create: CustomerDetailCreateInput
  connect: CustomerDetailWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: CustomerDetailUpdateDataInput
  upsert: CustomerDetailUpsertNestedInput
}

input CustomerDetailUpsertNestedInput {
  update: CustomerDetailUpdateDataInput!
  create: CustomerDetailCreateInput!
}

input CustomerDetailWhereInput {
  """Logical AND on all given filters."""
  AND: [CustomerDetailWhereInput!]

  """Logical OR on all given filters."""
  OR: [CustomerDetailWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CustomerDetailWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  phoneNumber: String

  """All values that are not equal to given value."""
  phoneNumber_not: String

  """All values that are contained in given list."""
  phoneNumber_in: [String!]

  """All values that are not contained in given list."""
  phoneNumber_not_in: [String!]

  """All values less than the given value."""
  phoneNumber_lt: String

  """All values less than or equal the given value."""
  phoneNumber_lte: String

  """All values greater than the given value."""
  phoneNumber_gt: String

  """All values greater than or equal the given value."""
  phoneNumber_gte: String

  """All values containing the given string."""
  phoneNumber_contains: String

  """All values not containing the given string."""
  phoneNumber_not_contains: String

  """All values starting with the given string."""
  phoneNumber_starts_with: String

  """All values not starting with the given string."""
  phoneNumber_not_starts_with: String

  """All values ending with the given string."""
  phoneNumber_ends_with: String

  """All values not ending with the given string."""
  phoneNumber_not_ends_with: String
  birthday: DateTime

  """All values that are not equal to given value."""
  birthday_not: DateTime

  """All values that are contained in given list."""
  birthday_in: [DateTime!]

  """All values that are not contained in given list."""
  birthday_not_in: [DateTime!]

  """All values less than the given value."""
  birthday_lt: DateTime

  """All values less than or equal the given value."""
  birthday_lte: DateTime

  """All values greater than the given value."""
  birthday_gt: DateTime

  """All values greater than or equal the given value."""
  birthday_gte: DateTime
  height: Int

  """All values that are not equal to given value."""
  height_not: Int

  """All values that are contained in given list."""
  height_in: [Int!]

  """All values that are not contained in given list."""
  height_not_in: [Int!]

  """All values less than the given value."""
  height_lt: Int

  """All values less than or equal the given value."""
  height_lte: Int

  """All values greater than the given value."""
  height_gt: Int

  """All values greater than or equal the given value."""
  height_gte: Int
  weight: String

  """All values that are not equal to given value."""
  weight_not: String

  """All values that are contained in given list."""
  weight_in: [String!]

  """All values that are not contained in given list."""
  weight_not_in: [String!]

  """All values less than the given value."""
  weight_lt: String

  """All values less than or equal the given value."""
  weight_lte: String

  """All values greater than the given value."""
  weight_gt: String

  """All values greater than or equal the given value."""
  weight_gte: String

  """All values containing the given string."""
  weight_contains: String

  """All values not containing the given string."""
  weight_not_contains: String

  """All values starting with the given string."""
  weight_starts_with: String

  """All values not starting with the given string."""
  weight_not_starts_with: String

  """All values ending with the given string."""
  weight_ends_with: String

  """All values not ending with the given string."""
  weight_not_ends_with: String
  bodyType: String

  """All values that are not equal to given value."""
  bodyType_not: String

  """All values that are contained in given list."""
  bodyType_in: [String!]

  """All values that are not contained in given list."""
  bodyType_not_in: [String!]

  """All values less than the given value."""
  bodyType_lt: String

  """All values less than or equal the given value."""
  bodyType_lte: String

  """All values greater than the given value."""
  bodyType_gt: String

  """All values greater than or equal the given value."""
  bodyType_gte: String

  """All values containing the given string."""
  bodyType_contains: String

  """All values not containing the given string."""
  bodyType_not_contains: String

  """All values starting with the given string."""
  bodyType_starts_with: String

  """All values not starting with the given string."""
  bodyType_not_starts_with: String

  """All values ending with the given string."""
  bodyType_ends_with: String

  """All values not ending with the given string."""
  bodyType_not_ends_with: String
  averageTopSize: String

  """All values that are not equal to given value."""
  averageTopSize_not: String

  """All values that are contained in given list."""
  averageTopSize_in: [String!]

  """All values that are not contained in given list."""
  averageTopSize_not_in: [String!]

  """All values less than the given value."""
  averageTopSize_lt: String

  """All values less than or equal the given value."""
  averageTopSize_lte: String

  """All values greater than the given value."""
  averageTopSize_gt: String

  """All values greater than or equal the given value."""
  averageTopSize_gte: String

  """All values containing the given string."""
  averageTopSize_contains: String

  """All values not containing the given string."""
  averageTopSize_not_contains: String

  """All values starting with the given string."""
  averageTopSize_starts_with: String

  """All values not starting with the given string."""
  averageTopSize_not_starts_with: String

  """All values ending with the given string."""
  averageTopSize_ends_with: String

  """All values not ending with the given string."""
  averageTopSize_not_ends_with: String
  averageWaistSize: String

  """All values that are not equal to given value."""
  averageWaistSize_not: String

  """All values that are contained in given list."""
  averageWaistSize_in: [String!]

  """All values that are not contained in given list."""
  averageWaistSize_not_in: [String!]

  """All values less than the given value."""
  averageWaistSize_lt: String

  """All values less than or equal the given value."""
  averageWaistSize_lte: String

  """All values greater than the given value."""
  averageWaistSize_gt: String

  """All values greater than or equal the given value."""
  averageWaistSize_gte: String

  """All values containing the given string."""
  averageWaistSize_contains: String

  """All values not containing the given string."""
  averageWaistSize_not_contains: String

  """All values starting with the given string."""
  averageWaistSize_starts_with: String

  """All values not starting with the given string."""
  averageWaistSize_not_starts_with: String

  """All values ending with the given string."""
  averageWaistSize_ends_with: String

  """All values not ending with the given string."""
  averageWaistSize_not_ends_with: String
  averagePantLength: String

  """All values that are not equal to given value."""
  averagePantLength_not: String

  """All values that are contained in given list."""
  averagePantLength_in: [String!]

  """All values that are not contained in given list."""
  averagePantLength_not_in: [String!]

  """All values less than the given value."""
  averagePantLength_lt: String

  """All values less than or equal the given value."""
  averagePantLength_lte: String

  """All values greater than the given value."""
  averagePantLength_gt: String

  """All values greater than or equal the given value."""
  averagePantLength_gte: String

  """All values containing the given string."""
  averagePantLength_contains: String

  """All values not containing the given string."""
  averagePantLength_not_contains: String

  """All values starting with the given string."""
  averagePantLength_starts_with: String

  """All values not starting with the given string."""
  averagePantLength_not_starts_with: String

  """All values ending with the given string."""
  averagePantLength_ends_with: String

  """All values not ending with the given string."""
  averagePantLength_not_ends_with: String
  preferredPronouns: String

  """All values that are not equal to given value."""
  preferredPronouns_not: String

  """All values that are contained in given list."""
  preferredPronouns_in: [String!]

  """All values that are not contained in given list."""
  preferredPronouns_not_in: [String!]

  """All values less than the given value."""
  preferredPronouns_lt: String

  """All values less than or equal the given value."""
  preferredPronouns_lte: String

  """All values greater than the given value."""
  preferredPronouns_gt: String

  """All values greater than or equal the given value."""
  preferredPronouns_gte: String

  """All values containing the given string."""
  preferredPronouns_contains: String

  """All values not containing the given string."""
  preferredPronouns_not_contains: String

  """All values starting with the given string."""
  preferredPronouns_starts_with: String

  """All values not starting with the given string."""
  preferredPronouns_not_starts_with: String

  """All values ending with the given string."""
  preferredPronouns_ends_with: String

  """All values not ending with the given string."""
  preferredPronouns_not_ends_with: String
  profession: String

  """All values that are not equal to given value."""
  profession_not: String

  """All values that are contained in given list."""
  profession_in: [String!]

  """All values that are not contained in given list."""
  profession_not_in: [String!]

  """All values less than the given value."""
  profession_lt: String

  """All values less than or equal the given value."""
  profession_lte: String

  """All values greater than the given value."""
  profession_gt: String

  """All values greater than or equal the given value."""
  profession_gte: String

  """All values containing the given string."""
  profession_contains: String

  """All values not containing the given string."""
  profession_not_contains: String

  """All values starting with the given string."""
  profession_starts_with: String

  """All values not starting with the given string."""
  profession_not_starts_with: String

  """All values ending with the given string."""
  profession_ends_with: String

  """All values not ending with the given string."""
  profession_not_ends_with: String
  partyFrequency: String

  """All values that are not equal to given value."""
  partyFrequency_not: String

  """All values that are contained in given list."""
  partyFrequency_in: [String!]

  """All values that are not contained in given list."""
  partyFrequency_not_in: [String!]

  """All values less than the given value."""
  partyFrequency_lt: String

  """All values less than or equal the given value."""
  partyFrequency_lte: String

  """All values greater than the given value."""
  partyFrequency_gt: String

  """All values greater than or equal the given value."""
  partyFrequency_gte: String

  """All values containing the given string."""
  partyFrequency_contains: String

  """All values not containing the given string."""
  partyFrequency_not_contains: String

  """All values starting with the given string."""
  partyFrequency_starts_with: String

  """All values not starting with the given string."""
  partyFrequency_not_starts_with: String

  """All values ending with the given string."""
  partyFrequency_ends_with: String

  """All values not ending with the given string."""
  partyFrequency_not_ends_with: String
  travelFrequency: String

  """All values that are not equal to given value."""
  travelFrequency_not: String

  """All values that are contained in given list."""
  travelFrequency_in: [String!]

  """All values that are not contained in given list."""
  travelFrequency_not_in: [String!]

  """All values less than the given value."""
  travelFrequency_lt: String

  """All values less than or equal the given value."""
  travelFrequency_lte: String

  """All values greater than the given value."""
  travelFrequency_gt: String

  """All values greater than or equal the given value."""
  travelFrequency_gte: String

  """All values containing the given string."""
  travelFrequency_contains: String

  """All values not containing the given string."""
  travelFrequency_not_contains: String

  """All values starting with the given string."""
  travelFrequency_starts_with: String

  """All values not starting with the given string."""
  travelFrequency_not_starts_with: String

  """All values ending with the given string."""
  travelFrequency_ends_with: String

  """All values not ending with the given string."""
  travelFrequency_not_ends_with: String
  shoppingFrequency: String

  """All values that are not equal to given value."""
  shoppingFrequency_not: String

  """All values that are contained in given list."""
  shoppingFrequency_in: [String!]

  """All values that are not contained in given list."""
  shoppingFrequency_not_in: [String!]

  """All values less than the given value."""
  shoppingFrequency_lt: String

  """All values less than or equal the given value."""
  shoppingFrequency_lte: String

  """All values greater than the given value."""
  shoppingFrequency_gt: String

  """All values greater than or equal the given value."""
  shoppingFrequency_gte: String

  """All values containing the given string."""
  shoppingFrequency_contains: String

  """All values not containing the given string."""
  shoppingFrequency_not_contains: String

  """All values starting with the given string."""
  shoppingFrequency_starts_with: String

  """All values not starting with the given string."""
  shoppingFrequency_not_starts_with: String

  """All values ending with the given string."""
  shoppingFrequency_ends_with: String

  """All values not ending with the given string."""
  shoppingFrequency_not_ends_with: String
  averageSpend: String

  """All values that are not equal to given value."""
  averageSpend_not: String

  """All values that are contained in given list."""
  averageSpend_in: [String!]

  """All values that are not contained in given list."""
  averageSpend_not_in: [String!]

  """All values less than the given value."""
  averageSpend_lt: String

  """All values less than or equal the given value."""
  averageSpend_lte: String

  """All values greater than the given value."""
  averageSpend_gt: String

  """All values greater than or equal the given value."""
  averageSpend_gte: String

  """All values containing the given string."""
  averageSpend_contains: String

  """All values not containing the given string."""
  averageSpend_not_contains: String

  """All values starting with the given string."""
  averageSpend_starts_with: String

  """All values not starting with the given string."""
  averageSpend_not_starts_with: String

  """All values ending with the given string."""
  averageSpend_ends_with: String

  """All values not ending with the given string."""
  averageSpend_not_ends_with: String
  style: String

  """All values that are not equal to given value."""
  style_not: String

  """All values that are contained in given list."""
  style_in: [String!]

  """All values that are not contained in given list."""
  style_not_in: [String!]

  """All values less than the given value."""
  style_lt: String

  """All values less than or equal the given value."""
  style_lte: String

  """All values greater than the given value."""
  style_gt: String

  """All values greater than or equal the given value."""
  style_gte: String

  """All values containing the given string."""
  style_contains: String

  """All values not containing the given string."""
  style_not_contains: String

  """All values starting with the given string."""
  style_starts_with: String

  """All values not starting with the given string."""
  style_not_starts_with: String

  """All values ending with the given string."""
  style_ends_with: String

  """All values not ending with the given string."""
  style_not_ends_with: String
  commuteStyle: String

  """All values that are not equal to given value."""
  commuteStyle_not: String

  """All values that are contained in given list."""
  commuteStyle_in: [String!]

  """All values that are not contained in given list."""
  commuteStyle_not_in: [String!]

  """All values less than the given value."""
  commuteStyle_lt: String

  """All values less than or equal the given value."""
  commuteStyle_lte: String

  """All values greater than the given value."""
  commuteStyle_gt: String

  """All values greater than or equal the given value."""
  commuteStyle_gte: String

  """All values containing the given string."""
  commuteStyle_contains: String

  """All values not containing the given string."""
  commuteStyle_not_contains: String

  """All values starting with the given string."""
  commuteStyle_starts_with: String

  """All values not starting with the given string."""
  commuteStyle_not_starts_with: String

  """All values ending with the given string."""
  commuteStyle_ends_with: String

  """All values not ending with the given string."""
  commuteStyle_not_ends_with: String
  phoneOS: String

  """All values that are not equal to given value."""
  phoneOS_not: String

  """All values that are contained in given list."""
  phoneOS_in: [String!]

  """All values that are not contained in given list."""
  phoneOS_not_in: [String!]

  """All values less than the given value."""
  phoneOS_lt: String

  """All values less than or equal the given value."""
  phoneOS_lte: String

  """All values greater than the given value."""
  phoneOS_gt: String

  """All values greater than or equal the given value."""
  phoneOS_gte: String

  """All values containing the given string."""
  phoneOS_contains: String

  """All values not containing the given string."""
  phoneOS_not_contains: String

  """All values starting with the given string."""
  phoneOS_starts_with: String

  """All values not starting with the given string."""
  phoneOS_not_starts_with: String

  """All values ending with the given string."""
  phoneOS_ends_with: String

  """All values not ending with the given string."""
  phoneOS_not_ends_with: String
  insureShipment: Boolean

  """All values that are not equal to given value."""
  insureShipment_not: Boolean
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  shippingAddress: LocationWhereInput
}

input CustomerDetailWhereUniqueInput {
  id: ID
}

"""An edge in a connection."""
type CustomerEdge {
  """The item at the end of the edge."""
  node: Customer!

  """A cursor for use in pagination."""
  cursor: String!
}

enum CustomerOrderByInput {
  id_ASC
  id_DESC
  status_ASC
  status_DESC
  plan_ASC
  plan_DESC
}

type CustomerPreviousValues {
  id: ID!
  status: CustomerStatus
  plan: Plan
}

enum CustomerStatus {
  Invited
  Created
  Waitlisted
  Authorized
  Active
  Suspended
  Paused
  Deactivated
}

type CustomerSubscriptionPayload {
  mutation: MutationType!
  node: Customer
  updatedFields: [String!]
  previousValues: CustomerPreviousValues
}

input CustomerSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [CustomerSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [CustomerSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CustomerSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: CustomerWhereInput
}

input CustomerUpdateDataInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateManyMutationInput {
  status: CustomerStatus
  plan: Plan
}

input CustomerUpdateOneRequiredInput {
  create: CustomerCreateInput
  connect: CustomerWhereUniqueInput
  update: CustomerUpdateDataInput
  upsert: CustomerUpsertNestedInput
}

input CustomerUpdateOneRequiredWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  connect: CustomerWhereUniqueInput
  update: CustomerUpdateWithoutReservationsDataInput
  upsert: CustomerUpsertWithoutReservationsInput
}

input CustomerUpdateWithoutReservationsDataInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
}

input CustomerUpsertNestedInput {
  update: CustomerUpdateDataInput!
  create: CustomerCreateInput!
}

input CustomerUpsertWithoutReservationsInput {
  update: CustomerUpdateWithoutReservationsDataInput!
  create: CustomerCreateWithoutReservationsInput!
}

input CustomerWhereInput {
  """Logical AND on all given filters."""
  AND: [CustomerWhereInput!]

  """Logical OR on all given filters."""
  OR: [CustomerWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [CustomerWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  status: CustomerStatus

  """All values that are not equal to given value."""
  status_not: CustomerStatus

  """All values that are contained in given list."""
  status_in: [CustomerStatus!]

  """All values that are not contained in given list."""
  status_not_in: [CustomerStatus!]
  plan: Plan

  """All values that are not equal to given value."""
  plan_not: Plan

  """All values that are contained in given list."""
  plan_in: [Plan!]

  """All values that are not contained in given list."""
  plan_not_in: [Plan!]
  user: UserWhereInput
  detail: CustomerDetailWhereInput
  billingInfo: BillingInfoWhereInput
  reservations_every: ReservationWhereInput
  reservations_some: ReservationWhereInput
  reservations_none: ReservationWhereInput
}

input CustomerWhereUniqueInput {
  id: ID
}

scalar DateTime

type HomepageProductRail implements Node {
  id: ID!
  slug: String!
  name: String!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

"""A connection to a list of items."""
type HomepageProductRailConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [HomepageProductRailEdge]!
  aggregate: AggregateHomepageProductRail!
}

input HomepageProductRailCreateInput {
  id: ID
  slug: String!
  name: String!
  products: ProductCreateManyInput
}

"""An edge in a connection."""
type HomepageProductRailEdge {
  """The item at the end of the edge."""
  node: HomepageProductRail!

  """A cursor for use in pagination."""
  cursor: String!
}

enum HomepageProductRailOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
}

type HomepageProductRailPreviousValues {
  id: ID!
  slug: String!
  name: String!
}

type HomepageProductRailSubscriptionPayload {
  mutation: MutationType!
  node: HomepageProductRail
  updatedFields: [String!]
  previousValues: HomepageProductRailPreviousValues
}

input HomepageProductRailSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [HomepageProductRailSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [HomepageProductRailSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [HomepageProductRailSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: HomepageProductRailWhereInput
}

input HomepageProductRailUpdateInput {
  slug: String
  name: String
  products: ProductUpdateManyInput
}

input HomepageProductRailUpdateManyMutationInput {
  slug: String
  name: String
}

input HomepageProductRailWhereInput {
  """Logical AND on all given filters."""
  AND: [HomepageProductRailWhereInput!]

  """Logical OR on all given filters."""
  OR: [HomepageProductRailWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [HomepageProductRailWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
}

input HomepageProductRailWhereUniqueInput {
  id: ID
  slug: String
}

type Image implements Node {
  id: ID!
  caption: String
  originalHeight: Int
  originalUrl: String!
  originalWidth: Int
  resizedUrl: String!
  title: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type ImageConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ImageEdge]!
  aggregate: AggregateImage!
}

input ImageCreateInput {
  id: ID
  caption: String
  originalHeight: Int
  originalUrl: String!
  originalWidth: Int
  resizedUrl: String!
  title: String
}

"""An edge in a connection."""
type ImageEdge {
  """The item at the end of the edge."""
  node: Image!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ImageOrderByInput {
  id_ASC
  id_DESC
  caption_ASC
  caption_DESC
  originalHeight_ASC
  originalHeight_DESC
  originalUrl_ASC
  originalUrl_DESC
  originalWidth_ASC
  originalWidth_DESC
  resizedUrl_ASC
  resizedUrl_DESC
  title_ASC
  title_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ImagePreviousValues {
  id: ID!
  caption: String
  originalHeight: Int
  originalUrl: String!
  originalWidth: Int
  resizedUrl: String!
  title: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ImageSubscriptionPayload {
  mutation: MutationType!
  node: Image
  updatedFields: [String!]
  previousValues: ImagePreviousValues
}

input ImageSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ImageSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ImageSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ImageSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ImageWhereInput
}

input ImageUpdateInput {
  caption: String
  originalHeight: Int
  originalUrl: String
  originalWidth: Int
  resizedUrl: String
  title: String
}

input ImageUpdateManyMutationInput {
  caption: String
  originalHeight: Int
  originalUrl: String
  originalWidth: Int
  resizedUrl: String
  title: String
}

input ImageWhereInput {
  """Logical AND on all given filters."""
  AND: [ImageWhereInput!]

  """Logical OR on all given filters."""
  OR: [ImageWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ImageWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  caption: String

  """All values that are not equal to given value."""
  caption_not: String

  """All values that are contained in given list."""
  caption_in: [String!]

  """All values that are not contained in given list."""
  caption_not_in: [String!]

  """All values less than the given value."""
  caption_lt: String

  """All values less than or equal the given value."""
  caption_lte: String

  """All values greater than the given value."""
  caption_gt: String

  """All values greater than or equal the given value."""
  caption_gte: String

  """All values containing the given string."""
  caption_contains: String

  """All values not containing the given string."""
  caption_not_contains: String

  """All values starting with the given string."""
  caption_starts_with: String

  """All values not starting with the given string."""
  caption_not_starts_with: String

  """All values ending with the given string."""
  caption_ends_with: String

  """All values not ending with the given string."""
  caption_not_ends_with: String
  originalHeight: Int

  """All values that are not equal to given value."""
  originalHeight_not: Int

  """All values that are contained in given list."""
  originalHeight_in: [Int!]

  """All values that are not contained in given list."""
  originalHeight_not_in: [Int!]

  """All values less than the given value."""
  originalHeight_lt: Int

  """All values less than or equal the given value."""
  originalHeight_lte: Int

  """All values greater than the given value."""
  originalHeight_gt: Int

  """All values greater than or equal the given value."""
  originalHeight_gte: Int
  originalUrl: String

  """All values that are not equal to given value."""
  originalUrl_not: String

  """All values that are contained in given list."""
  originalUrl_in: [String!]

  """All values that are not contained in given list."""
  originalUrl_not_in: [String!]

  """All values less than the given value."""
  originalUrl_lt: String

  """All values less than or equal the given value."""
  originalUrl_lte: String

  """All values greater than the given value."""
  originalUrl_gt: String

  """All values greater than or equal the given value."""
  originalUrl_gte: String

  """All values containing the given string."""
  originalUrl_contains: String

  """All values not containing the given string."""
  originalUrl_not_contains: String

  """All values starting with the given string."""
  originalUrl_starts_with: String

  """All values not starting with the given string."""
  originalUrl_not_starts_with: String

  """All values ending with the given string."""
  originalUrl_ends_with: String

  """All values not ending with the given string."""
  originalUrl_not_ends_with: String
  originalWidth: Int

  """All values that are not equal to given value."""
  originalWidth_not: Int

  """All values that are contained in given list."""
  originalWidth_in: [Int!]

  """All values that are not contained in given list."""
  originalWidth_not_in: [Int!]

  """All values less than the given value."""
  originalWidth_lt: Int

  """All values less than or equal the given value."""
  originalWidth_lte: Int

  """All values greater than the given value."""
  originalWidth_gt: Int

  """All values greater than or equal the given value."""
  originalWidth_gte: Int
  resizedUrl: String

  """All values that are not equal to given value."""
  resizedUrl_not: String

  """All values that are contained in given list."""
  resizedUrl_in: [String!]

  """All values that are not contained in given list."""
  resizedUrl_not_in: [String!]

  """All values less than the given value."""
  resizedUrl_lt: String

  """All values less than or equal the given value."""
  resizedUrl_lte: String

  """All values greater than the given value."""
  resizedUrl_gt: String

  """All values greater than or equal the given value."""
  resizedUrl_gte: String

  """All values containing the given string."""
  resizedUrl_contains: String

  """All values not containing the given string."""
  resizedUrl_not_contains: String

  """All values starting with the given string."""
  resizedUrl_starts_with: String

  """All values not starting with the given string."""
  resizedUrl_not_starts_with: String

  """All values ending with the given string."""
  resizedUrl_ends_with: String

  """All values not ending with the given string."""
  resizedUrl_not_ends_with: String
  title: String

  """All values that are not equal to given value."""
  title_not: String

  """All values that are contained in given list."""
  title_in: [String!]

  """All values that are not contained in given list."""
  title_not_in: [String!]

  """All values less than the given value."""
  title_lt: String

  """All values less than or equal the given value."""
  title_lte: String

  """All values greater than the given value."""
  title_gt: String

  """All values greater than or equal the given value."""
  title_gte: String

  """All values containing the given string."""
  title_contains: String

  """All values not containing the given string."""
  title_not_contains: String

  """All values starting with the given string."""
  title_starts_with: String

  """All values not starting with the given string."""
  title_not_starts_with: String

  """All values ending with the given string."""
  title_ends_with: String

  """All values not ending with the given string."""
  title_not_ends_with: String
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

input ImageWhereUniqueInput {
  id: ID
}

enum InventoryStatus {
  NonReservable
  Reservable
  Reserved
}

"""Raw JSON value"""
scalar Json

type Label implements Node {
  id: ID!
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

"""A connection to a list of items."""
type LabelConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [LabelEdge]!
  aggregate: AggregateLabel!
}

input LabelCreateInput {
  id: ID
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

input LabelCreateOneInput {
  create: LabelCreateInput
  connect: LabelWhereUniqueInput
}

"""An edge in a connection."""
type LabelEdge {
  """The item at the end of the edge."""
  node: Label!

  """A cursor for use in pagination."""
  cursor: String!
}

enum LabelOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  image_ASC
  image_DESC
  trackingNumber_ASC
  trackingNumber_DESC
  trackingURL_ASC
  trackingURL_DESC
}

type LabelPreviousValues {
  id: ID!
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

type LabelSubscriptionPayload {
  mutation: MutationType!
  node: Label
  updatedFields: [String!]
  previousValues: LabelPreviousValues
}

input LabelSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [LabelSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [LabelSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [LabelSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: LabelWhereInput
}

input LabelUpdateDataInput {
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

input LabelUpdateInput {
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

input LabelUpdateManyMutationInput {
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

input LabelUpdateOneRequiredInput {
  create: LabelCreateInput
  connect: LabelWhereUniqueInput
  update: LabelUpdateDataInput
  upsert: LabelUpsertNestedInput
}

input LabelUpsertNestedInput {
  update: LabelUpdateDataInput!
  create: LabelCreateInput!
}

input LabelWhereInput {
  """Logical AND on all given filters."""
  AND: [LabelWhereInput!]

  """Logical OR on all given filters."""
  OR: [LabelWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [LabelWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  image: String

  """All values that are not equal to given value."""
  image_not: String

  """All values that are contained in given list."""
  image_in: [String!]

  """All values that are not contained in given list."""
  image_not_in: [String!]

  """All values less than the given value."""
  image_lt: String

  """All values less than or equal the given value."""
  image_lte: String

  """All values greater than the given value."""
  image_gt: String

  """All values greater than or equal the given value."""
  image_gte: String

  """All values containing the given string."""
  image_contains: String

  """All values not containing the given string."""
  image_not_contains: String

  """All values starting with the given string."""
  image_starts_with: String

  """All values not starting with the given string."""
  image_not_starts_with: String

  """All values ending with the given string."""
  image_ends_with: String

  """All values not ending with the given string."""
  image_not_ends_with: String
  trackingNumber: String

  """All values that are not equal to given value."""
  trackingNumber_not: String

  """All values that are contained in given list."""
  trackingNumber_in: [String!]

  """All values that are not contained in given list."""
  trackingNumber_not_in: [String!]

  """All values less than the given value."""
  trackingNumber_lt: String

  """All values less than or equal the given value."""
  trackingNumber_lte: String

  """All values greater than the given value."""
  trackingNumber_gt: String

  """All values greater than or equal the given value."""
  trackingNumber_gte: String

  """All values containing the given string."""
  trackingNumber_contains: String

  """All values not containing the given string."""
  trackingNumber_not_contains: String

  """All values starting with the given string."""
  trackingNumber_starts_with: String

  """All values not starting with the given string."""
  trackingNumber_not_starts_with: String

  """All values ending with the given string."""
  trackingNumber_ends_with: String

  """All values not ending with the given string."""
  trackingNumber_not_ends_with: String
  trackingURL: String

  """All values that are not equal to given value."""
  trackingURL_not: String

  """All values that are contained in given list."""
  trackingURL_in: [String!]

  """All values that are not contained in given list."""
  trackingURL_not_in: [String!]

  """All values less than the given value."""
  trackingURL_lt: String

  """All values less than or equal the given value."""
  trackingURL_lte: String

  """All values greater than the given value."""
  trackingURL_gt: String

  """All values greater than or equal the given value."""
  trackingURL_gte: String

  """All values containing the given string."""
  trackingURL_contains: String

  """All values not containing the given string."""
  trackingURL_not_contains: String

  """All values starting with the given string."""
  trackingURL_starts_with: String

  """All values not starting with the given string."""
  trackingURL_not_starts_with: String

  """All values ending with the given string."""
  trackingURL_ends_with: String

  """All values not ending with the given string."""
  trackingURL_not_ends_with: String
}

input LabelWhereUniqueInput {
  id: ID
}

type Location implements Node {
  id: ID!
  slug: String!
  name: String!
  company: String
  description: String
  address1: String!
  address2: String
  city: String!
  state: String!
  zipCode: String!
  locationType: LocationType
  user: User
  lat: Float
  lng: Float
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type LocationConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [LocationEdge]!
  aggregate: AggregateLocation!
}

input LocationCreateInput {
  id: ID
  slug: String!
  name: String!
  company: String
  description: String
  address1: String!
  address2: String
  city: String!
  state: String!
  zipCode: String!
  locationType: LocationType
  lat: Float
  lng: Float
  user: UserCreateOneInput
  physicalProducts: PhysicalProductCreateManyWithoutLocationInput
}

input LocationCreateOneInput {
  create: LocationCreateInput
  connect: LocationWhereUniqueInput
}

input LocationCreateOneWithoutPhysicalProductsInput {
  create: LocationCreateWithoutPhysicalProductsInput
  connect: LocationWhereUniqueInput
}

input LocationCreateWithoutPhysicalProductsInput {
  id: ID
  slug: String!
  name: String!
  company: String
  description: String
  address1: String!
  address2: String
  city: String!
  state: String!
  zipCode: String!
  locationType: LocationType
  lat: Float
  lng: Float
  user: UserCreateOneInput
}

"""An edge in a connection."""
type LocationEdge {
  """The item at the end of the edge."""
  node: Location!

  """A cursor for use in pagination."""
  cursor: String!
}

enum LocationOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
  company_ASC
  company_DESC
  description_ASC
  description_DESC
  address1_ASC
  address1_DESC
  address2_ASC
  address2_DESC
  city_ASC
  city_DESC
  state_ASC
  state_DESC
  zipCode_ASC
  zipCode_DESC
  locationType_ASC
  locationType_DESC
  lat_ASC
  lat_DESC
  lng_ASC
  lng_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type LocationPreviousValues {
  id: ID!
  slug: String!
  name: String!
  company: String
  description: String
  address1: String!
  address2: String
  city: String!
  state: String!
  zipCode: String!
  locationType: LocationType
  lat: Float
  lng: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type LocationSubscriptionPayload {
  mutation: MutationType!
  node: Location
  updatedFields: [String!]
  previousValues: LocationPreviousValues
}

input LocationSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [LocationSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [LocationSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [LocationSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: LocationWhereInput
}

enum LocationType {
  Office
  Warehouse
  Cleaner
  Customer
}

input LocationUpdateDataInput {
  slug: String
  name: String
  company: String
  description: String
  address1: String
  address2: String
  city: String
  state: String
  zipCode: String
  locationType: LocationType
  lat: Float
  lng: Float
  user: UserUpdateOneInput
  physicalProducts: PhysicalProductUpdateManyWithoutLocationInput
}

input LocationUpdateInput {
  slug: String
  name: String
  company: String
  description: String
  address1: String
  address2: String
  city: String
  state: String
  zipCode: String
  locationType: LocationType
  lat: Float
  lng: Float
  user: UserUpdateOneInput
  physicalProducts: PhysicalProductUpdateManyWithoutLocationInput
}

input LocationUpdateManyMutationInput {
  slug: String
  name: String
  company: String
  description: String
  address1: String
  address2: String
  city: String
  state: String
  zipCode: String
  locationType: LocationType
  lat: Float
  lng: Float
}

input LocationUpdateOneInput {
  create: LocationCreateInput
  connect: LocationWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: LocationUpdateDataInput
  upsert: LocationUpsertNestedInput
}

input LocationUpdateOneRequiredInput {
  create: LocationCreateInput
  connect: LocationWhereUniqueInput
  update: LocationUpdateDataInput
  upsert: LocationUpsertNestedInput
}

input LocationUpdateOneRequiredWithoutPhysicalProductsInput {
  create: LocationCreateWithoutPhysicalProductsInput
  connect: LocationWhereUniqueInput
  update: LocationUpdateWithoutPhysicalProductsDataInput
  upsert: LocationUpsertWithoutPhysicalProductsInput
}

input LocationUpdateWithoutPhysicalProductsDataInput {
  slug: String
  name: String
  company: String
  description: String
  address1: String
  address2: String
  city: String
  state: String
  zipCode: String
  locationType: LocationType
  lat: Float
  lng: Float
  user: UserUpdateOneInput
}

input LocationUpsertNestedInput {
  update: LocationUpdateDataInput!
  create: LocationCreateInput!
}

input LocationUpsertWithoutPhysicalProductsInput {
  update: LocationUpdateWithoutPhysicalProductsDataInput!
  create: LocationCreateWithoutPhysicalProductsInput!
}

input LocationWhereInput {
  """Logical AND on all given filters."""
  AND: [LocationWhereInput!]

  """Logical OR on all given filters."""
  OR: [LocationWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [LocationWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  company: String

  """All values that are not equal to given value."""
  company_not: String

  """All values that are contained in given list."""
  company_in: [String!]

  """All values that are not contained in given list."""
  company_not_in: [String!]

  """All values less than the given value."""
  company_lt: String

  """All values less than or equal the given value."""
  company_lte: String

  """All values greater than the given value."""
  company_gt: String

  """All values greater than or equal the given value."""
  company_gte: String

  """All values containing the given string."""
  company_contains: String

  """All values not containing the given string."""
  company_not_contains: String

  """All values starting with the given string."""
  company_starts_with: String

  """All values not starting with the given string."""
  company_not_starts_with: String

  """All values ending with the given string."""
  company_ends_with: String

  """All values not ending with the given string."""
  company_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  address1: String

  """All values that are not equal to given value."""
  address1_not: String

  """All values that are contained in given list."""
  address1_in: [String!]

  """All values that are not contained in given list."""
  address1_not_in: [String!]

  """All values less than the given value."""
  address1_lt: String

  """All values less than or equal the given value."""
  address1_lte: String

  """All values greater than the given value."""
  address1_gt: String

  """All values greater than or equal the given value."""
  address1_gte: String

  """All values containing the given string."""
  address1_contains: String

  """All values not containing the given string."""
  address1_not_contains: String

  """All values starting with the given string."""
  address1_starts_with: String

  """All values not starting with the given string."""
  address1_not_starts_with: String

  """All values ending with the given string."""
  address1_ends_with: String

  """All values not ending with the given string."""
  address1_not_ends_with: String
  address2: String

  """All values that are not equal to given value."""
  address2_not: String

  """All values that are contained in given list."""
  address2_in: [String!]

  """All values that are not contained in given list."""
  address2_not_in: [String!]

  """All values less than the given value."""
  address2_lt: String

  """All values less than or equal the given value."""
  address2_lte: String

  """All values greater than the given value."""
  address2_gt: String

  """All values greater than or equal the given value."""
  address2_gte: String

  """All values containing the given string."""
  address2_contains: String

  """All values not containing the given string."""
  address2_not_contains: String

  """All values starting with the given string."""
  address2_starts_with: String

  """All values not starting with the given string."""
  address2_not_starts_with: String

  """All values ending with the given string."""
  address2_ends_with: String

  """All values not ending with the given string."""
  address2_not_ends_with: String
  city: String

  """All values that are not equal to given value."""
  city_not: String

  """All values that are contained in given list."""
  city_in: [String!]

  """All values that are not contained in given list."""
  city_not_in: [String!]

  """All values less than the given value."""
  city_lt: String

  """All values less than or equal the given value."""
  city_lte: String

  """All values greater than the given value."""
  city_gt: String

  """All values greater than or equal the given value."""
  city_gte: String

  """All values containing the given string."""
  city_contains: String

  """All values not containing the given string."""
  city_not_contains: String

  """All values starting with the given string."""
  city_starts_with: String

  """All values not starting with the given string."""
  city_not_starts_with: String

  """All values ending with the given string."""
  city_ends_with: String

  """All values not ending with the given string."""
  city_not_ends_with: String
  state: String

  """All values that are not equal to given value."""
  state_not: String

  """All values that are contained in given list."""
  state_in: [String!]

  """All values that are not contained in given list."""
  state_not_in: [String!]

  """All values less than the given value."""
  state_lt: String

  """All values less than or equal the given value."""
  state_lte: String

  """All values greater than the given value."""
  state_gt: String

  """All values greater than or equal the given value."""
  state_gte: String

  """All values containing the given string."""
  state_contains: String

  """All values not containing the given string."""
  state_not_contains: String

  """All values starting with the given string."""
  state_starts_with: String

  """All values not starting with the given string."""
  state_not_starts_with: String

  """All values ending with the given string."""
  state_ends_with: String

  """All values not ending with the given string."""
  state_not_ends_with: String
  zipCode: String

  """All values that are not equal to given value."""
  zipCode_not: String

  """All values that are contained in given list."""
  zipCode_in: [String!]

  """All values that are not contained in given list."""
  zipCode_not_in: [String!]

  """All values less than the given value."""
  zipCode_lt: String

  """All values less than or equal the given value."""
  zipCode_lte: String

  """All values greater than the given value."""
  zipCode_gt: String

  """All values greater than or equal the given value."""
  zipCode_gte: String

  """All values containing the given string."""
  zipCode_contains: String

  """All values not containing the given string."""
  zipCode_not_contains: String

  """All values starting with the given string."""
  zipCode_starts_with: String

  """All values not starting with the given string."""
  zipCode_not_starts_with: String

  """All values ending with the given string."""
  zipCode_ends_with: String

  """All values not ending with the given string."""
  zipCode_not_ends_with: String
  locationType: LocationType

  """All values that are not equal to given value."""
  locationType_not: LocationType

  """All values that are contained in given list."""
  locationType_in: [LocationType!]

  """All values that are not contained in given list."""
  locationType_not_in: [LocationType!]
  lat: Float

  """All values that are not equal to given value."""
  lat_not: Float

  """All values that are contained in given list."""
  lat_in: [Float!]

  """All values that are not contained in given list."""
  lat_not_in: [Float!]

  """All values less than the given value."""
  lat_lt: Float

  """All values less than or equal the given value."""
  lat_lte: Float

  """All values greater than the given value."""
  lat_gt: Float

  """All values greater than or equal the given value."""
  lat_gte: Float
  lng: Float

  """All values that are not equal to given value."""
  lng_not: Float

  """All values that are contained in given list."""
  lng_in: [Float!]

  """All values that are not contained in given list."""
  lng_not_in: [Float!]

  """All values less than the given value."""
  lng_lt: Float

  """All values less than or equal the given value."""
  lng_lte: Float

  """All values greater than the given value."""
  lng_gt: Float

  """All values greater than or equal the given value."""
  lng_gte: Float
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  user: UserWhereInput
  physicalProducts_every: PhysicalProductWhereInput
  physicalProducts_some: PhysicalProductWhereInput
  physicalProducts_none: PhysicalProductWhereInput
}

input LocationWhereUniqueInput {
  id: ID
  slug: String
}

"""
The \`Long\` scalar type represents non-fractional signed whole numeric values.
Long can represent values between -(2^63) and 2^63 - 1.
"""
scalar Long

enum Material {
  Acetate
  Acrylic
  Alpaca
  CalfLeather
  CamelHair
  Camel
  Cashmere
  Cotton
  CowLeather
  Cupro
  DuckFeathers
  Elastane
  Esterlane
  Feather
  FeatherDown
  GooseDown
  LambLeather
  LambSkin
  Leather
  Lyocell
  MerinoWool
  Modacrylic
  Mohair
  Nylon
  OrganicCotton
  Polyamide
  Polyester
  Polyethylene
  Polyurethane
  PolyurethanicResin
  PVC
  Rayon
  RecycledPolyester
  RecycledWool
  Silk
  Suede
  SheepLeather
  Spandex
  Taffeta
  Tartan
  VirginWool
  Viscose
  Velcro
  WaxCoating
  WhiteDuckDown
  WhiteGooseDown
  Wool
  Mesh
  Denim
  Lambswool
}

type Mutation {
  createBrand(data: BrandCreateInput!): Brand!
  createCollectionGroup(data: CollectionGroupCreateInput!): CollectionGroup!
  createHomepageProductRail(data: HomepageProductRailCreateInput!): HomepageProductRail!
  createImage(data: ImageCreateInput!): Image!
  createBagItem(data: BagItemCreateInput!): BagItem!
  createRecentlyViewedProduct(data: RecentlyViewedProductCreateInput!): RecentlyViewedProduct!
  createOrder(data: OrderCreateInput!): Order!
  createReservation(data: ReservationCreateInput!): Reservation!
  createProductRequest(data: ProductRequestCreateInput!): ProductRequest!
  createCollection(data: CollectionCreateInput!): Collection!
  createCategory(data: CategoryCreateInput!): Category!
  createCustomerDetail(data: CustomerDetailCreateInput!): CustomerDetail!
  createBillingInfo(data: BillingInfoCreateInput!): BillingInfo!
  createLocation(data: LocationCreateInput!): Location!
  createPackage(data: PackageCreateInput!): Package!
  createProductFunction(data: ProductFunctionCreateInput!): ProductFunction!
  createColor(data: ColorCreateInput!): Color!
  createLabel(data: LabelCreateInput!): Label!
  createPhysicalProduct(data: PhysicalProductCreateInput!): PhysicalProduct!
  createCustomer(data: CustomerCreateInput!): Customer!
  createProductVariant(data: ProductVariantCreateInput!): ProductVariant!
  createProduct(data: ProductCreateInput!): Product!
  createUser(data: UserCreateInput!): User!
  updateBrand(data: BrandUpdateInput!, where: BrandWhereUniqueInput!): Brand
  updateCollectionGroup(data: CollectionGroupUpdateInput!, where: CollectionGroupWhereUniqueInput!): CollectionGroup
  updateHomepageProductRail(data: HomepageProductRailUpdateInput!, where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  updateImage(data: ImageUpdateInput!, where: ImageWhereUniqueInput!): Image
  updateBagItem(data: BagItemUpdateInput!, where: BagItemWhereUniqueInput!): BagItem
  updateRecentlyViewedProduct(data: RecentlyViewedProductUpdateInput!, where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  updateReservation(data: ReservationUpdateInput!, where: ReservationWhereUniqueInput!): Reservation
  updateProductRequest(data: ProductRequestUpdateInput!, where: ProductRequestWhereUniqueInput!): ProductRequest
  updateCollection(data: CollectionUpdateInput!, where: CollectionWhereUniqueInput!): Collection
  updateCategory(data: CategoryUpdateInput!, where: CategoryWhereUniqueInput!): Category
  updateCustomerDetail(data: CustomerDetailUpdateInput!, where: CustomerDetailWhereUniqueInput!): CustomerDetail
  updateBillingInfo(data: BillingInfoUpdateInput!, where: BillingInfoWhereUniqueInput!): BillingInfo
  updateLocation(data: LocationUpdateInput!, where: LocationWhereUniqueInput!): Location
  updatePackage(data: PackageUpdateInput!, where: PackageWhereUniqueInput!): Package
  updateProductFunction(data: ProductFunctionUpdateInput!, where: ProductFunctionWhereUniqueInput!): ProductFunction
  updateColor(data: ColorUpdateInput!, where: ColorWhereUniqueInput!): Color
  updateLabel(data: LabelUpdateInput!, where: LabelWhereUniqueInput!): Label
  updatePhysicalProduct(data: PhysicalProductUpdateInput!, where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  updateCustomer(data: CustomerUpdateInput!, where: CustomerWhereUniqueInput!): Customer
  updateProductVariant(data: ProductVariantUpdateInput!, where: ProductVariantWhereUniqueInput!): ProductVariant
  updateProduct(data: ProductUpdateInput!, where: ProductWhereUniqueInput!): Product
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteBrand(where: BrandWhereUniqueInput!): Brand
  deleteCollectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  deleteHomepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  deleteImage(where: ImageWhereUniqueInput!): Image
  deleteBagItem(where: BagItemWhereUniqueInput!): BagItem
  deleteRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  deleteOrder(where: OrderWhereUniqueInput!): Order
  deleteReservation(where: ReservationWhereUniqueInput!): Reservation
  deleteProductRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  deleteCollection(where: CollectionWhereUniqueInput!): Collection
  deleteCategory(where: CategoryWhereUniqueInput!): Category
  deleteCustomerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  deleteBillingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  deleteLocation(where: LocationWhereUniqueInput!): Location
  deletePackage(where: PackageWhereUniqueInput!): Package
  deleteProductFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  deleteColor(where: ColorWhereUniqueInput!): Color
  deleteLabel(where: LabelWhereUniqueInput!): Label
  deletePhysicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  deleteCustomer(where: CustomerWhereUniqueInput!): Customer
  deleteProductVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  deleteProduct(where: ProductWhereUniqueInput!): Product
  deleteUser(where: UserWhereUniqueInput!): User
  upsertBrand(where: BrandWhereUniqueInput!, create: BrandCreateInput!, update: BrandUpdateInput!): Brand!
  upsertCollectionGroup(where: CollectionGroupWhereUniqueInput!, create: CollectionGroupCreateInput!, update: CollectionGroupUpdateInput!): CollectionGroup!
  upsertHomepageProductRail(where: HomepageProductRailWhereUniqueInput!, create: HomepageProductRailCreateInput!, update: HomepageProductRailUpdateInput!): HomepageProductRail!
  upsertImage(where: ImageWhereUniqueInput!, create: ImageCreateInput!, update: ImageUpdateInput!): Image!
  upsertBagItem(where: BagItemWhereUniqueInput!, create: BagItemCreateInput!, update: BagItemUpdateInput!): BagItem!
  upsertRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!, create: RecentlyViewedProductCreateInput!, update: RecentlyViewedProductUpdateInput!): RecentlyViewedProduct!
  upsertReservation(where: ReservationWhereUniqueInput!, create: ReservationCreateInput!, update: ReservationUpdateInput!): Reservation!
  upsertProductRequest(where: ProductRequestWhereUniqueInput!, create: ProductRequestCreateInput!, update: ProductRequestUpdateInput!): ProductRequest!
  upsertCollection(where: CollectionWhereUniqueInput!, create: CollectionCreateInput!, update: CollectionUpdateInput!): Collection!
  upsertCategory(where: CategoryWhereUniqueInput!, create: CategoryCreateInput!, update: CategoryUpdateInput!): Category!
  upsertCustomerDetail(where: CustomerDetailWhereUniqueInput!, create: CustomerDetailCreateInput!, update: CustomerDetailUpdateInput!): CustomerDetail!
  upsertBillingInfo(where: BillingInfoWhereUniqueInput!, create: BillingInfoCreateInput!, update: BillingInfoUpdateInput!): BillingInfo!
  upsertLocation(where: LocationWhereUniqueInput!, create: LocationCreateInput!, update: LocationUpdateInput!): Location!
  upsertPackage(where: PackageWhereUniqueInput!, create: PackageCreateInput!, update: PackageUpdateInput!): Package!
  upsertProductFunction(where: ProductFunctionWhereUniqueInput!, create: ProductFunctionCreateInput!, update: ProductFunctionUpdateInput!): ProductFunction!
  upsertColor(where: ColorWhereUniqueInput!, create: ColorCreateInput!, update: ColorUpdateInput!): Color!
  upsertLabel(where: LabelWhereUniqueInput!, create: LabelCreateInput!, update: LabelUpdateInput!): Label!
  upsertPhysicalProduct(where: PhysicalProductWhereUniqueInput!, create: PhysicalProductCreateInput!, update: PhysicalProductUpdateInput!): PhysicalProduct!
  upsertCustomer(where: CustomerWhereUniqueInput!, create: CustomerCreateInput!, update: CustomerUpdateInput!): Customer!
  upsertProductVariant(where: ProductVariantWhereUniqueInput!, create: ProductVariantCreateInput!, update: ProductVariantUpdateInput!): ProductVariant!
  upsertProduct(where: ProductWhereUniqueInput!, create: ProductCreateInput!, update: ProductUpdateInput!): Product!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  updateManyBrands(data: BrandUpdateManyMutationInput!, where: BrandWhereInput): BatchPayload!
  updateManyCollectionGroups(data: CollectionGroupUpdateManyMutationInput!, where: CollectionGroupWhereInput): BatchPayload!
  updateManyHomepageProductRails(data: HomepageProductRailUpdateManyMutationInput!, where: HomepageProductRailWhereInput): BatchPayload!
  updateManyImages(data: ImageUpdateManyMutationInput!, where: ImageWhereInput): BatchPayload!
  updateManyBagItems(data: BagItemUpdateManyMutationInput!, where: BagItemWhereInput): BatchPayload!
  updateManyRecentlyViewedProducts(data: RecentlyViewedProductUpdateManyMutationInput!, where: RecentlyViewedProductWhereInput): BatchPayload!
  updateManyReservations(data: ReservationUpdateManyMutationInput!, where: ReservationWhereInput): BatchPayload!
  updateManyProductRequests(data: ProductRequestUpdateManyMutationInput!, where: ProductRequestWhereInput): BatchPayload!
  updateManyCollections(data: CollectionUpdateManyMutationInput!, where: CollectionWhereInput): BatchPayload!
  updateManyCategories(data: CategoryUpdateManyMutationInput!, where: CategoryWhereInput): BatchPayload!
  updateManyCustomerDetails(data: CustomerDetailUpdateManyMutationInput!, where: CustomerDetailWhereInput): BatchPayload!
  updateManyBillingInfoes(data: BillingInfoUpdateManyMutationInput!, where: BillingInfoWhereInput): BatchPayload!
  updateManyLocations(data: LocationUpdateManyMutationInput!, where: LocationWhereInput): BatchPayload!
  updateManyPackages(data: PackageUpdateManyMutationInput!, where: PackageWhereInput): BatchPayload!
  updateManyProductFunctions(data: ProductFunctionUpdateManyMutationInput!, where: ProductFunctionWhereInput): BatchPayload!
  updateManyColors(data: ColorUpdateManyMutationInput!, where: ColorWhereInput): BatchPayload!
  updateManyLabels(data: LabelUpdateManyMutationInput!, where: LabelWhereInput): BatchPayload!
  updateManyPhysicalProducts(data: PhysicalProductUpdateManyMutationInput!, where: PhysicalProductWhereInput): BatchPayload!
  updateManyCustomers(data: CustomerUpdateManyMutationInput!, where: CustomerWhereInput): BatchPayload!
  updateManyProductVariants(data: ProductVariantUpdateManyMutationInput!, where: ProductVariantWhereInput): BatchPayload!
  updateManyProducts(data: ProductUpdateManyMutationInput!, where: ProductWhereInput): BatchPayload!
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  deleteManyBrands(where: BrandWhereInput): BatchPayload!
  deleteManyCollectionGroups(where: CollectionGroupWhereInput): BatchPayload!
  deleteManyHomepageProductRails(where: HomepageProductRailWhereInput): BatchPayload!
  deleteManyImages(where: ImageWhereInput): BatchPayload!
  deleteManyBagItems(where: BagItemWhereInput): BatchPayload!
  deleteManyRecentlyViewedProducts(where: RecentlyViewedProductWhereInput): BatchPayload!
  deleteManyOrders(where: OrderWhereInput): BatchPayload!
  deleteManyReservations(where: ReservationWhereInput): BatchPayload!
  deleteManyProductRequests(where: ProductRequestWhereInput): BatchPayload!
  deleteManyCollections(where: CollectionWhereInput): BatchPayload!
  deleteManyCategories(where: CategoryWhereInput): BatchPayload!
  deleteManyCustomerDetails(where: CustomerDetailWhereInput): BatchPayload!
  deleteManyBillingInfoes(where: BillingInfoWhereInput): BatchPayload!
  deleteManyLocations(where: LocationWhereInput): BatchPayload!
  deleteManyPackages(where: PackageWhereInput): BatchPayload!
  deleteManyProductFunctions(where: ProductFunctionWhereInput): BatchPayload!
  deleteManyColors(where: ColorWhereInput): BatchPayload!
  deleteManyLabels(where: LabelWhereInput): BatchPayload!
  deleteManyPhysicalProducts(where: PhysicalProductWhereInput): BatchPayload!
  deleteManyCustomers(where: CustomerWhereInput): BatchPayload!
  deleteManyProductVariants(where: ProductVariantWhereInput): BatchPayload!
  deleteManyProducts(where: ProductWhereInput): BatchPayload!
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

"""An object with an ID"""
interface Node {
  """The id of the object."""
  id: ID!
}

type Order implements Node {
  id: ID!
}

"""A connection to a list of items."""
type OrderConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [OrderEdge]!
  aggregate: AggregateOrder!
}

input OrderCreateInput {
  id: ID
}

"""An edge in a connection."""
type OrderEdge {
  """The item at the end of the edge."""
  node: Order!

  """A cursor for use in pagination."""
  cursor: String!
}

enum OrderOrderByInput {
  id_ASC
  id_DESC
}

type OrderPreviousValues {
  id: ID!
}

type OrderSubscriptionPayload {
  mutation: MutationType!
  node: Order
  updatedFields: [String!]
  previousValues: OrderPreviousValues
}

input OrderSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [OrderSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [OrderSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [OrderSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: OrderWhereInput
}

input OrderWhereInput {
  """Logical AND on all given filters."""
  AND: [OrderWhereInput!]

  """Logical OR on all given filters."""
  OR: [OrderWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [OrderWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
}

input OrderWhereUniqueInput {
  id: ID
}

type Package implements Node {
  id: ID!
  items(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  shippingLabel: Label!
  fromAddress: Location!
  toAddress: Location!
  weight: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type PackageConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [PackageEdge]!
  aggregate: AggregatePackage!
}

input PackageCreateInput {
  id: ID
  weight: Float
  items: PhysicalProductCreateManyInput
  shippingLabel: LabelCreateOneInput!
  fromAddress: LocationCreateOneInput!
  toAddress: LocationCreateOneInput!
}

input PackageCreateOneInput {
  create: PackageCreateInput
  connect: PackageWhereUniqueInput
}

"""An edge in a connection."""
type PackageEdge {
  """The item at the end of the edge."""
  node: Package!

  """A cursor for use in pagination."""
  cursor: String!
}

enum PackageOrderByInput {
  id_ASC
  id_DESC
  weight_ASC
  weight_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PackagePreviousValues {
  id: ID!
  weight: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PackageSubscriptionPayload {
  mutation: MutationType!
  node: Package
  updatedFields: [String!]
  previousValues: PackagePreviousValues
}

input PackageSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [PackageSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [PackageSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [PackageSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: PackageWhereInput
}

input PackageUpdateDataInput {
  weight: Float
  items: PhysicalProductUpdateManyInput
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
}

input PackageUpdateInput {
  weight: Float
  items: PhysicalProductUpdateManyInput
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
}

input PackageUpdateManyMutationInput {
  weight: Float
}

input PackageUpdateOneInput {
  create: PackageCreateInput
  connect: PackageWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: PackageUpdateDataInput
  upsert: PackageUpsertNestedInput
}

input PackageUpsertNestedInput {
  update: PackageUpdateDataInput!
  create: PackageCreateInput!
}

input PackageWhereInput {
  """Logical AND on all given filters."""
  AND: [PackageWhereInput!]

  """Logical OR on all given filters."""
  OR: [PackageWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [PackageWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  weight: Float

  """All values that are not equal to given value."""
  weight_not: Float

  """All values that are contained in given list."""
  weight_in: [Float!]

  """All values that are not contained in given list."""
  weight_not_in: [Float!]

  """All values less than the given value."""
  weight_lt: Float

  """All values less than or equal the given value."""
  weight_lte: Float

  """All values greater than the given value."""
  weight_gt: Float

  """All values greater than or equal the given value."""
  weight_gte: Float
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  items_every: PhysicalProductWhereInput
  items_some: PhysicalProductWhereInput
  items_none: PhysicalProductWhereInput
  shippingLabel: LabelWhereInput
  fromAddress: LocationWhereInput
  toAddress: LocationWhereInput
}

input PackageWhereUniqueInput {
  id: ID
}

"""Information about pagination in a connection."""
type PageInfo {
  """When paginating forwards, are there more items?"""
  hasNextPage: Boolean!

  """When paginating backwards, are there more items?"""
  hasPreviousPage: Boolean!

  """When paginating backwards, the cursor to continue."""
  startCursor: String

  """When paginating forwards, the cursor to continue."""
  endCursor: String
}

type PhysicalProduct implements Node {
  id: ID!
  seasonsUID: String!
  location: Location!
  productVariant: ProductVariant!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type PhysicalProductConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [PhysicalProductEdge]!
  aggregate: AggregatePhysicalProduct!
}

input PhysicalProductCreateInput {
  id: ID
  seasonsUID: String!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  location: LocationCreateOneWithoutPhysicalProductsInput!
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
}

input PhysicalProductCreateManyInput {
  create: [PhysicalProductCreateInput!]
  connect: [PhysicalProductWhereUniqueInput!]
}

input PhysicalProductCreateManyWithoutLocationInput {
  create: [PhysicalProductCreateWithoutLocationInput!]
  connect: [PhysicalProductWhereUniqueInput!]
}

input PhysicalProductCreateManyWithoutProductVariantInput {
  create: [PhysicalProductCreateWithoutProductVariantInput!]
  connect: [PhysicalProductWhereUniqueInput!]
}

input PhysicalProductCreateWithoutLocationInput {
  id: ID
  seasonsUID: String!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
}

input PhysicalProductCreateWithoutProductVariantInput {
  id: ID
  seasonsUID: String!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  location: LocationCreateOneWithoutPhysicalProductsInput!
}

"""An edge in a connection."""
type PhysicalProductEdge {
  """The item at the end of the edge."""
  node: PhysicalProduct!

  """A cursor for use in pagination."""
  cursor: String!
}

enum PhysicalProductOrderByInput {
  id_ASC
  id_DESC
  seasonsUID_ASC
  seasonsUID_DESC
  inventoryStatus_ASC
  inventoryStatus_DESC
  productStatus_ASC
  productStatus_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PhysicalProductPreviousValues {
  id: ID!
  seasonsUID: String!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input PhysicalProductScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [PhysicalProductScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [PhysicalProductScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [PhysicalProductScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  seasonsUID: String

  """All values that are not equal to given value."""
  seasonsUID_not: String

  """All values that are contained in given list."""
  seasonsUID_in: [String!]

  """All values that are not contained in given list."""
  seasonsUID_not_in: [String!]

  """All values less than the given value."""
  seasonsUID_lt: String

  """All values less than or equal the given value."""
  seasonsUID_lte: String

  """All values greater than the given value."""
  seasonsUID_gt: String

  """All values greater than or equal the given value."""
  seasonsUID_gte: String

  """All values containing the given string."""
  seasonsUID_contains: String

  """All values not containing the given string."""
  seasonsUID_not_contains: String

  """All values starting with the given string."""
  seasonsUID_starts_with: String

  """All values not starting with the given string."""
  seasonsUID_not_starts_with: String

  """All values ending with the given string."""
  seasonsUID_ends_with: String

  """All values not ending with the given string."""
  seasonsUID_not_ends_with: String
  inventoryStatus: InventoryStatus

  """All values that are not equal to given value."""
  inventoryStatus_not: InventoryStatus

  """All values that are contained in given list."""
  inventoryStatus_in: [InventoryStatus!]

  """All values that are not contained in given list."""
  inventoryStatus_not_in: [InventoryStatus!]
  productStatus: PhysicalProductStatus

  """All values that are not equal to given value."""
  productStatus_not: PhysicalProductStatus

  """All values that are contained in given list."""
  productStatus_in: [PhysicalProductStatus!]

  """All values that are not contained in given list."""
  productStatus_not_in: [PhysicalProductStatus!]
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

enum PhysicalProductStatus {
  New
  Used
  Damaged
  Clean
  Lost
}

type PhysicalProductSubscriptionPayload {
  mutation: MutationType!
  node: PhysicalProduct
  updatedFields: [String!]
  previousValues: PhysicalProductPreviousValues
}

input PhysicalProductSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [PhysicalProductSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [PhysicalProductSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [PhysicalProductSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: PhysicalProductWhereInput
}

input PhysicalProductUpdateDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
}

input PhysicalProductUpdateInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
}

input PhysicalProductUpdateManyDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateManyInput {
  create: [PhysicalProductCreateInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueNestedInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueNestedInput!]
}

input PhysicalProductUpdateManyMutationInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateManyWithoutLocationInput {
  create: [PhysicalProductCreateWithoutLocationInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueWithoutLocationInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueWithoutLocationInput!]
}

input PhysicalProductUpdateManyWithoutProductVariantInput {
  create: [PhysicalProductCreateWithoutProductVariantInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput!]
}

input PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput!
  data: PhysicalProductUpdateManyDataInput!
}

input PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
}

input PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
}

input PhysicalProductUpdateWithWhereUniqueNestedInput {
  where: PhysicalProductWhereUniqueInput!
  data: PhysicalProductUpdateDataInput!
}

input PhysicalProductUpdateWithWhereUniqueWithoutLocationInput {
  where: PhysicalProductWhereUniqueInput!
  data: PhysicalProductUpdateWithoutLocationDataInput!
}

input PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput {
  where: PhysicalProductWhereUniqueInput!
  data: PhysicalProductUpdateWithoutProductVariantDataInput!
}

input PhysicalProductUpsertWithWhereUniqueNestedInput {
  where: PhysicalProductWhereUniqueInput!
  update: PhysicalProductUpdateDataInput!
  create: PhysicalProductCreateInput!
}

input PhysicalProductUpsertWithWhereUniqueWithoutLocationInput {
  where: PhysicalProductWhereUniqueInput!
  update: PhysicalProductUpdateWithoutLocationDataInput!
  create: PhysicalProductCreateWithoutLocationInput!
}

input PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput {
  where: PhysicalProductWhereUniqueInput!
  update: PhysicalProductUpdateWithoutProductVariantDataInput!
  create: PhysicalProductCreateWithoutProductVariantInput!
}

input PhysicalProductWhereInput {
  """Logical AND on all given filters."""
  AND: [PhysicalProductWhereInput!]

  """Logical OR on all given filters."""
  OR: [PhysicalProductWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [PhysicalProductWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  seasonsUID: String

  """All values that are not equal to given value."""
  seasonsUID_not: String

  """All values that are contained in given list."""
  seasonsUID_in: [String!]

  """All values that are not contained in given list."""
  seasonsUID_not_in: [String!]

  """All values less than the given value."""
  seasonsUID_lt: String

  """All values less than or equal the given value."""
  seasonsUID_lte: String

  """All values greater than the given value."""
  seasonsUID_gt: String

  """All values greater than or equal the given value."""
  seasonsUID_gte: String

  """All values containing the given string."""
  seasonsUID_contains: String

  """All values not containing the given string."""
  seasonsUID_not_contains: String

  """All values starting with the given string."""
  seasonsUID_starts_with: String

  """All values not starting with the given string."""
  seasonsUID_not_starts_with: String

  """All values ending with the given string."""
  seasonsUID_ends_with: String

  """All values not ending with the given string."""
  seasonsUID_not_ends_with: String
  inventoryStatus: InventoryStatus

  """All values that are not equal to given value."""
  inventoryStatus_not: InventoryStatus

  """All values that are contained in given list."""
  inventoryStatus_in: [InventoryStatus!]

  """All values that are not contained in given list."""
  inventoryStatus_not_in: [InventoryStatus!]
  productStatus: PhysicalProductStatus

  """All values that are not equal to given value."""
  productStatus_not: PhysicalProductStatus

  """All values that are contained in given list."""
  productStatus_in: [PhysicalProductStatus!]

  """All values that are not contained in given list."""
  productStatus_not_in: [PhysicalProductStatus!]
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  location: LocationWhereInput
  productVariant: ProductVariantWhereInput
}

input PhysicalProductWhereUniqueInput {
  id: ID
  seasonsUID: String
}

enum Plan {
  AllAccess
  Essential
}

type Product implements Node {
  id: ID!
  slug: String!
  name: String!
  brand: Brand!
  category: Category!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: Color!
  secondaryColor: Color
  tags: Json
  functions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction!]
  availableSizes: [Size!]!
  innerMaterials: [Material!]!
  outerMaterials: [Material!]!
  variants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant!]
  status: ProductStatus
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type ProductConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductEdge]!
  aggregate: AggregateProduct!
}

input ProductCreateavailableSizesInput {
  set: [Size!]
}

input ProductCreateinnerMaterialsInput {
  set: [Material!]
}

input ProductCreateInput {
  id: ID
  slug: String!
  name: String!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateManyInput {
  create: [ProductCreateInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateManyWithoutBrandInput {
  create: [ProductCreateWithoutBrandInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateManyWithoutCategoryInput {
  create: [ProductCreateWithoutCategoryInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateOneInput {
  create: ProductCreateInput
  connect: ProductWhereUniqueInput
}

input ProductCreateOneWithoutVariantsInput {
  create: ProductCreateWithoutVariantsInput
  connect: ProductWhereUniqueInput
}

input ProductCreateouterMaterialsInput {
  set: [Material!]
}

input ProductCreateWithoutBrandInput {
  id: ID
  slug: String!
  name: String!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  category: CategoryCreateOneWithoutProductsInput!
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateWithoutCategoryInput {
  id: ID
  slug: String!
  name: String!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateWithoutVariantsInput {
  id: ID
  slug: String!
  name: String!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
}

"""An edge in a connection."""
type ProductEdge {
  """The item at the end of the edge."""
  node: Product!

  """A cursor for use in pagination."""
  cursor: String!
}

type ProductFunction implements Node {
  id: ID!
  name: String
}

"""A connection to a list of items."""
type ProductFunctionConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductFunctionEdge]!
  aggregate: AggregateProductFunction!
}

input ProductFunctionCreateInput {
  id: ID
  name: String
}

input ProductFunctionCreateManyInput {
  create: [ProductFunctionCreateInput!]
  connect: [ProductFunctionWhereUniqueInput!]
}

"""An edge in a connection."""
type ProductFunctionEdge {
  """The item at the end of the edge."""
  node: ProductFunction!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductFunctionOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
}

type ProductFunctionPreviousValues {
  id: ID!
  name: String
}

input ProductFunctionScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductFunctionScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductFunctionScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductFunctionScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
}

type ProductFunctionSubscriptionPayload {
  mutation: MutationType!
  node: ProductFunction
  updatedFields: [String!]
  previousValues: ProductFunctionPreviousValues
}

input ProductFunctionSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductFunctionSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductFunctionSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductFunctionSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ProductFunctionWhereInput
}

input ProductFunctionUpdateDataInput {
  name: String
}

input ProductFunctionUpdateInput {
  name: String
}

input ProductFunctionUpdateManyDataInput {
  name: String
}

input ProductFunctionUpdateManyInput {
  create: [ProductFunctionCreateInput!]
  connect: [ProductFunctionWhereUniqueInput!]
  set: [ProductFunctionWhereUniqueInput!]
  disconnect: [ProductFunctionWhereUniqueInput!]
  delete: [ProductFunctionWhereUniqueInput!]
  update: [ProductFunctionUpdateWithWhereUniqueNestedInput!]
  updateMany: [ProductFunctionUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductFunctionScalarWhereInput!]
  upsert: [ProductFunctionUpsertWithWhereUniqueNestedInput!]
}

input ProductFunctionUpdateManyMutationInput {
  name: String
}

input ProductFunctionUpdateManyWithWhereNestedInput {
  where: ProductFunctionScalarWhereInput!
  data: ProductFunctionUpdateManyDataInput!
}

input ProductFunctionUpdateWithWhereUniqueNestedInput {
  where: ProductFunctionWhereUniqueInput!
  data: ProductFunctionUpdateDataInput!
}

input ProductFunctionUpsertWithWhereUniqueNestedInput {
  where: ProductFunctionWhereUniqueInput!
  update: ProductFunctionUpdateDataInput!
  create: ProductFunctionCreateInput!
}

input ProductFunctionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductFunctionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductFunctionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductFunctionWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
}

input ProductFunctionWhereUniqueInput {
  id: ID
  name: String
}

enum ProductOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  externalURL_ASC
  externalURL_DESC
  images_ASC
  images_DESC
  modelHeight_ASC
  modelHeight_DESC
  modelSize_ASC
  modelSize_DESC
  retailPrice_ASC
  retailPrice_DESC
  tags_ASC
  tags_DESC
  status_ASC
  status_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ProductPreviousValues {
  id: ID!
  slug: String!
  name: String!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  availableSizes: [Size!]!
  innerMaterials: [Material!]!
  outerMaterials: [Material!]!
  status: ProductStatus
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProductRequest implements Node {
  id: ID!
  brand: String
  description: String
  images: [String!]!
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String!
  sku: String
  url: String!
  user: User!
}

"""A connection to a list of items."""
type ProductRequestConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductRequestEdge]!
  aggregate: AggregateProductRequest!
}

input ProductRequestCreateimagesInput {
  set: [String!]
}

input ProductRequestCreateInput {
  id: ID
  brand: String
  description: String
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String!
  sku: String
  url: String!
  images: ProductRequestCreateimagesInput
  user: UserCreateOneInput!
}

"""An edge in a connection."""
type ProductRequestEdge {
  """The item at the end of the edge."""
  node: ProductRequest!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductRequestOrderByInput {
  id_ASC
  id_DESC
  brand_ASC
  brand_DESC
  description_ASC
  description_DESC
  name_ASC
  name_DESC
  price_ASC
  price_DESC
  priceCurrency_ASC
  priceCurrency_DESC
  productID_ASC
  productID_DESC
  reason_ASC
  reason_DESC
  sku_ASC
  sku_DESC
  url_ASC
  url_DESC
}

type ProductRequestPreviousValues {
  id: ID!
  brand: String
  description: String
  images: [String!]!
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String!
  sku: String
  url: String!
}

type ProductRequestSubscriptionPayload {
  mutation: MutationType!
  node: ProductRequest
  updatedFields: [String!]
  previousValues: ProductRequestPreviousValues
}

input ProductRequestSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductRequestSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductRequestSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductRequestSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ProductRequestWhereInput
}

input ProductRequestUpdateimagesInput {
  set: [String!]
}

input ProductRequestUpdateInput {
  brand: String
  description: String
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String
  sku: String
  url: String
  images: ProductRequestUpdateimagesInput
  user: UserUpdateOneRequiredInput
}

input ProductRequestUpdateManyMutationInput {
  brand: String
  description: String
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String
  sku: String
  url: String
  images: ProductRequestUpdateimagesInput
}

input ProductRequestWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductRequestWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductRequestWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductRequestWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  brand: String

  """All values that are not equal to given value."""
  brand_not: String

  """All values that are contained in given list."""
  brand_in: [String!]

  """All values that are not contained in given list."""
  brand_not_in: [String!]

  """All values less than the given value."""
  brand_lt: String

  """All values less than or equal the given value."""
  brand_lte: String

  """All values greater than the given value."""
  brand_gt: String

  """All values greater than or equal the given value."""
  brand_gte: String

  """All values containing the given string."""
  brand_contains: String

  """All values not containing the given string."""
  brand_not_contains: String

  """All values starting with the given string."""
  brand_starts_with: String

  """All values not starting with the given string."""
  brand_not_starts_with: String

  """All values ending with the given string."""
  brand_ends_with: String

  """All values not ending with the given string."""
  brand_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  price: Int

  """All values that are not equal to given value."""
  price_not: Int

  """All values that are contained in given list."""
  price_in: [Int!]

  """All values that are not contained in given list."""
  price_not_in: [Int!]

  """All values less than the given value."""
  price_lt: Int

  """All values less than or equal the given value."""
  price_lte: Int

  """All values greater than the given value."""
  price_gt: Int

  """All values greater than or equal the given value."""
  price_gte: Int
  priceCurrency: String

  """All values that are not equal to given value."""
  priceCurrency_not: String

  """All values that are contained in given list."""
  priceCurrency_in: [String!]

  """All values that are not contained in given list."""
  priceCurrency_not_in: [String!]

  """All values less than the given value."""
  priceCurrency_lt: String

  """All values less than or equal the given value."""
  priceCurrency_lte: String

  """All values greater than the given value."""
  priceCurrency_gt: String

  """All values greater than or equal the given value."""
  priceCurrency_gte: String

  """All values containing the given string."""
  priceCurrency_contains: String

  """All values not containing the given string."""
  priceCurrency_not_contains: String

  """All values starting with the given string."""
  priceCurrency_starts_with: String

  """All values not starting with the given string."""
  priceCurrency_not_starts_with: String

  """All values ending with the given string."""
  priceCurrency_ends_with: String

  """All values not ending with the given string."""
  priceCurrency_not_ends_with: String
  productID: String

  """All values that are not equal to given value."""
  productID_not: String

  """All values that are contained in given list."""
  productID_in: [String!]

  """All values that are not contained in given list."""
  productID_not_in: [String!]

  """All values less than the given value."""
  productID_lt: String

  """All values less than or equal the given value."""
  productID_lte: String

  """All values greater than the given value."""
  productID_gt: String

  """All values greater than or equal the given value."""
  productID_gte: String

  """All values containing the given string."""
  productID_contains: String

  """All values not containing the given string."""
  productID_not_contains: String

  """All values starting with the given string."""
  productID_starts_with: String

  """All values not starting with the given string."""
  productID_not_starts_with: String

  """All values ending with the given string."""
  productID_ends_with: String

  """All values not ending with the given string."""
  productID_not_ends_with: String
  reason: String

  """All values that are not equal to given value."""
  reason_not: String

  """All values that are contained in given list."""
  reason_in: [String!]

  """All values that are not contained in given list."""
  reason_not_in: [String!]

  """All values less than the given value."""
  reason_lt: String

  """All values less than or equal the given value."""
  reason_lte: String

  """All values greater than the given value."""
  reason_gt: String

  """All values greater than or equal the given value."""
  reason_gte: String

  """All values containing the given string."""
  reason_contains: String

  """All values not containing the given string."""
  reason_not_contains: String

  """All values starting with the given string."""
  reason_starts_with: String

  """All values not starting with the given string."""
  reason_not_starts_with: String

  """All values ending with the given string."""
  reason_ends_with: String

  """All values not ending with the given string."""
  reason_not_ends_with: String
  sku: String

  """All values that are not equal to given value."""
  sku_not: String

  """All values that are contained in given list."""
  sku_in: [String!]

  """All values that are not contained in given list."""
  sku_not_in: [String!]

  """All values less than the given value."""
  sku_lt: String

  """All values less than or equal the given value."""
  sku_lte: String

  """All values greater than the given value."""
  sku_gt: String

  """All values greater than or equal the given value."""
  sku_gte: String

  """All values containing the given string."""
  sku_contains: String

  """All values not containing the given string."""
  sku_not_contains: String

  """All values starting with the given string."""
  sku_starts_with: String

  """All values not starting with the given string."""
  sku_not_starts_with: String

  """All values ending with the given string."""
  sku_ends_with: String

  """All values not ending with the given string."""
  sku_not_ends_with: String
  url: String

  """All values that are not equal to given value."""
  url_not: String

  """All values that are contained in given list."""
  url_in: [String!]

  """All values that are not contained in given list."""
  url_not_in: [String!]

  """All values less than the given value."""
  url_lt: String

  """All values less than or equal the given value."""
  url_lte: String

  """All values greater than the given value."""
  url_gt: String

  """All values greater than or equal the given value."""
  url_gte: String

  """All values containing the given string."""
  url_contains: String

  """All values not containing the given string."""
  url_not_contains: String

  """All values starting with the given string."""
  url_starts_with: String

  """All values not starting with the given string."""
  url_not_starts_with: String

  """All values ending with the given string."""
  url_ends_with: String

  """All values not ending with the given string."""
  url_not_ends_with: String
  user: UserWhereInput
}

input ProductRequestWhereUniqueInput {
  id: ID
}

input ProductScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  externalURL: String

  """All values that are not equal to given value."""
  externalURL_not: String

  """All values that are contained in given list."""
  externalURL_in: [String!]

  """All values that are not contained in given list."""
  externalURL_not_in: [String!]

  """All values less than the given value."""
  externalURL_lt: String

  """All values less than or equal the given value."""
  externalURL_lte: String

  """All values greater than the given value."""
  externalURL_gt: String

  """All values greater than or equal the given value."""
  externalURL_gte: String

  """All values containing the given string."""
  externalURL_contains: String

  """All values not containing the given string."""
  externalURL_not_contains: String

  """All values starting with the given string."""
  externalURL_starts_with: String

  """All values not starting with the given string."""
  externalURL_not_starts_with: String

  """All values ending with the given string."""
  externalURL_ends_with: String

  """All values not ending with the given string."""
  externalURL_not_ends_with: String
  modelHeight: Int

  """All values that are not equal to given value."""
  modelHeight_not: Int

  """All values that are contained in given list."""
  modelHeight_in: [Int!]

  """All values that are not contained in given list."""
  modelHeight_not_in: [Int!]

  """All values less than the given value."""
  modelHeight_lt: Int

  """All values less than or equal the given value."""
  modelHeight_lte: Int

  """All values greater than the given value."""
  modelHeight_gt: Int

  """All values greater than or equal the given value."""
  modelHeight_gte: Int
  modelSize: Size

  """All values that are not equal to given value."""
  modelSize_not: Size

  """All values that are contained in given list."""
  modelSize_in: [Size!]

  """All values that are not contained in given list."""
  modelSize_not_in: [Size!]
  retailPrice: Int

  """All values that are not equal to given value."""
  retailPrice_not: Int

  """All values that are contained in given list."""
  retailPrice_in: [Int!]

  """All values that are not contained in given list."""
  retailPrice_not_in: [Int!]

  """All values less than the given value."""
  retailPrice_lt: Int

  """All values less than or equal the given value."""
  retailPrice_lte: Int

  """All values greater than the given value."""
  retailPrice_gt: Int

  """All values greater than or equal the given value."""
  retailPrice_gte: Int
  status: ProductStatus

  """All values that are not equal to given value."""
  status_not: ProductStatus

  """All values that are contained in given list."""
  status_in: [ProductStatus!]

  """All values that are not contained in given list."""
  status_not_in: [ProductStatus!]
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

enum ProductStatus {
  Available
  NotAvailable
}

type ProductSubscriptionPayload {
  mutation: MutationType!
  node: Product
  updatedFields: [String!]
  previousValues: ProductPreviousValues
}

input ProductSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ProductWhereInput
}

input ProductUpdateavailableSizesInput {
  set: [Size!]
}

input ProductUpdateDataInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateinnerMaterialsInput {
  set: [Material!]
}

input ProductUpdateInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateManyDataInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
}

input ProductUpdateManyInput {
  create: [ProductCreateInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  delete: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueNestedInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductScalarWhereInput!]
  upsert: [ProductUpsertWithWhereUniqueNestedInput!]
}

input ProductUpdateManyMutationInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
}

input ProductUpdateManyWithoutBrandInput {
  create: [ProductCreateWithoutBrandInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  delete: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutBrandInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductScalarWhereInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutBrandInput!]
}

input ProductUpdateManyWithoutCategoryInput {
  create: [ProductCreateWithoutCategoryInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  delete: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutCategoryInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductScalarWhereInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutCategoryInput!]
}

input ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput!
  data: ProductUpdateManyDataInput!
}

input ProductUpdateOneRequiredInput {
  create: ProductCreateInput
  connect: ProductWhereUniqueInput
  update: ProductUpdateDataInput
  upsert: ProductUpsertNestedInput
}

input ProductUpdateOneRequiredWithoutVariantsInput {
  create: ProductCreateWithoutVariantsInput
  connect: ProductWhereUniqueInput
  update: ProductUpdateWithoutVariantsDataInput
  upsert: ProductUpsertWithoutVariantsInput
}

input ProductUpdateouterMaterialsInput {
  set: [Material!]
}

input ProductUpdateWithoutBrandDataInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateWithoutCategoryDataInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateWithoutVariantsDataInput {
  slug: String
  name: String
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  tags: Json
  status: ProductStatus
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
}

input ProductUpdateWithWhereUniqueNestedInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateDataInput!
}

input ProductUpdateWithWhereUniqueWithoutBrandInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutBrandDataInput!
}

input ProductUpdateWithWhereUniqueWithoutCategoryInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutCategoryDataInput!
}

input ProductUpsertNestedInput {
  update: ProductUpdateDataInput!
  create: ProductCreateInput!
}

input ProductUpsertWithoutVariantsInput {
  update: ProductUpdateWithoutVariantsDataInput!
  create: ProductCreateWithoutVariantsInput!
}

input ProductUpsertWithWhereUniqueNestedInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateDataInput!
  create: ProductCreateInput!
}

input ProductUpsertWithWhereUniqueWithoutBrandInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutBrandDataInput!
  create: ProductCreateWithoutBrandInput!
}

input ProductUpsertWithWhereUniqueWithoutCategoryInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutCategoryDataInput!
  create: ProductCreateWithoutCategoryInput!
}

type ProductVariant implements Node {
  id: ID!
  sku: String
  color: Color!
  size: Size!
  weight: Float
  height: Float
  productID: String!
  product: Product!
  retailPrice: Float
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type ProductVariantConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductVariantEdge]!
  aggregate: AggregateProductVariant!
}

input ProductVariantCreateInput {
  id: ID
  sku: String
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  product: ProductCreateOneWithoutVariantsInput!
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
}

input ProductVariantCreateManyWithoutColorInput {
  create: [ProductVariantCreateWithoutColorInput!]
  connect: [ProductVariantWhereUniqueInput!]
}

input ProductVariantCreateManyWithoutProductInput {
  create: [ProductVariantCreateWithoutProductInput!]
  connect: [ProductVariantWhereUniqueInput!]
}

input ProductVariantCreateOneInput {
  create: ProductVariantCreateInput
  connect: ProductVariantWhereUniqueInput
}

input ProductVariantCreateOneWithoutPhysicalProductsInput {
  create: ProductVariantCreateWithoutPhysicalProductsInput
  connect: ProductVariantWhereUniqueInput
}

input ProductVariantCreateWithoutColorInput {
  id: ID
  sku: String
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  product: ProductCreateOneWithoutVariantsInput!
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
}

input ProductVariantCreateWithoutPhysicalProductsInput {
  id: ID
  sku: String
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  product: ProductCreateOneWithoutVariantsInput!
}

input ProductVariantCreateWithoutProductInput {
  id: ID
  sku: String
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
}

"""An edge in a connection."""
type ProductVariantEdge {
  """The item at the end of the edge."""
  node: ProductVariant!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductVariantOrderByInput {
  id_ASC
  id_DESC
  sku_ASC
  sku_DESC
  size_ASC
  size_DESC
  weight_ASC
  weight_DESC
  height_ASC
  height_DESC
  productID_ASC
  productID_DESC
  retailPrice_ASC
  retailPrice_DESC
  total_ASC
  total_DESC
  reservable_ASC
  reservable_DESC
  reserved_ASC
  reserved_DESC
  nonReservable_ASC
  nonReservable_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ProductVariantPreviousValues {
  id: ID!
  sku: String
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ProductVariantScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  sku: String

  """All values that are not equal to given value."""
  sku_not: String

  """All values that are contained in given list."""
  sku_in: [String!]

  """All values that are not contained in given list."""
  sku_not_in: [String!]

  """All values less than the given value."""
  sku_lt: String

  """All values less than or equal the given value."""
  sku_lte: String

  """All values greater than the given value."""
  sku_gt: String

  """All values greater than or equal the given value."""
  sku_gte: String

  """All values containing the given string."""
  sku_contains: String

  """All values not containing the given string."""
  sku_not_contains: String

  """All values starting with the given string."""
  sku_starts_with: String

  """All values not starting with the given string."""
  sku_not_starts_with: String

  """All values ending with the given string."""
  sku_ends_with: String

  """All values not ending with the given string."""
  sku_not_ends_with: String
  size: Size

  """All values that are not equal to given value."""
  size_not: Size

  """All values that are contained in given list."""
  size_in: [Size!]

  """All values that are not contained in given list."""
  size_not_in: [Size!]
  weight: Float

  """All values that are not equal to given value."""
  weight_not: Float

  """All values that are contained in given list."""
  weight_in: [Float!]

  """All values that are not contained in given list."""
  weight_not_in: [Float!]

  """All values less than the given value."""
  weight_lt: Float

  """All values less than or equal the given value."""
  weight_lte: Float

  """All values greater than the given value."""
  weight_gt: Float

  """All values greater than or equal the given value."""
  weight_gte: Float
  height: Float

  """All values that are not equal to given value."""
  height_not: Float

  """All values that are contained in given list."""
  height_in: [Float!]

  """All values that are not contained in given list."""
  height_not_in: [Float!]

  """All values less than the given value."""
  height_lt: Float

  """All values less than or equal the given value."""
  height_lte: Float

  """All values greater than the given value."""
  height_gt: Float

  """All values greater than or equal the given value."""
  height_gte: Float
  productID: String

  """All values that are not equal to given value."""
  productID_not: String

  """All values that are contained in given list."""
  productID_in: [String!]

  """All values that are not contained in given list."""
  productID_not_in: [String!]

  """All values less than the given value."""
  productID_lt: String

  """All values less than or equal the given value."""
  productID_lte: String

  """All values greater than the given value."""
  productID_gt: String

  """All values greater than or equal the given value."""
  productID_gte: String

  """All values containing the given string."""
  productID_contains: String

  """All values not containing the given string."""
  productID_not_contains: String

  """All values starting with the given string."""
  productID_starts_with: String

  """All values not starting with the given string."""
  productID_not_starts_with: String

  """All values ending with the given string."""
  productID_ends_with: String

  """All values not ending with the given string."""
  productID_not_ends_with: String
  retailPrice: Float

  """All values that are not equal to given value."""
  retailPrice_not: Float

  """All values that are contained in given list."""
  retailPrice_in: [Float!]

  """All values that are not contained in given list."""
  retailPrice_not_in: [Float!]

  """All values less than the given value."""
  retailPrice_lt: Float

  """All values less than or equal the given value."""
  retailPrice_lte: Float

  """All values greater than the given value."""
  retailPrice_gt: Float

  """All values greater than or equal the given value."""
  retailPrice_gte: Float
  total: Int

  """All values that are not equal to given value."""
  total_not: Int

  """All values that are contained in given list."""
  total_in: [Int!]

  """All values that are not contained in given list."""
  total_not_in: [Int!]

  """All values less than the given value."""
  total_lt: Int

  """All values less than or equal the given value."""
  total_lte: Int

  """All values greater than the given value."""
  total_gt: Int

  """All values greater than or equal the given value."""
  total_gte: Int
  reservable: Int

  """All values that are not equal to given value."""
  reservable_not: Int

  """All values that are contained in given list."""
  reservable_in: [Int!]

  """All values that are not contained in given list."""
  reservable_not_in: [Int!]

  """All values less than the given value."""
  reservable_lt: Int

  """All values less than or equal the given value."""
  reservable_lte: Int

  """All values greater than the given value."""
  reservable_gt: Int

  """All values greater than or equal the given value."""
  reservable_gte: Int
  reserved: Int

  """All values that are not equal to given value."""
  reserved_not: Int

  """All values that are contained in given list."""
  reserved_in: [Int!]

  """All values that are not contained in given list."""
  reserved_not_in: [Int!]

  """All values less than the given value."""
  reserved_lt: Int

  """All values less than or equal the given value."""
  reserved_lte: Int

  """All values greater than the given value."""
  reserved_gt: Int

  """All values greater than or equal the given value."""
  reserved_gte: Int
  nonReservable: Int

  """All values that are not equal to given value."""
  nonReservable_not: Int

  """All values that are contained in given list."""
  nonReservable_in: [Int!]

  """All values that are not contained in given list."""
  nonReservable_not_in: [Int!]

  """All values less than the given value."""
  nonReservable_lt: Int

  """All values less than or equal the given value."""
  nonReservable_lte: Int

  """All values greater than the given value."""
  nonReservable_gt: Int

  """All values greater than or equal the given value."""
  nonReservable_gte: Int
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

type ProductVariantSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariant
  updatedFields: [String!]
  previousValues: ProductVariantPreviousValues
}

input ProductVariantSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ProductVariantWhereInput
}

input ProductVariantUpdateDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateManyDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

input ProductVariantUpdateManyMutationInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

input ProductVariantUpdateManyWithoutColorInput {
  create: [ProductVariantCreateWithoutColorInput!]
  connect: [ProductVariantWhereUniqueInput!]
  set: [ProductVariantWhereUniqueInput!]
  disconnect: [ProductVariantWhereUniqueInput!]
  delete: [ProductVariantWhereUniqueInput!]
  update: [ProductVariantUpdateWithWhereUniqueWithoutColorInput!]
  updateMany: [ProductVariantUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductVariantScalarWhereInput!]
  upsert: [ProductVariantUpsertWithWhereUniqueWithoutColorInput!]
}

input ProductVariantUpdateManyWithoutProductInput {
  create: [ProductVariantCreateWithoutProductInput!]
  connect: [ProductVariantWhereUniqueInput!]
  set: [ProductVariantWhereUniqueInput!]
  disconnect: [ProductVariantWhereUniqueInput!]
  delete: [ProductVariantWhereUniqueInput!]
  update: [ProductVariantUpdateWithWhereUniqueWithoutProductInput!]
  updateMany: [ProductVariantUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductVariantScalarWhereInput!]
  upsert: [ProductVariantUpsertWithWhereUniqueWithoutProductInput!]
}

input ProductVariantUpdateManyWithWhereNestedInput {
  where: ProductVariantScalarWhereInput!
  data: ProductVariantUpdateManyDataInput!
}

input ProductVariantUpdateOneRequiredInput {
  create: ProductVariantCreateInput
  connect: ProductVariantWhereUniqueInput
  update: ProductVariantUpdateDataInput
  upsert: ProductVariantUpsertNestedInput
}

input ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput {
  create: ProductVariantCreateWithoutPhysicalProductsInput
  connect: ProductVariantWhereUniqueInput
  update: ProductVariantUpdateWithoutPhysicalProductsDataInput
  upsert: ProductVariantUpsertWithoutPhysicalProductsInput
}

input ProductVariantUpdateWithoutColorDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
}

input ProductVariantUpdateWithoutProductDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateWithWhereUniqueWithoutColorInput {
  where: ProductVariantWhereUniqueInput!
  data: ProductVariantUpdateWithoutColorDataInput!
}

input ProductVariantUpdateWithWhereUniqueWithoutProductInput {
  where: ProductVariantWhereUniqueInput!
  data: ProductVariantUpdateWithoutProductDataInput!
}

input ProductVariantUpsertNestedInput {
  update: ProductVariantUpdateDataInput!
  create: ProductVariantCreateInput!
}

input ProductVariantUpsertWithoutPhysicalProductsInput {
  update: ProductVariantUpdateWithoutPhysicalProductsDataInput!
  create: ProductVariantCreateWithoutPhysicalProductsInput!
}

input ProductVariantUpsertWithWhereUniqueWithoutColorInput {
  where: ProductVariantWhereUniqueInput!
  update: ProductVariantUpdateWithoutColorDataInput!
  create: ProductVariantCreateWithoutColorInput!
}

input ProductVariantUpsertWithWhereUniqueWithoutProductInput {
  where: ProductVariantWhereUniqueInput!
  update: ProductVariantUpdateWithoutProductDataInput!
  create: ProductVariantCreateWithoutProductInput!
}

input ProductVariantWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  sku: String

  """All values that are not equal to given value."""
  sku_not: String

  """All values that are contained in given list."""
  sku_in: [String!]

  """All values that are not contained in given list."""
  sku_not_in: [String!]

  """All values less than the given value."""
  sku_lt: String

  """All values less than or equal the given value."""
  sku_lte: String

  """All values greater than the given value."""
  sku_gt: String

  """All values greater than or equal the given value."""
  sku_gte: String

  """All values containing the given string."""
  sku_contains: String

  """All values not containing the given string."""
  sku_not_contains: String

  """All values starting with the given string."""
  sku_starts_with: String

  """All values not starting with the given string."""
  sku_not_starts_with: String

  """All values ending with the given string."""
  sku_ends_with: String

  """All values not ending with the given string."""
  sku_not_ends_with: String
  size: Size

  """All values that are not equal to given value."""
  size_not: Size

  """All values that are contained in given list."""
  size_in: [Size!]

  """All values that are not contained in given list."""
  size_not_in: [Size!]
  weight: Float

  """All values that are not equal to given value."""
  weight_not: Float

  """All values that are contained in given list."""
  weight_in: [Float!]

  """All values that are not contained in given list."""
  weight_not_in: [Float!]

  """All values less than the given value."""
  weight_lt: Float

  """All values less than or equal the given value."""
  weight_lte: Float

  """All values greater than the given value."""
  weight_gt: Float

  """All values greater than or equal the given value."""
  weight_gte: Float
  height: Float

  """All values that are not equal to given value."""
  height_not: Float

  """All values that are contained in given list."""
  height_in: [Float!]

  """All values that are not contained in given list."""
  height_not_in: [Float!]

  """All values less than the given value."""
  height_lt: Float

  """All values less than or equal the given value."""
  height_lte: Float

  """All values greater than the given value."""
  height_gt: Float

  """All values greater than or equal the given value."""
  height_gte: Float
  productID: String

  """All values that are not equal to given value."""
  productID_not: String

  """All values that are contained in given list."""
  productID_in: [String!]

  """All values that are not contained in given list."""
  productID_not_in: [String!]

  """All values less than the given value."""
  productID_lt: String

  """All values less than or equal the given value."""
  productID_lte: String

  """All values greater than the given value."""
  productID_gt: String

  """All values greater than or equal the given value."""
  productID_gte: String

  """All values containing the given string."""
  productID_contains: String

  """All values not containing the given string."""
  productID_not_contains: String

  """All values starting with the given string."""
  productID_starts_with: String

  """All values not starting with the given string."""
  productID_not_starts_with: String

  """All values ending with the given string."""
  productID_ends_with: String

  """All values not ending with the given string."""
  productID_not_ends_with: String
  retailPrice: Float

  """All values that are not equal to given value."""
  retailPrice_not: Float

  """All values that are contained in given list."""
  retailPrice_in: [Float!]

  """All values that are not contained in given list."""
  retailPrice_not_in: [Float!]

  """All values less than the given value."""
  retailPrice_lt: Float

  """All values less than or equal the given value."""
  retailPrice_lte: Float

  """All values greater than the given value."""
  retailPrice_gt: Float

  """All values greater than or equal the given value."""
  retailPrice_gte: Float
  total: Int

  """All values that are not equal to given value."""
  total_not: Int

  """All values that are contained in given list."""
  total_in: [Int!]

  """All values that are not contained in given list."""
  total_not_in: [Int!]

  """All values less than the given value."""
  total_lt: Int

  """All values less than or equal the given value."""
  total_lte: Int

  """All values greater than the given value."""
  total_gt: Int

  """All values greater than or equal the given value."""
  total_gte: Int
  reservable: Int

  """All values that are not equal to given value."""
  reservable_not: Int

  """All values that are contained in given list."""
  reservable_in: [Int!]

  """All values that are not contained in given list."""
  reservable_not_in: [Int!]

  """All values less than the given value."""
  reservable_lt: Int

  """All values less than or equal the given value."""
  reservable_lte: Int

  """All values greater than the given value."""
  reservable_gt: Int

  """All values greater than or equal the given value."""
  reservable_gte: Int
  reserved: Int

  """All values that are not equal to given value."""
  reserved_not: Int

  """All values that are contained in given list."""
  reserved_in: [Int!]

  """All values that are not contained in given list."""
  reserved_not_in: [Int!]

  """All values less than the given value."""
  reserved_lt: Int

  """All values less than or equal the given value."""
  reserved_lte: Int

  """All values greater than the given value."""
  reserved_gt: Int

  """All values greater than or equal the given value."""
  reserved_gte: Int
  nonReservable: Int

  """All values that are not equal to given value."""
  nonReservable_not: Int

  """All values that are contained in given list."""
  nonReservable_in: [Int!]

  """All values that are not contained in given list."""
  nonReservable_not_in: [Int!]

  """All values less than the given value."""
  nonReservable_lt: Int

  """All values less than or equal the given value."""
  nonReservable_lte: Int

  """All values greater than the given value."""
  nonReservable_gt: Int

  """All values greater than or equal the given value."""
  nonReservable_gte: Int
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  color: ColorWhereInput
  product: ProductWhereInput
  physicalProducts_every: PhysicalProductWhereInput
  physicalProducts_some: PhysicalProductWhereInput
  physicalProducts_none: PhysicalProductWhereInput
}

input ProductVariantWhereUniqueInput {
  id: ID
  sku: String
}

input ProductWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  slug: String

  """All values that are not equal to given value."""
  slug_not: String

  """All values that are contained in given list."""
  slug_in: [String!]

  """All values that are not contained in given list."""
  slug_not_in: [String!]

  """All values less than the given value."""
  slug_lt: String

  """All values less than or equal the given value."""
  slug_lte: String

  """All values greater than the given value."""
  slug_gt: String

  """All values greater than or equal the given value."""
  slug_gte: String

  """All values containing the given string."""
  slug_contains: String

  """All values not containing the given string."""
  slug_not_contains: String

  """All values starting with the given string."""
  slug_starts_with: String

  """All values not starting with the given string."""
  slug_not_starts_with: String

  """All values ending with the given string."""
  slug_ends_with: String

  """All values not ending with the given string."""
  slug_not_ends_with: String
  name: String

  """All values that are not equal to given value."""
  name_not: String

  """All values that are contained in given list."""
  name_in: [String!]

  """All values that are not contained in given list."""
  name_not_in: [String!]

  """All values less than the given value."""
  name_lt: String

  """All values less than or equal the given value."""
  name_lte: String

  """All values greater than the given value."""
  name_gt: String

  """All values greater than or equal the given value."""
  name_gte: String

  """All values containing the given string."""
  name_contains: String

  """All values not containing the given string."""
  name_not_contains: String

  """All values starting with the given string."""
  name_starts_with: String

  """All values not starting with the given string."""
  name_not_starts_with: String

  """All values ending with the given string."""
  name_ends_with: String

  """All values not ending with the given string."""
  name_not_ends_with: String
  description: String

  """All values that are not equal to given value."""
  description_not: String

  """All values that are contained in given list."""
  description_in: [String!]

  """All values that are not contained in given list."""
  description_not_in: [String!]

  """All values less than the given value."""
  description_lt: String

  """All values less than or equal the given value."""
  description_lte: String

  """All values greater than the given value."""
  description_gt: String

  """All values greater than or equal the given value."""
  description_gte: String

  """All values containing the given string."""
  description_contains: String

  """All values not containing the given string."""
  description_not_contains: String

  """All values starting with the given string."""
  description_starts_with: String

  """All values not starting with the given string."""
  description_not_starts_with: String

  """All values ending with the given string."""
  description_ends_with: String

  """All values not ending with the given string."""
  description_not_ends_with: String
  externalURL: String

  """All values that are not equal to given value."""
  externalURL_not: String

  """All values that are contained in given list."""
  externalURL_in: [String!]

  """All values that are not contained in given list."""
  externalURL_not_in: [String!]

  """All values less than the given value."""
  externalURL_lt: String

  """All values less than or equal the given value."""
  externalURL_lte: String

  """All values greater than the given value."""
  externalURL_gt: String

  """All values greater than or equal the given value."""
  externalURL_gte: String

  """All values containing the given string."""
  externalURL_contains: String

  """All values not containing the given string."""
  externalURL_not_contains: String

  """All values starting with the given string."""
  externalURL_starts_with: String

  """All values not starting with the given string."""
  externalURL_not_starts_with: String

  """All values ending with the given string."""
  externalURL_ends_with: String

  """All values not ending with the given string."""
  externalURL_not_ends_with: String
  modelHeight: Int

  """All values that are not equal to given value."""
  modelHeight_not: Int

  """All values that are contained in given list."""
  modelHeight_in: [Int!]

  """All values that are not contained in given list."""
  modelHeight_not_in: [Int!]

  """All values less than the given value."""
  modelHeight_lt: Int

  """All values less than or equal the given value."""
  modelHeight_lte: Int

  """All values greater than the given value."""
  modelHeight_gt: Int

  """All values greater than or equal the given value."""
  modelHeight_gte: Int
  modelSize: Size

  """All values that are not equal to given value."""
  modelSize_not: Size

  """All values that are contained in given list."""
  modelSize_in: [Size!]

  """All values that are not contained in given list."""
  modelSize_not_in: [Size!]
  retailPrice: Int

  """All values that are not equal to given value."""
  retailPrice_not: Int

  """All values that are contained in given list."""
  retailPrice_in: [Int!]

  """All values that are not contained in given list."""
  retailPrice_not_in: [Int!]

  """All values less than the given value."""
  retailPrice_lt: Int

  """All values less than or equal the given value."""
  retailPrice_lte: Int

  """All values greater than the given value."""
  retailPrice_gt: Int

  """All values greater than or equal the given value."""
  retailPrice_gte: Int
  status: ProductStatus

  """All values that are not equal to given value."""
  status_not: ProductStatus

  """All values that are contained in given list."""
  status_in: [ProductStatus!]

  """All values that are not contained in given list."""
  status_not_in: [ProductStatus!]
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  brand: BrandWhereInput
  category: CategoryWhereInput
  color: ColorWhereInput
  secondaryColor: ColorWhereInput
  functions_every: ProductFunctionWhereInput
  functions_some: ProductFunctionWhereInput
  functions_none: ProductFunctionWhereInput
  variants_every: ProductVariantWhereInput
  variants_some: ProductVariantWhereInput
  variants_none: ProductVariantWhereInput
}

input ProductWhereUniqueInput {
  id: ID
  slug: String
}

type Query {
  brands(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Brand]!
  collectionGroups(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CollectionGroup]!
  homepageProductRails(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [HomepageProductRail]!
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image]!
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem]!
  recentlyViewedProducts(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [RecentlyViewedProduct]!
  orders(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Order]!
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation]!
  productRequests(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductRequest]!
  collections(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Collection]!
  categories(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Category]!
  customerDetails(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CustomerDetail]!
  billingInfoes(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BillingInfo]!
  locations(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Location]!
  packages(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Package]!
  productFunctions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction]!
  colors(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Color]!
  labels(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Label]!
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct]!
  customers(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Customer]!
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant]!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product]!
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  brand(where: BrandWhereUniqueInput!): Brand
  collectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  homepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  image(where: ImageWhereUniqueInput!): Image
  bagItem(where: BagItemWhereUniqueInput!): BagItem
  recentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  order(where: OrderWhereUniqueInput!): Order
  reservation(where: ReservationWhereUniqueInput!): Reservation
  productRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  collection(where: CollectionWhereUniqueInput!): Collection
  category(where: CategoryWhereUniqueInput!): Category
  customerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  billingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  location(where: LocationWhereUniqueInput!): Location
  package(where: PackageWhereUniqueInput!): Package
  productFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  color(where: ColorWhereUniqueInput!): Color
  label(where: LabelWhereUniqueInput!): Label
  physicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  customer(where: CustomerWhereUniqueInput!): Customer
  productVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  product(where: ProductWhereUniqueInput!): Product
  user(where: UserWhereUniqueInput!): User
  brandsConnection(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BrandConnection!
  collectionGroupsConnection(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionGroupConnection!
  homepageProductRailsConnection(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): HomepageProductRailConnection!
  imagesConnection(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ImageConnection!
  bagItemsConnection(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BagItemConnection!
  recentlyViewedProductsConnection(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): RecentlyViewedProductConnection!
  ordersConnection(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): OrderConnection!
  reservationsConnection(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationConnection!
  productRequestsConnection(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductRequestConnection!
  collectionsConnection(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionConnection!
  categoriesConnection(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CategoryConnection!
  customerDetailsConnection(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerDetailConnection!
  billingInfoesConnection(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BillingInfoConnection!
  locationsConnection(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LocationConnection!
  packagesConnection(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PackageConnection!
  productFunctionsConnection(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductFunctionConnection!
  colorsConnection(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ColorConnection!
  labelsConnection(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LabelConnection!
  physicalProductsConnection(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PhysicalProductConnection!
  customersConnection(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerConnection!
  productVariantsConnection(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantConnection!
  productsConnection(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductConnection!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!

  """Fetches an object given its ID"""
  node(
    """The ID of an object"""
    id: ID!
  ): Node
}

type RecentlyViewedProduct implements Node {
  id: ID!
  product: Product!
  customer: Customer!
  viewCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type RecentlyViewedProductConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [RecentlyViewedProductEdge]!
  aggregate: AggregateRecentlyViewedProduct!
}

input RecentlyViewedProductCreateInput {
  id: ID
  viewCount: Int
  product: ProductCreateOneInput!
  customer: CustomerCreateOneInput!
}

"""An edge in a connection."""
type RecentlyViewedProductEdge {
  """The item at the end of the edge."""
  node: RecentlyViewedProduct!

  """A cursor for use in pagination."""
  cursor: String!
}

enum RecentlyViewedProductOrderByInput {
  id_ASC
  id_DESC
  viewCount_ASC
  viewCount_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type RecentlyViewedProductPreviousValues {
  id: ID!
  viewCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RecentlyViewedProductSubscriptionPayload {
  mutation: MutationType!
  node: RecentlyViewedProduct
  updatedFields: [String!]
  previousValues: RecentlyViewedProductPreviousValues
}

input RecentlyViewedProductSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [RecentlyViewedProductSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [RecentlyViewedProductSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [RecentlyViewedProductSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: RecentlyViewedProductWhereInput
}

input RecentlyViewedProductUpdateInput {
  viewCount: Int
  product: ProductUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredInput
}

input RecentlyViewedProductUpdateManyMutationInput {
  viewCount: Int
}

input RecentlyViewedProductWhereInput {
  """Logical AND on all given filters."""
  AND: [RecentlyViewedProductWhereInput!]

  """Logical OR on all given filters."""
  OR: [RecentlyViewedProductWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [RecentlyViewedProductWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  viewCount: Int

  """All values that are not equal to given value."""
  viewCount_not: Int

  """All values that are contained in given list."""
  viewCount_in: [Int!]

  """All values that are not contained in given list."""
  viewCount_not_in: [Int!]

  """All values less than the given value."""
  viewCount_lt: Int

  """All values less than or equal the given value."""
  viewCount_lte: Int

  """All values greater than the given value."""
  viewCount_gt: Int

  """All values greater than or equal the given value."""
  viewCount_gte: Int
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  product: ProductWhereInput
  customer: CustomerWhereInput
}

input RecentlyViewedProductWhereUniqueInput {
  id: ID
}

type Reservation implements Node {
  id: ID!
  user: User!
  customer: Customer!
  sentPackage: Package
  returnedPackage: Package
  location: Location
  products(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type ReservationConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ReservationEdge]!
  aggregate: AggregateReservation!
}

input ReservationCreateInput {
  id: ID
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  user: UserCreateOneInput!
  customer: CustomerCreateOneWithoutReservationsInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  location: LocationCreateOneInput
  products: PhysicalProductCreateManyInput
}

input ReservationCreateManyWithoutCustomerInput {
  create: [ReservationCreateWithoutCustomerInput!]
  connect: [ReservationWhereUniqueInput!]
}

input ReservationCreateWithoutCustomerInput {
  id: ID
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  user: UserCreateOneInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  location: LocationCreateOneInput
  products: PhysicalProductCreateManyInput
}

"""An edge in a connection."""
type ReservationEdge {
  """The item at the end of the edge."""
  node: Reservation!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ReservationOrderByInput {
  id_ASC
  id_DESC
  reservationNumber_ASC
  reservationNumber_DESC
  shipped_ASC
  shipped_DESC
  status_ASC
  status_DESC
  shippedAt_ASC
  shippedAt_DESC
  receivedAt_ASC
  receivedAt_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ReservationPreviousValues {
  id: ID!
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ReservationScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ReservationScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ReservationScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ReservationScalarWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  reservationNumber: Int

  """All values that are not equal to given value."""
  reservationNumber_not: Int

  """All values that are contained in given list."""
  reservationNumber_in: [Int!]

  """All values that are not contained in given list."""
  reservationNumber_not_in: [Int!]

  """All values less than the given value."""
  reservationNumber_lt: Int

  """All values less than or equal the given value."""
  reservationNumber_lte: Int

  """All values greater than the given value."""
  reservationNumber_gt: Int

  """All values greater than or equal the given value."""
  reservationNumber_gte: Int
  shipped: Boolean

  """All values that are not equal to given value."""
  shipped_not: Boolean
  status: ReservationStatus

  """All values that are not equal to given value."""
  status_not: ReservationStatus

  """All values that are contained in given list."""
  status_in: [ReservationStatus!]

  """All values that are not contained in given list."""
  status_not_in: [ReservationStatus!]
  shippedAt: DateTime

  """All values that are not equal to given value."""
  shippedAt_not: DateTime

  """All values that are contained in given list."""
  shippedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  shippedAt_not_in: [DateTime!]

  """All values less than the given value."""
  shippedAt_lt: DateTime

  """All values less than or equal the given value."""
  shippedAt_lte: DateTime

  """All values greater than the given value."""
  shippedAt_gt: DateTime

  """All values greater than or equal the given value."""
  shippedAt_gte: DateTime
  receivedAt: DateTime

  """All values that are not equal to given value."""
  receivedAt_not: DateTime

  """All values that are contained in given list."""
  receivedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  receivedAt_not_in: [DateTime!]

  """All values less than the given value."""
  receivedAt_lt: DateTime

  """All values less than or equal the given value."""
  receivedAt_lte: DateTime

  """All values greater than the given value."""
  receivedAt_gt: DateTime

  """All values greater than or equal the given value."""
  receivedAt_gte: DateTime
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

enum ReservationStatus {
  New
  InQueue
  OnHold
  Packed
  Shipped
  InTransit
  Received
  Cancelled
  Completed
}

type ReservationSubscriptionPayload {
  mutation: MutationType!
  node: Reservation
  updatedFields: [String!]
  previousValues: ReservationPreviousValues
}

input ReservationSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ReservationSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ReservationSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ReservationSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: ReservationWhereInput
}

input ReservationUpdateInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  location: LocationUpdateOneInput
  products: PhysicalProductUpdateManyInput
}

input ReservationUpdateManyDataInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
}

input ReservationUpdateManyMutationInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
}

input ReservationUpdateManyWithoutCustomerInput {
  create: [ReservationCreateWithoutCustomerInput!]
  connect: [ReservationWhereUniqueInput!]
  set: [ReservationWhereUniqueInput!]
  disconnect: [ReservationWhereUniqueInput!]
  delete: [ReservationWhereUniqueInput!]
  update: [ReservationUpdateWithWhereUniqueWithoutCustomerInput!]
  updateMany: [ReservationUpdateManyWithWhereNestedInput!]
  deleteMany: [ReservationScalarWhereInput!]
  upsert: [ReservationUpsertWithWhereUniqueWithoutCustomerInput!]
}

input ReservationUpdateManyWithWhereNestedInput {
  where: ReservationScalarWhereInput!
  data: ReservationUpdateManyDataInput!
}

input ReservationUpdateWithoutCustomerDataInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  user: UserUpdateOneRequiredInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  location: LocationUpdateOneInput
  products: PhysicalProductUpdateManyInput
}

input ReservationUpdateWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput!
  data: ReservationUpdateWithoutCustomerDataInput!
}

input ReservationUpsertWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput!
  update: ReservationUpdateWithoutCustomerDataInput!
  create: ReservationCreateWithoutCustomerInput!
}

input ReservationWhereInput {
  """Logical AND on all given filters."""
  AND: [ReservationWhereInput!]

  """Logical OR on all given filters."""
  OR: [ReservationWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ReservationWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  reservationNumber: Int

  """All values that are not equal to given value."""
  reservationNumber_not: Int

  """All values that are contained in given list."""
  reservationNumber_in: [Int!]

  """All values that are not contained in given list."""
  reservationNumber_not_in: [Int!]

  """All values less than the given value."""
  reservationNumber_lt: Int

  """All values less than or equal the given value."""
  reservationNumber_lte: Int

  """All values greater than the given value."""
  reservationNumber_gt: Int

  """All values greater than or equal the given value."""
  reservationNumber_gte: Int
  shipped: Boolean

  """All values that are not equal to given value."""
  shipped_not: Boolean
  status: ReservationStatus

  """All values that are not equal to given value."""
  status_not: ReservationStatus

  """All values that are contained in given list."""
  status_in: [ReservationStatus!]

  """All values that are not contained in given list."""
  status_not_in: [ReservationStatus!]
  shippedAt: DateTime

  """All values that are not equal to given value."""
  shippedAt_not: DateTime

  """All values that are contained in given list."""
  shippedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  shippedAt_not_in: [DateTime!]

  """All values less than the given value."""
  shippedAt_lt: DateTime

  """All values less than or equal the given value."""
  shippedAt_lte: DateTime

  """All values greater than the given value."""
  shippedAt_gt: DateTime

  """All values greater than or equal the given value."""
  shippedAt_gte: DateTime
  receivedAt: DateTime

  """All values that are not equal to given value."""
  receivedAt_not: DateTime

  """All values that are contained in given list."""
  receivedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  receivedAt_not_in: [DateTime!]

  """All values less than the given value."""
  receivedAt_lt: DateTime

  """All values less than or equal the given value."""
  receivedAt_lte: DateTime

  """All values greater than the given value."""
  receivedAt_gt: DateTime

  """All values greater than or equal the given value."""
  receivedAt_gte: DateTime
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
  user: UserWhereInput
  customer: CustomerWhereInput
  sentPackage: PackageWhereInput
  returnedPackage: PackageWhereInput
  location: LocationWhereInput
  products_every: PhysicalProductWhereInput
  products_some: PhysicalProductWhereInput
  products_none: PhysicalProductWhereInput
}

input ReservationWhereUniqueInput {
  id: ID
  reservationNumber: Int
}

enum Size {
  XS
  S
  M
  L
  XL
  XXL
}

type Subscription {
  brand(where: BrandSubscriptionWhereInput): BrandSubscriptionPayload
  collectionGroup(where: CollectionGroupSubscriptionWhereInput): CollectionGroupSubscriptionPayload
  homepageProductRail(where: HomepageProductRailSubscriptionWhereInput): HomepageProductRailSubscriptionPayload
  image(where: ImageSubscriptionWhereInput): ImageSubscriptionPayload
  bagItem(where: BagItemSubscriptionWhereInput): BagItemSubscriptionPayload
  recentlyViewedProduct(where: RecentlyViewedProductSubscriptionWhereInput): RecentlyViewedProductSubscriptionPayload
  order(where: OrderSubscriptionWhereInput): OrderSubscriptionPayload
  reservation(where: ReservationSubscriptionWhereInput): ReservationSubscriptionPayload
  productRequest(where: ProductRequestSubscriptionWhereInput): ProductRequestSubscriptionPayload
  collection(where: CollectionSubscriptionWhereInput): CollectionSubscriptionPayload
  category(where: CategorySubscriptionWhereInput): CategorySubscriptionPayload
  customerDetail(where: CustomerDetailSubscriptionWhereInput): CustomerDetailSubscriptionPayload
  billingInfo(where: BillingInfoSubscriptionWhereInput): BillingInfoSubscriptionPayload
  location(where: LocationSubscriptionWhereInput): LocationSubscriptionPayload
  package(where: PackageSubscriptionWhereInput): PackageSubscriptionPayload
  productFunction(where: ProductFunctionSubscriptionWhereInput): ProductFunctionSubscriptionPayload
  color(where: ColorSubscriptionWhereInput): ColorSubscriptionPayload
  label(where: LabelSubscriptionWhereInput): LabelSubscriptionPayload
  physicalProduct(where: PhysicalProductSubscriptionWhereInput): PhysicalProductSubscriptionPayload
  customer(where: CustomerSubscriptionWhereInput): CustomerSubscriptionPayload
  productVariant(where: ProductVariantSubscriptionWhereInput): ProductVariantSubscriptionPayload
  product(where: ProductSubscriptionWhereInput): ProductSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User implements Node {
  id: ID!
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type UserConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [UserEdge]!
  aggregate: AggregateUser!
}

input UserCreateInput {
  id: ID
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole
}

input UserCreateOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
}

"""An edge in a connection."""
type UserEdge {
  """The item at the end of the edge."""
  node: User!

  """A cursor for use in pagination."""
  cursor: String!
}

enum UserOrderByInput {
  id_ASC
  id_DESC
  auth0Id_ASC
  auth0Id_DESC
  email_ASC
  email_DESC
  firstName_ASC
  firstName_DESC
  lastName_ASC
  lastName_DESC
  role_ASC
  role_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type UserPreviousValues {
  id: ID!
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  Admin
  Customer
  Partner
}

type UserSubscriptionPayload {
  mutation: MutationType!
  node: User
  updatedFields: [String!]
  previousValues: UserPreviousValues
}

input UserSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [UserSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [UserSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [UserSubscriptionWhereInput!]

  """The subscription event gets dispatched when it's listed in mutation_in"""
  mutation_in: [MutationType!]

  """
  The subscription event gets only dispatched when one of the updated fields names is included in this list
  """
  updatedFields_contains: String

  """
  The subscription event gets only dispatched when all of the field names included in this list have been updated
  """
  updatedFields_contains_every: [String!]

  """
  The subscription event gets only dispatched when some of the field names included in this list have been updated
  """
  updatedFields_contains_some: [String!]
  node: UserWhereInput
}

input UserUpdateDataInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
}

input UserUpdateInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
}

input UserUpdateManyMutationInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
}

input UserUpdateOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: UserUpdateDataInput
  upsert: UserUpsertNestedInput
}

input UserUpdateOneRequiredInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
  update: UserUpdateDataInput
  upsert: UserUpsertNestedInput
}

input UserUpsertNestedInput {
  update: UserUpdateDataInput!
  create: UserCreateInput!
}

input UserWhereInput {
  """Logical AND on all given filters."""
  AND: [UserWhereInput!]

  """Logical OR on all given filters."""
  OR: [UserWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [UserWhereInput!]
  id: ID

  """All values that are not equal to given value."""
  id_not: ID

  """All values that are contained in given list."""
  id_in: [ID!]

  """All values that are not contained in given list."""
  id_not_in: [ID!]

  """All values less than the given value."""
  id_lt: ID

  """All values less than or equal the given value."""
  id_lte: ID

  """All values greater than the given value."""
  id_gt: ID

  """All values greater than or equal the given value."""
  id_gte: ID

  """All values containing the given string."""
  id_contains: ID

  """All values not containing the given string."""
  id_not_contains: ID

  """All values starting with the given string."""
  id_starts_with: ID

  """All values not starting with the given string."""
  id_not_starts_with: ID

  """All values ending with the given string."""
  id_ends_with: ID

  """All values not ending with the given string."""
  id_not_ends_with: ID
  auth0Id: String

  """All values that are not equal to given value."""
  auth0Id_not: String

  """All values that are contained in given list."""
  auth0Id_in: [String!]

  """All values that are not contained in given list."""
  auth0Id_not_in: [String!]

  """All values less than the given value."""
  auth0Id_lt: String

  """All values less than or equal the given value."""
  auth0Id_lte: String

  """All values greater than the given value."""
  auth0Id_gt: String

  """All values greater than or equal the given value."""
  auth0Id_gte: String

  """All values containing the given string."""
  auth0Id_contains: String

  """All values not containing the given string."""
  auth0Id_not_contains: String

  """All values starting with the given string."""
  auth0Id_starts_with: String

  """All values not starting with the given string."""
  auth0Id_not_starts_with: String

  """All values ending with the given string."""
  auth0Id_ends_with: String

  """All values not ending with the given string."""
  auth0Id_not_ends_with: String
  email: String

  """All values that are not equal to given value."""
  email_not: String

  """All values that are contained in given list."""
  email_in: [String!]

  """All values that are not contained in given list."""
  email_not_in: [String!]

  """All values less than the given value."""
  email_lt: String

  """All values less than or equal the given value."""
  email_lte: String

  """All values greater than the given value."""
  email_gt: String

  """All values greater than or equal the given value."""
  email_gte: String

  """All values containing the given string."""
  email_contains: String

  """All values not containing the given string."""
  email_not_contains: String

  """All values starting with the given string."""
  email_starts_with: String

  """All values not starting with the given string."""
  email_not_starts_with: String

  """All values ending with the given string."""
  email_ends_with: String

  """All values not ending with the given string."""
  email_not_ends_with: String
  firstName: String

  """All values that are not equal to given value."""
  firstName_not: String

  """All values that are contained in given list."""
  firstName_in: [String!]

  """All values that are not contained in given list."""
  firstName_not_in: [String!]

  """All values less than the given value."""
  firstName_lt: String

  """All values less than or equal the given value."""
  firstName_lte: String

  """All values greater than the given value."""
  firstName_gt: String

  """All values greater than or equal the given value."""
  firstName_gte: String

  """All values containing the given string."""
  firstName_contains: String

  """All values not containing the given string."""
  firstName_not_contains: String

  """All values starting with the given string."""
  firstName_starts_with: String

  """All values not starting with the given string."""
  firstName_not_starts_with: String

  """All values ending with the given string."""
  firstName_ends_with: String

  """All values not ending with the given string."""
  firstName_not_ends_with: String
  lastName: String

  """All values that are not equal to given value."""
  lastName_not: String

  """All values that are contained in given list."""
  lastName_in: [String!]

  """All values that are not contained in given list."""
  lastName_not_in: [String!]

  """All values less than the given value."""
  lastName_lt: String

  """All values less than or equal the given value."""
  lastName_lte: String

  """All values greater than the given value."""
  lastName_gt: String

  """All values greater than or equal the given value."""
  lastName_gte: String

  """All values containing the given string."""
  lastName_contains: String

  """All values not containing the given string."""
  lastName_not_contains: String

  """All values starting with the given string."""
  lastName_starts_with: String

  """All values not starting with the given string."""
  lastName_not_starts_with: String

  """All values ending with the given string."""
  lastName_ends_with: String

  """All values not ending with the given string."""
  lastName_not_ends_with: String
  role: UserRole

  """All values that are not equal to given value."""
  role_not: UserRole

  """All values that are contained in given list."""
  role_in: [UserRole!]

  """All values that are not contained in given list."""
  role_not_in: [UserRole!]
  createdAt: DateTime

  """All values that are not equal to given value."""
  createdAt_not: DateTime

  """All values that are contained in given list."""
  createdAt_in: [DateTime!]

  """All values that are not contained in given list."""
  createdAt_not_in: [DateTime!]

  """All values less than the given value."""
  createdAt_lt: DateTime

  """All values less than or equal the given value."""
  createdAt_lte: DateTime

  """All values greater than the given value."""
  createdAt_gt: DateTime

  """All values greater than or equal the given value."""
  createdAt_gte: DateTime
  updatedAt: DateTime

  """All values that are not equal to given value."""
  updatedAt_not: DateTime

  """All values that are contained in given list."""
  updatedAt_in: [DateTime!]

  """All values that are not contained in given list."""
  updatedAt_not_in: [DateTime!]

  """All values less than the given value."""
  updatedAt_lt: DateTime

  """All values less than or equal the given value."""
  updatedAt_lte: DateTime

  """All values greater than the given value."""
  updatedAt_gt: DateTime

  """All values greater than or equal the given value."""
  updatedAt_gte: DateTime
}

input UserWhereUniqueInput {
  id: ID
  auth0Id: String
  email: String
}
`;
exports.Prisma = prisma_binding_1.makePrismaBindingClass({ typeDefs });
//# sourceMappingURL=prisma.binding.js.map