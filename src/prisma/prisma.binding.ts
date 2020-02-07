import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import { Options } from 'graphql-binding'
import { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'

export interface Query {
    bagItem: <T = BagItem | null>(args: { where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    bagItems: <T = Array<BagItem | null>>(args: { where?: BagItemWhereInput | null, orderBy?: BagItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bagItemsConnection: <T = BagItemConnection>(args: { where?: BagItemWhereInput | null, orderBy?: BagItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    billingInfo: <T = BillingInfo | null>(args: { where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    billingInfoes: <T = Array<BillingInfo | null>>(args: { where?: BillingInfoWhereInput | null, orderBy?: BillingInfoOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    billingInfoesConnection: <T = BillingInfoConnection>(args: { where?: BillingInfoWhereInput | null, orderBy?: BillingInfoOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    brand: <T = Brand | null>(args: { where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    brands: <T = Array<Brand | null>>(args: { where?: BrandWhereInput | null, orderBy?: BrandOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    brandsConnection: <T = BrandConnection>(args: { where?: BrandWhereInput | null, orderBy?: BrandOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    category: <T = Category | null>(args: { where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    categories: <T = Array<Category | null>>(args: { where?: CategoryWhereInput | null, orderBy?: CategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    categoriesConnection: <T = CategoryConnection>(args: { where?: CategoryWhereInput | null, orderBy?: CategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collection: <T = Collection | null>(args: { where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    collections: <T = Array<Collection | null>>(args: { where?: CollectionWhereInput | null, orderBy?: CollectionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionsConnection: <T = CollectionConnection>(args: { where?: CollectionWhereInput | null, orderBy?: CollectionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionGroup: <T = CollectionGroup | null>(args: { where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    collectionGroups: <T = Array<CollectionGroup | null>>(args: { where?: CollectionGroupWhereInput | null, orderBy?: CollectionGroupOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionGroupsConnection: <T = CollectionGroupConnection>(args: { where?: CollectionGroupWhereInput | null, orderBy?: CollectionGroupOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    color: <T = Color | null>(args: { where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    colors: <T = Array<Color | null>>(args: { where?: ColorWhereInput | null, orderBy?: ColorOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    colorsConnection: <T = ColorConnection>(args: { where?: ColorWhereInput | null, orderBy?: ColorOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customer: <T = Customer | null>(args: { where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    customers: <T = Array<Customer | null>>(args: { where?: CustomerWhereInput | null, orderBy?: CustomerOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customersConnection: <T = CustomerConnection>(args: { where?: CustomerWhereInput | null, orderBy?: CustomerOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customerDetail: <T = CustomerDetail | null>(args: { where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    customerDetails: <T = Array<CustomerDetail | null>>(args: { where?: CustomerDetailWhereInput | null, orderBy?: CustomerDetailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customerDetailsConnection: <T = CustomerDetailConnection>(args: { where?: CustomerDetailWhereInput | null, orderBy?: CustomerDetailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    homepageProductRail: <T = HomepageProductRail | null>(args: { where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    homepageProductRails: <T = Array<HomepageProductRail | null>>(args: { where?: HomepageProductRailWhereInput | null, orderBy?: HomepageProductRailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    homepageProductRailsConnection: <T = HomepageProductRailConnection>(args: { where?: HomepageProductRailWhereInput | null, orderBy?: HomepageProductRailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    image: <T = Image | null>(args: { where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    images: <T = Array<Image | null>>(args: { where?: ImageWhereInput | null, orderBy?: ImageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    imagesConnection: <T = ImageConnection>(args: { where?: ImageWhereInput | null, orderBy?: ImageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    label: <T = Label | null>(args: { where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    labels: <T = Array<Label | null>>(args: { where?: LabelWhereInput | null, orderBy?: LabelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    labelsConnection: <T = LabelConnection>(args: { where?: LabelWhereInput | null, orderBy?: LabelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    location: <T = Location | null>(args: { where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    locations: <T = Array<Location | null>>(args: { where?: LocationWhereInput | null, orderBy?: LocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    locationsConnection: <T = LocationConnection>(args: { where?: LocationWhereInput | null, orderBy?: LocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    order: <T = Order | null>(args: { where: OrderWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    orders: <T = Array<Order | null>>(args: { where?: OrderWhereInput | null, orderBy?: OrderOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    ordersConnection: <T = OrderConnection>(args: { where?: OrderWhereInput | null, orderBy?: OrderOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    package: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    packages: <T = Array<Package | null>>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packagesConnection: <T = PackageConnection>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    physicalProducts: <T = Array<PhysicalProduct | null>>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProductsConnection: <T = PhysicalProductConnection>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    product: <T = Product | null>(args: { where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    products: <T = Array<Product | null>>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productsConnection: <T = ProductConnection>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunction: <T = ProductFunction | null>(args: { where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productFunctions: <T = Array<ProductFunction | null>>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunctionsConnection: <T = ProductFunctionConnection>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productRequests: <T = Array<ProductRequest | null>>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequestsConnection: <T = ProductRequestConnection>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariants: <T = Array<ProductVariant | null>>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantsConnection: <T = ProductVariantConnection>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservations: <T = Array<Reservation | null>>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationsConnection: <T = ReservationConnection>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    user: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    users: <T = Array<User | null>>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    usersConnection: <T = UserConnection>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    node: <T = Node | null>(args: { id: ID_Output }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> 
  }

export interface Mutation {
    createBagItem: <T = BagItem>(args: { data: BagItemCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateBagItem: <T = BagItem | null>(args: { data: BagItemUpdateInput, where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyBagItems: <T = BatchPayload>(args: { data: BagItemUpdateManyMutationInput, where?: BagItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBagItem: <T = BagItem>(args: { where: BagItemWhereUniqueInput, create: BagItemCreateInput, update: BagItemUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteBagItem: <T = BagItem | null>(args: { where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyBagItems: <T = BatchPayload>(args: { where?: BagItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createBillingInfo: <T = BillingInfo>(args: { data: BillingInfoCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateBillingInfo: <T = BillingInfo | null>(args: { data: BillingInfoUpdateInput, where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyBillingInfoes: <T = BatchPayload>(args: { data: BillingInfoUpdateManyMutationInput, where?: BillingInfoWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBillingInfo: <T = BillingInfo>(args: { where: BillingInfoWhereUniqueInput, create: BillingInfoCreateInput, update: BillingInfoUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteBillingInfo: <T = BillingInfo | null>(args: { where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyBillingInfoes: <T = BatchPayload>(args: { where?: BillingInfoWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createBrand: <T = Brand>(args: { data: BrandCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateBrand: <T = Brand | null>(args: { data: BrandUpdateInput, where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyBrands: <T = BatchPayload>(args: { data: BrandUpdateManyMutationInput, where?: BrandWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBrand: <T = Brand>(args: { where: BrandWhereUniqueInput, create: BrandCreateInput, update: BrandUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteBrand: <T = Brand | null>(args: { where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyBrands: <T = BatchPayload>(args: { where?: BrandWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCategory: <T = Category>(args: { data: CategoryCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCategory: <T = Category | null>(args: { data: CategoryUpdateInput, where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCategories: <T = BatchPayload>(args: { data: CategoryUpdateManyMutationInput, where?: CategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCategory: <T = Category>(args: { where: CategoryWhereUniqueInput, create: CategoryCreateInput, update: CategoryUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCategory: <T = Category | null>(args: { where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCategories: <T = BatchPayload>(args: { where?: CategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCollection: <T = Collection>(args: { data: CollectionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCollection: <T = Collection | null>(args: { data: CollectionUpdateInput, where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCollections: <T = BatchPayload>(args: { data: CollectionUpdateManyMutationInput, where?: CollectionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCollection: <T = Collection>(args: { where: CollectionWhereUniqueInput, create: CollectionCreateInput, update: CollectionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCollection: <T = Collection | null>(args: { where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCollections: <T = BatchPayload>(args: { where?: CollectionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCollectionGroup: <T = CollectionGroup>(args: { data: CollectionGroupCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCollectionGroup: <T = CollectionGroup | null>(args: { data: CollectionGroupUpdateInput, where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCollectionGroups: <T = BatchPayload>(args: { data: CollectionGroupUpdateManyMutationInput, where?: CollectionGroupWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCollectionGroup: <T = CollectionGroup>(args: { where: CollectionGroupWhereUniqueInput, create: CollectionGroupCreateInput, update: CollectionGroupUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCollectionGroup: <T = CollectionGroup | null>(args: { where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCollectionGroups: <T = BatchPayload>(args: { where?: CollectionGroupWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createColor: <T = Color>(args: { data: ColorCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateColor: <T = Color | null>(args: { data: ColorUpdateInput, where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyColors: <T = BatchPayload>(args: { data: ColorUpdateManyMutationInput, where?: ColorWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertColor: <T = Color>(args: { where: ColorWhereUniqueInput, create: ColorCreateInput, update: ColorUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteColor: <T = Color | null>(args: { where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyColors: <T = BatchPayload>(args: { where?: ColorWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCustomer: <T = Customer>(args: { data: CustomerCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCustomer: <T = Customer | null>(args: { data: CustomerUpdateInput, where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCustomers: <T = BatchPayload>(args: { data: CustomerUpdateManyMutationInput, where?: CustomerWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCustomer: <T = Customer>(args: { where: CustomerWhereUniqueInput, create: CustomerCreateInput, update: CustomerUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCustomer: <T = Customer | null>(args: { where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCustomers: <T = BatchPayload>(args: { where?: CustomerWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCustomerDetail: <T = CustomerDetail>(args: { data: CustomerDetailCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCustomerDetail: <T = CustomerDetail | null>(args: { data: CustomerDetailUpdateInput, where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCustomerDetails: <T = BatchPayload>(args: { data: CustomerDetailUpdateManyMutationInput, where?: CustomerDetailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCustomerDetail: <T = CustomerDetail>(args: { where: CustomerDetailWhereUniqueInput, create: CustomerDetailCreateInput, update: CustomerDetailUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCustomerDetail: <T = CustomerDetail | null>(args: { where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCustomerDetails: <T = BatchPayload>(args: { where?: CustomerDetailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createHomepageProductRail: <T = HomepageProductRail>(args: { data: HomepageProductRailCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateHomepageProductRail: <T = HomepageProductRail | null>(args: { data: HomepageProductRailUpdateInput, where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyHomepageProductRails: <T = BatchPayload>(args: { data: HomepageProductRailUpdateManyMutationInput, where?: HomepageProductRailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertHomepageProductRail: <T = HomepageProductRail>(args: { where: HomepageProductRailWhereUniqueInput, create: HomepageProductRailCreateInput, update: HomepageProductRailUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteHomepageProductRail: <T = HomepageProductRail | null>(args: { where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyHomepageProductRails: <T = BatchPayload>(args: { where?: HomepageProductRailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createImage: <T = Image>(args: { data: ImageCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateImage: <T = Image | null>(args: { data: ImageUpdateInput, where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyImages: <T = BatchPayload>(args: { data: ImageUpdateManyMutationInput, where?: ImageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertImage: <T = Image>(args: { where: ImageWhereUniqueInput, create: ImageCreateInput, update: ImageUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteImage: <T = Image | null>(args: { where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyImages: <T = BatchPayload>(args: { where?: ImageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createLabel: <T = Label>(args: { data: LabelCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateLabel: <T = Label | null>(args: { data: LabelUpdateInput, where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyLabels: <T = BatchPayload>(args: { data: LabelUpdateManyMutationInput, where?: LabelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertLabel: <T = Label>(args: { where: LabelWhereUniqueInput, create: LabelCreateInput, update: LabelUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteLabel: <T = Label | null>(args: { where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyLabels: <T = BatchPayload>(args: { where?: LabelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createLocation: <T = Location>(args: { data: LocationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateLocation: <T = Location | null>(args: { data: LocationUpdateInput, where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyLocations: <T = BatchPayload>(args: { data: LocationUpdateManyMutationInput, where?: LocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertLocation: <T = Location>(args: { where: LocationWhereUniqueInput, create: LocationCreateInput, update: LocationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteLocation: <T = Location | null>(args: { where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyLocations: <T = BatchPayload>(args: { where?: LocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createOrder: <T = Order>(args: { data: OrderCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteOrder: <T = Order | null>(args: { where: OrderWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyOrders: <T = BatchPayload>(args: { where?: OrderWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPackage: <T = Package>(args: { data: PackageCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePackage: <T = Package | null>(args: { data: PackageUpdateInput, where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPackages: <T = BatchPayload>(args: { data: PackageUpdateManyMutationInput, where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPackage: <T = Package>(args: { where: PackageWhereUniqueInput, create: PackageCreateInput, update: PackageUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePackage: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPackages: <T = BatchPayload>(args: { where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPhysicalProduct: <T = PhysicalProduct>(args: { data: PhysicalProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePhysicalProduct: <T = PhysicalProduct | null>(args: { data: PhysicalProductUpdateInput, where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPhysicalProducts: <T = BatchPayload>(args: { data: PhysicalProductUpdateManyMutationInput, where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPhysicalProduct: <T = PhysicalProduct>(args: { where: PhysicalProductWhereUniqueInput, create: PhysicalProductCreateInput, update: PhysicalProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePhysicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPhysicalProducts: <T = BatchPayload>(args: { where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProduct: <T = Product>(args: { data: ProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProduct: <T = Product | null>(args: { data: ProductUpdateInput, where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProducts: <T = BatchPayload>(args: { data: ProductUpdateManyMutationInput, where?: ProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProduct: <T = Product>(args: { where: ProductWhereUniqueInput, create: ProductCreateInput, update: ProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProduct: <T = Product | null>(args: { where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProducts: <T = BatchPayload>(args: { where?: ProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductFunction: <T = ProductFunction>(args: { data: ProductFunctionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductFunction: <T = ProductFunction | null>(args: { data: ProductFunctionUpdateInput, where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductFunctions: <T = BatchPayload>(args: { data: ProductFunctionUpdateManyMutationInput, where?: ProductFunctionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductFunction: <T = ProductFunction>(args: { where: ProductFunctionWhereUniqueInput, create: ProductFunctionCreateInput, update: ProductFunctionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductFunction: <T = ProductFunction | null>(args: { where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductFunctions: <T = BatchPayload>(args: { where?: ProductFunctionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductRequest: <T = ProductRequest>(args: { data: ProductRequestCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductRequest: <T = ProductRequest | null>(args: { data: ProductRequestUpdateInput, where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductRequests: <T = BatchPayload>(args: { data: ProductRequestUpdateManyMutationInput, where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductRequest: <T = ProductRequest>(args: { where: ProductRequestWhereUniqueInput, create: ProductRequestCreateInput, update: ProductRequestUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductRequests: <T = BatchPayload>(args: { where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariant: <T = ProductVariant>(args: { data: ProductVariantCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductVariant: <T = ProductVariant | null>(args: { data: ProductVariantUpdateInput, where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductVariants: <T = BatchPayload>(args: { data: ProductVariantUpdateManyMutationInput, where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariant: <T = ProductVariant>(args: { where: ProductVariantWhereUniqueInput, create: ProductVariantCreateInput, update: ProductVariantUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductVariants: <T = BatchPayload>(args: { where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservation: <T = Reservation>(args: { data: ReservationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateReservation: <T = Reservation | null>(args: { data: ReservationUpdateInput, where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyReservations: <T = BatchPayload>(args: { data: ReservationUpdateManyMutationInput, where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservation: <T = Reservation>(args: { where: ReservationWhereUniqueInput, create: ReservationCreateInput, update: ReservationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteReservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyReservations: <T = BatchPayload>(args: { where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createUser: <T = User>(args: { data: UserCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateUser: <T = User | null>(args: { data: UserUpdateInput, where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyUsers: <T = BatchPayload>(args: { data: UserUpdateManyMutationInput, where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertUser: <T = User>(args: { where: UserWhereUniqueInput, create: UserCreateInput, update: UserUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteUser: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyUsers: <T = BatchPayload>(args: { where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Subscription {
    bagItem: <T = BagItemSubscriptionPayload | null>(args: { where?: BagItemSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    billingInfo: <T = BillingInfoSubscriptionPayload | null>(args: { where?: BillingInfoSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    brand: <T = BrandSubscriptionPayload | null>(args: { where?: BrandSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    category: <T = CategorySubscriptionPayload | null>(args: { where?: CategorySubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collection: <T = CollectionSubscriptionPayload | null>(args: { where?: CollectionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collectionGroup: <T = CollectionGroupSubscriptionPayload | null>(args: { where?: CollectionGroupSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    color: <T = ColorSubscriptionPayload | null>(args: { where?: ColorSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customer: <T = CustomerSubscriptionPayload | null>(args: { where?: CustomerSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customerDetail: <T = CustomerDetailSubscriptionPayload | null>(args: { where?: CustomerDetailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    homepageProductRail: <T = HomepageProductRailSubscriptionPayload | null>(args: { where?: HomepageProductRailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    image: <T = ImageSubscriptionPayload | null>(args: { where?: ImageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    label: <T = LabelSubscriptionPayload | null>(args: { where?: LabelSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    location: <T = LocationSubscriptionPayload | null>(args: { where?: LocationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    order: <T = OrderSubscriptionPayload | null>(args: { where?: OrderSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    package: <T = PackageSubscriptionPayload | null>(args: { where?: PackageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    physicalProduct: <T = PhysicalProductSubscriptionPayload | null>(args: { where?: PhysicalProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    product: <T = ProductSubscriptionPayload | null>(args: { where?: ProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productFunction: <T = ProductFunctionSubscriptionPayload | null>(args: { where?: ProductFunctionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productRequest: <T = ProductRequestSubscriptionPayload | null>(args: { where?: ProductRequestSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariant: <T = ProductVariantSubscriptionPayload | null>(args: { where?: ProductVariantSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservation: <T = ReservationSubscriptionPayload | null>(args: { where?: ReservationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    user: <T = UserSubscriptionPayload | null>(args: { where?: UserSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> 
  }

export interface Exists {
  BagItem: (where?: BagItemWhereInput) => Promise<boolean>
  BillingInfo: (where?: BillingInfoWhereInput) => Promise<boolean>
  Brand: (where?: BrandWhereInput) => Promise<boolean>
  Category: (where?: CategoryWhereInput) => Promise<boolean>
  Collection: (where?: CollectionWhereInput) => Promise<boolean>
  CollectionGroup: (where?: CollectionGroupWhereInput) => Promise<boolean>
  Color: (where?: ColorWhereInput) => Promise<boolean>
  Customer: (where?: CustomerWhereInput) => Promise<boolean>
  CustomerDetail: (where?: CustomerDetailWhereInput) => Promise<boolean>
  HomepageProductRail: (where?: HomepageProductRailWhereInput) => Promise<boolean>
  Image: (where?: ImageWhereInput) => Promise<boolean>
  Label: (where?: LabelWhereInput) => Promise<boolean>
  Location: (where?: LocationWhereInput) => Promise<boolean>
  Order: (where?: OrderWhereInput) => Promise<boolean>
  Package: (where?: PackageWhereInput) => Promise<boolean>
  PhysicalProduct: (where?: PhysicalProductWhereInput) => Promise<boolean>
  Product: (where?: ProductWhereInput) => Promise<boolean>
  ProductFunction: (where?: ProductFunctionWhereInput) => Promise<boolean>
  ProductRequest: (where?: ProductRequestWhereInput) => Promise<boolean>
  ProductVariant: (where?: ProductVariantWhereInput) => Promise<boolean>
  Reservation: (where?: ReservationWhereInput) => Promise<boolean>
  User: (where?: UserWhereInput) => Promise<boolean>
}

export interface Prisma {
  query: Query
  mutation: Mutation
  subscription: Subscription
  exists: Exists
  request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>
  delegate(operation: 'query' | 'mutation', fieldName: string, args: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<any>;
delegateSubscription(fieldName: string, args?: {
    [key: string]: any;
}, infoOrQuery?: GraphQLResolveInfo | string, options?: Options): Promise<AsyncIterator<any>>;
getAbstractResolvers(filterSchema?: GraphQLSchema | string): IResolvers;
}

export interface BindingConstructor<T> {
  new(options: BasePrismaOptions): T
}
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

type AggregateReservation {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type BagItem {
  id: ID!
  customer: Customer!
  productVariant: ProductVariant!
  position: Int
  saved: Boolean
  status: BagItemStatus!
}

type BagItemConnection {
  pageInfo: PageInfo!
  edges: [BagItemEdge]!
  aggregate: AggregateBagItem!
}

input BagItemCreateInput {
  id: ID
  customer: CustomerCreateOneInput!
  productVariant: ProductVariantCreateOneInput!
  position: Int
  saved: Boolean
  status: BagItemStatus!
}

type BagItemEdge {
  node: BagItem!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: BagItemWhereInput
  AND: [BagItemSubscriptionWhereInput!]
  OR: [BagItemSubscriptionWhereInput!]
  NOT: [BagItemSubscriptionWhereInput!]
}

input BagItemUpdateInput {
  customer: CustomerUpdateOneRequiredInput
  productVariant: ProductVariantUpdateOneRequiredInput
  position: Int
  saved: Boolean
  status: BagItemStatus
}

input BagItemUpdateManyMutationInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
}

input BagItemWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  customer: CustomerWhereInput
  productVariant: ProductVariantWhereInput
  position: Int
  position_not: Int
  position_in: [Int!]
  position_not_in: [Int!]
  position_lt: Int
  position_lte: Int
  position_gt: Int
  position_gte: Int
  saved: Boolean
  saved_not: Boolean
  status: BagItemStatus
  status_not: BagItemStatus
  status_in: [BagItemStatus!]
  status_not_in: [BagItemStatus!]
  AND: [BagItemWhereInput!]
  OR: [BagItemWhereInput!]
  NOT: [BagItemWhereInput!]
}

input BagItemWhereUniqueInput {
  id: ID
}

type BatchPayload {
  count: Long!
}

type BillingInfo {
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

type BillingInfoConnection {
  pageInfo: PageInfo!
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

type BillingInfoEdge {
  node: BillingInfo!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: BillingInfoWhereInput
  AND: [BillingInfoSubscriptionWhereInput!]
  OR: [BillingInfoSubscriptionWhereInput!]
  NOT: [BillingInfoSubscriptionWhereInput!]
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
  update: BillingInfoUpdateDataInput
  upsert: BillingInfoUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: BillingInfoWhereUniqueInput
}

input BillingInfoUpsertNestedInput {
  update: BillingInfoUpdateDataInput!
  create: BillingInfoCreateInput!
}

input BillingInfoWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  brand: String
  brand_not: String
  brand_in: [String!]
  brand_not_in: [String!]
  brand_lt: String
  brand_lte: String
  brand_gt: String
  brand_gte: String
  brand_contains: String
  brand_not_contains: String
  brand_starts_with: String
  brand_not_starts_with: String
  brand_ends_with: String
  brand_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  last_digits: String
  last_digits_not: String
  last_digits_in: [String!]
  last_digits_not_in: [String!]
  last_digits_lt: String
  last_digits_lte: String
  last_digits_gt: String
  last_digits_gte: String
  last_digits_contains: String
  last_digits_not_contains: String
  last_digits_starts_with: String
  last_digits_not_starts_with: String
  last_digits_ends_with: String
  last_digits_not_ends_with: String
  expiration_month: Int
  expiration_month_not: Int
  expiration_month_in: [Int!]
  expiration_month_not_in: [Int!]
  expiration_month_lt: Int
  expiration_month_lte: Int
  expiration_month_gt: Int
  expiration_month_gte: Int
  expiration_year: Int
  expiration_year_not: Int
  expiration_year_in: [Int!]
  expiration_year_not_in: [Int!]
  expiration_year_lt: Int
  expiration_year_lte: Int
  expiration_year_gt: Int
  expiration_year_gte: Int
  street1: String
  street1_not: String
  street1_in: [String!]
  street1_not_in: [String!]
  street1_lt: String
  street1_lte: String
  street1_gt: String
  street1_gte: String
  street1_contains: String
  street1_not_contains: String
  street1_starts_with: String
  street1_not_starts_with: String
  street1_ends_with: String
  street1_not_ends_with: String
  street2: String
  street2_not: String
  street2_in: [String!]
  street2_not_in: [String!]
  street2_lt: String
  street2_lte: String
  street2_gt: String
  street2_gte: String
  street2_contains: String
  street2_not_contains: String
  street2_starts_with: String
  street2_not_starts_with: String
  street2_ends_with: String
  street2_not_ends_with: String
  city: String
  city_not: String
  city_in: [String!]
  city_not_in: [String!]
  city_lt: String
  city_lte: String
  city_gt: String
  city_gte: String
  city_contains: String
  city_not_contains: String
  city_starts_with: String
  city_not_starts_with: String
  city_ends_with: String
  city_not_ends_with: String
  state: String
  state_not: String
  state_in: [String!]
  state_not_in: [String!]
  state_lt: String
  state_lte: String
  state_gt: String
  state_gte: String
  state_contains: String
  state_not_contains: String
  state_starts_with: String
  state_not_starts_with: String
  state_ends_with: String
  state_not_ends_with: String
  country: String
  country_not: String
  country_in: [String!]
  country_not_in: [String!]
  country_lt: String
  country_lte: String
  country_gt: String
  country_gte: String
  country_contains: String
  country_not_contains: String
  country_starts_with: String
  country_not_starts_with: String
  country_ends_with: String
  country_not_ends_with: String
  postal_code: String
  postal_code_not: String
  postal_code_in: [String!]
  postal_code_not_in: [String!]
  postal_code_lt: String
  postal_code_lte: String
  postal_code_gt: String
  postal_code_gte: String
  postal_code_contains: String
  postal_code_not_contains: String
  postal_code_starts_with: String
  postal_code_not_starts_with: String
  postal_code_ends_with: String
  postal_code_not_ends_with: String
  AND: [BillingInfoWhereInput!]
  OR: [BillingInfoWhereInput!]
  NOT: [BillingInfoWhereInput!]
}

input BillingInfoWhereUniqueInput {
  id: ID
}

type Brand {
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

type BrandConnection {
  pageInfo: PageInfo!
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
  products: ProductCreateManyWithoutBrandInput
  since: DateTime
  tier: BrandTier!
  websiteUrl: String
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

type BrandEdge {
  node: Brand!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: BrandWhereInput
  AND: [BrandSubscriptionWhereInput!]
  OR: [BrandSubscriptionWhereInput!]
  NOT: [BrandSubscriptionWhereInput!]
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
  products: ProductUpdateManyWithoutBrandInput
  since: DateTime
  tier: BrandTier
  websiteUrl: String
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
  update: BrandUpdateWithoutProductsDataInput
  upsert: BrandUpsertWithoutProductsInput
  connect: BrandWhereUniqueInput
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  brandCode: String
  brandCode_not: String
  brandCode_in: [String!]
  brandCode_not_in: [String!]
  brandCode_lt: String
  brandCode_lte: String
  brandCode_gt: String
  brandCode_gte: String
  brandCode_contains: String
  brandCode_not_contains: String
  brandCode_starts_with: String
  brandCode_not_starts_with: String
  brandCode_ends_with: String
  brandCode_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  isPrimaryBrand: Boolean
  isPrimaryBrand_not: Boolean
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  basedIn: String
  basedIn_not: String
  basedIn_in: [String!]
  basedIn_not_in: [String!]
  basedIn_lt: String
  basedIn_lte: String
  basedIn_gt: String
  basedIn_gte: String
  basedIn_contains: String
  basedIn_not_contains: String
  basedIn_starts_with: String
  basedIn_not_starts_with: String
  basedIn_ends_with: String
  basedIn_not_ends_with: String
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  since: DateTime
  since_not: DateTime
  since_in: [DateTime!]
  since_not_in: [DateTime!]
  since_lt: DateTime
  since_lte: DateTime
  since_gt: DateTime
  since_gte: DateTime
  tier: BrandTier
  tier_not: BrandTier
  tier_in: [BrandTier!]
  tier_not_in: [BrandTier!]
  websiteUrl: String
  websiteUrl_not: String
  websiteUrl_in: [String!]
  websiteUrl_not_in: [String!]
  websiteUrl_lt: String
  websiteUrl_lte: String
  websiteUrl_gt: String
  websiteUrl_gte: String
  websiteUrl_contains: String
  websiteUrl_not_contains: String
  websiteUrl_starts_with: String
  websiteUrl_not_starts_with: String
  websiteUrl_ends_with: String
  websiteUrl_not_ends_with: String
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [BrandWhereInput!]
  OR: [BrandWhereInput!]
  NOT: [BrandWhereInput!]
}

input BrandWhereUniqueInput {
  id: ID
  slug: String
  brandCode: String
}

type Category {
  id: ID!
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
  children(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Category!]
}

type CategoryConnection {
  pageInfo: PageInfo!
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
  children: CategoryCreateManyWithoutChildrenInput
}

input CategoryCreateManyWithoutChildrenInput {
  create: [CategoryCreateWithoutChildrenInput!]
  connect: [CategoryWhereUniqueInput!]
}

input CategoryCreateOneWithoutProductsInput {
  create: CategoryCreateWithoutProductsInput
  connect: CategoryWhereUniqueInput
}

input CategoryCreateWithoutChildrenInput {
  id: ID
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean
  products: ProductCreateManyWithoutCategoryInput
}

input CategoryCreateWithoutProductsInput {
  id: ID
  slug: String!
  name: String!
  image: Json
  description: String
  visible: Boolean
  children: CategoryCreateManyWithoutChildrenInput
}

type CategoryEdge {
  node: Category!
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  visible: Boolean
  visible_not: Boolean
  AND: [CategoryScalarWhereInput!]
  OR: [CategoryScalarWhereInput!]
  NOT: [CategoryScalarWhereInput!]
}

type CategorySubscriptionPayload {
  mutation: MutationType!
  node: Category
  updatedFields: [String!]
  previousValues: CategoryPreviousValues
}

input CategorySubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CategoryWhereInput
  AND: [CategorySubscriptionWhereInput!]
  OR: [CategorySubscriptionWhereInput!]
  NOT: [CategorySubscriptionWhereInput!]
}

input CategoryUpdateInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  products: ProductUpdateManyWithoutCategoryInput
  children: CategoryUpdateManyWithoutChildrenInput
}

input CategoryUpdateManyDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
}

input CategoryUpdateManyMutationInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
}

input CategoryUpdateManyWithoutChildrenInput {
  create: [CategoryCreateWithoutChildrenInput!]
  delete: [CategoryWhereUniqueInput!]
  connect: [CategoryWhereUniqueInput!]
  set: [CategoryWhereUniqueInput!]
  disconnect: [CategoryWhereUniqueInput!]
  update: [CategoryUpdateWithWhereUniqueWithoutChildrenInput!]
  upsert: [CategoryUpsertWithWhereUniqueWithoutChildrenInput!]
  deleteMany: [CategoryScalarWhereInput!]
  updateMany: [CategoryUpdateManyWithWhereNestedInput!]
}

input CategoryUpdateManyWithWhereNestedInput {
  where: CategoryScalarWhereInput!
  data: CategoryUpdateManyDataInput!
}

input CategoryUpdateOneRequiredWithoutProductsInput {
  create: CategoryCreateWithoutProductsInput
  update: CategoryUpdateWithoutProductsDataInput
  upsert: CategoryUpsertWithoutProductsInput
  connect: CategoryWhereUniqueInput
}

input CategoryUpdateWithoutChildrenDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  products: ProductUpdateManyWithoutCategoryInput
}

input CategoryUpdateWithoutProductsDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  children: CategoryUpdateManyWithoutChildrenInput
}

input CategoryUpdateWithWhereUniqueWithoutChildrenInput {
  where: CategoryWhereUniqueInput!
  data: CategoryUpdateWithoutChildrenDataInput!
}

input CategoryUpsertWithoutProductsInput {
  update: CategoryUpdateWithoutProductsDataInput!
  create: CategoryCreateWithoutProductsInput!
}

input CategoryUpsertWithWhereUniqueWithoutChildrenInput {
  where: CategoryWhereUniqueInput!
  update: CategoryUpdateWithoutChildrenDataInput!
  create: CategoryCreateWithoutChildrenInput!
}

input CategoryWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  visible: Boolean
  visible_not: Boolean
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  children_every: CategoryWhereInput
  children_some: CategoryWhereInput
  children_none: CategoryWhereInput
  AND: [CategoryWhereInput!]
  OR: [CategoryWhereInput!]
  NOT: [CategoryWhereInput!]
}

input CategoryWhereUniqueInput {
  id: ID
  slug: String
  name: String
}

type Collection {
  id: ID!
  slug: String!
  images: Json!
  title: String
  subTitle: String
  descriptionTop: String
  descriptionBottom: String
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

type CollectionConnection {
  pageInfo: PageInfo!
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

type CollectionEdge {
  node: Collection!
  cursor: String!
}

type CollectionGroup {
  id: ID!
  slug: String!
  title: String
  collectionCount: Int
  collections(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Collection!]
}

type CollectionGroupConnection {
  pageInfo: PageInfo!
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

type CollectionGroupEdge {
  node: CollectionGroup!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CollectionGroupWhereInput
  AND: [CollectionGroupSubscriptionWhereInput!]
  OR: [CollectionGroupSubscriptionWhereInput!]
  NOT: [CollectionGroupSubscriptionWhereInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  title: String
  title_not: String
  title_in: [String!]
  title_not_in: [String!]
  title_lt: String
  title_lte: String
  title_gt: String
  title_gte: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  collectionCount: Int
  collectionCount_not: Int
  collectionCount_in: [Int!]
  collectionCount_not_in: [Int!]
  collectionCount_lt: Int
  collectionCount_lte: Int
  collectionCount_gt: Int
  collectionCount_gte: Int
  collections_every: CollectionWhereInput
  collections_some: CollectionWhereInput
  collections_none: CollectionWhereInput
  AND: [CollectionGroupWhereInput!]
  OR: [CollectionGroupWhereInput!]
  NOT: [CollectionGroupWhereInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  title: String
  title_not: String
  title_in: [String!]
  title_not_in: [String!]
  title_lt: String
  title_lte: String
  title_gt: String
  title_gte: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  subTitle: String
  subTitle_not: String
  subTitle_in: [String!]
  subTitle_not_in: [String!]
  subTitle_lt: String
  subTitle_lte: String
  subTitle_gt: String
  subTitle_gte: String
  subTitle_contains: String
  subTitle_not_contains: String
  subTitle_starts_with: String
  subTitle_not_starts_with: String
  subTitle_ends_with: String
  subTitle_not_ends_with: String
  descriptionTop: String
  descriptionTop_not: String
  descriptionTop_in: [String!]
  descriptionTop_not_in: [String!]
  descriptionTop_lt: String
  descriptionTop_lte: String
  descriptionTop_gt: String
  descriptionTop_gte: String
  descriptionTop_contains: String
  descriptionTop_not_contains: String
  descriptionTop_starts_with: String
  descriptionTop_not_starts_with: String
  descriptionTop_ends_with: String
  descriptionTop_not_ends_with: String
  descriptionBottom: String
  descriptionBottom_not: String
  descriptionBottom_in: [String!]
  descriptionBottom_not_in: [String!]
  descriptionBottom_lt: String
  descriptionBottom_lte: String
  descriptionBottom_gt: String
  descriptionBottom_gte: String
  descriptionBottom_contains: String
  descriptionBottom_not_contains: String
  descriptionBottom_starts_with: String
  descriptionBottom_not_starts_with: String
  descriptionBottom_ends_with: String
  descriptionBottom_not_ends_with: String
  AND: [CollectionScalarWhereInput!]
  OR: [CollectionScalarWhereInput!]
  NOT: [CollectionScalarWhereInput!]
}

type CollectionSubscriptionPayload {
  mutation: MutationType!
  node: Collection
  updatedFields: [String!]
  previousValues: CollectionPreviousValues
}

input CollectionSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CollectionWhereInput
  AND: [CollectionSubscriptionWhereInput!]
  OR: [CollectionSubscriptionWhereInput!]
  NOT: [CollectionSubscriptionWhereInput!]
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
  update: [CollectionUpdateWithWhereUniqueNestedInput!]
  upsert: [CollectionUpsertWithWhereUniqueNestedInput!]
  delete: [CollectionWhereUniqueInput!]
  connect: [CollectionWhereUniqueInput!]
  set: [CollectionWhereUniqueInput!]
  disconnect: [CollectionWhereUniqueInput!]
  deleteMany: [CollectionScalarWhereInput!]
  updateMany: [CollectionUpdateManyWithWhereNestedInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  title: String
  title_not: String
  title_in: [String!]
  title_not_in: [String!]
  title_lt: String
  title_lte: String
  title_gt: String
  title_gte: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  subTitle: String
  subTitle_not: String
  subTitle_in: [String!]
  subTitle_not_in: [String!]
  subTitle_lt: String
  subTitle_lte: String
  subTitle_gt: String
  subTitle_gte: String
  subTitle_contains: String
  subTitle_not_contains: String
  subTitle_starts_with: String
  subTitle_not_starts_with: String
  subTitle_ends_with: String
  subTitle_not_ends_with: String
  descriptionTop: String
  descriptionTop_not: String
  descriptionTop_in: [String!]
  descriptionTop_not_in: [String!]
  descriptionTop_lt: String
  descriptionTop_lte: String
  descriptionTop_gt: String
  descriptionTop_gte: String
  descriptionTop_contains: String
  descriptionTop_not_contains: String
  descriptionTop_starts_with: String
  descriptionTop_not_starts_with: String
  descriptionTop_ends_with: String
  descriptionTop_not_ends_with: String
  descriptionBottom: String
  descriptionBottom_not: String
  descriptionBottom_in: [String!]
  descriptionBottom_not_in: [String!]
  descriptionBottom_lt: String
  descriptionBottom_lte: String
  descriptionBottom_gt: String
  descriptionBottom_gte: String
  descriptionBottom_contains: String
  descriptionBottom_not_contains: String
  descriptionBottom_starts_with: String
  descriptionBottom_not_starts_with: String
  descriptionBottom_ends_with: String
  descriptionBottom_not_ends_with: String
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  AND: [CollectionWhereInput!]
  OR: [CollectionWhereInput!]
  NOT: [CollectionWhereInput!]
}

input CollectionWhereUniqueInput {
  id: ID
  slug: String
}

type Color {
  id: ID!
  slug: String!
  name: String!
  colorCode: String!
  hexCode: String!
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant!]
}

type ColorConnection {
  pageInfo: PageInfo!
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

type ColorEdge {
  node: Color!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ColorWhereInput
  AND: [ColorSubscriptionWhereInput!]
  OR: [ColorSubscriptionWhereInput!]
  NOT: [ColorSubscriptionWhereInput!]
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
  update: ColorUpdateDataInput
  upsert: ColorUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: ColorWhereUniqueInput
}

input ColorUpdateOneRequiredInput {
  create: ColorCreateInput
  update: ColorUpdateDataInput
  upsert: ColorUpsertNestedInput
  connect: ColorWhereUniqueInput
}

input ColorUpdateOneRequiredWithoutProductVariantsInput {
  create: ColorCreateWithoutProductVariantsInput
  update: ColorUpdateWithoutProductVariantsDataInput
  upsert: ColorUpsertWithoutProductVariantsInput
  connect: ColorWhereUniqueInput
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  colorCode: String
  colorCode_not: String
  colorCode_in: [String!]
  colorCode_not_in: [String!]
  colorCode_lt: String
  colorCode_lte: String
  colorCode_gt: String
  colorCode_gte: String
  colorCode_contains: String
  colorCode_not_contains: String
  colorCode_starts_with: String
  colorCode_not_starts_with: String
  colorCode_ends_with: String
  colorCode_not_ends_with: String
  hexCode: String
  hexCode_not: String
  hexCode_in: [String!]
  hexCode_not_in: [String!]
  hexCode_lt: String
  hexCode_lte: String
  hexCode_gt: String
  hexCode_gte: String
  hexCode_contains: String
  hexCode_not_contains: String
  hexCode_starts_with: String
  hexCode_not_starts_with: String
  hexCode_ends_with: String
  hexCode_not_ends_with: String
  productVariants_every: ProductVariantWhereInput
  productVariants_some: ProductVariantWhereInput
  productVariants_none: ProductVariantWhereInput
  AND: [ColorWhereInput!]
  OR: [ColorWhereInput!]
  NOT: [ColorWhereInput!]
}

input ColorWhereUniqueInput {
  id: ID
  slug: String
  colorCode: String
}

type Customer {
  id: ID!
  user: User!
  status: CustomerStatus
  detail: CustomerDetail
  billingInfo: BillingInfo
  plan: Plan
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation!]
}

type CustomerConnection {
  pageInfo: PageInfo!
  edges: [CustomerEdge]!
  aggregate: AggregateCustomer!
}

input CustomerCreateInput {
  id: ID
  user: UserCreateOneInput!
  status: CustomerStatus
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  plan: Plan
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
  user: UserCreateOneInput!
  status: CustomerStatus
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  plan: Plan
}

type CustomerDetail {
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
  createdAt: DateTime!
  updatedAt: DateTime!
}

type CustomerDetailConnection {
  pageInfo: PageInfo!
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
  shippingAddress: LocationCreateOneInput
  phoneOS: String
}

input CustomerDetailCreateOneInput {
  create: CustomerDetailCreateInput
  connect: CustomerDetailWhereUniqueInput
}

type CustomerDetailEdge {
  node: CustomerDetail!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CustomerDetailWhereInput
  AND: [CustomerDetailSubscriptionWhereInput!]
  OR: [CustomerDetailSubscriptionWhereInput!]
  NOT: [CustomerDetailSubscriptionWhereInput!]
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
  shippingAddress: LocationUpdateOneInput
  phoneOS: String
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
  shippingAddress: LocationUpdateOneInput
  phoneOS: String
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
}

input CustomerDetailUpdateOneInput {
  create: CustomerDetailCreateInput
  update: CustomerDetailUpdateDataInput
  upsert: CustomerDetailUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: CustomerDetailWhereUniqueInput
}

input CustomerDetailUpsertNestedInput {
  update: CustomerDetailUpdateDataInput!
  create: CustomerDetailCreateInput!
}

input CustomerDetailWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  phoneNumber: String
  phoneNumber_not: String
  phoneNumber_in: [String!]
  phoneNumber_not_in: [String!]
  phoneNumber_lt: String
  phoneNumber_lte: String
  phoneNumber_gt: String
  phoneNumber_gte: String
  phoneNumber_contains: String
  phoneNumber_not_contains: String
  phoneNumber_starts_with: String
  phoneNumber_not_starts_with: String
  phoneNumber_ends_with: String
  phoneNumber_not_ends_with: String
  birthday: DateTime
  birthday_not: DateTime
  birthday_in: [DateTime!]
  birthday_not_in: [DateTime!]
  birthday_lt: DateTime
  birthday_lte: DateTime
  birthday_gt: DateTime
  birthday_gte: DateTime
  height: Int
  height_not: Int
  height_in: [Int!]
  height_not_in: [Int!]
  height_lt: Int
  height_lte: Int
  height_gt: Int
  height_gte: Int
  weight: String
  weight_not: String
  weight_in: [String!]
  weight_not_in: [String!]
  weight_lt: String
  weight_lte: String
  weight_gt: String
  weight_gte: String
  weight_contains: String
  weight_not_contains: String
  weight_starts_with: String
  weight_not_starts_with: String
  weight_ends_with: String
  weight_not_ends_with: String
  bodyType: String
  bodyType_not: String
  bodyType_in: [String!]
  bodyType_not_in: [String!]
  bodyType_lt: String
  bodyType_lte: String
  bodyType_gt: String
  bodyType_gte: String
  bodyType_contains: String
  bodyType_not_contains: String
  bodyType_starts_with: String
  bodyType_not_starts_with: String
  bodyType_ends_with: String
  bodyType_not_ends_with: String
  averageTopSize: String
  averageTopSize_not: String
  averageTopSize_in: [String!]
  averageTopSize_not_in: [String!]
  averageTopSize_lt: String
  averageTopSize_lte: String
  averageTopSize_gt: String
  averageTopSize_gte: String
  averageTopSize_contains: String
  averageTopSize_not_contains: String
  averageTopSize_starts_with: String
  averageTopSize_not_starts_with: String
  averageTopSize_ends_with: String
  averageTopSize_not_ends_with: String
  averageWaistSize: String
  averageWaistSize_not: String
  averageWaistSize_in: [String!]
  averageWaistSize_not_in: [String!]
  averageWaistSize_lt: String
  averageWaistSize_lte: String
  averageWaistSize_gt: String
  averageWaistSize_gte: String
  averageWaistSize_contains: String
  averageWaistSize_not_contains: String
  averageWaistSize_starts_with: String
  averageWaistSize_not_starts_with: String
  averageWaistSize_ends_with: String
  averageWaistSize_not_ends_with: String
  averagePantLength: String
  averagePantLength_not: String
  averagePantLength_in: [String!]
  averagePantLength_not_in: [String!]
  averagePantLength_lt: String
  averagePantLength_lte: String
  averagePantLength_gt: String
  averagePantLength_gte: String
  averagePantLength_contains: String
  averagePantLength_not_contains: String
  averagePantLength_starts_with: String
  averagePantLength_not_starts_with: String
  averagePantLength_ends_with: String
  averagePantLength_not_ends_with: String
  preferredPronouns: String
  preferredPronouns_not: String
  preferredPronouns_in: [String!]
  preferredPronouns_not_in: [String!]
  preferredPronouns_lt: String
  preferredPronouns_lte: String
  preferredPronouns_gt: String
  preferredPronouns_gte: String
  preferredPronouns_contains: String
  preferredPronouns_not_contains: String
  preferredPronouns_starts_with: String
  preferredPronouns_not_starts_with: String
  preferredPronouns_ends_with: String
  preferredPronouns_not_ends_with: String
  profession: String
  profession_not: String
  profession_in: [String!]
  profession_not_in: [String!]
  profession_lt: String
  profession_lte: String
  profession_gt: String
  profession_gte: String
  profession_contains: String
  profession_not_contains: String
  profession_starts_with: String
  profession_not_starts_with: String
  profession_ends_with: String
  profession_not_ends_with: String
  partyFrequency: String
  partyFrequency_not: String
  partyFrequency_in: [String!]
  partyFrequency_not_in: [String!]
  partyFrequency_lt: String
  partyFrequency_lte: String
  partyFrequency_gt: String
  partyFrequency_gte: String
  partyFrequency_contains: String
  partyFrequency_not_contains: String
  partyFrequency_starts_with: String
  partyFrequency_not_starts_with: String
  partyFrequency_ends_with: String
  partyFrequency_not_ends_with: String
  travelFrequency: String
  travelFrequency_not: String
  travelFrequency_in: [String!]
  travelFrequency_not_in: [String!]
  travelFrequency_lt: String
  travelFrequency_lte: String
  travelFrequency_gt: String
  travelFrequency_gte: String
  travelFrequency_contains: String
  travelFrequency_not_contains: String
  travelFrequency_starts_with: String
  travelFrequency_not_starts_with: String
  travelFrequency_ends_with: String
  travelFrequency_not_ends_with: String
  shoppingFrequency: String
  shoppingFrequency_not: String
  shoppingFrequency_in: [String!]
  shoppingFrequency_not_in: [String!]
  shoppingFrequency_lt: String
  shoppingFrequency_lte: String
  shoppingFrequency_gt: String
  shoppingFrequency_gte: String
  shoppingFrequency_contains: String
  shoppingFrequency_not_contains: String
  shoppingFrequency_starts_with: String
  shoppingFrequency_not_starts_with: String
  shoppingFrequency_ends_with: String
  shoppingFrequency_not_ends_with: String
  averageSpend: String
  averageSpend_not: String
  averageSpend_in: [String!]
  averageSpend_not_in: [String!]
  averageSpend_lt: String
  averageSpend_lte: String
  averageSpend_gt: String
  averageSpend_gte: String
  averageSpend_contains: String
  averageSpend_not_contains: String
  averageSpend_starts_with: String
  averageSpend_not_starts_with: String
  averageSpend_ends_with: String
  averageSpend_not_ends_with: String
  style: String
  style_not: String
  style_in: [String!]
  style_not_in: [String!]
  style_lt: String
  style_lte: String
  style_gt: String
  style_gte: String
  style_contains: String
  style_not_contains: String
  style_starts_with: String
  style_not_starts_with: String
  style_ends_with: String
  style_not_ends_with: String
  commuteStyle: String
  commuteStyle_not: String
  commuteStyle_in: [String!]
  commuteStyle_not_in: [String!]
  commuteStyle_lt: String
  commuteStyle_lte: String
  commuteStyle_gt: String
  commuteStyle_gte: String
  commuteStyle_contains: String
  commuteStyle_not_contains: String
  commuteStyle_starts_with: String
  commuteStyle_not_starts_with: String
  commuteStyle_ends_with: String
  commuteStyle_not_ends_with: String
  shippingAddress: LocationWhereInput
  phoneOS: String
  phoneOS_not: String
  phoneOS_in: [String!]
  phoneOS_not_in: [String!]
  phoneOS_lt: String
  phoneOS_lte: String
  phoneOS_gt: String
  phoneOS_gte: String
  phoneOS_contains: String
  phoneOS_not_contains: String
  phoneOS_starts_with: String
  phoneOS_not_starts_with: String
  phoneOS_ends_with: String
  phoneOS_not_ends_with: String
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [CustomerDetailWhereInput!]
  OR: [CustomerDetailWhereInput!]
  NOT: [CustomerDetailWhereInput!]
}

input CustomerDetailWhereUniqueInput {
  id: ID
}

type CustomerEdge {
  node: Customer!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CustomerWhereInput
  AND: [CustomerSubscriptionWhereInput!]
  OR: [CustomerSubscriptionWhereInput!]
  NOT: [CustomerSubscriptionWhereInput!]
}

input CustomerUpdateDataInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateManyMutationInput {
  status: CustomerStatus
  plan: Plan
}

input CustomerUpdateOneRequiredInput {
  create: CustomerCreateInput
  update: CustomerUpdateDataInput
  upsert: CustomerUpsertNestedInput
  connect: CustomerWhereUniqueInput
}

input CustomerUpdateOneRequiredWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  update: CustomerUpdateWithoutReservationsDataInput
  upsert: CustomerUpsertWithoutReservationsInput
  connect: CustomerWhereUniqueInput
}

input CustomerUpdateWithoutReservationsDataInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  user: UserWhereInput
  status: CustomerStatus
  status_not: CustomerStatus
  status_in: [CustomerStatus!]
  status_not_in: [CustomerStatus!]
  detail: CustomerDetailWhereInput
  billingInfo: BillingInfoWhereInput
  plan: Plan
  plan_not: Plan
  plan_in: [Plan!]
  plan_not_in: [Plan!]
  reservations_every: ReservationWhereInput
  reservations_some: ReservationWhereInput
  reservations_none: ReservationWhereInput
  AND: [CustomerWhereInput!]
  OR: [CustomerWhereInput!]
  NOT: [CustomerWhereInput!]
}

input CustomerWhereUniqueInput {
  id: ID
}

scalar DateTime

type HomepageProductRail {
  id: ID!
  slug: String!
  name: String!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

type HomepageProductRailConnection {
  pageInfo: PageInfo!
  edges: [HomepageProductRailEdge]!
  aggregate: AggregateHomepageProductRail!
}

input HomepageProductRailCreateInput {
  id: ID
  slug: String!
  name: String!
  products: ProductCreateManyInput
}

type HomepageProductRailEdge {
  node: HomepageProductRail!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: HomepageProductRailWhereInput
  AND: [HomepageProductRailSubscriptionWhereInput!]
  OR: [HomepageProductRailSubscriptionWhereInput!]
  NOT: [HomepageProductRailSubscriptionWhereInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  AND: [HomepageProductRailWhereInput!]
  OR: [HomepageProductRailWhereInput!]
  NOT: [HomepageProductRailWhereInput!]
}

input HomepageProductRailWhereUniqueInput {
  id: ID
  slug: String
}

type Image {
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

type ImageConnection {
  pageInfo: PageInfo!
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

type ImageEdge {
  node: Image!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ImageWhereInput
  AND: [ImageSubscriptionWhereInput!]
  OR: [ImageSubscriptionWhereInput!]
  NOT: [ImageSubscriptionWhereInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  caption: String
  caption_not: String
  caption_in: [String!]
  caption_not_in: [String!]
  caption_lt: String
  caption_lte: String
  caption_gt: String
  caption_gte: String
  caption_contains: String
  caption_not_contains: String
  caption_starts_with: String
  caption_not_starts_with: String
  caption_ends_with: String
  caption_not_ends_with: String
  originalHeight: Int
  originalHeight_not: Int
  originalHeight_in: [Int!]
  originalHeight_not_in: [Int!]
  originalHeight_lt: Int
  originalHeight_lte: Int
  originalHeight_gt: Int
  originalHeight_gte: Int
  originalUrl: String
  originalUrl_not: String
  originalUrl_in: [String!]
  originalUrl_not_in: [String!]
  originalUrl_lt: String
  originalUrl_lte: String
  originalUrl_gt: String
  originalUrl_gte: String
  originalUrl_contains: String
  originalUrl_not_contains: String
  originalUrl_starts_with: String
  originalUrl_not_starts_with: String
  originalUrl_ends_with: String
  originalUrl_not_ends_with: String
  originalWidth: Int
  originalWidth_not: Int
  originalWidth_in: [Int!]
  originalWidth_not_in: [Int!]
  originalWidth_lt: Int
  originalWidth_lte: Int
  originalWidth_gt: Int
  originalWidth_gte: Int
  resizedUrl: String
  resizedUrl_not: String
  resizedUrl_in: [String!]
  resizedUrl_not_in: [String!]
  resizedUrl_lt: String
  resizedUrl_lte: String
  resizedUrl_gt: String
  resizedUrl_gte: String
  resizedUrl_contains: String
  resizedUrl_not_contains: String
  resizedUrl_starts_with: String
  resizedUrl_not_starts_with: String
  resizedUrl_ends_with: String
  resizedUrl_not_ends_with: String
  title: String
  title_not: String
  title_in: [String!]
  title_not_in: [String!]
  title_lt: String
  title_lte: String
  title_gt: String
  title_gte: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ImageWhereInput!]
  OR: [ImageWhereInput!]
  NOT: [ImageWhereInput!]
}

input ImageWhereUniqueInput {
  id: ID
}

enum InventoryStatus {
  NonReservable
  Reservable
  Reserved
}

scalar Json

type Label {
  id: ID!
  name: String
  image: String
  trackingNumber: String
  trackingURL: String
}

type LabelConnection {
  pageInfo: PageInfo!
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

type LabelEdge {
  node: Label!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: LabelWhereInput
  AND: [LabelSubscriptionWhereInput!]
  OR: [LabelSubscriptionWhereInput!]
  NOT: [LabelSubscriptionWhereInput!]
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
  update: LabelUpdateDataInput
  upsert: LabelUpsertNestedInput
  connect: LabelWhereUniqueInput
}

input LabelUpsertNestedInput {
  update: LabelUpdateDataInput!
  create: LabelCreateInput!
}

input LabelWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  image: String
  image_not: String
  image_in: [String!]
  image_not_in: [String!]
  image_lt: String
  image_lte: String
  image_gt: String
  image_gte: String
  image_contains: String
  image_not_contains: String
  image_starts_with: String
  image_not_starts_with: String
  image_ends_with: String
  image_not_ends_with: String
  trackingNumber: String
  trackingNumber_not: String
  trackingNumber_in: [String!]
  trackingNumber_not_in: [String!]
  trackingNumber_lt: String
  trackingNumber_lte: String
  trackingNumber_gt: String
  trackingNumber_gte: String
  trackingNumber_contains: String
  trackingNumber_not_contains: String
  trackingNumber_starts_with: String
  trackingNumber_not_starts_with: String
  trackingNumber_ends_with: String
  trackingNumber_not_ends_with: String
  trackingURL: String
  trackingURL_not: String
  trackingURL_in: [String!]
  trackingURL_not_in: [String!]
  trackingURL_lt: String
  trackingURL_lte: String
  trackingURL_gt: String
  trackingURL_gte: String
  trackingURL_contains: String
  trackingURL_not_contains: String
  trackingURL_starts_with: String
  trackingURL_not_starts_with: String
  trackingURL_ends_with: String
  trackingURL_not_ends_with: String
  AND: [LabelWhereInput!]
  OR: [LabelWhereInput!]
  NOT: [LabelWhereInput!]
}

input LabelWhereUniqueInput {
  id: ID
}

type Location {
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

type LocationConnection {
  pageInfo: PageInfo!
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
  user: UserCreateOneInput
  lat: Float
  lng: Float
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
  user: UserCreateOneInput
  lat: Float
  lng: Float
}

type LocationEdge {
  node: Location!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: LocationWhereInput
  AND: [LocationSubscriptionWhereInput!]
  OR: [LocationSubscriptionWhereInput!]
  NOT: [LocationSubscriptionWhereInput!]
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
  user: UserUpdateOneInput
  lat: Float
  lng: Float
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
  user: UserUpdateOneInput
  lat: Float
  lng: Float
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
  update: LocationUpdateDataInput
  upsert: LocationUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: LocationWhereUniqueInput
}

input LocationUpdateOneRequiredInput {
  create: LocationCreateInput
  update: LocationUpdateDataInput
  upsert: LocationUpsertNestedInput
  connect: LocationWhereUniqueInput
}

input LocationUpdateOneRequiredWithoutPhysicalProductsInput {
  create: LocationCreateWithoutPhysicalProductsInput
  update: LocationUpdateWithoutPhysicalProductsDataInput
  upsert: LocationUpsertWithoutPhysicalProductsInput
  connect: LocationWhereUniqueInput
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
  user: UserUpdateOneInput
  lat: Float
  lng: Float
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  company: String
  company_not: String
  company_in: [String!]
  company_not_in: [String!]
  company_lt: String
  company_lte: String
  company_gt: String
  company_gte: String
  company_contains: String
  company_not_contains: String
  company_starts_with: String
  company_not_starts_with: String
  company_ends_with: String
  company_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  address1: String
  address1_not: String
  address1_in: [String!]
  address1_not_in: [String!]
  address1_lt: String
  address1_lte: String
  address1_gt: String
  address1_gte: String
  address1_contains: String
  address1_not_contains: String
  address1_starts_with: String
  address1_not_starts_with: String
  address1_ends_with: String
  address1_not_ends_with: String
  address2: String
  address2_not: String
  address2_in: [String!]
  address2_not_in: [String!]
  address2_lt: String
  address2_lte: String
  address2_gt: String
  address2_gte: String
  address2_contains: String
  address2_not_contains: String
  address2_starts_with: String
  address2_not_starts_with: String
  address2_ends_with: String
  address2_not_ends_with: String
  city: String
  city_not: String
  city_in: [String!]
  city_not_in: [String!]
  city_lt: String
  city_lte: String
  city_gt: String
  city_gte: String
  city_contains: String
  city_not_contains: String
  city_starts_with: String
  city_not_starts_with: String
  city_ends_with: String
  city_not_ends_with: String
  state: String
  state_not: String
  state_in: [String!]
  state_not_in: [String!]
  state_lt: String
  state_lte: String
  state_gt: String
  state_gte: String
  state_contains: String
  state_not_contains: String
  state_starts_with: String
  state_not_starts_with: String
  state_ends_with: String
  state_not_ends_with: String
  zipCode: String
  zipCode_not: String
  zipCode_in: [String!]
  zipCode_not_in: [String!]
  zipCode_lt: String
  zipCode_lte: String
  zipCode_gt: String
  zipCode_gte: String
  zipCode_contains: String
  zipCode_not_contains: String
  zipCode_starts_with: String
  zipCode_not_starts_with: String
  zipCode_ends_with: String
  zipCode_not_ends_with: String
  locationType: LocationType
  locationType_not: LocationType
  locationType_in: [LocationType!]
  locationType_not_in: [LocationType!]
  user: UserWhereInput
  lat: Float
  lat_not: Float
  lat_in: [Float!]
  lat_not_in: [Float!]
  lat_lt: Float
  lat_lte: Float
  lat_gt: Float
  lat_gte: Float
  lng: Float
  lng_not: Float
  lng_in: [Float!]
  lng_not_in: [Float!]
  lng_lt: Float
  lng_lte: Float
  lng_gt: Float
  lng_gte: Float
  physicalProducts_every: PhysicalProductWhereInput
  physicalProducts_some: PhysicalProductWhereInput
  physicalProducts_none: PhysicalProductWhereInput
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [LocationWhereInput!]
  OR: [LocationWhereInput!]
  NOT: [LocationWhereInput!]
}

input LocationWhereUniqueInput {
  id: ID
  slug: String
}

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
}

type Mutation {
  createBagItem(data: BagItemCreateInput!): BagItem!
  updateBagItem(data: BagItemUpdateInput!, where: BagItemWhereUniqueInput!): BagItem
  updateManyBagItems(data: BagItemUpdateManyMutationInput!, where: BagItemWhereInput): BatchPayload!
  upsertBagItem(where: BagItemWhereUniqueInput!, create: BagItemCreateInput!, update: BagItemUpdateInput!): BagItem!
  deleteBagItem(where: BagItemWhereUniqueInput!): BagItem
  deleteManyBagItems(where: BagItemWhereInput): BatchPayload!
  createBillingInfo(data: BillingInfoCreateInput!): BillingInfo!
  updateBillingInfo(data: BillingInfoUpdateInput!, where: BillingInfoWhereUniqueInput!): BillingInfo
  updateManyBillingInfoes(data: BillingInfoUpdateManyMutationInput!, where: BillingInfoWhereInput): BatchPayload!
  upsertBillingInfo(where: BillingInfoWhereUniqueInput!, create: BillingInfoCreateInput!, update: BillingInfoUpdateInput!): BillingInfo!
  deleteBillingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  deleteManyBillingInfoes(where: BillingInfoWhereInput): BatchPayload!
  createBrand(data: BrandCreateInput!): Brand!
  updateBrand(data: BrandUpdateInput!, where: BrandWhereUniqueInput!): Brand
  updateManyBrands(data: BrandUpdateManyMutationInput!, where: BrandWhereInput): BatchPayload!
  upsertBrand(where: BrandWhereUniqueInput!, create: BrandCreateInput!, update: BrandUpdateInput!): Brand!
  deleteBrand(where: BrandWhereUniqueInput!): Brand
  deleteManyBrands(where: BrandWhereInput): BatchPayload!
  createCategory(data: CategoryCreateInput!): Category!
  updateCategory(data: CategoryUpdateInput!, where: CategoryWhereUniqueInput!): Category
  updateManyCategories(data: CategoryUpdateManyMutationInput!, where: CategoryWhereInput): BatchPayload!
  upsertCategory(where: CategoryWhereUniqueInput!, create: CategoryCreateInput!, update: CategoryUpdateInput!): Category!
  deleteCategory(where: CategoryWhereUniqueInput!): Category
  deleteManyCategories(where: CategoryWhereInput): BatchPayload!
  createCollection(data: CollectionCreateInput!): Collection!
  updateCollection(data: CollectionUpdateInput!, where: CollectionWhereUniqueInput!): Collection
  updateManyCollections(data: CollectionUpdateManyMutationInput!, where: CollectionWhereInput): BatchPayload!
  upsertCollection(where: CollectionWhereUniqueInput!, create: CollectionCreateInput!, update: CollectionUpdateInput!): Collection!
  deleteCollection(where: CollectionWhereUniqueInput!): Collection
  deleteManyCollections(where: CollectionWhereInput): BatchPayload!
  createCollectionGroup(data: CollectionGroupCreateInput!): CollectionGroup!
  updateCollectionGroup(data: CollectionGroupUpdateInput!, where: CollectionGroupWhereUniqueInput!): CollectionGroup
  updateManyCollectionGroups(data: CollectionGroupUpdateManyMutationInput!, where: CollectionGroupWhereInput): BatchPayload!
  upsertCollectionGroup(where: CollectionGroupWhereUniqueInput!, create: CollectionGroupCreateInput!, update: CollectionGroupUpdateInput!): CollectionGroup!
  deleteCollectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  deleteManyCollectionGroups(where: CollectionGroupWhereInput): BatchPayload!
  createColor(data: ColorCreateInput!): Color!
  updateColor(data: ColorUpdateInput!, where: ColorWhereUniqueInput!): Color
  updateManyColors(data: ColorUpdateManyMutationInput!, where: ColorWhereInput): BatchPayload!
  upsertColor(where: ColorWhereUniqueInput!, create: ColorCreateInput!, update: ColorUpdateInput!): Color!
  deleteColor(where: ColorWhereUniqueInput!): Color
  deleteManyColors(where: ColorWhereInput): BatchPayload!
  createCustomer(data: CustomerCreateInput!): Customer!
  updateCustomer(data: CustomerUpdateInput!, where: CustomerWhereUniqueInput!): Customer
  updateManyCustomers(data: CustomerUpdateManyMutationInput!, where: CustomerWhereInput): BatchPayload!
  upsertCustomer(where: CustomerWhereUniqueInput!, create: CustomerCreateInput!, update: CustomerUpdateInput!): Customer!
  deleteCustomer(where: CustomerWhereUniqueInput!): Customer
  deleteManyCustomers(where: CustomerWhereInput): BatchPayload!
  createCustomerDetail(data: CustomerDetailCreateInput!): CustomerDetail!
  updateCustomerDetail(data: CustomerDetailUpdateInput!, where: CustomerDetailWhereUniqueInput!): CustomerDetail
  updateManyCustomerDetails(data: CustomerDetailUpdateManyMutationInput!, where: CustomerDetailWhereInput): BatchPayload!
  upsertCustomerDetail(where: CustomerDetailWhereUniqueInput!, create: CustomerDetailCreateInput!, update: CustomerDetailUpdateInput!): CustomerDetail!
  deleteCustomerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  deleteManyCustomerDetails(where: CustomerDetailWhereInput): BatchPayload!
  createHomepageProductRail(data: HomepageProductRailCreateInput!): HomepageProductRail!
  updateHomepageProductRail(data: HomepageProductRailUpdateInput!, where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  updateManyHomepageProductRails(data: HomepageProductRailUpdateManyMutationInput!, where: HomepageProductRailWhereInput): BatchPayload!
  upsertHomepageProductRail(where: HomepageProductRailWhereUniqueInput!, create: HomepageProductRailCreateInput!, update: HomepageProductRailUpdateInput!): HomepageProductRail!
  deleteHomepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  deleteManyHomepageProductRails(where: HomepageProductRailWhereInput): BatchPayload!
  createImage(data: ImageCreateInput!): Image!
  updateImage(data: ImageUpdateInput!, where: ImageWhereUniqueInput!): Image
  updateManyImages(data: ImageUpdateManyMutationInput!, where: ImageWhereInput): BatchPayload!
  upsertImage(where: ImageWhereUniqueInput!, create: ImageCreateInput!, update: ImageUpdateInput!): Image!
  deleteImage(where: ImageWhereUniqueInput!): Image
  deleteManyImages(where: ImageWhereInput): BatchPayload!
  createLabel(data: LabelCreateInput!): Label!
  updateLabel(data: LabelUpdateInput!, where: LabelWhereUniqueInput!): Label
  updateManyLabels(data: LabelUpdateManyMutationInput!, where: LabelWhereInput): BatchPayload!
  upsertLabel(where: LabelWhereUniqueInput!, create: LabelCreateInput!, update: LabelUpdateInput!): Label!
  deleteLabel(where: LabelWhereUniqueInput!): Label
  deleteManyLabels(where: LabelWhereInput): BatchPayload!
  createLocation(data: LocationCreateInput!): Location!
  updateLocation(data: LocationUpdateInput!, where: LocationWhereUniqueInput!): Location
  updateManyLocations(data: LocationUpdateManyMutationInput!, where: LocationWhereInput): BatchPayload!
  upsertLocation(where: LocationWhereUniqueInput!, create: LocationCreateInput!, update: LocationUpdateInput!): Location!
  deleteLocation(where: LocationWhereUniqueInput!): Location
  deleteManyLocations(where: LocationWhereInput): BatchPayload!
  createOrder(data: OrderCreateInput!): Order!
  deleteOrder(where: OrderWhereUniqueInput!): Order
  deleteManyOrders(where: OrderWhereInput): BatchPayload!
  createPackage(data: PackageCreateInput!): Package!
  updatePackage(data: PackageUpdateInput!, where: PackageWhereUniqueInput!): Package
  updateManyPackages(data: PackageUpdateManyMutationInput!, where: PackageWhereInput): BatchPayload!
  upsertPackage(where: PackageWhereUniqueInput!, create: PackageCreateInput!, update: PackageUpdateInput!): Package!
  deletePackage(where: PackageWhereUniqueInput!): Package
  deleteManyPackages(where: PackageWhereInput): BatchPayload!
  createPhysicalProduct(data: PhysicalProductCreateInput!): PhysicalProduct!
  updatePhysicalProduct(data: PhysicalProductUpdateInput!, where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  updateManyPhysicalProducts(data: PhysicalProductUpdateManyMutationInput!, where: PhysicalProductWhereInput): BatchPayload!
  upsertPhysicalProduct(where: PhysicalProductWhereUniqueInput!, create: PhysicalProductCreateInput!, update: PhysicalProductUpdateInput!): PhysicalProduct!
  deletePhysicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  deleteManyPhysicalProducts(where: PhysicalProductWhereInput): BatchPayload!
  createProduct(data: ProductCreateInput!): Product!
  updateProduct(data: ProductUpdateInput!, where: ProductWhereUniqueInput!): Product
  updateManyProducts(data: ProductUpdateManyMutationInput!, where: ProductWhereInput): BatchPayload!
  upsertProduct(where: ProductWhereUniqueInput!, create: ProductCreateInput!, update: ProductUpdateInput!): Product!
  deleteProduct(where: ProductWhereUniqueInput!): Product
  deleteManyProducts(where: ProductWhereInput): BatchPayload!
  createProductFunction(data: ProductFunctionCreateInput!): ProductFunction!
  updateProductFunction(data: ProductFunctionUpdateInput!, where: ProductFunctionWhereUniqueInput!): ProductFunction
  updateManyProductFunctions(data: ProductFunctionUpdateManyMutationInput!, where: ProductFunctionWhereInput): BatchPayload!
  upsertProductFunction(where: ProductFunctionWhereUniqueInput!, create: ProductFunctionCreateInput!, update: ProductFunctionUpdateInput!): ProductFunction!
  deleteProductFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  deleteManyProductFunctions(where: ProductFunctionWhereInput): BatchPayload!
  createProductRequest(data: ProductRequestCreateInput!): ProductRequest!
  updateProductRequest(data: ProductRequestUpdateInput!, where: ProductRequestWhereUniqueInput!): ProductRequest
  updateManyProductRequests(data: ProductRequestUpdateManyMutationInput!, where: ProductRequestWhereInput): BatchPayload!
  upsertProductRequest(where: ProductRequestWhereUniqueInput!, create: ProductRequestCreateInput!, update: ProductRequestUpdateInput!): ProductRequest!
  deleteProductRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  deleteManyProductRequests(where: ProductRequestWhereInput): BatchPayload!
  createProductVariant(data: ProductVariantCreateInput!): ProductVariant!
  updateProductVariant(data: ProductVariantUpdateInput!, where: ProductVariantWhereUniqueInput!): ProductVariant
  updateManyProductVariants(data: ProductVariantUpdateManyMutationInput!, where: ProductVariantWhereInput): BatchPayload!
  upsertProductVariant(where: ProductVariantWhereUniqueInput!, create: ProductVariantCreateInput!, update: ProductVariantUpdateInput!): ProductVariant!
  deleteProductVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  deleteManyProductVariants(where: ProductVariantWhereInput): BatchPayload!
  createReservation(data: ReservationCreateInput!): Reservation!
  updateReservation(data: ReservationUpdateInput!, where: ReservationWhereUniqueInput!): Reservation
  updateManyReservations(data: ReservationUpdateManyMutationInput!, where: ReservationWhereInput): BatchPayload!
  upsertReservation(where: ReservationWhereUniqueInput!, create: ReservationCreateInput!, update: ReservationUpdateInput!): Reservation!
  deleteReservation(where: ReservationWhereUniqueInput!): Reservation
  deleteManyReservations(where: ReservationWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type Order {
  id: ID!
}

type OrderConnection {
  pageInfo: PageInfo!
  edges: [OrderEdge]!
  aggregate: AggregateOrder!
}

input OrderCreateInput {
  id: ID
}

type OrderEdge {
  node: Order!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: OrderWhereInput
  AND: [OrderSubscriptionWhereInput!]
  OR: [OrderSubscriptionWhereInput!]
  NOT: [OrderSubscriptionWhereInput!]
}

input OrderWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  AND: [OrderWhereInput!]
  OR: [OrderWhereInput!]
  NOT: [OrderWhereInput!]
}

input OrderWhereUniqueInput {
  id: ID
}

type Package {
  id: ID!
  items(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  shippingLabel: Label!
  fromAddress: Location!
  toAddress: Location!
  weight: Float
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PackageConnection {
  pageInfo: PageInfo!
  edges: [PackageEdge]!
  aggregate: AggregatePackage!
}

input PackageCreateInput {
  id: ID
  items: PhysicalProductCreateManyInput
  shippingLabel: LabelCreateOneInput!
  fromAddress: LocationCreateOneInput!
  toAddress: LocationCreateOneInput!
  weight: Float
}

input PackageCreateOneInput {
  create: PackageCreateInput
  connect: PackageWhereUniqueInput
}

type PackageEdge {
  node: Package!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PackageWhereInput
  AND: [PackageSubscriptionWhereInput!]
  OR: [PackageSubscriptionWhereInput!]
  NOT: [PackageSubscriptionWhereInput!]
}

input PackageUpdateDataInput {
  items: PhysicalProductUpdateManyInput
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
  weight: Float
}

input PackageUpdateInput {
  items: PhysicalProductUpdateManyInput
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
  weight: Float
}

input PackageUpdateManyMutationInput {
  weight: Float
}

input PackageUpdateOneInput {
  create: PackageCreateInput
  update: PackageUpdateDataInput
  upsert: PackageUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: PackageWhereUniqueInput
}

input PackageUpsertNestedInput {
  update: PackageUpdateDataInput!
  create: PackageCreateInput!
}

input PackageWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  items_every: PhysicalProductWhereInput
  items_some: PhysicalProductWhereInput
  items_none: PhysicalProductWhereInput
  shippingLabel: LabelWhereInput
  fromAddress: LocationWhereInput
  toAddress: LocationWhereInput
  weight: Float
  weight_not: Float
  weight_in: [Float!]
  weight_not_in: [Float!]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [PackageWhereInput!]
  OR: [PackageWhereInput!]
  NOT: [PackageWhereInput!]
}

input PackageWhereUniqueInput {
  id: ID
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type PhysicalProduct {
  id: ID!
  seasonsUID: String!
  location: Location!
  productVariant: ProductVariant!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PhysicalProductConnection {
  pageInfo: PageInfo!
  edges: [PhysicalProductEdge]!
  aggregate: AggregatePhysicalProduct!
}

input PhysicalProductCreateInput {
  id: ID
  seasonsUID: String!
  location: LocationCreateOneWithoutPhysicalProductsInput!
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
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
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
}

input PhysicalProductCreateWithoutProductVariantInput {
  id: ID
  seasonsUID: String!
  location: LocationCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
}

type PhysicalProductEdge {
  node: PhysicalProduct!
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  seasonsUID: String
  seasonsUID_not: String
  seasonsUID_in: [String!]
  seasonsUID_not_in: [String!]
  seasonsUID_lt: String
  seasonsUID_lte: String
  seasonsUID_gt: String
  seasonsUID_gte: String
  seasonsUID_contains: String
  seasonsUID_not_contains: String
  seasonsUID_starts_with: String
  seasonsUID_not_starts_with: String
  seasonsUID_ends_with: String
  seasonsUID_not_ends_with: String
  inventoryStatus: InventoryStatus
  inventoryStatus_not: InventoryStatus
  inventoryStatus_in: [InventoryStatus!]
  inventoryStatus_not_in: [InventoryStatus!]
  productStatus: PhysicalProductStatus
  productStatus_not: PhysicalProductStatus
  productStatus_in: [PhysicalProductStatus!]
  productStatus_not_in: [PhysicalProductStatus!]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [PhysicalProductScalarWhereInput!]
  OR: [PhysicalProductScalarWhereInput!]
  NOT: [PhysicalProductScalarWhereInput!]
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PhysicalProductWhereInput
  AND: [PhysicalProductSubscriptionWhereInput!]
  OR: [PhysicalProductSubscriptionWhereInput!]
  NOT: [PhysicalProductSubscriptionWhereInput!]
}

input PhysicalProductUpdateDataInput {
  seasonsUID: String
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateInput {
  seasonsUID: String
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateManyDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateManyInput {
  create: [PhysicalProductCreateInput!]
  update: [PhysicalProductUpdateWithWhereUniqueNestedInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueNestedInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
}

input PhysicalProductUpdateManyMutationInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateManyWithoutLocationInput {
  create: [PhysicalProductCreateWithoutLocationInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueWithoutLocationInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueWithoutLocationInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
}

input PhysicalProductUpdateManyWithoutProductVariantInput {
  create: [PhysicalProductCreateWithoutProductVariantInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
}

input PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput!
  data: PhysicalProductUpdateManyDataInput!
}

input PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID: String
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

input PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID: String
  location: LocationUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  seasonsUID: String
  seasonsUID_not: String
  seasonsUID_in: [String!]
  seasonsUID_not_in: [String!]
  seasonsUID_lt: String
  seasonsUID_lte: String
  seasonsUID_gt: String
  seasonsUID_gte: String
  seasonsUID_contains: String
  seasonsUID_not_contains: String
  seasonsUID_starts_with: String
  seasonsUID_not_starts_with: String
  seasonsUID_ends_with: String
  seasonsUID_not_ends_with: String
  location: LocationWhereInput
  productVariant: ProductVariantWhereInput
  inventoryStatus: InventoryStatus
  inventoryStatus_not: InventoryStatus
  inventoryStatus_in: [InventoryStatus!]
  inventoryStatus_not_in: [InventoryStatus!]
  productStatus: PhysicalProductStatus
  productStatus_not: PhysicalProductStatus
  productStatus_in: [PhysicalProductStatus!]
  productStatus_not_in: [PhysicalProductStatus!]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [PhysicalProductWhereInput!]
  OR: [PhysicalProductWhereInput!]
  NOT: [PhysicalProductWhereInput!]
}

input PhysicalProductWhereUniqueInput {
  id: ID
  seasonsUID: String
}

enum Plan {
  AllAccess
  Essential
}

type Product {
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

type ProductConnection {
  pageInfo: PageInfo!
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
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: Json
  functions: ProductFunctionCreateManyInput
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
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
  category: CategoryCreateOneWithoutProductsInput!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: Json
  functions: ProductFunctionCreateManyInput
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
}

input ProductCreateWithoutCategoryInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: Json
  functions: ProductFunctionCreateManyInput
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
}

input ProductCreateWithoutVariantsInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  description: String
  externalURL: String
  images: Json!
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: Json
  functions: ProductFunctionCreateManyInput
  availableSizes: ProductCreateavailableSizesInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  status: ProductStatus
}

type ProductEdge {
  node: Product!
  cursor: String!
}

type ProductFunction {
  id: ID!
  name: String
}

type ProductFunctionConnection {
  pageInfo: PageInfo!
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

type ProductFunctionEdge {
  node: ProductFunction!
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  AND: [ProductFunctionScalarWhereInput!]
  OR: [ProductFunctionScalarWhereInput!]
  NOT: [ProductFunctionScalarWhereInput!]
}

type ProductFunctionSubscriptionPayload {
  mutation: MutationType!
  node: ProductFunction
  updatedFields: [String!]
  previousValues: ProductFunctionPreviousValues
}

input ProductFunctionSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductFunctionWhereInput
  AND: [ProductFunctionSubscriptionWhereInput!]
  OR: [ProductFunctionSubscriptionWhereInput!]
  NOT: [ProductFunctionSubscriptionWhereInput!]
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
  update: [ProductFunctionUpdateWithWhereUniqueNestedInput!]
  upsert: [ProductFunctionUpsertWithWhereUniqueNestedInput!]
  delete: [ProductFunctionWhereUniqueInput!]
  connect: [ProductFunctionWhereUniqueInput!]
  set: [ProductFunctionWhereUniqueInput!]
  disconnect: [ProductFunctionWhereUniqueInput!]
  deleteMany: [ProductFunctionScalarWhereInput!]
  updateMany: [ProductFunctionUpdateManyWithWhereNestedInput!]
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  AND: [ProductFunctionWhereInput!]
  OR: [ProductFunctionWhereInput!]
  NOT: [ProductFunctionWhereInput!]
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

type ProductRequest {
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

type ProductRequestConnection {
  pageInfo: PageInfo!
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
  images: ProductRequestCreateimagesInput
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String!
  sku: String
  url: String!
  user: UserCreateOneInput!
}

type ProductRequestEdge {
  node: ProductRequest!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductRequestWhereInput
  AND: [ProductRequestSubscriptionWhereInput!]
  OR: [ProductRequestSubscriptionWhereInput!]
  NOT: [ProductRequestSubscriptionWhereInput!]
}

input ProductRequestUpdateimagesInput {
  set: [String!]
}

input ProductRequestUpdateInput {
  brand: String
  description: String
  images: ProductRequestUpdateimagesInput
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String
  sku: String
  url: String
  user: UserUpdateOneRequiredInput
}

input ProductRequestUpdateManyMutationInput {
  brand: String
  description: String
  images: ProductRequestUpdateimagesInput
  name: String
  price: Int
  priceCurrency: String
  productID: String
  reason: String
  sku: String
  url: String
}

input ProductRequestWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  brand: String
  brand_not: String
  brand_in: [String!]
  brand_not_in: [String!]
  brand_lt: String
  brand_lte: String
  brand_gt: String
  brand_gte: String
  brand_contains: String
  brand_not_contains: String
  brand_starts_with: String
  brand_not_starts_with: String
  brand_ends_with: String
  brand_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  price: Int
  price_not: Int
  price_in: [Int!]
  price_not_in: [Int!]
  price_lt: Int
  price_lte: Int
  price_gt: Int
  price_gte: Int
  priceCurrency: String
  priceCurrency_not: String
  priceCurrency_in: [String!]
  priceCurrency_not_in: [String!]
  priceCurrency_lt: String
  priceCurrency_lte: String
  priceCurrency_gt: String
  priceCurrency_gte: String
  priceCurrency_contains: String
  priceCurrency_not_contains: String
  priceCurrency_starts_with: String
  priceCurrency_not_starts_with: String
  priceCurrency_ends_with: String
  priceCurrency_not_ends_with: String
  productID: String
  productID_not: String
  productID_in: [String!]
  productID_not_in: [String!]
  productID_lt: String
  productID_lte: String
  productID_gt: String
  productID_gte: String
  productID_contains: String
  productID_not_contains: String
  productID_starts_with: String
  productID_not_starts_with: String
  productID_ends_with: String
  productID_not_ends_with: String
  reason: String
  reason_not: String
  reason_in: [String!]
  reason_not_in: [String!]
  reason_lt: String
  reason_lte: String
  reason_gt: String
  reason_gte: String
  reason_contains: String
  reason_not_contains: String
  reason_starts_with: String
  reason_not_starts_with: String
  reason_ends_with: String
  reason_not_ends_with: String
  sku: String
  sku_not: String
  sku_in: [String!]
  sku_not_in: [String!]
  sku_lt: String
  sku_lte: String
  sku_gt: String
  sku_gte: String
  sku_contains: String
  sku_not_contains: String
  sku_starts_with: String
  sku_not_starts_with: String
  sku_ends_with: String
  sku_not_ends_with: String
  url: String
  url_not: String
  url_in: [String!]
  url_not_in: [String!]
  url_lt: String
  url_lte: String
  url_gt: String
  url_gte: String
  url_contains: String
  url_not_contains: String
  url_starts_with: String
  url_not_starts_with: String
  url_ends_with: String
  url_not_ends_with: String
  user: UserWhereInput
  AND: [ProductRequestWhereInput!]
  OR: [ProductRequestWhereInput!]
  NOT: [ProductRequestWhereInput!]
}

input ProductRequestWhereUniqueInput {
  id: ID
}

input ProductScalarWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  externalURL: String
  externalURL_not: String
  externalURL_in: [String!]
  externalURL_not_in: [String!]
  externalURL_lt: String
  externalURL_lte: String
  externalURL_gt: String
  externalURL_gte: String
  externalURL_contains: String
  externalURL_not_contains: String
  externalURL_starts_with: String
  externalURL_not_starts_with: String
  externalURL_ends_with: String
  externalURL_not_ends_with: String
  modelHeight: Int
  modelHeight_not: Int
  modelHeight_in: [Int!]
  modelHeight_not_in: [Int!]
  modelHeight_lt: Int
  modelHeight_lte: Int
  modelHeight_gt: Int
  modelHeight_gte: Int
  modelSize: Size
  modelSize_not: Size
  modelSize_in: [Size!]
  modelSize_not_in: [Size!]
  retailPrice: Int
  retailPrice_not: Int
  retailPrice_in: [Int!]
  retailPrice_not_in: [Int!]
  retailPrice_lt: Int
  retailPrice_lte: Int
  retailPrice_gt: Int
  retailPrice_gte: Int
  status: ProductStatus
  status_not: ProductStatus
  status_in: [ProductStatus!]
  status_not_in: [ProductStatus!]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ProductScalarWhereInput!]
  OR: [ProductScalarWhereInput!]
  NOT: [ProductScalarWhereInput!]
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductWhereInput
  AND: [ProductSubscriptionWhereInput!]
  OR: [ProductSubscriptionWhereInput!]
  NOT: [ProductSubscriptionWhereInput!]
}

input ProductUpdateavailableSizesInput {
  set: [Size!]
}

input ProductUpdateDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: Json
  functions: ProductFunctionUpdateManyInput
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
}

input ProductUpdateinnerMaterialsInput {
  set: [Material!]
}

input ProductUpdateInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: Json
  functions: ProductFunctionUpdateManyInput
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
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
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
}

input ProductUpdateManyInput {
  create: [ProductCreateInput!]
  update: [ProductUpdateWithWhereUniqueNestedInput!]
  upsert: [ProductUpsertWithWhereUniqueNestedInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
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
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
}

input ProductUpdateManyWithoutBrandInput {
  create: [ProductCreateWithoutBrandInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutBrandInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutBrandInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
}

input ProductUpdateManyWithoutCategoryInput {
  create: [ProductCreateWithoutCategoryInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutCategoryInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutCategoryInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
}

input ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput!
  data: ProductUpdateManyDataInput!
}

input ProductUpdateOneRequiredWithoutVariantsInput {
  create: ProductCreateWithoutVariantsInput
  update: ProductUpdateWithoutVariantsDataInput
  upsert: ProductUpsertWithoutVariantsInput
  connect: ProductWhereUniqueInput
}

input ProductUpdateouterMaterialsInput {
  set: [Material!]
}

input ProductUpdateWithoutBrandDataInput {
  slug: String
  name: String
  category: CategoryUpdateOneRequiredWithoutProductsInput
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: Json
  functions: ProductFunctionUpdateManyInput
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
}

input ProductUpdateWithoutCategoryDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: Json
  functions: ProductFunctionUpdateManyInput
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
}

input ProductUpdateWithoutVariantsDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  modelSize: Size
  retailPrice: Int
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: Json
  functions: ProductFunctionUpdateManyInput
  availableSizes: ProductUpdateavailableSizesInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
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

type ProductVariant {
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

type ProductVariantConnection {
  pageInfo: PageInfo!
  edges: [ProductVariantEdge]!
  aggregate: AggregateProductVariant!
}

input ProductVariantCreateInput {
  id: ID
  sku: String
  color: ColorCreateOneWithoutProductVariantsInput!
  size: Size!
  weight: Float
  height: Float
  productID: String!
  product: ProductCreateOneWithoutVariantsInput!
  retailPrice: Float
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
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
  product: ProductCreateOneWithoutVariantsInput!
  retailPrice: Float
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
}

input ProductVariantCreateWithoutPhysicalProductsInput {
  id: ID
  sku: String
  color: ColorCreateOneWithoutProductVariantsInput!
  size: Size!
  weight: Float
  height: Float
  productID: String!
  product: ProductCreateOneWithoutVariantsInput!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
}

input ProductVariantCreateWithoutProductInput {
  id: ID
  sku: String
  color: ColorCreateOneWithoutProductVariantsInput!
  size: Size!
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
}

type ProductVariantEdge {
  node: ProductVariant!
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  sku: String
  sku_not: String
  sku_in: [String!]
  sku_not_in: [String!]
  sku_lt: String
  sku_lte: String
  sku_gt: String
  sku_gte: String
  sku_contains: String
  sku_not_contains: String
  sku_starts_with: String
  sku_not_starts_with: String
  sku_ends_with: String
  sku_not_ends_with: String
  size: Size
  size_not: Size
  size_in: [Size!]
  size_not_in: [Size!]
  weight: Float
  weight_not: Float
  weight_in: [Float!]
  weight_not_in: [Float!]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  height: Float
  height_not: Float
  height_in: [Float!]
  height_not_in: [Float!]
  height_lt: Float
  height_lte: Float
  height_gt: Float
  height_gte: Float
  productID: String
  productID_not: String
  productID_in: [String!]
  productID_not_in: [String!]
  productID_lt: String
  productID_lte: String
  productID_gt: String
  productID_gte: String
  productID_contains: String
  productID_not_contains: String
  productID_starts_with: String
  productID_not_starts_with: String
  productID_ends_with: String
  productID_not_ends_with: String
  retailPrice: Float
  retailPrice_not: Float
  retailPrice_in: [Float!]
  retailPrice_not_in: [Float!]
  retailPrice_lt: Float
  retailPrice_lte: Float
  retailPrice_gt: Float
  retailPrice_gte: Float
  total: Int
  total_not: Int
  total_in: [Int!]
  total_not_in: [Int!]
  total_lt: Int
  total_lte: Int
  total_gt: Int
  total_gte: Int
  reservable: Int
  reservable_not: Int
  reservable_in: [Int!]
  reservable_not_in: [Int!]
  reservable_lt: Int
  reservable_lte: Int
  reservable_gt: Int
  reservable_gte: Int
  reserved: Int
  reserved_not: Int
  reserved_in: [Int!]
  reserved_not_in: [Int!]
  reserved_lt: Int
  reserved_lte: Int
  reserved_gt: Int
  reserved_gte: Int
  nonReservable: Int
  nonReservable_not: Int
  nonReservable_in: [Int!]
  nonReservable_not_in: [Int!]
  nonReservable_lt: Int
  nonReservable_lte: Int
  nonReservable_gt: Int
  nonReservable_gte: Int
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ProductVariantScalarWhereInput!]
  OR: [ProductVariantScalarWhereInput!]
  NOT: [ProductVariantScalarWhereInput!]
}

type ProductVariantSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariant
  updatedFields: [String!]
  previousValues: ProductVariantPreviousValues
}

input ProductVariantSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductVariantWhereInput
  AND: [ProductVariantSubscriptionWhereInput!]
  OR: [ProductVariantSubscriptionWhereInput!]
  NOT: [ProductVariantSubscriptionWhereInput!]
}

input ProductVariantUpdateDataInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  size: Size
  weight: Float
  height: Float
  productID: String
  product: ProductUpdateOneRequiredWithoutVariantsInput
  retailPrice: Float
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

input ProductVariantUpdateInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  size: Size
  weight: Float
  height: Float
  productID: String
  product: ProductUpdateOneRequiredWithoutVariantsInput
  retailPrice: Float
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
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
  delete: [ProductVariantWhereUniqueInput!]
  connect: [ProductVariantWhereUniqueInput!]
  set: [ProductVariantWhereUniqueInput!]
  disconnect: [ProductVariantWhereUniqueInput!]
  update: [ProductVariantUpdateWithWhereUniqueWithoutColorInput!]
  upsert: [ProductVariantUpsertWithWhereUniqueWithoutColorInput!]
  deleteMany: [ProductVariantScalarWhereInput!]
  updateMany: [ProductVariantUpdateManyWithWhereNestedInput!]
}

input ProductVariantUpdateManyWithoutProductInput {
  create: [ProductVariantCreateWithoutProductInput!]
  delete: [ProductVariantWhereUniqueInput!]
  connect: [ProductVariantWhereUniqueInput!]
  set: [ProductVariantWhereUniqueInput!]
  disconnect: [ProductVariantWhereUniqueInput!]
  update: [ProductVariantUpdateWithWhereUniqueWithoutProductInput!]
  upsert: [ProductVariantUpsertWithWhereUniqueWithoutProductInput!]
  deleteMany: [ProductVariantScalarWhereInput!]
  updateMany: [ProductVariantUpdateManyWithWhereNestedInput!]
}

input ProductVariantUpdateManyWithWhereNestedInput {
  where: ProductVariantScalarWhereInput!
  data: ProductVariantUpdateManyDataInput!
}

input ProductVariantUpdateOneRequiredInput {
  create: ProductVariantCreateInput
  update: ProductVariantUpdateDataInput
  upsert: ProductVariantUpsertNestedInput
  connect: ProductVariantWhereUniqueInput
}

input ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput {
  create: ProductVariantCreateWithoutPhysicalProductsInput
  update: ProductVariantUpdateWithoutPhysicalProductsDataInput
  upsert: ProductVariantUpsertWithoutPhysicalProductsInput
  connect: ProductVariantWhereUniqueInput
}

input ProductVariantUpdateWithoutColorDataInput {
  sku: String
  size: Size
  weight: Float
  height: Float
  productID: String
  product: ProductUpdateOneRequiredWithoutVariantsInput
  retailPrice: Float
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

input ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  size: Size
  weight: Float
  height: Float
  productID: String
  product: ProductUpdateOneRequiredWithoutVariantsInput
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

input ProductVariantUpdateWithoutProductDataInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  size: Size
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  sku: String
  sku_not: String
  sku_in: [String!]
  sku_not_in: [String!]
  sku_lt: String
  sku_lte: String
  sku_gt: String
  sku_gte: String
  sku_contains: String
  sku_not_contains: String
  sku_starts_with: String
  sku_not_starts_with: String
  sku_ends_with: String
  sku_not_ends_with: String
  color: ColorWhereInput
  size: Size
  size_not: Size
  size_in: [Size!]
  size_not_in: [Size!]
  weight: Float
  weight_not: Float
  weight_in: [Float!]
  weight_not_in: [Float!]
  weight_lt: Float
  weight_lte: Float
  weight_gt: Float
  weight_gte: Float
  height: Float
  height_not: Float
  height_in: [Float!]
  height_not_in: [Float!]
  height_lt: Float
  height_lte: Float
  height_gt: Float
  height_gte: Float
  productID: String
  productID_not: String
  productID_in: [String!]
  productID_not_in: [String!]
  productID_lt: String
  productID_lte: String
  productID_gt: String
  productID_gte: String
  productID_contains: String
  productID_not_contains: String
  productID_starts_with: String
  productID_not_starts_with: String
  productID_ends_with: String
  productID_not_ends_with: String
  product: ProductWhereInput
  retailPrice: Float
  retailPrice_not: Float
  retailPrice_in: [Float!]
  retailPrice_not_in: [Float!]
  retailPrice_lt: Float
  retailPrice_lte: Float
  retailPrice_gt: Float
  retailPrice_gte: Float
  physicalProducts_every: PhysicalProductWhereInput
  physicalProducts_some: PhysicalProductWhereInput
  physicalProducts_none: PhysicalProductWhereInput
  total: Int
  total_not: Int
  total_in: [Int!]
  total_not_in: [Int!]
  total_lt: Int
  total_lte: Int
  total_gt: Int
  total_gte: Int
  reservable: Int
  reservable_not: Int
  reservable_in: [Int!]
  reservable_not_in: [Int!]
  reservable_lt: Int
  reservable_lte: Int
  reservable_gt: Int
  reservable_gte: Int
  reserved: Int
  reserved_not: Int
  reserved_in: [Int!]
  reserved_not_in: [Int!]
  reserved_lt: Int
  reserved_lte: Int
  reserved_gt: Int
  reserved_gte: Int
  nonReservable: Int
  nonReservable_not: Int
  nonReservable_in: [Int!]
  nonReservable_not_in: [Int!]
  nonReservable_lt: Int
  nonReservable_lte: Int
  nonReservable_gt: Int
  nonReservable_gte: Int
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ProductVariantWhereInput!]
  OR: [ProductVariantWhereInput!]
  NOT: [ProductVariantWhereInput!]
}

input ProductVariantWhereUniqueInput {
  id: ID
  sku: String
}

input ProductWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  slug: String
  slug_not: String
  slug_in: [String!]
  slug_not_in: [String!]
  slug_lt: String
  slug_lte: String
  slug_gt: String
  slug_gte: String
  slug_contains: String
  slug_not_contains: String
  slug_starts_with: String
  slug_not_starts_with: String
  slug_ends_with: String
  slug_not_ends_with: String
  name: String
  name_not: String
  name_in: [String!]
  name_not_in: [String!]
  name_lt: String
  name_lte: String
  name_gt: String
  name_gte: String
  name_contains: String
  name_not_contains: String
  name_starts_with: String
  name_not_starts_with: String
  name_ends_with: String
  name_not_ends_with: String
  brand: BrandWhereInput
  category: CategoryWhereInput
  description: String
  description_not: String
  description_in: [String!]
  description_not_in: [String!]
  description_lt: String
  description_lte: String
  description_gt: String
  description_gte: String
  description_contains: String
  description_not_contains: String
  description_starts_with: String
  description_not_starts_with: String
  description_ends_with: String
  description_not_ends_with: String
  externalURL: String
  externalURL_not: String
  externalURL_in: [String!]
  externalURL_not_in: [String!]
  externalURL_lt: String
  externalURL_lte: String
  externalURL_gt: String
  externalURL_gte: String
  externalURL_contains: String
  externalURL_not_contains: String
  externalURL_starts_with: String
  externalURL_not_starts_with: String
  externalURL_ends_with: String
  externalURL_not_ends_with: String
  modelHeight: Int
  modelHeight_not: Int
  modelHeight_in: [Int!]
  modelHeight_not_in: [Int!]
  modelHeight_lt: Int
  modelHeight_lte: Int
  modelHeight_gt: Int
  modelHeight_gte: Int
  modelSize: Size
  modelSize_not: Size
  modelSize_in: [Size!]
  modelSize_not_in: [Size!]
  retailPrice: Int
  retailPrice_not: Int
  retailPrice_in: [Int!]
  retailPrice_not_in: [Int!]
  retailPrice_lt: Int
  retailPrice_lte: Int
  retailPrice_gt: Int
  retailPrice_gte: Int
  color: ColorWhereInput
  secondaryColor: ColorWhereInput
  functions_every: ProductFunctionWhereInput
  functions_some: ProductFunctionWhereInput
  functions_none: ProductFunctionWhereInput
  variants_every: ProductVariantWhereInput
  variants_some: ProductVariantWhereInput
  variants_none: ProductVariantWhereInput
  status: ProductStatus
  status_not: ProductStatus
  status_in: [ProductStatus!]
  status_not_in: [ProductStatus!]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ProductWhereInput!]
  OR: [ProductWhereInput!]
  NOT: [ProductWhereInput!]
}

input ProductWhereUniqueInput {
  id: ID
  slug: String
}

type Query {
  bagItem(where: BagItemWhereUniqueInput!): BagItem
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem]!
  bagItemsConnection(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BagItemConnection!
  billingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  billingInfoes(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BillingInfo]!
  billingInfoesConnection(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BillingInfoConnection!
  brand(where: BrandWhereUniqueInput!): Brand
  brands(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Brand]!
  brandsConnection(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BrandConnection!
  category(where: CategoryWhereUniqueInput!): Category
  categories(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Category]!
  categoriesConnection(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CategoryConnection!
  collection(where: CollectionWhereUniqueInput!): Collection
  collections(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Collection]!
  collectionsConnection(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionConnection!
  collectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  collectionGroups(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CollectionGroup]!
  collectionGroupsConnection(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionGroupConnection!
  color(where: ColorWhereUniqueInput!): Color
  colors(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Color]!
  colorsConnection(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ColorConnection!
  customer(where: CustomerWhereUniqueInput!): Customer
  customers(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Customer]!
  customersConnection(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerConnection!
  customerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  customerDetails(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CustomerDetail]!
  customerDetailsConnection(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerDetailConnection!
  homepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  homepageProductRails(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [HomepageProductRail]!
  homepageProductRailsConnection(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): HomepageProductRailConnection!
  image(where: ImageWhereUniqueInput!): Image
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image]!
  imagesConnection(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ImageConnection!
  label(where: LabelWhereUniqueInput!): Label
  labels(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Label]!
  labelsConnection(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LabelConnection!
  location(where: LocationWhereUniqueInput!): Location
  locations(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Location]!
  locationsConnection(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LocationConnection!
  order(where: OrderWhereUniqueInput!): Order
  orders(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Order]!
  ordersConnection(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): OrderConnection!
  package(where: PackageWhereUniqueInput!): Package
  packages(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Package]!
  packagesConnection(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PackageConnection!
  physicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct]!
  physicalProductsConnection(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PhysicalProductConnection!
  product(where: ProductWhereUniqueInput!): Product
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product]!
  productsConnection(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductConnection!
  productFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  productFunctions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction]!
  productFunctionsConnection(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductFunctionConnection!
  productRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  productRequests(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductRequest]!
  productRequestsConnection(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductRequestConnection!
  productVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant]!
  productVariantsConnection(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantConnection!
  reservation(where: ReservationWhereUniqueInput!): Reservation
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation]!
  reservationsConnection(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  node(id: ID!): Node
}

type Reservation {
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

type ReservationConnection {
  pageInfo: PageInfo!
  edges: [ReservationEdge]!
  aggregate: AggregateReservation!
}

input ReservationCreateInput {
  id: ID
  user: UserCreateOneInput!
  customer: CustomerCreateOneWithoutReservationsInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  location: LocationCreateOneInput
  products: PhysicalProductCreateManyInput
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
}

input ReservationCreateManyWithoutCustomerInput {
  create: [ReservationCreateWithoutCustomerInput!]
  connect: [ReservationWhereUniqueInput!]
}

input ReservationCreateWithoutCustomerInput {
  id: ID
  user: UserCreateOneInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  location: LocationCreateOneInput
  products: PhysicalProductCreateManyInput
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
}

type ReservationEdge {
  node: Reservation!
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  reservationNumber: Int
  reservationNumber_not: Int
  reservationNumber_in: [Int!]
  reservationNumber_not_in: [Int!]
  reservationNumber_lt: Int
  reservationNumber_lte: Int
  reservationNumber_gt: Int
  reservationNumber_gte: Int
  shipped: Boolean
  shipped_not: Boolean
  status: ReservationStatus
  status_not: ReservationStatus
  status_in: [ReservationStatus!]
  status_not_in: [ReservationStatus!]
  shippedAt: DateTime
  shippedAt_not: DateTime
  shippedAt_in: [DateTime!]
  shippedAt_not_in: [DateTime!]
  shippedAt_lt: DateTime
  shippedAt_lte: DateTime
  shippedAt_gt: DateTime
  shippedAt_gte: DateTime
  receivedAt: DateTime
  receivedAt_not: DateTime
  receivedAt_in: [DateTime!]
  receivedAt_not_in: [DateTime!]
  receivedAt_lt: DateTime
  receivedAt_lte: DateTime
  receivedAt_gt: DateTime
  receivedAt_gte: DateTime
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ReservationScalarWhereInput!]
  OR: [ReservationScalarWhereInput!]
  NOT: [ReservationScalarWhereInput!]
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ReservationWhereInput
  AND: [ReservationSubscriptionWhereInput!]
  OR: [ReservationSubscriptionWhereInput!]
  NOT: [ReservationSubscriptionWhereInput!]
}

input ReservationUpdateInput {
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  location: LocationUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
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
  delete: [ReservationWhereUniqueInput!]
  connect: [ReservationWhereUniqueInput!]
  set: [ReservationWhereUniqueInput!]
  disconnect: [ReservationWhereUniqueInput!]
  update: [ReservationUpdateWithWhereUniqueWithoutCustomerInput!]
  upsert: [ReservationUpsertWithWhereUniqueWithoutCustomerInput!]
  deleteMany: [ReservationScalarWhereInput!]
  updateMany: [ReservationUpdateManyWithWhereNestedInput!]
}

input ReservationUpdateManyWithWhereNestedInput {
  where: ReservationScalarWhereInput!
  data: ReservationUpdateManyDataInput!
}

input ReservationUpdateWithoutCustomerDataInput {
  user: UserUpdateOneRequiredInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  location: LocationUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
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
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  user: UserWhereInput
  customer: CustomerWhereInput
  sentPackage: PackageWhereInput
  returnedPackage: PackageWhereInput
  location: LocationWhereInput
  products_every: PhysicalProductWhereInput
  products_some: PhysicalProductWhereInput
  products_none: PhysicalProductWhereInput
  reservationNumber: Int
  reservationNumber_not: Int
  reservationNumber_in: [Int!]
  reservationNumber_not_in: [Int!]
  reservationNumber_lt: Int
  reservationNumber_lte: Int
  reservationNumber_gt: Int
  reservationNumber_gte: Int
  shipped: Boolean
  shipped_not: Boolean
  status: ReservationStatus
  status_not: ReservationStatus
  status_in: [ReservationStatus!]
  status_not_in: [ReservationStatus!]
  shippedAt: DateTime
  shippedAt_not: DateTime
  shippedAt_in: [DateTime!]
  shippedAt_not_in: [DateTime!]
  shippedAt_lt: DateTime
  shippedAt_lte: DateTime
  shippedAt_gt: DateTime
  shippedAt_gte: DateTime
  receivedAt: DateTime
  receivedAt_not: DateTime
  receivedAt_in: [DateTime!]
  receivedAt_not_in: [DateTime!]
  receivedAt_lt: DateTime
  receivedAt_lte: DateTime
  receivedAt_gt: DateTime
  receivedAt_gte: DateTime
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [ReservationWhereInput!]
  OR: [ReservationWhereInput!]
  NOT: [ReservationWhereInput!]
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
  bagItem(where: BagItemSubscriptionWhereInput): BagItemSubscriptionPayload
  billingInfo(where: BillingInfoSubscriptionWhereInput): BillingInfoSubscriptionPayload
  brand(where: BrandSubscriptionWhereInput): BrandSubscriptionPayload
  category(where: CategorySubscriptionWhereInput): CategorySubscriptionPayload
  collection(where: CollectionSubscriptionWhereInput): CollectionSubscriptionPayload
  collectionGroup(where: CollectionGroupSubscriptionWhereInput): CollectionGroupSubscriptionPayload
  color(where: ColorSubscriptionWhereInput): ColorSubscriptionPayload
  customer(where: CustomerSubscriptionWhereInput): CustomerSubscriptionPayload
  customerDetail(where: CustomerDetailSubscriptionWhereInput): CustomerDetailSubscriptionPayload
  homepageProductRail(where: HomepageProductRailSubscriptionWhereInput): HomepageProductRailSubscriptionPayload
  image(where: ImageSubscriptionWhereInput): ImageSubscriptionPayload
  label(where: LabelSubscriptionWhereInput): LabelSubscriptionPayload
  location(where: LocationSubscriptionWhereInput): LocationSubscriptionPayload
  order(where: OrderSubscriptionWhereInput): OrderSubscriptionPayload
  package(where: PackageSubscriptionWhereInput): PackageSubscriptionPayload
  physicalProduct(where: PhysicalProductSubscriptionWhereInput): PhysicalProductSubscriptionPayload
  product(where: ProductSubscriptionWhereInput): ProductSubscriptionPayload
  productFunction(where: ProductFunctionSubscriptionWhereInput): ProductFunctionSubscriptionPayload
  productRequest(where: ProductRequestSubscriptionWhereInput): ProductRequestSubscriptionPayload
  productVariant(where: ProductVariantSubscriptionWhereInput): ProductVariantSubscriptionPayload
  reservation(where: ReservationSubscriptionWhereInput): ReservationSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type User {
  id: ID!
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserConnection {
  pageInfo: PageInfo!
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

type UserEdge {
  node: User!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: UserWhereInput
  AND: [UserSubscriptionWhereInput!]
  OR: [UserSubscriptionWhereInput!]
  NOT: [UserSubscriptionWhereInput!]
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
  update: UserUpdateDataInput
  upsert: UserUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: UserWhereUniqueInput
}

input UserUpdateOneRequiredInput {
  create: UserCreateInput
  update: UserUpdateDataInput
  upsert: UserUpsertNestedInput
  connect: UserWhereUniqueInput
}

input UserUpsertNestedInput {
  update: UserUpdateDataInput!
  create: UserCreateInput!
}

input UserWhereInput {
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  auth0Id: String
  auth0Id_not: String
  auth0Id_in: [String!]
  auth0Id_not_in: [String!]
  auth0Id_lt: String
  auth0Id_lte: String
  auth0Id_gt: String
  auth0Id_gte: String
  auth0Id_contains: String
  auth0Id_not_contains: String
  auth0Id_starts_with: String
  auth0Id_not_starts_with: String
  auth0Id_ends_with: String
  auth0Id_not_ends_with: String
  email: String
  email_not: String
  email_in: [String!]
  email_not_in: [String!]
  email_lt: String
  email_lte: String
  email_gt: String
  email_gte: String
  email_contains: String
  email_not_contains: String
  email_starts_with: String
  email_not_starts_with: String
  email_ends_with: String
  email_not_ends_with: String
  firstName: String
  firstName_not: String
  firstName_in: [String!]
  firstName_not_in: [String!]
  firstName_lt: String
  firstName_lte: String
  firstName_gt: String
  firstName_gte: String
  firstName_contains: String
  firstName_not_contains: String
  firstName_starts_with: String
  firstName_not_starts_with: String
  firstName_ends_with: String
  firstName_not_ends_with: String
  lastName: String
  lastName_not: String
  lastName_in: [String!]
  lastName_not_in: [String!]
  lastName_lt: String
  lastName_lte: String
  lastName_gt: String
  lastName_gte: String
  lastName_contains: String
  lastName_not_contains: String
  lastName_starts_with: String
  lastName_not_starts_with: String
  lastName_ends_with: String
  lastName_not_ends_with: String
  role: UserRole
  role_not: UserRole
  role_in: [UserRole!]
  role_not_in: [UserRole!]
  createdAt: DateTime
  createdAt_not: DateTime
  createdAt_in: [DateTime!]
  createdAt_not_in: [DateTime!]
  createdAt_lt: DateTime
  createdAt_lte: DateTime
  createdAt_gt: DateTime
  createdAt_gte: DateTime
  updatedAt: DateTime
  updatedAt_not: DateTime
  updatedAt_in: [DateTime!]
  updatedAt_not_in: [DateTime!]
  updatedAt_lt: DateTime
  updatedAt_lte: DateTime
  updatedAt_gt: DateTime
  updatedAt_gte: DateTime
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
  auth0Id: String
  email: String
}
`

export const Prisma = makePrismaBindingClass<BindingConstructor<Prisma>>({typeDefs})

/**
 * Types
*/

export type BagItemOrderByInput =   'id_ASC' |
  'id_DESC' |
  'position_ASC' |
  'position_DESC' |
  'saved_ASC' |
  'saved_DESC' |
  'status_ASC' |
  'status_DESC'

export type BagItemStatus =   'Added' |
  'Reserved' |
  'Received'

export type BillingInfoOrderByInput =   'id_ASC' |
  'id_DESC' |
  'brand_ASC' |
  'brand_DESC' |
  'name_ASC' |
  'name_DESC' |
  'last_digits_ASC' |
  'last_digits_DESC' |
  'expiration_month_ASC' |
  'expiration_month_DESC' |
  'expiration_year_ASC' |
  'expiration_year_DESC' |
  'street1_ASC' |
  'street1_DESC' |
  'street2_ASC' |
  'street2_DESC' |
  'city_ASC' |
  'city_DESC' |
  'state_ASC' |
  'state_DESC' |
  'country_ASC' |
  'country_DESC' |
  'postal_code_ASC' |
  'postal_code_DESC'

export type BrandOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'brandCode_ASC' |
  'brandCode_DESC' |
  'description_ASC' |
  'description_DESC' |
  'isPrimaryBrand_ASC' |
  'isPrimaryBrand_DESC' |
  'logo_ASC' |
  'logo_DESC' |
  'name_ASC' |
  'name_DESC' |
  'basedIn_ASC' |
  'basedIn_DESC' |
  'since_ASC' |
  'since_DESC' |
  'tier_ASC' |
  'tier_DESC' |
  'websiteUrl_ASC' |
  'websiteUrl_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type BrandTier =   'Tier0' |
  'Tier1' |
  'Tier2' |
  'Niche' |
  'Upcoming' |
  'Retro' |
  'Boutique' |
  'Local' |
  'Discovery'

export type CategoryOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC' |
  'image_ASC' |
  'image_DESC' |
  'description_ASC' |
  'description_DESC' |
  'visible_ASC' |
  'visible_DESC'

export type CollectionGroupOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'title_ASC' |
  'title_DESC' |
  'collectionCount_ASC' |
  'collectionCount_DESC'

export type CollectionOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'images_ASC' |
  'images_DESC' |
  'title_ASC' |
  'title_DESC' |
  'subTitle_ASC' |
  'subTitle_DESC' |
  'descriptionTop_ASC' |
  'descriptionTop_DESC' |
  'descriptionBottom_ASC' |
  'descriptionBottom_DESC'

export type ColorOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC' |
  'colorCode_ASC' |
  'colorCode_DESC' |
  'hexCode_ASC' |
  'hexCode_DESC'

export type CustomerDetailOrderByInput =   'id_ASC' |
  'id_DESC' |
  'phoneNumber_ASC' |
  'phoneNumber_DESC' |
  'birthday_ASC' |
  'birthday_DESC' |
  'height_ASC' |
  'height_DESC' |
  'weight_ASC' |
  'weight_DESC' |
  'bodyType_ASC' |
  'bodyType_DESC' |
  'averageTopSize_ASC' |
  'averageTopSize_DESC' |
  'averageWaistSize_ASC' |
  'averageWaistSize_DESC' |
  'averagePantLength_ASC' |
  'averagePantLength_DESC' |
  'preferredPronouns_ASC' |
  'preferredPronouns_DESC' |
  'profession_ASC' |
  'profession_DESC' |
  'partyFrequency_ASC' |
  'partyFrequency_DESC' |
  'travelFrequency_ASC' |
  'travelFrequency_DESC' |
  'shoppingFrequency_ASC' |
  'shoppingFrequency_DESC' |
  'averageSpend_ASC' |
  'averageSpend_DESC' |
  'style_ASC' |
  'style_DESC' |
  'commuteStyle_ASC' |
  'commuteStyle_DESC' |
  'phoneOS_ASC' |
  'phoneOS_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type CustomerOrderByInput =   'id_ASC' |
  'id_DESC' |
  'status_ASC' |
  'status_DESC' |
  'plan_ASC' |
  'plan_DESC'

export type CustomerStatus =   'Invited' |
  'Created' |
  'Waitlisted' |
  'Authorized' |
  'Active' |
  'Suspended' |
  'Paused' |
  'Deactivated'

export type HomepageProductRailOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC'

export type ImageOrderByInput =   'id_ASC' |
  'id_DESC' |
  'caption_ASC' |
  'caption_DESC' |
  'originalHeight_ASC' |
  'originalHeight_DESC' |
  'originalUrl_ASC' |
  'originalUrl_DESC' |
  'originalWidth_ASC' |
  'originalWidth_DESC' |
  'resizedUrl_ASC' |
  'resizedUrl_DESC' |
  'title_ASC' |
  'title_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type InventoryStatus =   'NonReservable' |
  'Reservable' |
  'Reserved'

export type LabelOrderByInput =   'id_ASC' |
  'id_DESC' |
  'name_ASC' |
  'name_DESC' |
  'image_ASC' |
  'image_DESC' |
  'trackingNumber_ASC' |
  'trackingNumber_DESC' |
  'trackingURL_ASC' |
  'trackingURL_DESC'

export type LocationOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC' |
  'company_ASC' |
  'company_DESC' |
  'description_ASC' |
  'description_DESC' |
  'address1_ASC' |
  'address1_DESC' |
  'address2_ASC' |
  'address2_DESC' |
  'city_ASC' |
  'city_DESC' |
  'state_ASC' |
  'state_DESC' |
  'zipCode_ASC' |
  'zipCode_DESC' |
  'locationType_ASC' |
  'locationType_DESC' |
  'lat_ASC' |
  'lat_DESC' |
  'lng_ASC' |
  'lng_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type LocationType =   'Office' |
  'Warehouse' |
  'Cleaner' |
  'Customer'

export type Material =   'Acetate' |
  'Acrylic' |
  'Alpaca' |
  'CalfLeather' |
  'CamelHair' |
  'Camel' |
  'Cashmere' |
  'Cotton' |
  'CowLeather' |
  'Cupro' |
  'DuckFeathers' |
  'Elastane' |
  'Esterlane' |
  'Feather' |
  'FeatherDown' |
  'GooseDown' |
  'LambLeather' |
  'LambSkin' |
  'Leather' |
  'Lyocell' |
  'MerinoWool' |
  'Modacrylic' |
  'Mohair' |
  'Nylon' |
  'OrganicCotton' |
  'Polyamide' |
  'Polyester' |
  'Polyethylene' |
  'Polyurethane' |
  'PolyurethanicResin' |
  'PVC' |
  'Rayon' |
  'RecycledPolyester' |
  'RecycledWool' |
  'Silk' |
  'Suede' |
  'SheepLeather' |
  'Spandex' |
  'Taffeta' |
  'Tartan' |
  'VirginWool' |
  'Viscose' |
  'Velcro' |
  'WaxCoating' |
  'WhiteDuckDown' |
  'WhiteGooseDown' |
  'Wool' |
  'Mesh' |
  'Denim'

export type MutationType =   'CREATED' |
  'UPDATED' |
  'DELETED'

export type OrderOrderByInput =   'id_ASC' |
  'id_DESC'

export type PackageOrderByInput =   'id_ASC' |
  'id_DESC' |
  'weight_ASC' |
  'weight_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PhysicalProductOrderByInput =   'id_ASC' |
  'id_DESC' |
  'seasonsUID_ASC' |
  'seasonsUID_DESC' |
  'inventoryStatus_ASC' |
  'inventoryStatus_DESC' |
  'productStatus_ASC' |
  'productStatus_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PhysicalProductStatus =   'New' |
  'Used' |
  'Damaged' |
  'Clean' |
  'Lost'

export type Plan =   'AllAccess' |
  'Essential'

export type ProductFunctionOrderByInput =   'id_ASC' |
  'id_DESC' |
  'name_ASC' |
  'name_DESC'

export type ProductOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC' |
  'description_ASC' |
  'description_DESC' |
  'externalURL_ASC' |
  'externalURL_DESC' |
  'images_ASC' |
  'images_DESC' |
  'modelHeight_ASC' |
  'modelHeight_DESC' |
  'modelSize_ASC' |
  'modelSize_DESC' |
  'retailPrice_ASC' |
  'retailPrice_DESC' |
  'tags_ASC' |
  'tags_DESC' |
  'status_ASC' |
  'status_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ProductRequestOrderByInput =   'id_ASC' |
  'id_DESC' |
  'brand_ASC' |
  'brand_DESC' |
  'description_ASC' |
  'description_DESC' |
  'name_ASC' |
  'name_DESC' |
  'price_ASC' |
  'price_DESC' |
  'priceCurrency_ASC' |
  'priceCurrency_DESC' |
  'productID_ASC' |
  'productID_DESC' |
  'reason_ASC' |
  'reason_DESC' |
  'sku_ASC' |
  'sku_DESC' |
  'url_ASC' |
  'url_DESC'

export type ProductStatus =   'Available' |
  'NotAvailable'

export type ProductVariantOrderByInput =   'id_ASC' |
  'id_DESC' |
  'sku_ASC' |
  'sku_DESC' |
  'size_ASC' |
  'size_DESC' |
  'weight_ASC' |
  'weight_DESC' |
  'height_ASC' |
  'height_DESC' |
  'productID_ASC' |
  'productID_DESC' |
  'retailPrice_ASC' |
  'retailPrice_DESC' |
  'total_ASC' |
  'total_DESC' |
  'reservable_ASC' |
  'reservable_DESC' |
  'reserved_ASC' |
  'reserved_DESC' |
  'nonReservable_ASC' |
  'nonReservable_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ReservationOrderByInput =   'id_ASC' |
  'id_DESC' |
  'reservationNumber_ASC' |
  'reservationNumber_DESC' |
  'shipped_ASC' |
  'shipped_DESC' |
  'status_ASC' |
  'status_DESC' |
  'shippedAt_ASC' |
  'shippedAt_DESC' |
  'receivedAt_ASC' |
  'receivedAt_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ReservationStatus =   'New' |
  'InQueue' |
  'OnHold' |
  'Packed' |
  'Shipped' |
  'InTransit' |
  'Received' |
  'Cancelled' |
  'Completed'

export type Size =   'XS' |
  'S' |
  'M' |
  'L' |
  'XL' |
  'XXL'

export type UserOrderByInput =   'id_ASC' |
  'id_DESC' |
  'auth0Id_ASC' |
  'auth0Id_DESC' |
  'email_ASC' |
  'email_DESC' |
  'firstName_ASC' |
  'firstName_DESC' |
  'lastName_ASC' |
  'lastName_DESC' |
  'role_ASC' |
  'role_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type UserRole =   'Admin' |
  'Customer' |
  'Partner'

export interface BagItemCreateInput {
  id?: ID_Input | null
  customer: CustomerCreateOneInput
  productVariant: ProductVariantCreateOneInput
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

export interface BagItemSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BagItemWhereInput | null
  AND?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
  OR?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
  NOT?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
}

export interface BagItemUpdateInput {
  customer?: CustomerUpdateOneRequiredInput | null
  productVariant?: ProductVariantUpdateOneRequiredInput | null
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
}

export interface BagItemUpdateManyMutationInput {
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
}

export interface BagItemWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  customer?: CustomerWhereInput | null
  productVariant?: ProductVariantWhereInput | null
  position?: Int | null
  position_not?: Int | null
  position_in?: Int[] | Int | null
  position_not_in?: Int[] | Int | null
  position_lt?: Int | null
  position_lte?: Int | null
  position_gt?: Int | null
  position_gte?: Int | null
  saved?: Boolean | null
  saved_not?: Boolean | null
  status?: BagItemStatus | null
  status_not?: BagItemStatus | null
  status_in?: BagItemStatus[] | BagItemStatus | null
  status_not_in?: BagItemStatus[] | BagItemStatus | null
  AND?: BagItemWhereInput[] | BagItemWhereInput | null
  OR?: BagItemWhereInput[] | BagItemWhereInput | null
  NOT?: BagItemWhereInput[] | BagItemWhereInput | null
}

export interface BagItemWhereUniqueInput {
  id?: ID_Input | null
}

export interface BillingInfoCreateInput {
  id?: ID_Input | null
  brand: String
  name?: String | null
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoCreateOneInput {
  create?: BillingInfoCreateInput | null
  connect?: BillingInfoWhereUniqueInput | null
}

export interface BillingInfoSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BillingInfoWhereInput | null
  AND?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
  OR?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
  NOT?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
}

export interface BillingInfoUpdateDataInput {
  brand?: String | null
  name?: String | null
  last_digits?: String | null
  expiration_month?: Int | null
  expiration_year?: Int | null
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoUpdateInput {
  brand?: String | null
  name?: String | null
  last_digits?: String | null
  expiration_month?: Int | null
  expiration_year?: Int | null
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoUpdateManyMutationInput {
  brand?: String | null
  name?: String | null
  last_digits?: String | null
  expiration_month?: Int | null
  expiration_year?: Int | null
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoUpdateOneInput {
  create?: BillingInfoCreateInput | null
  update?: BillingInfoUpdateDataInput | null
  upsert?: BillingInfoUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: BillingInfoWhereUniqueInput | null
}

export interface BillingInfoUpsertNestedInput {
  update: BillingInfoUpdateDataInput
  create: BillingInfoCreateInput
}

export interface BillingInfoWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  brand?: String | null
  brand_not?: String | null
  brand_in?: String[] | String | null
  brand_not_in?: String[] | String | null
  brand_lt?: String | null
  brand_lte?: String | null
  brand_gt?: String | null
  brand_gte?: String | null
  brand_contains?: String | null
  brand_not_contains?: String | null
  brand_starts_with?: String | null
  brand_not_starts_with?: String | null
  brand_ends_with?: String | null
  brand_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  last_digits?: String | null
  last_digits_not?: String | null
  last_digits_in?: String[] | String | null
  last_digits_not_in?: String[] | String | null
  last_digits_lt?: String | null
  last_digits_lte?: String | null
  last_digits_gt?: String | null
  last_digits_gte?: String | null
  last_digits_contains?: String | null
  last_digits_not_contains?: String | null
  last_digits_starts_with?: String | null
  last_digits_not_starts_with?: String | null
  last_digits_ends_with?: String | null
  last_digits_not_ends_with?: String | null
  expiration_month?: Int | null
  expiration_month_not?: Int | null
  expiration_month_in?: Int[] | Int | null
  expiration_month_not_in?: Int[] | Int | null
  expiration_month_lt?: Int | null
  expiration_month_lte?: Int | null
  expiration_month_gt?: Int | null
  expiration_month_gte?: Int | null
  expiration_year?: Int | null
  expiration_year_not?: Int | null
  expiration_year_in?: Int[] | Int | null
  expiration_year_not_in?: Int[] | Int | null
  expiration_year_lt?: Int | null
  expiration_year_lte?: Int | null
  expiration_year_gt?: Int | null
  expiration_year_gte?: Int | null
  street1?: String | null
  street1_not?: String | null
  street1_in?: String[] | String | null
  street1_not_in?: String[] | String | null
  street1_lt?: String | null
  street1_lte?: String | null
  street1_gt?: String | null
  street1_gte?: String | null
  street1_contains?: String | null
  street1_not_contains?: String | null
  street1_starts_with?: String | null
  street1_not_starts_with?: String | null
  street1_ends_with?: String | null
  street1_not_ends_with?: String | null
  street2?: String | null
  street2_not?: String | null
  street2_in?: String[] | String | null
  street2_not_in?: String[] | String | null
  street2_lt?: String | null
  street2_lte?: String | null
  street2_gt?: String | null
  street2_gte?: String | null
  street2_contains?: String | null
  street2_not_contains?: String | null
  street2_starts_with?: String | null
  street2_not_starts_with?: String | null
  street2_ends_with?: String | null
  street2_not_ends_with?: String | null
  city?: String | null
  city_not?: String | null
  city_in?: String[] | String | null
  city_not_in?: String[] | String | null
  city_lt?: String | null
  city_lte?: String | null
  city_gt?: String | null
  city_gte?: String | null
  city_contains?: String | null
  city_not_contains?: String | null
  city_starts_with?: String | null
  city_not_starts_with?: String | null
  city_ends_with?: String | null
  city_not_ends_with?: String | null
  state?: String | null
  state_not?: String | null
  state_in?: String[] | String | null
  state_not_in?: String[] | String | null
  state_lt?: String | null
  state_lte?: String | null
  state_gt?: String | null
  state_gte?: String | null
  state_contains?: String | null
  state_not_contains?: String | null
  state_starts_with?: String | null
  state_not_starts_with?: String | null
  state_ends_with?: String | null
  state_not_ends_with?: String | null
  country?: String | null
  country_not?: String | null
  country_in?: String[] | String | null
  country_not_in?: String[] | String | null
  country_lt?: String | null
  country_lte?: String | null
  country_gt?: String | null
  country_gte?: String | null
  country_contains?: String | null
  country_not_contains?: String | null
  country_starts_with?: String | null
  country_not_starts_with?: String | null
  country_ends_with?: String | null
  country_not_ends_with?: String | null
  postal_code?: String | null
  postal_code_not?: String | null
  postal_code_in?: String[] | String | null
  postal_code_not_in?: String[] | String | null
  postal_code_lt?: String | null
  postal_code_lte?: String | null
  postal_code_gt?: String | null
  postal_code_gte?: String | null
  postal_code_contains?: String | null
  postal_code_not_contains?: String | null
  postal_code_starts_with?: String | null
  postal_code_not_starts_with?: String | null
  postal_code_ends_with?: String | null
  postal_code_not_ends_with?: String | null
  AND?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
  OR?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
  NOT?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
}

export interface BillingInfoWhereUniqueInput {
  id?: ID_Input | null
}

export interface BrandCreateInput {
  id?: ID_Input | null
  slug: String
  brandCode: String
  description?: String | null
  isPrimaryBrand?: Boolean | null
  logo?: Json | null
  name: String
  basedIn?: String | null
  products?: ProductCreateManyWithoutBrandInput | null
  since?: DateTime | null
  tier: BrandTier
  websiteUrl?: String | null
}

export interface BrandCreateOneWithoutProductsInput {
  create?: BrandCreateWithoutProductsInput | null
  connect?: BrandWhereUniqueInput | null
}

export interface BrandCreateWithoutProductsInput {
  id?: ID_Input | null
  slug: String
  brandCode: String
  description?: String | null
  isPrimaryBrand?: Boolean | null
  logo?: Json | null
  name: String
  basedIn?: String | null
  since?: DateTime | null
  tier: BrandTier
  websiteUrl?: String | null
}

export interface BrandSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BrandWhereInput | null
  AND?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
  OR?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
  NOT?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
}

export interface BrandUpdateInput {
  slug?: String | null
  brandCode?: String | null
  description?: String | null
  isPrimaryBrand?: Boolean | null
  logo?: Json | null
  name?: String | null
  basedIn?: String | null
  products?: ProductUpdateManyWithoutBrandInput | null
  since?: DateTime | null
  tier?: BrandTier | null
  websiteUrl?: String | null
}

export interface BrandUpdateManyMutationInput {
  slug?: String | null
  brandCode?: String | null
  description?: String | null
  isPrimaryBrand?: Boolean | null
  logo?: Json | null
  name?: String | null
  basedIn?: String | null
  since?: DateTime | null
  tier?: BrandTier | null
  websiteUrl?: String | null
}

export interface BrandUpdateOneRequiredWithoutProductsInput {
  create?: BrandCreateWithoutProductsInput | null
  update?: BrandUpdateWithoutProductsDataInput | null
  upsert?: BrandUpsertWithoutProductsInput | null
  connect?: BrandWhereUniqueInput | null
}

export interface BrandUpdateWithoutProductsDataInput {
  slug?: String | null
  brandCode?: String | null
  description?: String | null
  isPrimaryBrand?: Boolean | null
  logo?: Json | null
  name?: String | null
  basedIn?: String | null
  since?: DateTime | null
  tier?: BrandTier | null
  websiteUrl?: String | null
}

export interface BrandUpsertWithoutProductsInput {
  update: BrandUpdateWithoutProductsDataInput
  create: BrandCreateWithoutProductsInput
}

export interface BrandWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  brandCode?: String | null
  brandCode_not?: String | null
  brandCode_in?: String[] | String | null
  brandCode_not_in?: String[] | String | null
  brandCode_lt?: String | null
  brandCode_lte?: String | null
  brandCode_gt?: String | null
  brandCode_gte?: String | null
  brandCode_contains?: String | null
  brandCode_not_contains?: String | null
  brandCode_starts_with?: String | null
  brandCode_not_starts_with?: String | null
  brandCode_ends_with?: String | null
  brandCode_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  isPrimaryBrand?: Boolean | null
  isPrimaryBrand_not?: Boolean | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  basedIn?: String | null
  basedIn_not?: String | null
  basedIn_in?: String[] | String | null
  basedIn_not_in?: String[] | String | null
  basedIn_lt?: String | null
  basedIn_lte?: String | null
  basedIn_gt?: String | null
  basedIn_gte?: String | null
  basedIn_contains?: String | null
  basedIn_not_contains?: String | null
  basedIn_starts_with?: String | null
  basedIn_not_starts_with?: String | null
  basedIn_ends_with?: String | null
  basedIn_not_ends_with?: String | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
  since?: DateTime | null
  since_not?: DateTime | null
  since_in?: DateTime[] | DateTime | null
  since_not_in?: DateTime[] | DateTime | null
  since_lt?: DateTime | null
  since_lte?: DateTime | null
  since_gt?: DateTime | null
  since_gte?: DateTime | null
  tier?: BrandTier | null
  tier_not?: BrandTier | null
  tier_in?: BrandTier[] | BrandTier | null
  tier_not_in?: BrandTier[] | BrandTier | null
  websiteUrl?: String | null
  websiteUrl_not?: String | null
  websiteUrl_in?: String[] | String | null
  websiteUrl_not_in?: String[] | String | null
  websiteUrl_lt?: String | null
  websiteUrl_lte?: String | null
  websiteUrl_gt?: String | null
  websiteUrl_gte?: String | null
  websiteUrl_contains?: String | null
  websiteUrl_not_contains?: String | null
  websiteUrl_starts_with?: String | null
  websiteUrl_not_starts_with?: String | null
  websiteUrl_ends_with?: String | null
  websiteUrl_not_ends_with?: String | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: BrandWhereInput[] | BrandWhereInput | null
  OR?: BrandWhereInput[] | BrandWhereInput | null
  NOT?: BrandWhereInput[] | BrandWhereInput | null
}

export interface BrandWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
  brandCode?: String | null
}

export interface CategoryCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductCreateManyWithoutCategoryInput | null
  children?: CategoryCreateManyWithoutChildrenInput | null
}

export interface CategoryCreateManyWithoutChildrenInput {
  create?: CategoryCreateWithoutChildrenInput[] | CategoryCreateWithoutChildrenInput | null
  connect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
}

export interface CategoryCreateOneWithoutProductsInput {
  create?: CategoryCreateWithoutProductsInput | null
  connect?: CategoryWhereUniqueInput | null
}

export interface CategoryCreateWithoutChildrenInput {
  id?: ID_Input | null
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductCreateManyWithoutCategoryInput | null
}

export interface CategoryCreateWithoutProductsInput {
  id?: ID_Input | null
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  children?: CategoryCreateManyWithoutChildrenInput | null
}

export interface CategoryScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  visible?: Boolean | null
  visible_not?: Boolean | null
  AND?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  OR?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  NOT?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
}

export interface CategorySubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CategoryWhereInput | null
  AND?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
  OR?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
  NOT?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
}

export interface CategoryUpdateInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductUpdateManyWithoutCategoryInput | null
  children?: CategoryUpdateManyWithoutChildrenInput | null
}

export interface CategoryUpdateManyDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
}

export interface CategoryUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
}

export interface CategoryUpdateManyWithoutChildrenInput {
  create?: CategoryCreateWithoutChildrenInput[] | CategoryCreateWithoutChildrenInput | null
  delete?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  connect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  set?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  disconnect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  update?: CategoryUpdateWithWhereUniqueWithoutChildrenInput[] | CategoryUpdateWithWhereUniqueWithoutChildrenInput | null
  upsert?: CategoryUpsertWithWhereUniqueWithoutChildrenInput[] | CategoryUpsertWithWhereUniqueWithoutChildrenInput | null
  deleteMany?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  updateMany?: CategoryUpdateManyWithWhereNestedInput[] | CategoryUpdateManyWithWhereNestedInput | null
}

export interface CategoryUpdateManyWithWhereNestedInput {
  where: CategoryScalarWhereInput
  data: CategoryUpdateManyDataInput
}

export interface CategoryUpdateOneRequiredWithoutProductsInput {
  create?: CategoryCreateWithoutProductsInput | null
  update?: CategoryUpdateWithoutProductsDataInput | null
  upsert?: CategoryUpsertWithoutProductsInput | null
  connect?: CategoryWhereUniqueInput | null
}

export interface CategoryUpdateWithoutChildrenDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductUpdateManyWithoutCategoryInput | null
}

export interface CategoryUpdateWithoutProductsDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  children?: CategoryUpdateManyWithoutChildrenInput | null
}

export interface CategoryUpdateWithWhereUniqueWithoutChildrenInput {
  where: CategoryWhereUniqueInput
  data: CategoryUpdateWithoutChildrenDataInput
}

export interface CategoryUpsertWithoutProductsInput {
  update: CategoryUpdateWithoutProductsDataInput
  create: CategoryCreateWithoutProductsInput
}

export interface CategoryUpsertWithWhereUniqueWithoutChildrenInput {
  where: CategoryWhereUniqueInput
  update: CategoryUpdateWithoutChildrenDataInput
  create: CategoryCreateWithoutChildrenInput
}

export interface CategoryWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  visible?: Boolean | null
  visible_not?: Boolean | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
  children_every?: CategoryWhereInput | null
  children_some?: CategoryWhereInput | null
  children_none?: CategoryWhereInput | null
  AND?: CategoryWhereInput[] | CategoryWhereInput | null
  OR?: CategoryWhereInput[] | CategoryWhereInput | null
  NOT?: CategoryWhereInput[] | CategoryWhereInput | null
}

export interface CategoryWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
  name?: String | null
}

export interface CollectionCreateInput {
  id?: ID_Input | null
  slug: String
  images: Json
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
  products?: ProductCreateManyInput | null
}

export interface CollectionCreateManyInput {
  create?: CollectionCreateInput[] | CollectionCreateInput | null
  connect?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
}

export interface CollectionGroupCreateInput {
  id?: ID_Input | null
  slug: String
  title?: String | null
  collectionCount?: Int | null
  collections?: CollectionCreateManyInput | null
}

export interface CollectionGroupSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CollectionGroupWhereInput | null
  AND?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
  OR?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
  NOT?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
}

export interface CollectionGroupUpdateInput {
  slug?: String | null
  title?: String | null
  collectionCount?: Int | null
  collections?: CollectionUpdateManyInput | null
}

export interface CollectionGroupUpdateManyMutationInput {
  slug?: String | null
  title?: String | null
  collectionCount?: Int | null
}

export interface CollectionGroupWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  title?: String | null
  title_not?: String | null
  title_in?: String[] | String | null
  title_not_in?: String[] | String | null
  title_lt?: String | null
  title_lte?: String | null
  title_gt?: String | null
  title_gte?: String | null
  title_contains?: String | null
  title_not_contains?: String | null
  title_starts_with?: String | null
  title_not_starts_with?: String | null
  title_ends_with?: String | null
  title_not_ends_with?: String | null
  collectionCount?: Int | null
  collectionCount_not?: Int | null
  collectionCount_in?: Int[] | Int | null
  collectionCount_not_in?: Int[] | Int | null
  collectionCount_lt?: Int | null
  collectionCount_lte?: Int | null
  collectionCount_gt?: Int | null
  collectionCount_gte?: Int | null
  collections_every?: CollectionWhereInput | null
  collections_some?: CollectionWhereInput | null
  collections_none?: CollectionWhereInput | null
  AND?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
  OR?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
  NOT?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
}

export interface CollectionGroupWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface CollectionScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  title?: String | null
  title_not?: String | null
  title_in?: String[] | String | null
  title_not_in?: String[] | String | null
  title_lt?: String | null
  title_lte?: String | null
  title_gt?: String | null
  title_gte?: String | null
  title_contains?: String | null
  title_not_contains?: String | null
  title_starts_with?: String | null
  title_not_starts_with?: String | null
  title_ends_with?: String | null
  title_not_ends_with?: String | null
  subTitle?: String | null
  subTitle_not?: String | null
  subTitle_in?: String[] | String | null
  subTitle_not_in?: String[] | String | null
  subTitle_lt?: String | null
  subTitle_lte?: String | null
  subTitle_gt?: String | null
  subTitle_gte?: String | null
  subTitle_contains?: String | null
  subTitle_not_contains?: String | null
  subTitle_starts_with?: String | null
  subTitle_not_starts_with?: String | null
  subTitle_ends_with?: String | null
  subTitle_not_ends_with?: String | null
  descriptionTop?: String | null
  descriptionTop_not?: String | null
  descriptionTop_in?: String[] | String | null
  descriptionTop_not_in?: String[] | String | null
  descriptionTop_lt?: String | null
  descriptionTop_lte?: String | null
  descriptionTop_gt?: String | null
  descriptionTop_gte?: String | null
  descriptionTop_contains?: String | null
  descriptionTop_not_contains?: String | null
  descriptionTop_starts_with?: String | null
  descriptionTop_not_starts_with?: String | null
  descriptionTop_ends_with?: String | null
  descriptionTop_not_ends_with?: String | null
  descriptionBottom?: String | null
  descriptionBottom_not?: String | null
  descriptionBottom_in?: String[] | String | null
  descriptionBottom_not_in?: String[] | String | null
  descriptionBottom_lt?: String | null
  descriptionBottom_lte?: String | null
  descriptionBottom_gt?: String | null
  descriptionBottom_gte?: String | null
  descriptionBottom_contains?: String | null
  descriptionBottom_not_contains?: String | null
  descriptionBottom_starts_with?: String | null
  descriptionBottom_not_starts_with?: String | null
  descriptionBottom_ends_with?: String | null
  descriptionBottom_not_ends_with?: String | null
  AND?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  OR?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  NOT?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
}

export interface CollectionSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CollectionWhereInput | null
  AND?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
  OR?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
  NOT?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
}

export interface CollectionUpdateDataInput {
  slug?: String | null
  images?: Json | null
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
  products?: ProductUpdateManyInput | null
}

export interface CollectionUpdateInput {
  slug?: String | null
  images?: Json | null
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
  products?: ProductUpdateManyInput | null
}

export interface CollectionUpdateManyDataInput {
  slug?: String | null
  images?: Json | null
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
}

export interface CollectionUpdateManyInput {
  create?: CollectionCreateInput[] | CollectionCreateInput | null
  update?: CollectionUpdateWithWhereUniqueNestedInput[] | CollectionUpdateWithWhereUniqueNestedInput | null
  upsert?: CollectionUpsertWithWhereUniqueNestedInput[] | CollectionUpsertWithWhereUniqueNestedInput | null
  delete?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  connect?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  set?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  disconnect?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  deleteMany?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  updateMany?: CollectionUpdateManyWithWhereNestedInput[] | CollectionUpdateManyWithWhereNestedInput | null
}

export interface CollectionUpdateManyMutationInput {
  slug?: String | null
  images?: Json | null
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
}

export interface CollectionUpdateManyWithWhereNestedInput {
  where: CollectionScalarWhereInput
  data: CollectionUpdateManyDataInput
}

export interface CollectionUpdateWithWhereUniqueNestedInput {
  where: CollectionWhereUniqueInput
  data: CollectionUpdateDataInput
}

export interface CollectionUpsertWithWhereUniqueNestedInput {
  where: CollectionWhereUniqueInput
  update: CollectionUpdateDataInput
  create: CollectionCreateInput
}

export interface CollectionWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  title?: String | null
  title_not?: String | null
  title_in?: String[] | String | null
  title_not_in?: String[] | String | null
  title_lt?: String | null
  title_lte?: String | null
  title_gt?: String | null
  title_gte?: String | null
  title_contains?: String | null
  title_not_contains?: String | null
  title_starts_with?: String | null
  title_not_starts_with?: String | null
  title_ends_with?: String | null
  title_not_ends_with?: String | null
  subTitle?: String | null
  subTitle_not?: String | null
  subTitle_in?: String[] | String | null
  subTitle_not_in?: String[] | String | null
  subTitle_lt?: String | null
  subTitle_lte?: String | null
  subTitle_gt?: String | null
  subTitle_gte?: String | null
  subTitle_contains?: String | null
  subTitle_not_contains?: String | null
  subTitle_starts_with?: String | null
  subTitle_not_starts_with?: String | null
  subTitle_ends_with?: String | null
  subTitle_not_ends_with?: String | null
  descriptionTop?: String | null
  descriptionTop_not?: String | null
  descriptionTop_in?: String[] | String | null
  descriptionTop_not_in?: String[] | String | null
  descriptionTop_lt?: String | null
  descriptionTop_lte?: String | null
  descriptionTop_gt?: String | null
  descriptionTop_gte?: String | null
  descriptionTop_contains?: String | null
  descriptionTop_not_contains?: String | null
  descriptionTop_starts_with?: String | null
  descriptionTop_not_starts_with?: String | null
  descriptionTop_ends_with?: String | null
  descriptionTop_not_ends_with?: String | null
  descriptionBottom?: String | null
  descriptionBottom_not?: String | null
  descriptionBottom_in?: String[] | String | null
  descriptionBottom_not_in?: String[] | String | null
  descriptionBottom_lt?: String | null
  descriptionBottom_lte?: String | null
  descriptionBottom_gt?: String | null
  descriptionBottom_gte?: String | null
  descriptionBottom_contains?: String | null
  descriptionBottom_not_contains?: String | null
  descriptionBottom_starts_with?: String | null
  descriptionBottom_not_starts_with?: String | null
  descriptionBottom_ends_with?: String | null
  descriptionBottom_not_ends_with?: String | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
  AND?: CollectionWhereInput[] | CollectionWhereInput | null
  OR?: CollectionWhereInput[] | CollectionWhereInput | null
  NOT?: CollectionWhereInput[] | CollectionWhereInput | null
}

export interface CollectionWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface ColorCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  colorCode: String
  hexCode: String
  productVariants?: ProductVariantCreateManyWithoutColorInput | null
}

export interface ColorCreateOneInput {
  create?: ColorCreateInput | null
  connect?: ColorWhereUniqueInput | null
}

export interface ColorCreateOneWithoutProductVariantsInput {
  create?: ColorCreateWithoutProductVariantsInput | null
  connect?: ColorWhereUniqueInput | null
}

export interface ColorCreateWithoutProductVariantsInput {
  id?: ID_Input | null
  slug: String
  name: String
  colorCode: String
  hexCode: String
}

export interface ColorSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ColorWhereInput | null
  AND?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
  OR?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
  NOT?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
}

export interface ColorUpdateDataInput {
  slug?: String | null
  name?: String | null
  colorCode?: String | null
  hexCode?: String | null
  productVariants?: ProductVariantUpdateManyWithoutColorInput | null
}

export interface ColorUpdateInput {
  slug?: String | null
  name?: String | null
  colorCode?: String | null
  hexCode?: String | null
  productVariants?: ProductVariantUpdateManyWithoutColorInput | null
}

export interface ColorUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  colorCode?: String | null
  hexCode?: String | null
}

export interface ColorUpdateOneInput {
  create?: ColorCreateInput | null
  update?: ColorUpdateDataInput | null
  upsert?: ColorUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: ColorWhereUniqueInput | null
}

export interface ColorUpdateOneRequiredInput {
  create?: ColorCreateInput | null
  update?: ColorUpdateDataInput | null
  upsert?: ColorUpsertNestedInput | null
  connect?: ColorWhereUniqueInput | null
}

export interface ColorUpdateOneRequiredWithoutProductVariantsInput {
  create?: ColorCreateWithoutProductVariantsInput | null
  update?: ColorUpdateWithoutProductVariantsDataInput | null
  upsert?: ColorUpsertWithoutProductVariantsInput | null
  connect?: ColorWhereUniqueInput | null
}

export interface ColorUpdateWithoutProductVariantsDataInput {
  slug?: String | null
  name?: String | null
  colorCode?: String | null
  hexCode?: String | null
}

export interface ColorUpsertNestedInput {
  update: ColorUpdateDataInput
  create: ColorCreateInput
}

export interface ColorUpsertWithoutProductVariantsInput {
  update: ColorUpdateWithoutProductVariantsDataInput
  create: ColorCreateWithoutProductVariantsInput
}

export interface ColorWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  colorCode?: String | null
  colorCode_not?: String | null
  colorCode_in?: String[] | String | null
  colorCode_not_in?: String[] | String | null
  colorCode_lt?: String | null
  colorCode_lte?: String | null
  colorCode_gt?: String | null
  colorCode_gte?: String | null
  colorCode_contains?: String | null
  colorCode_not_contains?: String | null
  colorCode_starts_with?: String | null
  colorCode_not_starts_with?: String | null
  colorCode_ends_with?: String | null
  colorCode_not_ends_with?: String | null
  hexCode?: String | null
  hexCode_not?: String | null
  hexCode_in?: String[] | String | null
  hexCode_not_in?: String[] | String | null
  hexCode_lt?: String | null
  hexCode_lte?: String | null
  hexCode_gt?: String | null
  hexCode_gte?: String | null
  hexCode_contains?: String | null
  hexCode_not_contains?: String | null
  hexCode_starts_with?: String | null
  hexCode_not_starts_with?: String | null
  hexCode_ends_with?: String | null
  hexCode_not_ends_with?: String | null
  productVariants_every?: ProductVariantWhereInput | null
  productVariants_some?: ProductVariantWhereInput | null
  productVariants_none?: ProductVariantWhereInput | null
  AND?: ColorWhereInput[] | ColorWhereInput | null
  OR?: ColorWhereInput[] | ColorWhereInput | null
  NOT?: ColorWhereInput[] | ColorWhereInput | null
}

export interface ColorWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
  colorCode?: String | null
}

export interface CustomerCreateInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  status?: CustomerStatus | null
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  plan?: Plan | null
  reservations?: ReservationCreateManyWithoutCustomerInput | null
}

export interface CustomerCreateOneInput {
  create?: CustomerCreateInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateOneWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateWithoutReservationsInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  status?: CustomerStatus | null
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  plan?: Plan | null
}

export interface CustomerDetailCreateInput {
  id?: ID_Input | null
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  shippingAddress?: LocationCreateOneInput | null
  phoneOS?: String | null
}

export interface CustomerDetailCreateOneInput {
  create?: CustomerDetailCreateInput | null
  connect?: CustomerDetailWhereUniqueInput | null
}

export interface CustomerDetailSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CustomerDetailWhereInput | null
  AND?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
  OR?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
  NOT?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
}

export interface CustomerDetailUpdateDataInput {
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  shippingAddress?: LocationUpdateOneInput | null
  phoneOS?: String | null
}

export interface CustomerDetailUpdateInput {
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  shippingAddress?: LocationUpdateOneInput | null
  phoneOS?: String | null
}

export interface CustomerDetailUpdateManyMutationInput {
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  phoneOS?: String | null
}

export interface CustomerDetailUpdateOneInput {
  create?: CustomerDetailCreateInput | null
  update?: CustomerDetailUpdateDataInput | null
  upsert?: CustomerDetailUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: CustomerDetailWhereUniqueInput | null
}

export interface CustomerDetailUpsertNestedInput {
  update: CustomerDetailUpdateDataInput
  create: CustomerDetailCreateInput
}

export interface CustomerDetailWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  phoneNumber?: String | null
  phoneNumber_not?: String | null
  phoneNumber_in?: String[] | String | null
  phoneNumber_not_in?: String[] | String | null
  phoneNumber_lt?: String | null
  phoneNumber_lte?: String | null
  phoneNumber_gt?: String | null
  phoneNumber_gte?: String | null
  phoneNumber_contains?: String | null
  phoneNumber_not_contains?: String | null
  phoneNumber_starts_with?: String | null
  phoneNumber_not_starts_with?: String | null
  phoneNumber_ends_with?: String | null
  phoneNumber_not_ends_with?: String | null
  birthday?: DateTime | null
  birthday_not?: DateTime | null
  birthday_in?: DateTime[] | DateTime | null
  birthday_not_in?: DateTime[] | DateTime | null
  birthday_lt?: DateTime | null
  birthday_lte?: DateTime | null
  birthday_gt?: DateTime | null
  birthday_gte?: DateTime | null
  height?: Int | null
  height_not?: Int | null
  height_in?: Int[] | Int | null
  height_not_in?: Int[] | Int | null
  height_lt?: Int | null
  height_lte?: Int | null
  height_gt?: Int | null
  height_gte?: Int | null
  weight?: String | null
  weight_not?: String | null
  weight_in?: String[] | String | null
  weight_not_in?: String[] | String | null
  weight_lt?: String | null
  weight_lte?: String | null
  weight_gt?: String | null
  weight_gte?: String | null
  weight_contains?: String | null
  weight_not_contains?: String | null
  weight_starts_with?: String | null
  weight_not_starts_with?: String | null
  weight_ends_with?: String | null
  weight_not_ends_with?: String | null
  bodyType?: String | null
  bodyType_not?: String | null
  bodyType_in?: String[] | String | null
  bodyType_not_in?: String[] | String | null
  bodyType_lt?: String | null
  bodyType_lte?: String | null
  bodyType_gt?: String | null
  bodyType_gte?: String | null
  bodyType_contains?: String | null
  bodyType_not_contains?: String | null
  bodyType_starts_with?: String | null
  bodyType_not_starts_with?: String | null
  bodyType_ends_with?: String | null
  bodyType_not_ends_with?: String | null
  averageTopSize?: String | null
  averageTopSize_not?: String | null
  averageTopSize_in?: String[] | String | null
  averageTopSize_not_in?: String[] | String | null
  averageTopSize_lt?: String | null
  averageTopSize_lte?: String | null
  averageTopSize_gt?: String | null
  averageTopSize_gte?: String | null
  averageTopSize_contains?: String | null
  averageTopSize_not_contains?: String | null
  averageTopSize_starts_with?: String | null
  averageTopSize_not_starts_with?: String | null
  averageTopSize_ends_with?: String | null
  averageTopSize_not_ends_with?: String | null
  averageWaistSize?: String | null
  averageWaistSize_not?: String | null
  averageWaistSize_in?: String[] | String | null
  averageWaistSize_not_in?: String[] | String | null
  averageWaistSize_lt?: String | null
  averageWaistSize_lte?: String | null
  averageWaistSize_gt?: String | null
  averageWaistSize_gte?: String | null
  averageWaistSize_contains?: String | null
  averageWaistSize_not_contains?: String | null
  averageWaistSize_starts_with?: String | null
  averageWaistSize_not_starts_with?: String | null
  averageWaistSize_ends_with?: String | null
  averageWaistSize_not_ends_with?: String | null
  averagePantLength?: String | null
  averagePantLength_not?: String | null
  averagePantLength_in?: String[] | String | null
  averagePantLength_not_in?: String[] | String | null
  averagePantLength_lt?: String | null
  averagePantLength_lte?: String | null
  averagePantLength_gt?: String | null
  averagePantLength_gte?: String | null
  averagePantLength_contains?: String | null
  averagePantLength_not_contains?: String | null
  averagePantLength_starts_with?: String | null
  averagePantLength_not_starts_with?: String | null
  averagePantLength_ends_with?: String | null
  averagePantLength_not_ends_with?: String | null
  preferredPronouns?: String | null
  preferredPronouns_not?: String | null
  preferredPronouns_in?: String[] | String | null
  preferredPronouns_not_in?: String[] | String | null
  preferredPronouns_lt?: String | null
  preferredPronouns_lte?: String | null
  preferredPronouns_gt?: String | null
  preferredPronouns_gte?: String | null
  preferredPronouns_contains?: String | null
  preferredPronouns_not_contains?: String | null
  preferredPronouns_starts_with?: String | null
  preferredPronouns_not_starts_with?: String | null
  preferredPronouns_ends_with?: String | null
  preferredPronouns_not_ends_with?: String | null
  profession?: String | null
  profession_not?: String | null
  profession_in?: String[] | String | null
  profession_not_in?: String[] | String | null
  profession_lt?: String | null
  profession_lte?: String | null
  profession_gt?: String | null
  profession_gte?: String | null
  profession_contains?: String | null
  profession_not_contains?: String | null
  profession_starts_with?: String | null
  profession_not_starts_with?: String | null
  profession_ends_with?: String | null
  profession_not_ends_with?: String | null
  partyFrequency?: String | null
  partyFrequency_not?: String | null
  partyFrequency_in?: String[] | String | null
  partyFrequency_not_in?: String[] | String | null
  partyFrequency_lt?: String | null
  partyFrequency_lte?: String | null
  partyFrequency_gt?: String | null
  partyFrequency_gte?: String | null
  partyFrequency_contains?: String | null
  partyFrequency_not_contains?: String | null
  partyFrequency_starts_with?: String | null
  partyFrequency_not_starts_with?: String | null
  partyFrequency_ends_with?: String | null
  partyFrequency_not_ends_with?: String | null
  travelFrequency?: String | null
  travelFrequency_not?: String | null
  travelFrequency_in?: String[] | String | null
  travelFrequency_not_in?: String[] | String | null
  travelFrequency_lt?: String | null
  travelFrequency_lte?: String | null
  travelFrequency_gt?: String | null
  travelFrequency_gte?: String | null
  travelFrequency_contains?: String | null
  travelFrequency_not_contains?: String | null
  travelFrequency_starts_with?: String | null
  travelFrequency_not_starts_with?: String | null
  travelFrequency_ends_with?: String | null
  travelFrequency_not_ends_with?: String | null
  shoppingFrequency?: String | null
  shoppingFrequency_not?: String | null
  shoppingFrequency_in?: String[] | String | null
  shoppingFrequency_not_in?: String[] | String | null
  shoppingFrequency_lt?: String | null
  shoppingFrequency_lte?: String | null
  shoppingFrequency_gt?: String | null
  shoppingFrequency_gte?: String | null
  shoppingFrequency_contains?: String | null
  shoppingFrequency_not_contains?: String | null
  shoppingFrequency_starts_with?: String | null
  shoppingFrequency_not_starts_with?: String | null
  shoppingFrequency_ends_with?: String | null
  shoppingFrequency_not_ends_with?: String | null
  averageSpend?: String | null
  averageSpend_not?: String | null
  averageSpend_in?: String[] | String | null
  averageSpend_not_in?: String[] | String | null
  averageSpend_lt?: String | null
  averageSpend_lte?: String | null
  averageSpend_gt?: String | null
  averageSpend_gte?: String | null
  averageSpend_contains?: String | null
  averageSpend_not_contains?: String | null
  averageSpend_starts_with?: String | null
  averageSpend_not_starts_with?: String | null
  averageSpend_ends_with?: String | null
  averageSpend_not_ends_with?: String | null
  style?: String | null
  style_not?: String | null
  style_in?: String[] | String | null
  style_not_in?: String[] | String | null
  style_lt?: String | null
  style_lte?: String | null
  style_gt?: String | null
  style_gte?: String | null
  style_contains?: String | null
  style_not_contains?: String | null
  style_starts_with?: String | null
  style_not_starts_with?: String | null
  style_ends_with?: String | null
  style_not_ends_with?: String | null
  commuteStyle?: String | null
  commuteStyle_not?: String | null
  commuteStyle_in?: String[] | String | null
  commuteStyle_not_in?: String[] | String | null
  commuteStyle_lt?: String | null
  commuteStyle_lte?: String | null
  commuteStyle_gt?: String | null
  commuteStyle_gte?: String | null
  commuteStyle_contains?: String | null
  commuteStyle_not_contains?: String | null
  commuteStyle_starts_with?: String | null
  commuteStyle_not_starts_with?: String | null
  commuteStyle_ends_with?: String | null
  commuteStyle_not_ends_with?: String | null
  shippingAddress?: LocationWhereInput | null
  phoneOS?: String | null
  phoneOS_not?: String | null
  phoneOS_in?: String[] | String | null
  phoneOS_not_in?: String[] | String | null
  phoneOS_lt?: String | null
  phoneOS_lte?: String | null
  phoneOS_gt?: String | null
  phoneOS_gte?: String | null
  phoneOS_contains?: String | null
  phoneOS_not_contains?: String | null
  phoneOS_starts_with?: String | null
  phoneOS_not_starts_with?: String | null
  phoneOS_ends_with?: String | null
  phoneOS_not_ends_with?: String | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  OR?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  NOT?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
}

export interface CustomerDetailWhereUniqueInput {
  id?: ID_Input | null
}

export interface CustomerSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CustomerWhereInput | null
  AND?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
  OR?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
  NOT?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
}

export interface CustomerUpdateDataInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateManyMutationInput {
  status?: CustomerStatus | null
  plan?: Plan | null
}

export interface CustomerUpdateOneRequiredInput {
  create?: CustomerCreateInput | null
  update?: CustomerUpdateDataInput | null
  upsert?: CustomerUpsertNestedInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerUpdateOneRequiredWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  update?: CustomerUpdateWithoutReservationsDataInput | null
  upsert?: CustomerUpsertWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerUpdateWithoutReservationsDataInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
}

export interface CustomerUpsertNestedInput {
  update: CustomerUpdateDataInput
  create: CustomerCreateInput
}

export interface CustomerUpsertWithoutReservationsInput {
  update: CustomerUpdateWithoutReservationsDataInput
  create: CustomerCreateWithoutReservationsInput
}

export interface CustomerWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  user?: UserWhereInput | null
  status?: CustomerStatus | null
  status_not?: CustomerStatus | null
  status_in?: CustomerStatus[] | CustomerStatus | null
  status_not_in?: CustomerStatus[] | CustomerStatus | null
  detail?: CustomerDetailWhereInput | null
  billingInfo?: BillingInfoWhereInput | null
  plan?: Plan | null
  plan_not?: Plan | null
  plan_in?: Plan[] | Plan | null
  plan_not_in?: Plan[] | Plan | null
  reservations_every?: ReservationWhereInput | null
  reservations_some?: ReservationWhereInput | null
  reservations_none?: ReservationWhereInput | null
  AND?: CustomerWhereInput[] | CustomerWhereInput | null
  OR?: CustomerWhereInput[] | CustomerWhereInput | null
  NOT?: CustomerWhereInput[] | CustomerWhereInput | null
}

export interface CustomerWhereUniqueInput {
  id?: ID_Input | null
}

export interface HomepageProductRailCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  products?: ProductCreateManyInput | null
}

export interface HomepageProductRailSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: HomepageProductRailWhereInput | null
  AND?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
  OR?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
  NOT?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
}

export interface HomepageProductRailUpdateInput {
  slug?: String | null
  name?: String | null
  products?: ProductUpdateManyInput | null
}

export interface HomepageProductRailUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
}

export interface HomepageProductRailWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
  AND?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
  OR?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
  NOT?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
}

export interface HomepageProductRailWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface ImageCreateInput {
  id?: ID_Input | null
  caption?: String | null
  originalHeight?: Int | null
  originalUrl: String
  originalWidth?: Int | null
  resizedUrl: String
  title?: String | null
}

export interface ImageSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ImageWhereInput | null
  AND?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
  OR?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
  NOT?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
}

export interface ImageUpdateInput {
  caption?: String | null
  originalHeight?: Int | null
  originalUrl?: String | null
  originalWidth?: Int | null
  resizedUrl?: String | null
  title?: String | null
}

export interface ImageUpdateManyMutationInput {
  caption?: String | null
  originalHeight?: Int | null
  originalUrl?: String | null
  originalWidth?: Int | null
  resizedUrl?: String | null
  title?: String | null
}

export interface ImageWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  caption?: String | null
  caption_not?: String | null
  caption_in?: String[] | String | null
  caption_not_in?: String[] | String | null
  caption_lt?: String | null
  caption_lte?: String | null
  caption_gt?: String | null
  caption_gte?: String | null
  caption_contains?: String | null
  caption_not_contains?: String | null
  caption_starts_with?: String | null
  caption_not_starts_with?: String | null
  caption_ends_with?: String | null
  caption_not_ends_with?: String | null
  originalHeight?: Int | null
  originalHeight_not?: Int | null
  originalHeight_in?: Int[] | Int | null
  originalHeight_not_in?: Int[] | Int | null
  originalHeight_lt?: Int | null
  originalHeight_lte?: Int | null
  originalHeight_gt?: Int | null
  originalHeight_gte?: Int | null
  originalUrl?: String | null
  originalUrl_not?: String | null
  originalUrl_in?: String[] | String | null
  originalUrl_not_in?: String[] | String | null
  originalUrl_lt?: String | null
  originalUrl_lte?: String | null
  originalUrl_gt?: String | null
  originalUrl_gte?: String | null
  originalUrl_contains?: String | null
  originalUrl_not_contains?: String | null
  originalUrl_starts_with?: String | null
  originalUrl_not_starts_with?: String | null
  originalUrl_ends_with?: String | null
  originalUrl_not_ends_with?: String | null
  originalWidth?: Int | null
  originalWidth_not?: Int | null
  originalWidth_in?: Int[] | Int | null
  originalWidth_not_in?: Int[] | Int | null
  originalWidth_lt?: Int | null
  originalWidth_lte?: Int | null
  originalWidth_gt?: Int | null
  originalWidth_gte?: Int | null
  resizedUrl?: String | null
  resizedUrl_not?: String | null
  resizedUrl_in?: String[] | String | null
  resizedUrl_not_in?: String[] | String | null
  resizedUrl_lt?: String | null
  resizedUrl_lte?: String | null
  resizedUrl_gt?: String | null
  resizedUrl_gte?: String | null
  resizedUrl_contains?: String | null
  resizedUrl_not_contains?: String | null
  resizedUrl_starts_with?: String | null
  resizedUrl_not_starts_with?: String | null
  resizedUrl_ends_with?: String | null
  resizedUrl_not_ends_with?: String | null
  title?: String | null
  title_not?: String | null
  title_in?: String[] | String | null
  title_not_in?: String[] | String | null
  title_lt?: String | null
  title_lte?: String | null
  title_gt?: String | null
  title_gte?: String | null
  title_contains?: String | null
  title_not_contains?: String | null
  title_starts_with?: String | null
  title_not_starts_with?: String | null
  title_ends_with?: String | null
  title_not_ends_with?: String | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ImageWhereInput[] | ImageWhereInput | null
  OR?: ImageWhereInput[] | ImageWhereInput | null
  NOT?: ImageWhereInput[] | ImageWhereInput | null
}

export interface ImageWhereUniqueInput {
  id?: ID_Input | null
}

export interface LabelCreateInput {
  id?: ID_Input | null
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelCreateOneInput {
  create?: LabelCreateInput | null
  connect?: LabelWhereUniqueInput | null
}

export interface LabelSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: LabelWhereInput | null
  AND?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
  OR?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
  NOT?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
}

export interface LabelUpdateDataInput {
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelUpdateInput {
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelUpdateManyMutationInput {
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelUpdateOneRequiredInput {
  create?: LabelCreateInput | null
  update?: LabelUpdateDataInput | null
  upsert?: LabelUpsertNestedInput | null
  connect?: LabelWhereUniqueInput | null
}

export interface LabelUpsertNestedInput {
  update: LabelUpdateDataInput
  create: LabelCreateInput
}

export interface LabelWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  image?: String | null
  image_not?: String | null
  image_in?: String[] | String | null
  image_not_in?: String[] | String | null
  image_lt?: String | null
  image_lte?: String | null
  image_gt?: String | null
  image_gte?: String | null
  image_contains?: String | null
  image_not_contains?: String | null
  image_starts_with?: String | null
  image_not_starts_with?: String | null
  image_ends_with?: String | null
  image_not_ends_with?: String | null
  trackingNumber?: String | null
  trackingNumber_not?: String | null
  trackingNumber_in?: String[] | String | null
  trackingNumber_not_in?: String[] | String | null
  trackingNumber_lt?: String | null
  trackingNumber_lte?: String | null
  trackingNumber_gt?: String | null
  trackingNumber_gte?: String | null
  trackingNumber_contains?: String | null
  trackingNumber_not_contains?: String | null
  trackingNumber_starts_with?: String | null
  trackingNumber_not_starts_with?: String | null
  trackingNumber_ends_with?: String | null
  trackingNumber_not_ends_with?: String | null
  trackingURL?: String | null
  trackingURL_not?: String | null
  trackingURL_in?: String[] | String | null
  trackingURL_not_in?: String[] | String | null
  trackingURL_lt?: String | null
  trackingURL_lte?: String | null
  trackingURL_gt?: String | null
  trackingURL_gte?: String | null
  trackingURL_contains?: String | null
  trackingURL_not_contains?: String | null
  trackingURL_starts_with?: String | null
  trackingURL_not_starts_with?: String | null
  trackingURL_ends_with?: String | null
  trackingURL_not_ends_with?: String | null
  AND?: LabelWhereInput[] | LabelWhereInput | null
  OR?: LabelWhereInput[] | LabelWhereInput | null
  NOT?: LabelWhereInput[] | LabelWhereInput | null
}

export interface LabelWhereUniqueInput {
  id?: ID_Input | null
}

export interface LocationCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  company?: String | null
  description?: String | null
  address1: String
  address2?: String | null
  city: String
  state: String
  zipCode: String
  locationType?: LocationType | null
  user?: UserCreateOneInput | null
  lat?: Float | null
  lng?: Float | null
  physicalProducts?: PhysicalProductCreateManyWithoutLocationInput | null
}

export interface LocationCreateOneInput {
  create?: LocationCreateInput | null
  connect?: LocationWhereUniqueInput | null
}

export interface LocationCreateOneWithoutPhysicalProductsInput {
  create?: LocationCreateWithoutPhysicalProductsInput | null
  connect?: LocationWhereUniqueInput | null
}

export interface LocationCreateWithoutPhysicalProductsInput {
  id?: ID_Input | null
  slug: String
  name: String
  company?: String | null
  description?: String | null
  address1: String
  address2?: String | null
  city: String
  state: String
  zipCode: String
  locationType?: LocationType | null
  user?: UserCreateOneInput | null
  lat?: Float | null
  lng?: Float | null
}

export interface LocationSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: LocationWhereInput | null
  AND?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
  OR?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
  NOT?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
}

export interface LocationUpdateDataInput {
  slug?: String | null
  name?: String | null
  company?: String | null
  description?: String | null
  address1?: String | null
  address2?: String | null
  city?: String | null
  state?: String | null
  zipCode?: String | null
  locationType?: LocationType | null
  user?: UserUpdateOneInput | null
  lat?: Float | null
  lng?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutLocationInput | null
}

export interface LocationUpdateInput {
  slug?: String | null
  name?: String | null
  company?: String | null
  description?: String | null
  address1?: String | null
  address2?: String | null
  city?: String | null
  state?: String | null
  zipCode?: String | null
  locationType?: LocationType | null
  user?: UserUpdateOneInput | null
  lat?: Float | null
  lng?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutLocationInput | null
}

export interface LocationUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  company?: String | null
  description?: String | null
  address1?: String | null
  address2?: String | null
  city?: String | null
  state?: String | null
  zipCode?: String | null
  locationType?: LocationType | null
  lat?: Float | null
  lng?: Float | null
}

export interface LocationUpdateOneInput {
  create?: LocationCreateInput | null
  update?: LocationUpdateDataInput | null
  upsert?: LocationUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: LocationWhereUniqueInput | null
}

export interface LocationUpdateOneRequiredInput {
  create?: LocationCreateInput | null
  update?: LocationUpdateDataInput | null
  upsert?: LocationUpsertNestedInput | null
  connect?: LocationWhereUniqueInput | null
}

export interface LocationUpdateOneRequiredWithoutPhysicalProductsInput {
  create?: LocationCreateWithoutPhysicalProductsInput | null
  update?: LocationUpdateWithoutPhysicalProductsDataInput | null
  upsert?: LocationUpsertWithoutPhysicalProductsInput | null
  connect?: LocationWhereUniqueInput | null
}

export interface LocationUpdateWithoutPhysicalProductsDataInput {
  slug?: String | null
  name?: String | null
  company?: String | null
  description?: String | null
  address1?: String | null
  address2?: String | null
  city?: String | null
  state?: String | null
  zipCode?: String | null
  locationType?: LocationType | null
  user?: UserUpdateOneInput | null
  lat?: Float | null
  lng?: Float | null
}

export interface LocationUpsertNestedInput {
  update: LocationUpdateDataInput
  create: LocationCreateInput
}

export interface LocationUpsertWithoutPhysicalProductsInput {
  update: LocationUpdateWithoutPhysicalProductsDataInput
  create: LocationCreateWithoutPhysicalProductsInput
}

export interface LocationWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  company?: String | null
  company_not?: String | null
  company_in?: String[] | String | null
  company_not_in?: String[] | String | null
  company_lt?: String | null
  company_lte?: String | null
  company_gt?: String | null
  company_gte?: String | null
  company_contains?: String | null
  company_not_contains?: String | null
  company_starts_with?: String | null
  company_not_starts_with?: String | null
  company_ends_with?: String | null
  company_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  address1?: String | null
  address1_not?: String | null
  address1_in?: String[] | String | null
  address1_not_in?: String[] | String | null
  address1_lt?: String | null
  address1_lte?: String | null
  address1_gt?: String | null
  address1_gte?: String | null
  address1_contains?: String | null
  address1_not_contains?: String | null
  address1_starts_with?: String | null
  address1_not_starts_with?: String | null
  address1_ends_with?: String | null
  address1_not_ends_with?: String | null
  address2?: String | null
  address2_not?: String | null
  address2_in?: String[] | String | null
  address2_not_in?: String[] | String | null
  address2_lt?: String | null
  address2_lte?: String | null
  address2_gt?: String | null
  address2_gte?: String | null
  address2_contains?: String | null
  address2_not_contains?: String | null
  address2_starts_with?: String | null
  address2_not_starts_with?: String | null
  address2_ends_with?: String | null
  address2_not_ends_with?: String | null
  city?: String | null
  city_not?: String | null
  city_in?: String[] | String | null
  city_not_in?: String[] | String | null
  city_lt?: String | null
  city_lte?: String | null
  city_gt?: String | null
  city_gte?: String | null
  city_contains?: String | null
  city_not_contains?: String | null
  city_starts_with?: String | null
  city_not_starts_with?: String | null
  city_ends_with?: String | null
  city_not_ends_with?: String | null
  state?: String | null
  state_not?: String | null
  state_in?: String[] | String | null
  state_not_in?: String[] | String | null
  state_lt?: String | null
  state_lte?: String | null
  state_gt?: String | null
  state_gte?: String | null
  state_contains?: String | null
  state_not_contains?: String | null
  state_starts_with?: String | null
  state_not_starts_with?: String | null
  state_ends_with?: String | null
  state_not_ends_with?: String | null
  zipCode?: String | null
  zipCode_not?: String | null
  zipCode_in?: String[] | String | null
  zipCode_not_in?: String[] | String | null
  zipCode_lt?: String | null
  zipCode_lte?: String | null
  zipCode_gt?: String | null
  zipCode_gte?: String | null
  zipCode_contains?: String | null
  zipCode_not_contains?: String | null
  zipCode_starts_with?: String | null
  zipCode_not_starts_with?: String | null
  zipCode_ends_with?: String | null
  zipCode_not_ends_with?: String | null
  locationType?: LocationType | null
  locationType_not?: LocationType | null
  locationType_in?: LocationType[] | LocationType | null
  locationType_not_in?: LocationType[] | LocationType | null
  user?: UserWhereInput | null
  lat?: Float | null
  lat_not?: Float | null
  lat_in?: Float[] | Float | null
  lat_not_in?: Float[] | Float | null
  lat_lt?: Float | null
  lat_lte?: Float | null
  lat_gt?: Float | null
  lat_gte?: Float | null
  lng?: Float | null
  lng_not?: Float | null
  lng_in?: Float[] | Float | null
  lng_not_in?: Float[] | Float | null
  lng_lt?: Float | null
  lng_lte?: Float | null
  lng_gt?: Float | null
  lng_gte?: Float | null
  physicalProducts_every?: PhysicalProductWhereInput | null
  physicalProducts_some?: PhysicalProductWhereInput | null
  physicalProducts_none?: PhysicalProductWhereInput | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: LocationWhereInput[] | LocationWhereInput | null
  OR?: LocationWhereInput[] | LocationWhereInput | null
  NOT?: LocationWhereInput[] | LocationWhereInput | null
}

export interface LocationWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface OrderCreateInput {
  id?: ID_Input | null
}

export interface OrderSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: OrderWhereInput | null
  AND?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
  OR?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
  NOT?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
}

export interface OrderWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  AND?: OrderWhereInput[] | OrderWhereInput | null
  OR?: OrderWhereInput[] | OrderWhereInput | null
  NOT?: OrderWhereInput[] | OrderWhereInput | null
}

export interface OrderWhereUniqueInput {
  id?: ID_Input | null
}

export interface PackageCreateInput {
  id?: ID_Input | null
  items?: PhysicalProductCreateManyInput | null
  shippingLabel: LabelCreateOneInput
  fromAddress: LocationCreateOneInput
  toAddress: LocationCreateOneInput
  weight?: Float | null
}

export interface PackageCreateOneInput {
  create?: PackageCreateInput | null
  connect?: PackageWhereUniqueInput | null
}

export interface PackageSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PackageWhereInput | null
  AND?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
  OR?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
  NOT?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
}

export interface PackageUpdateDataInput {
  items?: PhysicalProductUpdateManyInput | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
  weight?: Float | null
}

export interface PackageUpdateInput {
  items?: PhysicalProductUpdateManyInput | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
  weight?: Float | null
}

export interface PackageUpdateManyMutationInput {
  weight?: Float | null
}

export interface PackageUpdateOneInput {
  create?: PackageCreateInput | null
  update?: PackageUpdateDataInput | null
  upsert?: PackageUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: PackageWhereUniqueInput | null
}

export interface PackageUpsertNestedInput {
  update: PackageUpdateDataInput
  create: PackageCreateInput
}

export interface PackageWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  items_every?: PhysicalProductWhereInput | null
  items_some?: PhysicalProductWhereInput | null
  items_none?: PhysicalProductWhereInput | null
  shippingLabel?: LabelWhereInput | null
  fromAddress?: LocationWhereInput | null
  toAddress?: LocationWhereInput | null
  weight?: Float | null
  weight_not?: Float | null
  weight_in?: Float[] | Float | null
  weight_not_in?: Float[] | Float | null
  weight_lt?: Float | null
  weight_lte?: Float | null
  weight_gt?: Float | null
  weight_gte?: Float | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: PackageWhereInput[] | PackageWhereInput | null
  OR?: PackageWhereInput[] | PackageWhereInput | null
  NOT?: PackageWhereInput[] | PackageWhereInput | null
}

export interface PackageWhereUniqueInput {
  id?: ID_Input | null
}

export interface PhysicalProductCreateInput {
  id?: ID_Input | null
  seasonsUID: String
  location: LocationCreateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

export interface PhysicalProductCreateManyInput {
  create?: PhysicalProductCreateInput[] | PhysicalProductCreateInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateManyWithoutLocationInput {
  create?: PhysicalProductCreateWithoutLocationInput[] | PhysicalProductCreateWithoutLocationInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateManyWithoutProductVariantInput {
  create?: PhysicalProductCreateWithoutProductVariantInput[] | PhysicalProductCreateWithoutProductVariantInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateWithoutLocationInput {
  id?: ID_Input | null
  seasonsUID: String
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

export interface PhysicalProductCreateWithoutProductVariantInput {
  id?: ID_Input | null
  seasonsUID: String
  location: LocationCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
}

export interface PhysicalProductScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  seasonsUID?: String | null
  seasonsUID_not?: String | null
  seasonsUID_in?: String[] | String | null
  seasonsUID_not_in?: String[] | String | null
  seasonsUID_lt?: String | null
  seasonsUID_lte?: String | null
  seasonsUID_gt?: String | null
  seasonsUID_gte?: String | null
  seasonsUID_contains?: String | null
  seasonsUID_not_contains?: String | null
  seasonsUID_starts_with?: String | null
  seasonsUID_not_starts_with?: String | null
  seasonsUID_ends_with?: String | null
  seasonsUID_not_ends_with?: String | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatus_not?: InventoryStatus | null
  inventoryStatus_in?: InventoryStatus[] | InventoryStatus | null
  inventoryStatus_not_in?: InventoryStatus[] | InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  productStatus_not?: PhysicalProductStatus | null
  productStatus_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  productStatus_not_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  OR?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  NOT?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
}

export interface PhysicalProductSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PhysicalProductWhereInput | null
  AND?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
  OR?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
  NOT?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
}

export interface PhysicalProductUpdateDataInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneRequiredWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneRequiredWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateManyDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateManyInput {
  create?: PhysicalProductCreateInput[] | PhysicalProductCreateInput | null
  update?: PhysicalProductUpdateWithWhereUniqueNestedInput[] | PhysicalProductUpdateWithWhereUniqueNestedInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueNestedInput[] | PhysicalProductUpsertWithWhereUniqueNestedInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
}

export interface PhysicalProductUpdateManyMutationInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateManyWithoutLocationInput {
  create?: PhysicalProductCreateWithoutLocationInput[] | PhysicalProductCreateWithoutLocationInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueWithoutLocationInput[] | PhysicalProductUpdateWithWhereUniqueWithoutLocationInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueWithoutLocationInput[] | PhysicalProductUpsertWithWhereUniqueWithoutLocationInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
}

export interface PhysicalProductUpdateManyWithoutProductVariantInput {
  create?: PhysicalProductCreateWithoutProductVariantInput[] | PhysicalProductCreateWithoutProductVariantInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput[] | PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput[] | PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
}

export interface PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput
  data: PhysicalProductUpdateManyDataInput
}

export interface PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID?: String | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateWithWhereUniqueNestedInput {
  where: PhysicalProductWhereUniqueInput
  data: PhysicalProductUpdateDataInput
}

export interface PhysicalProductUpdateWithWhereUniqueWithoutLocationInput {
  where: PhysicalProductWhereUniqueInput
  data: PhysicalProductUpdateWithoutLocationDataInput
}

export interface PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput {
  where: PhysicalProductWhereUniqueInput
  data: PhysicalProductUpdateWithoutProductVariantDataInput
}

export interface PhysicalProductUpsertWithWhereUniqueNestedInput {
  where: PhysicalProductWhereUniqueInput
  update: PhysicalProductUpdateDataInput
  create: PhysicalProductCreateInput
}

export interface PhysicalProductUpsertWithWhereUniqueWithoutLocationInput {
  where: PhysicalProductWhereUniqueInput
  update: PhysicalProductUpdateWithoutLocationDataInput
  create: PhysicalProductCreateWithoutLocationInput
}

export interface PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput {
  where: PhysicalProductWhereUniqueInput
  update: PhysicalProductUpdateWithoutProductVariantDataInput
  create: PhysicalProductCreateWithoutProductVariantInput
}

export interface PhysicalProductWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  seasonsUID?: String | null
  seasonsUID_not?: String | null
  seasonsUID_in?: String[] | String | null
  seasonsUID_not_in?: String[] | String | null
  seasonsUID_lt?: String | null
  seasonsUID_lte?: String | null
  seasonsUID_gt?: String | null
  seasonsUID_gte?: String | null
  seasonsUID_contains?: String | null
  seasonsUID_not_contains?: String | null
  seasonsUID_starts_with?: String | null
  seasonsUID_not_starts_with?: String | null
  seasonsUID_ends_with?: String | null
  seasonsUID_not_ends_with?: String | null
  location?: LocationWhereInput | null
  productVariant?: ProductVariantWhereInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatus_not?: InventoryStatus | null
  inventoryStatus_in?: InventoryStatus[] | InventoryStatus | null
  inventoryStatus_not_in?: InventoryStatus[] | InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  productStatus_not?: PhysicalProductStatus | null
  productStatus_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  productStatus_not_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
  OR?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
  NOT?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
}

export interface PhysicalProductWhereUniqueInput {
  id?: ID_Input | null
  seasonsUID?: String | null
}

export interface ProductCreateavailableSizesInput {
  set?: Size[] | Size | null
}

export interface ProductCreateinnerMaterialsInput {
  set?: Material[] | Material | null
}

export interface ProductCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionCreateManyInput | null
  availableSizes?: ProductCreateavailableSizesInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductCreateManyInput {
  create?: ProductCreateInput[] | ProductCreateInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateManyWithoutBrandInput {
  create?: ProductCreateWithoutBrandInput[] | ProductCreateWithoutBrandInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateManyWithoutCategoryInput {
  create?: ProductCreateWithoutCategoryInput[] | ProductCreateWithoutCategoryInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateOneWithoutVariantsInput {
  create?: ProductCreateWithoutVariantsInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductCreateouterMaterialsInput {
  set?: Material[] | Material | null
}

export interface ProductCreateWithoutBrandInput {
  id?: ID_Input | null
  slug: String
  name: String
  category: CategoryCreateOneWithoutProductsInput
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionCreateManyInput | null
  availableSizes?: ProductCreateavailableSizesInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductCreateWithoutCategoryInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionCreateManyInput | null
  availableSizes?: ProductCreateavailableSizesInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductCreateWithoutVariantsInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionCreateManyInput | null
  availableSizes?: ProductCreateavailableSizesInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  status?: ProductStatus | null
}

export interface ProductFunctionCreateInput {
  id?: ID_Input | null
  name?: String | null
}

export interface ProductFunctionCreateManyInput {
  create?: ProductFunctionCreateInput[] | ProductFunctionCreateInput | null
  connect?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
}

export interface ProductFunctionScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  AND?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  OR?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  NOT?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
}

export interface ProductFunctionSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductFunctionWhereInput | null
  AND?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
  OR?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
  NOT?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
}

export interface ProductFunctionUpdateDataInput {
  name?: String | null
}

export interface ProductFunctionUpdateInput {
  name?: String | null
}

export interface ProductFunctionUpdateManyDataInput {
  name?: String | null
}

export interface ProductFunctionUpdateManyInput {
  create?: ProductFunctionCreateInput[] | ProductFunctionCreateInput | null
  update?: ProductFunctionUpdateWithWhereUniqueNestedInput[] | ProductFunctionUpdateWithWhereUniqueNestedInput | null
  upsert?: ProductFunctionUpsertWithWhereUniqueNestedInput[] | ProductFunctionUpsertWithWhereUniqueNestedInput | null
  delete?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  connect?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  set?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  disconnect?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  deleteMany?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  updateMany?: ProductFunctionUpdateManyWithWhereNestedInput[] | ProductFunctionUpdateManyWithWhereNestedInput | null
}

export interface ProductFunctionUpdateManyMutationInput {
  name?: String | null
}

export interface ProductFunctionUpdateManyWithWhereNestedInput {
  where: ProductFunctionScalarWhereInput
  data: ProductFunctionUpdateManyDataInput
}

export interface ProductFunctionUpdateWithWhereUniqueNestedInput {
  where: ProductFunctionWhereUniqueInput
  data: ProductFunctionUpdateDataInput
}

export interface ProductFunctionUpsertWithWhereUniqueNestedInput {
  where: ProductFunctionWhereUniqueInput
  update: ProductFunctionUpdateDataInput
  create: ProductFunctionCreateInput
}

export interface ProductFunctionWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  AND?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
  OR?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
  NOT?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
}

export interface ProductFunctionWhereUniqueInput {
  id?: ID_Input | null
  name?: String | null
}

export interface ProductRequestCreateimagesInput {
  set?: String[] | String | null
}

export interface ProductRequestCreateInput {
  id?: ID_Input | null
  brand?: String | null
  description?: String | null
  images?: ProductRequestCreateimagesInput | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason: String
  sku?: String | null
  url: String
  user: UserCreateOneInput
}

export interface ProductRequestSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductRequestWhereInput | null
  AND?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
  OR?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
  NOT?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
}

export interface ProductRequestUpdateimagesInput {
  set?: String[] | String | null
}

export interface ProductRequestUpdateInput {
  brand?: String | null
  description?: String | null
  images?: ProductRequestUpdateimagesInput | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason?: String | null
  sku?: String | null
  url?: String | null
  user?: UserUpdateOneRequiredInput | null
}

export interface ProductRequestUpdateManyMutationInput {
  brand?: String | null
  description?: String | null
  images?: ProductRequestUpdateimagesInput | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason?: String | null
  sku?: String | null
  url?: String | null
}

export interface ProductRequestWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  brand?: String | null
  brand_not?: String | null
  brand_in?: String[] | String | null
  brand_not_in?: String[] | String | null
  brand_lt?: String | null
  brand_lte?: String | null
  brand_gt?: String | null
  brand_gte?: String | null
  brand_contains?: String | null
  brand_not_contains?: String | null
  brand_starts_with?: String | null
  brand_not_starts_with?: String | null
  brand_ends_with?: String | null
  brand_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  price?: Int | null
  price_not?: Int | null
  price_in?: Int[] | Int | null
  price_not_in?: Int[] | Int | null
  price_lt?: Int | null
  price_lte?: Int | null
  price_gt?: Int | null
  price_gte?: Int | null
  priceCurrency?: String | null
  priceCurrency_not?: String | null
  priceCurrency_in?: String[] | String | null
  priceCurrency_not_in?: String[] | String | null
  priceCurrency_lt?: String | null
  priceCurrency_lte?: String | null
  priceCurrency_gt?: String | null
  priceCurrency_gte?: String | null
  priceCurrency_contains?: String | null
  priceCurrency_not_contains?: String | null
  priceCurrency_starts_with?: String | null
  priceCurrency_not_starts_with?: String | null
  priceCurrency_ends_with?: String | null
  priceCurrency_not_ends_with?: String | null
  productID?: String | null
  productID_not?: String | null
  productID_in?: String[] | String | null
  productID_not_in?: String[] | String | null
  productID_lt?: String | null
  productID_lte?: String | null
  productID_gt?: String | null
  productID_gte?: String | null
  productID_contains?: String | null
  productID_not_contains?: String | null
  productID_starts_with?: String | null
  productID_not_starts_with?: String | null
  productID_ends_with?: String | null
  productID_not_ends_with?: String | null
  reason?: String | null
  reason_not?: String | null
  reason_in?: String[] | String | null
  reason_not_in?: String[] | String | null
  reason_lt?: String | null
  reason_lte?: String | null
  reason_gt?: String | null
  reason_gte?: String | null
  reason_contains?: String | null
  reason_not_contains?: String | null
  reason_starts_with?: String | null
  reason_not_starts_with?: String | null
  reason_ends_with?: String | null
  reason_not_ends_with?: String | null
  sku?: String | null
  sku_not?: String | null
  sku_in?: String[] | String | null
  sku_not_in?: String[] | String | null
  sku_lt?: String | null
  sku_lte?: String | null
  sku_gt?: String | null
  sku_gte?: String | null
  sku_contains?: String | null
  sku_not_contains?: String | null
  sku_starts_with?: String | null
  sku_not_starts_with?: String | null
  sku_ends_with?: String | null
  sku_not_ends_with?: String | null
  url?: String | null
  url_not?: String | null
  url_in?: String[] | String | null
  url_not_in?: String[] | String | null
  url_lt?: String | null
  url_lte?: String | null
  url_gt?: String | null
  url_gte?: String | null
  url_contains?: String | null
  url_not_contains?: String | null
  url_starts_with?: String | null
  url_not_starts_with?: String | null
  url_ends_with?: String | null
  url_not_ends_with?: String | null
  user?: UserWhereInput | null
  AND?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
  OR?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
  NOT?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
}

export interface ProductRequestWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  externalURL?: String | null
  externalURL_not?: String | null
  externalURL_in?: String[] | String | null
  externalURL_not_in?: String[] | String | null
  externalURL_lt?: String | null
  externalURL_lte?: String | null
  externalURL_gt?: String | null
  externalURL_gte?: String | null
  externalURL_contains?: String | null
  externalURL_not_contains?: String | null
  externalURL_starts_with?: String | null
  externalURL_not_starts_with?: String | null
  externalURL_ends_with?: String | null
  externalURL_not_ends_with?: String | null
  modelHeight?: Int | null
  modelHeight_not?: Int | null
  modelHeight_in?: Int[] | Int | null
  modelHeight_not_in?: Int[] | Int | null
  modelHeight_lt?: Int | null
  modelHeight_lte?: Int | null
  modelHeight_gt?: Int | null
  modelHeight_gte?: Int | null
  modelSize?: Size | null
  modelSize_not?: Size | null
  modelSize_in?: Size[] | Size | null
  modelSize_not_in?: Size[] | Size | null
  retailPrice?: Int | null
  retailPrice_not?: Int | null
  retailPrice_in?: Int[] | Int | null
  retailPrice_not_in?: Int[] | Int | null
  retailPrice_lt?: Int | null
  retailPrice_lte?: Int | null
  retailPrice_gt?: Int | null
  retailPrice_gte?: Int | null
  status?: ProductStatus | null
  status_not?: ProductStatus | null
  status_in?: ProductStatus[] | ProductStatus | null
  status_not_in?: ProductStatus[] | ProductStatus | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  OR?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  NOT?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
}

export interface ProductSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductWhereInput | null
  AND?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
  OR?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
  NOT?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
}

export interface ProductUpdateavailableSizesInput {
  set?: Size[] | Size | null
}

export interface ProductUpdateDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionUpdateManyInput | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateinnerMaterialsInput {
  set?: Material[] | Material | null
}

export interface ProductUpdateInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionUpdateManyInput | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateManyDataInput {
  slug?: String | null
  name?: String | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  tags?: Json | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateManyInput {
  create?: ProductCreateInput[] | ProductCreateInput | null
  update?: ProductUpdateWithWhereUniqueNestedInput[] | ProductUpdateWithWhereUniqueNestedInput | null
  upsert?: ProductUpsertWithWhereUniqueNestedInput[] | ProductUpsertWithWhereUniqueNestedInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  tags?: Json | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateManyWithoutBrandInput {
  create?: ProductCreateWithoutBrandInput[] | ProductCreateWithoutBrandInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutBrandInput[] | ProductUpdateWithWhereUniqueWithoutBrandInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutBrandInput[] | ProductUpsertWithWhereUniqueWithoutBrandInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyWithoutCategoryInput {
  create?: ProductCreateWithoutCategoryInput[] | ProductCreateWithoutCategoryInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutCategoryInput[] | ProductUpdateWithWhereUniqueWithoutCategoryInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput[] | ProductUpsertWithWhereUniqueWithoutCategoryInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput
  data: ProductUpdateManyDataInput
}

export interface ProductUpdateOneRequiredWithoutVariantsInput {
  create?: ProductCreateWithoutVariantsInput | null
  update?: ProductUpdateWithoutVariantsDataInput | null
  upsert?: ProductUpsertWithoutVariantsInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductUpdateouterMaterialsInput {
  set?: Material[] | Material | null
}

export interface ProductUpdateWithoutBrandDataInput {
  slug?: String | null
  name?: String | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionUpdateManyInput | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateWithoutCategoryDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionUpdateManyInput | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateWithoutVariantsDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: Json | null
  functions?: ProductFunctionUpdateManyInput | null
  availableSizes?: ProductUpdateavailableSizesInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
}

export interface ProductUpdateWithWhereUniqueNestedInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateDataInput
}

export interface ProductUpdateWithWhereUniqueWithoutBrandInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutBrandDataInput
}

export interface ProductUpdateWithWhereUniqueWithoutCategoryInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutCategoryDataInput
}

export interface ProductUpsertWithoutVariantsInput {
  update: ProductUpdateWithoutVariantsDataInput
  create: ProductCreateWithoutVariantsInput
}

export interface ProductUpsertWithWhereUniqueNestedInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateDataInput
  create: ProductCreateInput
}

export interface ProductUpsertWithWhereUniqueWithoutBrandInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutBrandDataInput
  create: ProductCreateWithoutBrandInput
}

export interface ProductUpsertWithWhereUniqueWithoutCategoryInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutCategoryDataInput
  create: ProductCreateWithoutCategoryInput
}

export interface ProductVariantCreateInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  product: ProductCreateOneWithoutVariantsInput
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

export interface ProductVariantCreateManyWithoutColorInput {
  create?: ProductVariantCreateWithoutColorInput[] | ProductVariantCreateWithoutColorInput | null
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
}

export interface ProductVariantCreateManyWithoutProductInput {
  create?: ProductVariantCreateWithoutProductInput[] | ProductVariantCreateWithoutProductInput | null
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
}

export interface ProductVariantCreateOneInput {
  create?: ProductVariantCreateInput | null
  connect?: ProductVariantWhereUniqueInput | null
}

export interface ProductVariantCreateOneWithoutPhysicalProductsInput {
  create?: ProductVariantCreateWithoutPhysicalProductsInput | null
  connect?: ProductVariantWhereUniqueInput | null
}

export interface ProductVariantCreateWithoutColorInput {
  id?: ID_Input | null
  sku?: String | null
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  product: ProductCreateOneWithoutVariantsInput
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

export interface ProductVariantCreateWithoutPhysicalProductsInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  product: ProductCreateOneWithoutVariantsInput
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

export interface ProductVariantCreateWithoutProductInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
}

export interface ProductVariantScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  sku?: String | null
  sku_not?: String | null
  sku_in?: String[] | String | null
  sku_not_in?: String[] | String | null
  sku_lt?: String | null
  sku_lte?: String | null
  sku_gt?: String | null
  sku_gte?: String | null
  sku_contains?: String | null
  sku_not_contains?: String | null
  sku_starts_with?: String | null
  sku_not_starts_with?: String | null
  sku_ends_with?: String | null
  sku_not_ends_with?: String | null
  size?: Size | null
  size_not?: Size | null
  size_in?: Size[] | Size | null
  size_not_in?: Size[] | Size | null
  weight?: Float | null
  weight_not?: Float | null
  weight_in?: Float[] | Float | null
  weight_not_in?: Float[] | Float | null
  weight_lt?: Float | null
  weight_lte?: Float | null
  weight_gt?: Float | null
  weight_gte?: Float | null
  height?: Float | null
  height_not?: Float | null
  height_in?: Float[] | Float | null
  height_not_in?: Float[] | Float | null
  height_lt?: Float | null
  height_lte?: Float | null
  height_gt?: Float | null
  height_gte?: Float | null
  productID?: String | null
  productID_not?: String | null
  productID_in?: String[] | String | null
  productID_not_in?: String[] | String | null
  productID_lt?: String | null
  productID_lte?: String | null
  productID_gt?: String | null
  productID_gte?: String | null
  productID_contains?: String | null
  productID_not_contains?: String | null
  productID_starts_with?: String | null
  productID_not_starts_with?: String | null
  productID_ends_with?: String | null
  productID_not_ends_with?: String | null
  retailPrice?: Float | null
  retailPrice_not?: Float | null
  retailPrice_in?: Float[] | Float | null
  retailPrice_not_in?: Float[] | Float | null
  retailPrice_lt?: Float | null
  retailPrice_lte?: Float | null
  retailPrice_gt?: Float | null
  retailPrice_gte?: Float | null
  total?: Int | null
  total_not?: Int | null
  total_in?: Int[] | Int | null
  total_not_in?: Int[] | Int | null
  total_lt?: Int | null
  total_lte?: Int | null
  total_gt?: Int | null
  total_gte?: Int | null
  reservable?: Int | null
  reservable_not?: Int | null
  reservable_in?: Int[] | Int | null
  reservable_not_in?: Int[] | Int | null
  reservable_lt?: Int | null
  reservable_lte?: Int | null
  reservable_gt?: Int | null
  reservable_gte?: Int | null
  reserved?: Int | null
  reserved_not?: Int | null
  reserved_in?: Int[] | Int | null
  reserved_not_in?: Int[] | Int | null
  reserved_lt?: Int | null
  reserved_lte?: Int | null
  reserved_gt?: Int | null
  reserved_gte?: Int | null
  nonReservable?: Int | null
  nonReservable_not?: Int | null
  nonReservable_in?: Int[] | Int | null
  nonReservable_not_in?: Int[] | Int | null
  nonReservable_lt?: Int | null
  nonReservable_lte?: Int | null
  nonReservable_gt?: Int | null
  nonReservable_gte?: Int | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  OR?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  NOT?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
}

export interface ProductVariantSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantWhereInput | null
  AND?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
  OR?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
  NOT?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
}

export interface ProductVariantUpdateDataInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateManyDataInput {
  sku?: String | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateManyMutationInput {
  sku?: String | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateManyWithoutColorInput {
  create?: ProductVariantCreateWithoutColorInput[] | ProductVariantCreateWithoutColorInput | null
  delete?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  set?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  disconnect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateWithWhereUniqueWithoutColorInput[] | ProductVariantUpdateWithWhereUniqueWithoutColorInput | null
  upsert?: ProductVariantUpsertWithWhereUniqueWithoutColorInput[] | ProductVariantUpsertWithWhereUniqueWithoutColorInput | null
  deleteMany?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  updateMany?: ProductVariantUpdateManyWithWhereNestedInput[] | ProductVariantUpdateManyWithWhereNestedInput | null
}

export interface ProductVariantUpdateManyWithoutProductInput {
  create?: ProductVariantCreateWithoutProductInput[] | ProductVariantCreateWithoutProductInput | null
  delete?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  set?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  disconnect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateWithWhereUniqueWithoutProductInput[] | ProductVariantUpdateWithWhereUniqueWithoutProductInput | null
  upsert?: ProductVariantUpsertWithWhereUniqueWithoutProductInput[] | ProductVariantUpsertWithWhereUniqueWithoutProductInput | null
  deleteMany?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  updateMany?: ProductVariantUpdateManyWithWhereNestedInput[] | ProductVariantUpdateManyWithWhereNestedInput | null
}

export interface ProductVariantUpdateManyWithWhereNestedInput {
  where: ProductVariantScalarWhereInput
  data: ProductVariantUpdateManyDataInput
}

export interface ProductVariantUpdateOneRequiredInput {
  create?: ProductVariantCreateInput | null
  update?: ProductVariantUpdateDataInput | null
  upsert?: ProductVariantUpsertNestedInput | null
  connect?: ProductVariantWhereUniqueInput | null
}

export interface ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput {
  create?: ProductVariantCreateWithoutPhysicalProductsInput | null
  update?: ProductVariantUpdateWithoutPhysicalProductsDataInput | null
  upsert?: ProductVariantUpsertWithoutPhysicalProductsInput | null
  connect?: ProductVariantWhereUniqueInput | null
}

export interface ProductVariantUpdateWithoutColorDataInput {
  sku?: String | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateWithoutProductDataInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  size?: Size | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
}

export interface ProductVariantUpdateWithWhereUniqueWithoutColorInput {
  where: ProductVariantWhereUniqueInput
  data: ProductVariantUpdateWithoutColorDataInput
}

export interface ProductVariantUpdateWithWhereUniqueWithoutProductInput {
  where: ProductVariantWhereUniqueInput
  data: ProductVariantUpdateWithoutProductDataInput
}

export interface ProductVariantUpsertNestedInput {
  update: ProductVariantUpdateDataInput
  create: ProductVariantCreateInput
}

export interface ProductVariantUpsertWithoutPhysicalProductsInput {
  update: ProductVariantUpdateWithoutPhysicalProductsDataInput
  create: ProductVariantCreateWithoutPhysicalProductsInput
}

export interface ProductVariantUpsertWithWhereUniqueWithoutColorInput {
  where: ProductVariantWhereUniqueInput
  update: ProductVariantUpdateWithoutColorDataInput
  create: ProductVariantCreateWithoutColorInput
}

export interface ProductVariantUpsertWithWhereUniqueWithoutProductInput {
  where: ProductVariantWhereUniqueInput
  update: ProductVariantUpdateWithoutProductDataInput
  create: ProductVariantCreateWithoutProductInput
}

export interface ProductVariantWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  sku?: String | null
  sku_not?: String | null
  sku_in?: String[] | String | null
  sku_not_in?: String[] | String | null
  sku_lt?: String | null
  sku_lte?: String | null
  sku_gt?: String | null
  sku_gte?: String | null
  sku_contains?: String | null
  sku_not_contains?: String | null
  sku_starts_with?: String | null
  sku_not_starts_with?: String | null
  sku_ends_with?: String | null
  sku_not_ends_with?: String | null
  color?: ColorWhereInput | null
  size?: Size | null
  size_not?: Size | null
  size_in?: Size[] | Size | null
  size_not_in?: Size[] | Size | null
  weight?: Float | null
  weight_not?: Float | null
  weight_in?: Float[] | Float | null
  weight_not_in?: Float[] | Float | null
  weight_lt?: Float | null
  weight_lte?: Float | null
  weight_gt?: Float | null
  weight_gte?: Float | null
  height?: Float | null
  height_not?: Float | null
  height_in?: Float[] | Float | null
  height_not_in?: Float[] | Float | null
  height_lt?: Float | null
  height_lte?: Float | null
  height_gt?: Float | null
  height_gte?: Float | null
  productID?: String | null
  productID_not?: String | null
  productID_in?: String[] | String | null
  productID_not_in?: String[] | String | null
  productID_lt?: String | null
  productID_lte?: String | null
  productID_gt?: String | null
  productID_gte?: String | null
  productID_contains?: String | null
  productID_not_contains?: String | null
  productID_starts_with?: String | null
  productID_not_starts_with?: String | null
  productID_ends_with?: String | null
  productID_not_ends_with?: String | null
  product?: ProductWhereInput | null
  retailPrice?: Float | null
  retailPrice_not?: Float | null
  retailPrice_in?: Float[] | Float | null
  retailPrice_not_in?: Float[] | Float | null
  retailPrice_lt?: Float | null
  retailPrice_lte?: Float | null
  retailPrice_gt?: Float | null
  retailPrice_gte?: Float | null
  physicalProducts_every?: PhysicalProductWhereInput | null
  physicalProducts_some?: PhysicalProductWhereInput | null
  physicalProducts_none?: PhysicalProductWhereInput | null
  total?: Int | null
  total_not?: Int | null
  total_in?: Int[] | Int | null
  total_not_in?: Int[] | Int | null
  total_lt?: Int | null
  total_lte?: Int | null
  total_gt?: Int | null
  total_gte?: Int | null
  reservable?: Int | null
  reservable_not?: Int | null
  reservable_in?: Int[] | Int | null
  reservable_not_in?: Int[] | Int | null
  reservable_lt?: Int | null
  reservable_lte?: Int | null
  reservable_gt?: Int | null
  reservable_gte?: Int | null
  reserved?: Int | null
  reserved_not?: Int | null
  reserved_in?: Int[] | Int | null
  reserved_not_in?: Int[] | Int | null
  reserved_lt?: Int | null
  reserved_lte?: Int | null
  reserved_gt?: Int | null
  reserved_gte?: Int | null
  nonReservable?: Int | null
  nonReservable_not?: Int | null
  nonReservable_in?: Int[] | Int | null
  nonReservable_not_in?: Int[] | Int | null
  nonReservable_lt?: Int | null
  nonReservable_lte?: Int | null
  nonReservable_gt?: Int | null
  nonReservable_gte?: Int | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
  OR?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
  NOT?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
}

export interface ProductVariantWhereUniqueInput {
  id?: ID_Input | null
  sku?: String | null
}

export interface ProductWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  slug?: String | null
  slug_not?: String | null
  slug_in?: String[] | String | null
  slug_not_in?: String[] | String | null
  slug_lt?: String | null
  slug_lte?: String | null
  slug_gt?: String | null
  slug_gte?: String | null
  slug_contains?: String | null
  slug_not_contains?: String | null
  slug_starts_with?: String | null
  slug_not_starts_with?: String | null
  slug_ends_with?: String | null
  slug_not_ends_with?: String | null
  name?: String | null
  name_not?: String | null
  name_in?: String[] | String | null
  name_not_in?: String[] | String | null
  name_lt?: String | null
  name_lte?: String | null
  name_gt?: String | null
  name_gte?: String | null
  name_contains?: String | null
  name_not_contains?: String | null
  name_starts_with?: String | null
  name_not_starts_with?: String | null
  name_ends_with?: String | null
  name_not_ends_with?: String | null
  brand?: BrandWhereInput | null
  category?: CategoryWhereInput | null
  description?: String | null
  description_not?: String | null
  description_in?: String[] | String | null
  description_not_in?: String[] | String | null
  description_lt?: String | null
  description_lte?: String | null
  description_gt?: String | null
  description_gte?: String | null
  description_contains?: String | null
  description_not_contains?: String | null
  description_starts_with?: String | null
  description_not_starts_with?: String | null
  description_ends_with?: String | null
  description_not_ends_with?: String | null
  externalURL?: String | null
  externalURL_not?: String | null
  externalURL_in?: String[] | String | null
  externalURL_not_in?: String[] | String | null
  externalURL_lt?: String | null
  externalURL_lte?: String | null
  externalURL_gt?: String | null
  externalURL_gte?: String | null
  externalURL_contains?: String | null
  externalURL_not_contains?: String | null
  externalURL_starts_with?: String | null
  externalURL_not_starts_with?: String | null
  externalURL_ends_with?: String | null
  externalURL_not_ends_with?: String | null
  modelHeight?: Int | null
  modelHeight_not?: Int | null
  modelHeight_in?: Int[] | Int | null
  modelHeight_not_in?: Int[] | Int | null
  modelHeight_lt?: Int | null
  modelHeight_lte?: Int | null
  modelHeight_gt?: Int | null
  modelHeight_gte?: Int | null
  modelSize?: Size | null
  modelSize_not?: Size | null
  modelSize_in?: Size[] | Size | null
  modelSize_not_in?: Size[] | Size | null
  retailPrice?: Int | null
  retailPrice_not?: Int | null
  retailPrice_in?: Int[] | Int | null
  retailPrice_not_in?: Int[] | Int | null
  retailPrice_lt?: Int | null
  retailPrice_lte?: Int | null
  retailPrice_gt?: Int | null
  retailPrice_gte?: Int | null
  color?: ColorWhereInput | null
  secondaryColor?: ColorWhereInput | null
  functions_every?: ProductFunctionWhereInput | null
  functions_some?: ProductFunctionWhereInput | null
  functions_none?: ProductFunctionWhereInput | null
  variants_every?: ProductVariantWhereInput | null
  variants_some?: ProductVariantWhereInput | null
  variants_none?: ProductVariantWhereInput | null
  status?: ProductStatus | null
  status_not?: ProductStatus | null
  status_in?: ProductStatus[] | ProductStatus | null
  status_not_in?: ProductStatus[] | ProductStatus | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ProductWhereInput[] | ProductWhereInput | null
  OR?: ProductWhereInput[] | ProductWhereInput | null
  NOT?: ProductWhereInput[] | ProductWhereInput | null
}

export interface ProductWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface ReservationCreateInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  customer: CustomerCreateOneWithoutReservationsInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  location?: LocationCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationCreateManyWithoutCustomerInput {
  create?: ReservationCreateWithoutCustomerInput[] | ReservationCreateWithoutCustomerInput | null
  connect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
}

export interface ReservationCreateWithoutCustomerInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  location?: LocationCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationScalarWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  reservationNumber?: Int | null
  reservationNumber_not?: Int | null
  reservationNumber_in?: Int[] | Int | null
  reservationNumber_not_in?: Int[] | Int | null
  reservationNumber_lt?: Int | null
  reservationNumber_lte?: Int | null
  reservationNumber_gt?: Int | null
  reservationNumber_gte?: Int | null
  shipped?: Boolean | null
  shipped_not?: Boolean | null
  status?: ReservationStatus | null
  status_not?: ReservationStatus | null
  status_in?: ReservationStatus[] | ReservationStatus | null
  status_not_in?: ReservationStatus[] | ReservationStatus | null
  shippedAt?: DateTime | null
  shippedAt_not?: DateTime | null
  shippedAt_in?: DateTime[] | DateTime | null
  shippedAt_not_in?: DateTime[] | DateTime | null
  shippedAt_lt?: DateTime | null
  shippedAt_lte?: DateTime | null
  shippedAt_gt?: DateTime | null
  shippedAt_gte?: DateTime | null
  receivedAt?: DateTime | null
  receivedAt_not?: DateTime | null
  receivedAt_in?: DateTime[] | DateTime | null
  receivedAt_not_in?: DateTime[] | DateTime | null
  receivedAt_lt?: DateTime | null
  receivedAt_lte?: DateTime | null
  receivedAt_gt?: DateTime | null
  receivedAt_gte?: DateTime | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  OR?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  NOT?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
}

export interface ReservationSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationWhereInput | null
  AND?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
  OR?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
  NOT?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
}

export interface ReservationUpdateInput {
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  location?: LocationUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationUpdateManyDataInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationUpdateManyMutationInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationUpdateManyWithoutCustomerInput {
  create?: ReservationCreateWithoutCustomerInput[] | ReservationCreateWithoutCustomerInput | null
  delete?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  connect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  set?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  disconnect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  update?: ReservationUpdateWithWhereUniqueWithoutCustomerInput[] | ReservationUpdateWithWhereUniqueWithoutCustomerInput | null
  upsert?: ReservationUpsertWithWhereUniqueWithoutCustomerInput[] | ReservationUpsertWithWhereUniqueWithoutCustomerInput | null
  deleteMany?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  updateMany?: ReservationUpdateManyWithWhereNestedInput[] | ReservationUpdateManyWithWhereNestedInput | null
}

export interface ReservationUpdateManyWithWhereNestedInput {
  where: ReservationScalarWhereInput
  data: ReservationUpdateManyDataInput
}

export interface ReservationUpdateWithoutCustomerDataInput {
  user?: UserUpdateOneRequiredInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  location?: LocationUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
}

export interface ReservationUpdateWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput
  data: ReservationUpdateWithoutCustomerDataInput
}

export interface ReservationUpsertWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput
  update: ReservationUpdateWithoutCustomerDataInput
  create: ReservationCreateWithoutCustomerInput
}

export interface ReservationWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  user?: UserWhereInput | null
  customer?: CustomerWhereInput | null
  sentPackage?: PackageWhereInput | null
  returnedPackage?: PackageWhereInput | null
  location?: LocationWhereInput | null
  products_every?: PhysicalProductWhereInput | null
  products_some?: PhysicalProductWhereInput | null
  products_none?: PhysicalProductWhereInput | null
  reservationNumber?: Int | null
  reservationNumber_not?: Int | null
  reservationNumber_in?: Int[] | Int | null
  reservationNumber_not_in?: Int[] | Int | null
  reservationNumber_lt?: Int | null
  reservationNumber_lte?: Int | null
  reservationNumber_gt?: Int | null
  reservationNumber_gte?: Int | null
  shipped?: Boolean | null
  shipped_not?: Boolean | null
  status?: ReservationStatus | null
  status_not?: ReservationStatus | null
  status_in?: ReservationStatus[] | ReservationStatus | null
  status_not_in?: ReservationStatus[] | ReservationStatus | null
  shippedAt?: DateTime | null
  shippedAt_not?: DateTime | null
  shippedAt_in?: DateTime[] | DateTime | null
  shippedAt_not_in?: DateTime[] | DateTime | null
  shippedAt_lt?: DateTime | null
  shippedAt_lte?: DateTime | null
  shippedAt_gt?: DateTime | null
  shippedAt_gte?: DateTime | null
  receivedAt?: DateTime | null
  receivedAt_not?: DateTime | null
  receivedAt_in?: DateTime[] | DateTime | null
  receivedAt_not_in?: DateTime[] | DateTime | null
  receivedAt_lt?: DateTime | null
  receivedAt_lte?: DateTime | null
  receivedAt_gt?: DateTime | null
  receivedAt_gte?: DateTime | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: ReservationWhereInput[] | ReservationWhereInput | null
  OR?: ReservationWhereInput[] | ReservationWhereInput | null
  NOT?: ReservationWhereInput[] | ReservationWhereInput | null
}

export interface ReservationWhereUniqueInput {
  id?: ID_Input | null
  reservationNumber?: Int | null
}

export interface UserCreateInput {
  id?: ID_Input | null
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role?: UserRole | null
}

export interface UserCreateOneInput {
  create?: UserCreateInput | null
  connect?: UserWhereUniqueInput | null
}

export interface UserSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: UserWhereInput | null
  AND?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
  OR?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
  NOT?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
}

export interface UserUpdateDataInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
}

export interface UserUpdateInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
}

export interface UserUpdateManyMutationInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
}

export interface UserUpdateOneInput {
  create?: UserCreateInput | null
  update?: UserUpdateDataInput | null
  upsert?: UserUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: UserWhereUniqueInput | null
}

export interface UserUpdateOneRequiredInput {
  create?: UserCreateInput | null
  update?: UserUpdateDataInput | null
  upsert?: UserUpsertNestedInput | null
  connect?: UserWhereUniqueInput | null
}

export interface UserUpsertNestedInput {
  update: UserUpdateDataInput
  create: UserCreateInput
}

export interface UserWhereInput {
  id?: ID_Input | null
  id_not?: ID_Input | null
  id_in?: ID_Output[] | ID_Output | null
  id_not_in?: ID_Output[] | ID_Output | null
  id_lt?: ID_Input | null
  id_lte?: ID_Input | null
  id_gt?: ID_Input | null
  id_gte?: ID_Input | null
  id_contains?: ID_Input | null
  id_not_contains?: ID_Input | null
  id_starts_with?: ID_Input | null
  id_not_starts_with?: ID_Input | null
  id_ends_with?: ID_Input | null
  id_not_ends_with?: ID_Input | null
  auth0Id?: String | null
  auth0Id_not?: String | null
  auth0Id_in?: String[] | String | null
  auth0Id_not_in?: String[] | String | null
  auth0Id_lt?: String | null
  auth0Id_lte?: String | null
  auth0Id_gt?: String | null
  auth0Id_gte?: String | null
  auth0Id_contains?: String | null
  auth0Id_not_contains?: String | null
  auth0Id_starts_with?: String | null
  auth0Id_not_starts_with?: String | null
  auth0Id_ends_with?: String | null
  auth0Id_not_ends_with?: String | null
  email?: String | null
  email_not?: String | null
  email_in?: String[] | String | null
  email_not_in?: String[] | String | null
  email_lt?: String | null
  email_lte?: String | null
  email_gt?: String | null
  email_gte?: String | null
  email_contains?: String | null
  email_not_contains?: String | null
  email_starts_with?: String | null
  email_not_starts_with?: String | null
  email_ends_with?: String | null
  email_not_ends_with?: String | null
  firstName?: String | null
  firstName_not?: String | null
  firstName_in?: String[] | String | null
  firstName_not_in?: String[] | String | null
  firstName_lt?: String | null
  firstName_lte?: String | null
  firstName_gt?: String | null
  firstName_gte?: String | null
  firstName_contains?: String | null
  firstName_not_contains?: String | null
  firstName_starts_with?: String | null
  firstName_not_starts_with?: String | null
  firstName_ends_with?: String | null
  firstName_not_ends_with?: String | null
  lastName?: String | null
  lastName_not?: String | null
  lastName_in?: String[] | String | null
  lastName_not_in?: String[] | String | null
  lastName_lt?: String | null
  lastName_lte?: String | null
  lastName_gt?: String | null
  lastName_gte?: String | null
  lastName_contains?: String | null
  lastName_not_contains?: String | null
  lastName_starts_with?: String | null
  lastName_not_starts_with?: String | null
  lastName_ends_with?: String | null
  lastName_not_ends_with?: String | null
  role?: UserRole | null
  role_not?: UserRole | null
  role_in?: UserRole[] | UserRole | null
  role_not_in?: UserRole[] | UserRole | null
  createdAt?: DateTime | null
  createdAt_not?: DateTime | null
  createdAt_in?: DateTime[] | DateTime | null
  createdAt_not_in?: DateTime[] | DateTime | null
  createdAt_lt?: DateTime | null
  createdAt_lte?: DateTime | null
  createdAt_gt?: DateTime | null
  createdAt_gte?: DateTime | null
  updatedAt?: DateTime | null
  updatedAt_not?: DateTime | null
  updatedAt_in?: DateTime[] | DateTime | null
  updatedAt_not_in?: DateTime[] | DateTime | null
  updatedAt_lt?: DateTime | null
  updatedAt_lte?: DateTime | null
  updatedAt_gt?: DateTime | null
  updatedAt_gte?: DateTime | null
  AND?: UserWhereInput[] | UserWhereInput | null
  OR?: UserWhereInput[] | UserWhereInput | null
  NOT?: UserWhereInput[] | UserWhereInput | null
}

export interface UserWhereUniqueInput {
  id?: ID_Input | null
  auth0Id?: String | null
  email?: String | null
}

export interface Node {
  id: ID_Output
}

export interface AggregateBagItem {
  count: Int
}

export interface AggregateBillingInfo {
  count: Int
}

export interface AggregateBrand {
  count: Int
}

export interface AggregateCategory {
  count: Int
}

export interface AggregateCollection {
  count: Int
}

export interface AggregateCollectionGroup {
  count: Int
}

export interface AggregateColor {
  count: Int
}

export interface AggregateCustomer {
  count: Int
}

export interface AggregateCustomerDetail {
  count: Int
}

export interface AggregateHomepageProductRail {
  count: Int
}

export interface AggregateImage {
  count: Int
}

export interface AggregateLabel {
  count: Int
}

export interface AggregateLocation {
  count: Int
}

export interface AggregateOrder {
  count: Int
}

export interface AggregatePackage {
  count: Int
}

export interface AggregatePhysicalProduct {
  count: Int
}

export interface AggregateProduct {
  count: Int
}

export interface AggregateProductFunction {
  count: Int
}

export interface AggregateProductRequest {
  count: Int
}

export interface AggregateProductVariant {
  count: Int
}

export interface AggregateReservation {
  count: Int
}

export interface AggregateUser {
  count: Int
}

export interface BagItem {
  id: ID_Output
  customer: Customer
  productVariant: ProductVariant
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

export interface BagItemConnection {
  pageInfo: PageInfo
  edges: Array<BagItemEdge | null>
  aggregate: AggregateBagItem
}

export interface BagItemEdge {
  node: BagItem
  cursor: String
}

export interface BagItemPreviousValues {
  id: ID_Output
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

export interface BagItemSubscriptionPayload {
  mutation: MutationType
  node?: BagItem | null
  updatedFields?: Array<String> | null
  previousValues?: BagItemPreviousValues | null
}

export interface BatchPayload {
  count: Long
}

export interface BillingInfo {
  id: ID_Output
  brand: String
  name?: String | null
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoConnection {
  pageInfo: PageInfo
  edges: Array<BillingInfoEdge | null>
  aggregate: AggregateBillingInfo
}

export interface BillingInfoEdge {
  node: BillingInfo
  cursor: String
}

export interface BillingInfoPreviousValues {
  id: ID_Output
  brand: String
  name?: String | null
  last_digits: String
  expiration_month: Int
  expiration_year: Int
  street1?: String | null
  street2?: String | null
  city?: String | null
  state?: String | null
  country?: String | null
  postal_code?: String | null
}

export interface BillingInfoSubscriptionPayload {
  mutation: MutationType
  node?: BillingInfo | null
  updatedFields?: Array<String> | null
  previousValues?: BillingInfoPreviousValues | null
}

export interface Brand {
  id: ID_Output
  slug: String
  brandCode: String
  description?: String | null
  isPrimaryBrand: Boolean
  logo?: Json | null
  name: String
  basedIn?: String | null
  products?: Array<Product> | null
  since?: DateTime | null
  tier: BrandTier
  websiteUrl?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface BrandConnection {
  pageInfo: PageInfo
  edges: Array<BrandEdge | null>
  aggregate: AggregateBrand
}

export interface BrandEdge {
  node: Brand
  cursor: String
}

export interface BrandPreviousValues {
  id: ID_Output
  slug: String
  brandCode: String
  description?: String | null
  isPrimaryBrand: Boolean
  logo?: Json | null
  name: String
  basedIn?: String | null
  since?: DateTime | null
  tier: BrandTier
  websiteUrl?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface BrandSubscriptionPayload {
  mutation: MutationType
  node?: Brand | null
  updatedFields?: Array<String> | null
  previousValues?: BrandPreviousValues | null
}

export interface Category {
  id: ID_Output
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible: Boolean
  products?: Array<Product> | null
  children?: Array<Category> | null
}

export interface CategoryConnection {
  pageInfo: PageInfo
  edges: Array<CategoryEdge | null>
  aggregate: AggregateCategory
}

export interface CategoryEdge {
  node: Category
  cursor: String
}

export interface CategoryPreviousValues {
  id: ID_Output
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible: Boolean
}

export interface CategorySubscriptionPayload {
  mutation: MutationType
  node?: Category | null
  updatedFields?: Array<String> | null
  previousValues?: CategoryPreviousValues | null
}

export interface Collection {
  id: ID_Output
  slug: String
  images: Json
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
  products?: Array<Product> | null
}

export interface CollectionConnection {
  pageInfo: PageInfo
  edges: Array<CollectionEdge | null>
  aggregate: AggregateCollection
}

export interface CollectionEdge {
  node: Collection
  cursor: String
}

export interface CollectionGroup {
  id: ID_Output
  slug: String
  title?: String | null
  collectionCount?: Int | null
  collections?: Array<Collection> | null
}

export interface CollectionGroupConnection {
  pageInfo: PageInfo
  edges: Array<CollectionGroupEdge | null>
  aggregate: AggregateCollectionGroup
}

export interface CollectionGroupEdge {
  node: CollectionGroup
  cursor: String
}

export interface CollectionGroupPreviousValues {
  id: ID_Output
  slug: String
  title?: String | null
  collectionCount?: Int | null
}

export interface CollectionGroupSubscriptionPayload {
  mutation: MutationType
  node?: CollectionGroup | null
  updatedFields?: Array<String> | null
  previousValues?: CollectionGroupPreviousValues | null
}

export interface CollectionPreviousValues {
  id: ID_Output
  slug: String
  images: Json
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
}

export interface CollectionSubscriptionPayload {
  mutation: MutationType
  node?: Collection | null
  updatedFields?: Array<String> | null
  previousValues?: CollectionPreviousValues | null
}

export interface Color {
  id: ID_Output
  slug: String
  name: String
  colorCode: String
  hexCode: String
  productVariants?: Array<ProductVariant> | null
}

export interface ColorConnection {
  pageInfo: PageInfo
  edges: Array<ColorEdge | null>
  aggregate: AggregateColor
}

export interface ColorEdge {
  node: Color
  cursor: String
}

export interface ColorPreviousValues {
  id: ID_Output
  slug: String
  name: String
  colorCode: String
  hexCode: String
}

export interface ColorSubscriptionPayload {
  mutation: MutationType
  node?: Color | null
  updatedFields?: Array<String> | null
  previousValues?: ColorPreviousValues | null
}

export interface Customer {
  id: ID_Output
  user: User
  status?: CustomerStatus | null
  detail?: CustomerDetail | null
  billingInfo?: BillingInfo | null
  plan?: Plan | null
  reservations?: Array<Reservation> | null
}

export interface CustomerConnection {
  pageInfo: PageInfo
  edges: Array<CustomerEdge | null>
  aggregate: AggregateCustomer
}

export interface CustomerDetail {
  id: ID_Output
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  shippingAddress?: Location | null
  phoneOS?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface CustomerDetailConnection {
  pageInfo: PageInfo
  edges: Array<CustomerDetailEdge | null>
  aggregate: AggregateCustomerDetail
}

export interface CustomerDetailEdge {
  node: CustomerDetail
  cursor: String
}

export interface CustomerDetailPreviousValues {
  id: ID_Output
  phoneNumber?: String | null
  birthday?: DateTime | null
  height?: Int | null
  weight?: String | null
  bodyType?: String | null
  averageTopSize?: String | null
  averageWaistSize?: String | null
  averagePantLength?: String | null
  preferredPronouns?: String | null
  profession?: String | null
  partyFrequency?: String | null
  travelFrequency?: String | null
  shoppingFrequency?: String | null
  averageSpend?: String | null
  style?: String | null
  commuteStyle?: String | null
  phoneOS?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface CustomerDetailSubscriptionPayload {
  mutation: MutationType
  node?: CustomerDetail | null
  updatedFields?: Array<String> | null
  previousValues?: CustomerDetailPreviousValues | null
}

export interface CustomerEdge {
  node: Customer
  cursor: String
}

export interface CustomerPreviousValues {
  id: ID_Output
  status?: CustomerStatus | null
  plan?: Plan | null
}

export interface CustomerSubscriptionPayload {
  mutation: MutationType
  node?: Customer | null
  updatedFields?: Array<String> | null
  previousValues?: CustomerPreviousValues | null
}

export interface HomepageProductRail {
  id: ID_Output
  slug: String
  name: String
  products?: Array<Product> | null
}

export interface HomepageProductRailConnection {
  pageInfo: PageInfo
  edges: Array<HomepageProductRailEdge | null>
  aggregate: AggregateHomepageProductRail
}

export interface HomepageProductRailEdge {
  node: HomepageProductRail
  cursor: String
}

export interface HomepageProductRailPreviousValues {
  id: ID_Output
  slug: String
  name: String
}

export interface HomepageProductRailSubscriptionPayload {
  mutation: MutationType
  node?: HomepageProductRail | null
  updatedFields?: Array<String> | null
  previousValues?: HomepageProductRailPreviousValues | null
}

export interface Image {
  id: ID_Output
  caption?: String | null
  originalHeight?: Int | null
  originalUrl: String
  originalWidth?: Int | null
  resizedUrl: String
  title?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ImageConnection {
  pageInfo: PageInfo
  edges: Array<ImageEdge | null>
  aggregate: AggregateImage
}

export interface ImageEdge {
  node: Image
  cursor: String
}

export interface ImagePreviousValues {
  id: ID_Output
  caption?: String | null
  originalHeight?: Int | null
  originalUrl: String
  originalWidth?: Int | null
  resizedUrl: String
  title?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ImageSubscriptionPayload {
  mutation: MutationType
  node?: Image | null
  updatedFields?: Array<String> | null
  previousValues?: ImagePreviousValues | null
}

export interface Label {
  id: ID_Output
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelConnection {
  pageInfo: PageInfo
  edges: Array<LabelEdge | null>
  aggregate: AggregateLabel
}

export interface LabelEdge {
  node: Label
  cursor: String
}

export interface LabelPreviousValues {
  id: ID_Output
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

export interface LabelSubscriptionPayload {
  mutation: MutationType
  node?: Label | null
  updatedFields?: Array<String> | null
  previousValues?: LabelPreviousValues | null
}

export interface Location {
  id: ID_Output
  slug: String
  name: String
  company?: String | null
  description?: String | null
  address1: String
  address2?: String | null
  city: String
  state: String
  zipCode: String
  locationType?: LocationType | null
  user?: User | null
  lat?: Float | null
  lng?: Float | null
  physicalProducts?: Array<PhysicalProduct> | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface LocationConnection {
  pageInfo: PageInfo
  edges: Array<LocationEdge | null>
  aggregate: AggregateLocation
}

export interface LocationEdge {
  node: Location
  cursor: String
}

export interface LocationPreviousValues {
  id: ID_Output
  slug: String
  name: String
  company?: String | null
  description?: String | null
  address1: String
  address2?: String | null
  city: String
  state: String
  zipCode: String
  locationType?: LocationType | null
  lat?: Float | null
  lng?: Float | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface LocationSubscriptionPayload {
  mutation: MutationType
  node?: Location | null
  updatedFields?: Array<String> | null
  previousValues?: LocationPreviousValues | null
}

export interface Order {
  id: ID_Output
}

export interface OrderConnection {
  pageInfo: PageInfo
  edges: Array<OrderEdge | null>
  aggregate: AggregateOrder
}

export interface OrderEdge {
  node: Order
  cursor: String
}

export interface OrderPreviousValues {
  id: ID_Output
}

export interface OrderSubscriptionPayload {
  mutation: MutationType
  node?: Order | null
  updatedFields?: Array<String> | null
  previousValues?: OrderPreviousValues | null
}

export interface Package {
  id: ID_Output
  items?: Array<PhysicalProduct> | null
  shippingLabel: Label
  fromAddress: Location
  toAddress: Location
  weight?: Float | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PackageConnection {
  pageInfo: PageInfo
  edges: Array<PackageEdge | null>
  aggregate: AggregatePackage
}

export interface PackageEdge {
  node: Package
  cursor: String
}

export interface PackagePreviousValues {
  id: ID_Output
  weight?: Float | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PackageSubscriptionPayload {
  mutation: MutationType
  node?: Package | null
  updatedFields?: Array<String> | null
  previousValues?: PackagePreviousValues | null
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface PhysicalProduct {
  id: ID_Output
  seasonsUID: String
  location: Location
  productVariant: ProductVariant
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PhysicalProductConnection {
  pageInfo: PageInfo
  edges: Array<PhysicalProductEdge | null>
  aggregate: AggregatePhysicalProduct
}

export interface PhysicalProductEdge {
  node: PhysicalProduct
  cursor: String
}

export interface PhysicalProductPreviousValues {
  id: ID_Output
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PhysicalProductSubscriptionPayload {
  mutation: MutationType
  node?: PhysicalProduct | null
  updatedFields?: Array<String> | null
  previousValues?: PhysicalProductPreviousValues | null
}

export interface Product {
  id: ID_Output
  slug: String
  name: String
  brand: Brand
  category: Category
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  color: Color
  secondaryColor?: Color | null
  tags?: Json | null
  functions?: Array<ProductFunction> | null
  availableSizes: Array<Size>
  innerMaterials: Array<Material>
  outerMaterials: Array<Material>
  variants?: Array<ProductVariant> | null
  status?: ProductStatus | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductConnection {
  pageInfo: PageInfo
  edges: Array<ProductEdge | null>
  aggregate: AggregateProduct
}

export interface ProductEdge {
  node: Product
  cursor: String
}

export interface ProductFunction {
  id: ID_Output
  name?: String | null
}

export interface ProductFunctionConnection {
  pageInfo: PageInfo
  edges: Array<ProductFunctionEdge | null>
  aggregate: AggregateProductFunction
}

export interface ProductFunctionEdge {
  node: ProductFunction
  cursor: String
}

export interface ProductFunctionPreviousValues {
  id: ID_Output
  name?: String | null
}

export interface ProductFunctionSubscriptionPayload {
  mutation: MutationType
  node?: ProductFunction | null
  updatedFields?: Array<String> | null
  previousValues?: ProductFunctionPreviousValues | null
}

export interface ProductPreviousValues {
  id: ID_Output
  slug: String
  name: String
  description?: String | null
  externalURL?: String | null
  images: Json
  modelHeight?: Int | null
  modelSize?: Size | null
  retailPrice?: Int | null
  tags?: Json | null
  availableSizes: Array<Size>
  innerMaterials: Array<Material>
  outerMaterials: Array<Material>
  status?: ProductStatus | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductRequest {
  id: ID_Output
  brand?: String | null
  description?: String | null
  images: Array<String>
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason: String
  sku?: String | null
  url: String
  user: User
}

export interface ProductRequestConnection {
  pageInfo: PageInfo
  edges: Array<ProductRequestEdge | null>
  aggregate: AggregateProductRequest
}

export interface ProductRequestEdge {
  node: ProductRequest
  cursor: String
}

export interface ProductRequestPreviousValues {
  id: ID_Output
  brand?: String | null
  description?: String | null
  images: Array<String>
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason: String
  sku?: String | null
  url: String
}

export interface ProductRequestSubscriptionPayload {
  mutation: MutationType
  node?: ProductRequest | null
  updatedFields?: Array<String> | null
  previousValues?: ProductRequestPreviousValues | null
}

export interface ProductSubscriptionPayload {
  mutation: MutationType
  node?: Product | null
  updatedFields?: Array<String> | null
  previousValues?: ProductPreviousValues | null
}

export interface ProductVariant {
  id: ID_Output
  sku?: String | null
  color: Color
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  product: Product
  retailPrice?: Float | null
  physicalProducts?: Array<PhysicalProduct> | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductVariantConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantEdge | null>
  aggregate: AggregateProductVariant
}

export interface ProductVariantEdge {
  node: ProductVariant
  cursor: String
}

export interface ProductVariantPreviousValues {
  id: ID_Output
  sku?: String | null
  size: Size
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductVariantSubscriptionPayload {
  mutation: MutationType
  node?: ProductVariant | null
  updatedFields?: Array<String> | null
  previousValues?: ProductVariantPreviousValues | null
}

export interface Reservation {
  id: ID_Output
  user: User
  customer: Customer
  sentPackage?: Package | null
  returnedPackage?: Package | null
  location?: Location | null
  products?: Array<PhysicalProduct> | null
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationConnection {
  pageInfo: PageInfo
  edges: Array<ReservationEdge | null>
  aggregate: AggregateReservation
}

export interface ReservationEdge {
  node: Reservation
  cursor: String
}

export interface ReservationPreviousValues {
  id: ID_Output
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationSubscriptionPayload {
  mutation: MutationType
  node?: Reservation | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationPreviousValues | null
}

export interface User {
  id: ID_Output
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  createdAt: DateTime
  updatedAt: DateTime
}

export interface UserConnection {
  pageInfo: PageInfo
  edges: Array<UserEdge | null>
  aggregate: AggregateUser
}

export interface UserEdge {
  node: User
  cursor: String
}

export interface UserPreviousValues {
  id: ID_Output
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  createdAt: DateTime
  updatedAt: DateTime
}

export interface UserSubscriptionPayload {
  mutation: MutationType
  node?: User | null
  updatedFields?: Array<String> | null
  previousValues?: UserPreviousValues | null
}

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

export type DateTime = Date | string

/*
The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).
*/
export type Float = number

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID_Input = string | number
export type ID_Output = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.
*/
export type Int = number

export type Json = any

export type Long = string

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string