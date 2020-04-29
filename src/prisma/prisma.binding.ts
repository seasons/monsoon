import { GraphQLResolveInfo, GraphQLSchema } from 'graphql'
import { IResolvers } from 'graphql-tools/dist/Interfaces'
import { Options } from 'graphql-binding'
import { makePrismaBindingClass, BasePrismaOptions } from 'prisma-binding'

export interface Query {
    brands: <T = Array<Brand | null>>(args: { where?: BrandWhereInput | null, orderBy?: BrandOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionGroups: <T = Array<CollectionGroup | null>>(args: { where?: CollectionGroupWhereInput | null, orderBy?: CollectionGroupOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    homepageProductRails: <T = Array<HomepageProductRail | null>>(args: { where?: HomepageProductRailWhereInput | null, orderBy?: HomepageProductRailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    images: <T = Array<Image | null>>(args: { where?: ImageWhereInput | null, orderBy?: ImageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productModels: <T = Array<ProductModel | null>>(args: { where?: ProductModelWhereInput | null, orderBy?: ProductModelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bagItems: <T = Array<BagItem | null>>(args: { where?: BagItemWhereInput | null, orderBy?: BagItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    recentlyViewedProducts: <T = Array<RecentlyViewedProduct | null>>(args: { where?: RecentlyViewedProductWhereInput | null, orderBy?: RecentlyViewedProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    orders: <T = Array<Order | null>>(args: { where?: OrderWhereInput | null, orderBy?: OrderOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequests: <T = Array<ProductRequest | null>>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantWants: <T = Array<ProductVariantWant | null>>(args: { where?: ProductVariantWantWhereInput | null, orderBy?: ProductVariantWantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationFeedbacks: <T = Array<ReservationFeedback | null>>(args: { where?: ReservationFeedbackWhereInput | null, orderBy?: ReservationFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbacks: <T = Array<ProductVariantFeedback | null>>(args: { where?: ProductVariantFeedbackWhereInput | null, orderBy?: ProductVariantFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbackQuestions: <T = Array<ProductVariantFeedbackQuestion | null>>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null, orderBy?: ProductVariantFeedbackQuestionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collections: <T = Array<Collection | null>>(args: { where?: CollectionWhereInput | null, orderBy?: CollectionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    categories: <T = Array<Category | null>>(args: { where?: CategoryWhereInput | null, orderBy?: CategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customerDetails: <T = Array<CustomerDetail | null>>(args: { where?: CustomerDetailWhereInput | null, orderBy?: CustomerDetailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    billingInfoes: <T = Array<BillingInfo | null>>(args: { where?: BillingInfoWhereInput | null, orderBy?: BillingInfoOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    locations: <T = Array<Location | null>>(args: { where?: LocationWhereInput | null, orderBy?: LocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packages: <T = Array<Package | null>>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    sizes: <T = Array<Size | null>>(args: { where?: SizeWhereInput | null, orderBy?: SizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunctions: <T = Array<ProductFunction | null>>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    colors: <T = Array<Color | null>>(args: { where?: ColorWhereInput | null, orderBy?: ColorOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    topSizes: <T = Array<TopSize | null>>(args: { where?: TopSizeWhereInput | null, orderBy?: TopSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customers: <T = Array<Customer | null>>(args: { where?: CustomerWhereInput | null, orderBy?: CustomerOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bottomSizes: <T = Array<BottomSize | null>>(args: { where?: BottomSizeWhereInput | null, orderBy?: BottomSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    labels: <T = Array<Label | null>>(args: { where?: LabelWhereInput | null, orderBy?: LabelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProducts: <T = Array<PhysicalProduct | null>>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariants: <T = Array<ProductVariant | null>>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    products: <T = Array<Product | null>>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservations: <T = Array<Reservation | null>>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    users: <T = Array<User | null>>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    brand: <T = Brand | null>(args: { where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    collectionGroup: <T = CollectionGroup | null>(args: { where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    homepageProductRail: <T = HomepageProductRail | null>(args: { where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    image: <T = Image | null>(args: { where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productModel: <T = ProductModel | null>(args: { where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    bagItem: <T = BagItem | null>(args: { where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    recentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    order: <T = Order | null>(args: { where: OrderWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantWant: <T = ProductVariantWant | null>(args: { where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservationFeedback: <T = ReservationFeedback | null>(args: { where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantFeedback: <T = ProductVariantFeedback | null>(args: { where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    collection: <T = Collection | null>(args: { where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    category: <T = Category | null>(args: { where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    customerDetail: <T = CustomerDetail | null>(args: { where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    billingInfo: <T = BillingInfo | null>(args: { where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    location: <T = Location | null>(args: { where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    package: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    size: <T = Size | null>(args: { where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productFunction: <T = ProductFunction | null>(args: { where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    color: <T = Color | null>(args: { where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    topSize: <T = TopSize | null>(args: { where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    customer: <T = Customer | null>(args: { where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    bottomSize: <T = BottomSize | null>(args: { where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    label: <T = Label | null>(args: { where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    physicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    product: <T = Product | null>(args: { where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    user: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    brandsConnection: <T = BrandConnection>(args: { where?: BrandWhereInput | null, orderBy?: BrandOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionGroupsConnection: <T = CollectionGroupConnection>(args: { where?: CollectionGroupWhereInput | null, orderBy?: CollectionGroupOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    homepageProductRailsConnection: <T = HomepageProductRailConnection>(args: { where?: HomepageProductRailWhereInput | null, orderBy?: HomepageProductRailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    imagesConnection: <T = ImageConnection>(args: { where?: ImageWhereInput | null, orderBy?: ImageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productModelsConnection: <T = ProductModelConnection>(args: { where?: ProductModelWhereInput | null, orderBy?: ProductModelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bagItemsConnection: <T = BagItemConnection>(args: { where?: BagItemWhereInput | null, orderBy?: BagItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    recentlyViewedProductsConnection: <T = RecentlyViewedProductConnection>(args: { where?: RecentlyViewedProductWhereInput | null, orderBy?: RecentlyViewedProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    ordersConnection: <T = OrderConnection>(args: { where?: OrderWhereInput | null, orderBy?: OrderOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequestsConnection: <T = ProductRequestConnection>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantWantsConnection: <T = ProductVariantWantConnection>(args: { where?: ProductVariantWantWhereInput | null, orderBy?: ProductVariantWantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationFeedbacksConnection: <T = ReservationFeedbackConnection>(args: { where?: ReservationFeedbackWhereInput | null, orderBy?: ReservationFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbacksConnection: <T = ProductVariantFeedbackConnection>(args: { where?: ProductVariantFeedbackWhereInput | null, orderBy?: ProductVariantFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbackQuestionsConnection: <T = ProductVariantFeedbackQuestionConnection>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null, orderBy?: ProductVariantFeedbackQuestionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    collectionsConnection: <T = CollectionConnection>(args: { where?: CollectionWhereInput | null, orderBy?: CollectionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    categoriesConnection: <T = CategoryConnection>(args: { where?: CategoryWhereInput | null, orderBy?: CategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customerDetailsConnection: <T = CustomerDetailConnection>(args: { where?: CustomerDetailWhereInput | null, orderBy?: CustomerDetailOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    billingInfoesConnection: <T = BillingInfoConnection>(args: { where?: BillingInfoWhereInput | null, orderBy?: BillingInfoOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    locationsConnection: <T = LocationConnection>(args: { where?: LocationWhereInput | null, orderBy?: LocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packagesConnection: <T = PackageConnection>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    sizesConnection: <T = SizeConnection>(args: { where?: SizeWhereInput | null, orderBy?: SizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunctionsConnection: <T = ProductFunctionConnection>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    colorsConnection: <T = ColorConnection>(args: { where?: ColorWhereInput | null, orderBy?: ColorOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    topSizesConnection: <T = TopSizeConnection>(args: { where?: TopSizeWhereInput | null, orderBy?: TopSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customersConnection: <T = CustomerConnection>(args: { where?: CustomerWhereInput | null, orderBy?: CustomerOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bottomSizesConnection: <T = BottomSizeConnection>(args: { where?: BottomSizeWhereInput | null, orderBy?: BottomSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    labelsConnection: <T = LabelConnection>(args: { where?: LabelWhereInput | null, orderBy?: LabelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProductsConnection: <T = PhysicalProductConnection>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantsConnection: <T = ProductVariantConnection>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productsConnection: <T = ProductConnection>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationsConnection: <T = ReservationConnection>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    usersConnection: <T = UserConnection>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    node: <T = Node | null>(args: { id: ID_Output }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> 
  }

export interface Mutation {
    createBrand: <T = Brand>(args: { data: BrandCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCollectionGroup: <T = CollectionGroup>(args: { data: CollectionGroupCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createHomepageProductRail: <T = HomepageProductRail>(args: { data: HomepageProductRailCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createImage: <T = Image>(args: { data: ImageCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductModel: <T = ProductModel>(args: { data: ProductModelCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createBagItem: <T = BagItem>(args: { data: BagItemCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createRecentlyViewedProduct: <T = RecentlyViewedProduct>(args: { data: RecentlyViewedProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createOrder: <T = Order>(args: { data: OrderCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductRequest: <T = ProductRequest>(args: { data: ProductRequestCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantWant: <T = ProductVariantWant>(args: { data: ProductVariantWantCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservationFeedback: <T = ReservationFeedback>(args: { data: ReservationFeedbackCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantFeedback: <T = ProductVariantFeedback>(args: { data: ProductVariantFeedbackCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion>(args: { data: ProductVariantFeedbackQuestionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCollection: <T = Collection>(args: { data: CollectionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCategory: <T = Category>(args: { data: CategoryCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCustomerDetail: <T = CustomerDetail>(args: { data: CustomerDetailCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createBillingInfo: <T = BillingInfo>(args: { data: BillingInfoCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createLocation: <T = Location>(args: { data: LocationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPackage: <T = Package>(args: { data: PackageCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createSize: <T = Size>(args: { data: SizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductFunction: <T = ProductFunction>(args: { data: ProductFunctionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createColor: <T = Color>(args: { data: ColorCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createTopSize: <T = TopSize>(args: { data: TopSizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createCustomer: <T = Customer>(args: { data: CustomerCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createBottomSize: <T = BottomSize>(args: { data: BottomSizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createLabel: <T = Label>(args: { data: LabelCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPhysicalProduct: <T = PhysicalProduct>(args: { data: PhysicalProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariant: <T = ProductVariant>(args: { data: ProductVariantCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProduct: <T = Product>(args: { data: ProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservation: <T = Reservation>(args: { data: ReservationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createUser: <T = User>(args: { data: UserCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateBrand: <T = Brand | null>(args: { data: BrandUpdateInput, where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateCollectionGroup: <T = CollectionGroup | null>(args: { data: CollectionGroupUpdateInput, where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateHomepageProductRail: <T = HomepageProductRail | null>(args: { data: HomepageProductRailUpdateInput, where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateImage: <T = Image | null>(args: { data: ImageUpdateInput, where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductModel: <T = ProductModel | null>(args: { data: ProductModelUpdateInput, where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateBagItem: <T = BagItem | null>(args: { data: BagItemUpdateInput, where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateRecentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { data: RecentlyViewedProductUpdateInput, where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductRequest: <T = ProductRequest | null>(args: { data: ProductRequestUpdateInput, where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductVariantWant: <T = ProductVariantWant | null>(args: { data: ProductVariantWantUpdateInput, where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateReservationFeedback: <T = ReservationFeedback | null>(args: { data: ReservationFeedbackUpdateInput, where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductVariantFeedback: <T = ProductVariantFeedback | null>(args: { data: ProductVariantFeedbackUpdateInput, where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { data: ProductVariantFeedbackQuestionUpdateInput, where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateCollection: <T = Collection | null>(args: { data: CollectionUpdateInput, where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateCategory: <T = Category | null>(args: { data: CategoryUpdateInput, where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateCustomerDetail: <T = CustomerDetail | null>(args: { data: CustomerDetailUpdateInput, where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateBillingInfo: <T = BillingInfo | null>(args: { data: BillingInfoUpdateInput, where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateLocation: <T = Location | null>(args: { data: LocationUpdateInput, where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updatePackage: <T = Package | null>(args: { data: PackageUpdateInput, where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateSize: <T = Size | null>(args: { data: SizeUpdateInput, where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductFunction: <T = ProductFunction | null>(args: { data: ProductFunctionUpdateInput, where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateColor: <T = Color | null>(args: { data: ColorUpdateInput, where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateTopSize: <T = TopSize | null>(args: { data: TopSizeUpdateInput, where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateCustomer: <T = Customer | null>(args: { data: CustomerUpdateInput, where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateBottomSize: <T = BottomSize | null>(args: { data: BottomSizeUpdateInput, where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateLabel: <T = Label | null>(args: { data: LabelUpdateInput, where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updatePhysicalProduct: <T = PhysicalProduct | null>(args: { data: PhysicalProductUpdateInput, where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProductVariant: <T = ProductVariant | null>(args: { data: ProductVariantUpdateInput, where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateProduct: <T = Product | null>(args: { data: ProductUpdateInput, where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateReservation: <T = Reservation | null>(args: { data: ReservationUpdateInput, where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateUser: <T = User | null>(args: { data: UserUpdateInput, where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteBrand: <T = Brand | null>(args: { where: BrandWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteCollectionGroup: <T = CollectionGroup | null>(args: { where: CollectionGroupWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteHomepageProductRail: <T = HomepageProductRail | null>(args: { where: HomepageProductRailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteImage: <T = Image | null>(args: { where: ImageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductModel: <T = ProductModel | null>(args: { where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteBagItem: <T = BagItem | null>(args: { where: BagItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteRecentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteOrder: <T = Order | null>(args: { where: OrderWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductVariantWant: <T = ProductVariantWant | null>(args: { where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteReservationFeedback: <T = ReservationFeedback | null>(args: { where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductVariantFeedback: <T = ProductVariantFeedback | null>(args: { where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteCollection: <T = Collection | null>(args: { where: CollectionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteCategory: <T = Category | null>(args: { where: CategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteCustomerDetail: <T = CustomerDetail | null>(args: { where: CustomerDetailWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteBillingInfo: <T = BillingInfo | null>(args: { where: BillingInfoWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteLocation: <T = Location | null>(args: { where: LocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deletePackage: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteSize: <T = Size | null>(args: { where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductFunction: <T = ProductFunction | null>(args: { where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteColor: <T = Color | null>(args: { where: ColorWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteTopSize: <T = TopSize | null>(args: { where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteCustomer: <T = Customer | null>(args: { where: CustomerWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteBottomSize: <T = BottomSize | null>(args: { where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteLabel: <T = Label | null>(args: { where: LabelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deletePhysicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProductVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteProduct: <T = Product | null>(args: { where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteReservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteUser: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    upsertBrand: <T = Brand>(args: { where: BrandWhereUniqueInput, create: BrandCreateInput, update: BrandUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCollectionGroup: <T = CollectionGroup>(args: { where: CollectionGroupWhereUniqueInput, create: CollectionGroupCreateInput, update: CollectionGroupUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertHomepageProductRail: <T = HomepageProductRail>(args: { where: HomepageProductRailWhereUniqueInput, create: HomepageProductRailCreateInput, update: HomepageProductRailUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertImage: <T = Image>(args: { where: ImageWhereUniqueInput, create: ImageCreateInput, update: ImageUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductModel: <T = ProductModel>(args: { where: ProductModelWhereUniqueInput, create: ProductModelCreateInput, update: ProductModelUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBagItem: <T = BagItem>(args: { where: BagItemWhereUniqueInput, create: BagItemCreateInput, update: BagItemUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertRecentlyViewedProduct: <T = RecentlyViewedProduct>(args: { where: RecentlyViewedProductWhereUniqueInput, create: RecentlyViewedProductCreateInput, update: RecentlyViewedProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductRequest: <T = ProductRequest>(args: { where: ProductRequestWhereUniqueInput, create: ProductRequestCreateInput, update: ProductRequestUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantWant: <T = ProductVariantWant>(args: { where: ProductVariantWantWhereUniqueInput, create: ProductVariantWantCreateInput, update: ProductVariantWantUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservationFeedback: <T = ReservationFeedback>(args: { where: ReservationFeedbackWhereUniqueInput, create: ReservationFeedbackCreateInput, update: ReservationFeedbackUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantFeedback: <T = ProductVariantFeedback>(args: { where: ProductVariantFeedbackWhereUniqueInput, create: ProductVariantFeedbackCreateInput, update: ProductVariantFeedbackUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput, create: ProductVariantFeedbackQuestionCreateInput, update: ProductVariantFeedbackQuestionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCollection: <T = Collection>(args: { where: CollectionWhereUniqueInput, create: CollectionCreateInput, update: CollectionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCategory: <T = Category>(args: { where: CategoryWhereUniqueInput, create: CategoryCreateInput, update: CategoryUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCustomerDetail: <T = CustomerDetail>(args: { where: CustomerDetailWhereUniqueInput, create: CustomerDetailCreateInput, update: CustomerDetailUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBillingInfo: <T = BillingInfo>(args: { where: BillingInfoWhereUniqueInput, create: BillingInfoCreateInput, update: BillingInfoUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertLocation: <T = Location>(args: { where: LocationWhereUniqueInput, create: LocationCreateInput, update: LocationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPackage: <T = Package>(args: { where: PackageWhereUniqueInput, create: PackageCreateInput, update: PackageUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertSize: <T = Size>(args: { where: SizeWhereUniqueInput, create: SizeCreateInput, update: SizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductFunction: <T = ProductFunction>(args: { where: ProductFunctionWhereUniqueInput, create: ProductFunctionCreateInput, update: ProductFunctionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertColor: <T = Color>(args: { where: ColorWhereUniqueInput, create: ColorCreateInput, update: ColorUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertTopSize: <T = TopSize>(args: { where: TopSizeWhereUniqueInput, create: TopSizeCreateInput, update: TopSizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCustomer: <T = Customer>(args: { where: CustomerWhereUniqueInput, create: CustomerCreateInput, update: CustomerUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBottomSize: <T = BottomSize>(args: { where: BottomSizeWhereUniqueInput, create: BottomSizeCreateInput, update: BottomSizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertLabel: <T = Label>(args: { where: LabelWhereUniqueInput, create: LabelCreateInput, update: LabelUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPhysicalProduct: <T = PhysicalProduct>(args: { where: PhysicalProductWhereUniqueInput, create: PhysicalProductCreateInput, update: PhysicalProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariant: <T = ProductVariant>(args: { where: ProductVariantWhereUniqueInput, create: ProductVariantCreateInput, update: ProductVariantUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProduct: <T = Product>(args: { where: ProductWhereUniqueInput, create: ProductCreateInput, update: ProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservation: <T = Reservation>(args: { where: ReservationWhereUniqueInput, create: ReservationCreateInput, update: ReservationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertUser: <T = User>(args: { where: UserWhereUniqueInput, create: UserCreateInput, update: UserUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyBrands: <T = BatchPayload>(args: { data: BrandUpdateManyMutationInput, where?: BrandWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyCollectionGroups: <T = BatchPayload>(args: { data: CollectionGroupUpdateManyMutationInput, where?: CollectionGroupWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyHomepageProductRails: <T = BatchPayload>(args: { data: HomepageProductRailUpdateManyMutationInput, where?: HomepageProductRailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyImages: <T = BatchPayload>(args: { data: ImageUpdateManyMutationInput, where?: ImageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductModels: <T = BatchPayload>(args: { data: ProductModelUpdateManyMutationInput, where?: ProductModelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyBagItems: <T = BatchPayload>(args: { data: BagItemUpdateManyMutationInput, where?: BagItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyRecentlyViewedProducts: <T = BatchPayload>(args: { data: RecentlyViewedProductUpdateManyMutationInput, where?: RecentlyViewedProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductRequests: <T = BatchPayload>(args: { data: ProductRequestUpdateManyMutationInput, where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductVariantWants: <T = BatchPayload>(args: { data: ProductVariantWantUpdateManyMutationInput, where?: ProductVariantWantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyReservationFeedbacks: <T = BatchPayload>(args: { data: ReservationFeedbackUpdateManyMutationInput, where?: ReservationFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductVariantFeedbacks: <T = BatchPayload>(args: { data: ProductVariantFeedbackUpdateManyMutationInput, where?: ProductVariantFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductVariantFeedbackQuestions: <T = BatchPayload>(args: { data: ProductVariantFeedbackQuestionUpdateManyMutationInput, where?: ProductVariantFeedbackQuestionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyCollections: <T = BatchPayload>(args: { data: CollectionUpdateManyMutationInput, where?: CollectionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyCategories: <T = BatchPayload>(args: { data: CategoryUpdateManyMutationInput, where?: CategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyCustomerDetails: <T = BatchPayload>(args: { data: CustomerDetailUpdateManyMutationInput, where?: CustomerDetailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyBillingInfoes: <T = BatchPayload>(args: { data: BillingInfoUpdateManyMutationInput, where?: BillingInfoWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyLocations: <T = BatchPayload>(args: { data: LocationUpdateManyMutationInput, where?: LocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyPackages: <T = BatchPayload>(args: { data: PackageUpdateManyMutationInput, where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManySizes: <T = BatchPayload>(args: { data: SizeUpdateManyMutationInput, where?: SizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductFunctions: <T = BatchPayload>(args: { data: ProductFunctionUpdateManyMutationInput, where?: ProductFunctionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyColors: <T = BatchPayload>(args: { data: ColorUpdateManyMutationInput, where?: ColorWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyTopSizes: <T = BatchPayload>(args: { data: TopSizeUpdateManyMutationInput, where?: TopSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyCustomers: <T = BatchPayload>(args: { data: CustomerUpdateManyMutationInput, where?: CustomerWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyBottomSizes: <T = BatchPayload>(args: { data: BottomSizeUpdateManyMutationInput, where?: BottomSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyLabels: <T = BatchPayload>(args: { data: LabelUpdateManyMutationInput, where?: LabelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyPhysicalProducts: <T = BatchPayload>(args: { data: PhysicalProductUpdateManyMutationInput, where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProductVariants: <T = BatchPayload>(args: { data: ProductVariantUpdateManyMutationInput, where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyProducts: <T = BatchPayload>(args: { data: ProductUpdateManyMutationInput, where?: ProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyReservations: <T = BatchPayload>(args: { data: ReservationUpdateManyMutationInput, where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateManyUsers: <T = BatchPayload>(args: { data: UserUpdateManyMutationInput, where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyBrands: <T = BatchPayload>(args: { where?: BrandWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyCollectionGroups: <T = BatchPayload>(args: { where?: CollectionGroupWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyHomepageProductRails: <T = BatchPayload>(args: { where?: HomepageProductRailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyImages: <T = BatchPayload>(args: { where?: ImageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductModels: <T = BatchPayload>(args: { where?: ProductModelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyBagItems: <T = BatchPayload>(args: { where?: BagItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyRecentlyViewedProducts: <T = BatchPayload>(args: { where?: RecentlyViewedProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyOrders: <T = BatchPayload>(args: { where?: OrderWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductRequests: <T = BatchPayload>(args: { where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductVariantWants: <T = BatchPayload>(args: { where?: ProductVariantWantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyReservationFeedbacks: <T = BatchPayload>(args: { where?: ReservationFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductVariantFeedbacks: <T = BatchPayload>(args: { where?: ProductVariantFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductVariantFeedbackQuestions: <T = BatchPayload>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyCollections: <T = BatchPayload>(args: { where?: CollectionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyCategories: <T = BatchPayload>(args: { where?: CategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyCustomerDetails: <T = BatchPayload>(args: { where?: CustomerDetailWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyBillingInfoes: <T = BatchPayload>(args: { where?: BillingInfoWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyLocations: <T = BatchPayload>(args: { where?: LocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyPackages: <T = BatchPayload>(args: { where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManySizes: <T = BatchPayload>(args: { where?: SizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductFunctions: <T = BatchPayload>(args: { where?: ProductFunctionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyColors: <T = BatchPayload>(args: { where?: ColorWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyTopSizes: <T = BatchPayload>(args: { where?: TopSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyCustomers: <T = BatchPayload>(args: { where?: CustomerWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyBottomSizes: <T = BatchPayload>(args: { where?: BottomSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyLabels: <T = BatchPayload>(args: { where?: LabelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyPhysicalProducts: <T = BatchPayload>(args: { where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProductVariants: <T = BatchPayload>(args: { where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyProducts: <T = BatchPayload>(args: { where?: ProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyReservations: <T = BatchPayload>(args: { where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteManyUsers: <T = BatchPayload>(args: { where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Subscription {
    brand: <T = BrandSubscriptionPayload | null>(args: { where?: BrandSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collectionGroup: <T = CollectionGroupSubscriptionPayload | null>(args: { where?: CollectionGroupSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    homepageProductRail: <T = HomepageProductRailSubscriptionPayload | null>(args: { where?: HomepageProductRailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    image: <T = ImageSubscriptionPayload | null>(args: { where?: ImageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productModel: <T = ProductModelSubscriptionPayload | null>(args: { where?: ProductModelSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    bagItem: <T = BagItemSubscriptionPayload | null>(args: { where?: BagItemSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    recentlyViewedProduct: <T = RecentlyViewedProductSubscriptionPayload | null>(args: { where?: RecentlyViewedProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    order: <T = OrderSubscriptionPayload | null>(args: { where?: OrderSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productRequest: <T = ProductRequestSubscriptionPayload | null>(args: { where?: ProductRequestSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantWant: <T = ProductVariantWantSubscriptionPayload | null>(args: { where?: ProductVariantWantSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservationFeedback: <T = ReservationFeedbackSubscriptionPayload | null>(args: { where?: ReservationFeedbackSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantFeedback: <T = ProductVariantFeedbackSubscriptionPayload | null>(args: { where?: ProductVariantFeedbackSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestionSubscriptionPayload | null>(args: { where?: ProductVariantFeedbackQuestionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collection: <T = CollectionSubscriptionPayload | null>(args: { where?: CollectionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    category: <T = CategorySubscriptionPayload | null>(args: { where?: CategorySubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customerDetail: <T = CustomerDetailSubscriptionPayload | null>(args: { where?: CustomerDetailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    billingInfo: <T = BillingInfoSubscriptionPayload | null>(args: { where?: BillingInfoSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    location: <T = LocationSubscriptionPayload | null>(args: { where?: LocationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    package: <T = PackageSubscriptionPayload | null>(args: { where?: PackageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    size: <T = SizeSubscriptionPayload | null>(args: { where?: SizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productFunction: <T = ProductFunctionSubscriptionPayload | null>(args: { where?: ProductFunctionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    color: <T = ColorSubscriptionPayload | null>(args: { where?: ColorSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    topSize: <T = TopSizeSubscriptionPayload | null>(args: { where?: TopSizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customer: <T = CustomerSubscriptionPayload | null>(args: { where?: CustomerSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    bottomSize: <T = BottomSizeSubscriptionPayload | null>(args: { where?: BottomSizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    label: <T = LabelSubscriptionPayload | null>(args: { where?: LabelSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    physicalProduct: <T = PhysicalProductSubscriptionPayload | null>(args: { where?: PhysicalProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariant: <T = ProductVariantSubscriptionPayload | null>(args: { where?: ProductVariantSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    product: <T = ProductSubscriptionPayload | null>(args: { where?: ProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservation: <T = ReservationSubscriptionPayload | null>(args: { where?: ReservationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    user: <T = UserSubscriptionPayload | null>(args: { where?: UserSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> 
  }

export interface Exists {
  Brand: (where?: BrandWhereInput) => Promise<boolean>
  CollectionGroup: (where?: CollectionGroupWhereInput) => Promise<boolean>
  HomepageProductRail: (where?: HomepageProductRailWhereInput) => Promise<boolean>
  Image: (where?: ImageWhereInput) => Promise<boolean>
  ProductModel: (where?: ProductModelWhereInput) => Promise<boolean>
  BagItem: (where?: BagItemWhereInput) => Promise<boolean>
  RecentlyViewedProduct: (where?: RecentlyViewedProductWhereInput) => Promise<boolean>
  Order: (where?: OrderWhereInput) => Promise<boolean>
  ProductRequest: (where?: ProductRequestWhereInput) => Promise<boolean>
  ProductVariantWant: (where?: ProductVariantWantWhereInput) => Promise<boolean>
  ReservationFeedback: (where?: ReservationFeedbackWhereInput) => Promise<boolean>
  ProductVariantFeedback: (where?: ProductVariantFeedbackWhereInput) => Promise<boolean>
  ProductVariantFeedbackQuestion: (where?: ProductVariantFeedbackQuestionWhereInput) => Promise<boolean>
  Collection: (where?: CollectionWhereInput) => Promise<boolean>
  Category: (where?: CategoryWhereInput) => Promise<boolean>
  CustomerDetail: (where?: CustomerDetailWhereInput) => Promise<boolean>
  BillingInfo: (where?: BillingInfoWhereInput) => Promise<boolean>
  Location: (where?: LocationWhereInput) => Promise<boolean>
  Package: (where?: PackageWhereInput) => Promise<boolean>
  Size: (where?: SizeWhereInput) => Promise<boolean>
  ProductFunction: (where?: ProductFunctionWhereInput) => Promise<boolean>
  Color: (where?: ColorWhereInput) => Promise<boolean>
  TopSize: (where?: TopSizeWhereInput) => Promise<boolean>
  Customer: (where?: CustomerWhereInput) => Promise<boolean>
  BottomSize: (where?: BottomSizeWhereInput) => Promise<boolean>
  Label: (where?: LabelWhereInput) => Promise<boolean>
  PhysicalProduct: (where?: PhysicalProductWhereInput) => Promise<boolean>
  ProductVariant: (where?: ProductVariantWhereInput) => Promise<boolean>
  Product: (where?: ProductWhereInput) => Promise<boolean>
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

type AggregateBottomSize {
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

type AggregateProductModel {
  count: Int!
}

type AggregateProductRequest {
  count: Int!
}

type AggregateProductVariant {
  count: Int!
}

type AggregateProductVariantFeedback {
  count: Int!
}

type AggregateProductVariantFeedbackQuestion {
  count: Int!
}

type AggregateProductVariantWant {
  count: Int!
}

type AggregateRecentlyViewedProduct {
  count: Int!
}

type AggregateReservation {
  count: Int!
}

type AggregateReservationFeedback {
  count: Int!
}

type AggregateSize {
  count: Int!
}

type AggregateTopSize {
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
  customer: CustomerCreateOneWithoutBagItemsInput!
  productVariant: ProductVariantCreateOneInput!
}

input BagItemCreateManyWithoutCustomerInput {
  create: [BagItemCreateWithoutCustomerInput!]
  connect: [BagItemWhereUniqueInput!]
}

input BagItemCreateWithoutCustomerInput {
  id: ID
  position: Int
  saved: Boolean
  status: BagItemStatus!
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

input BagItemScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [BagItemScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [BagItemScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BagItemScalarWhereInput!]
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
  customer: CustomerUpdateOneRequiredWithoutBagItemsInput
  productVariant: ProductVariantUpdateOneRequiredInput
}

input BagItemUpdateManyDataInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
}

input BagItemUpdateManyMutationInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
}

input BagItemUpdateManyWithoutCustomerInput {
  create: [BagItemCreateWithoutCustomerInput!]
  connect: [BagItemWhereUniqueInput!]
  set: [BagItemWhereUniqueInput!]
  disconnect: [BagItemWhereUniqueInput!]
  delete: [BagItemWhereUniqueInput!]
  update: [BagItemUpdateWithWhereUniqueWithoutCustomerInput!]
  updateMany: [BagItemUpdateManyWithWhereNestedInput!]
  deleteMany: [BagItemScalarWhereInput!]
  upsert: [BagItemUpsertWithWhereUniqueWithoutCustomerInput!]
}

input BagItemUpdateManyWithWhereNestedInput {
  where: BagItemScalarWhereInput!
  data: BagItemUpdateManyDataInput!
}

input BagItemUpdateWithoutCustomerDataInput {
  position: Int
  saved: Boolean
  status: BagItemStatus
  productVariant: ProductVariantUpdateOneRequiredInput
}

input BagItemUpdateWithWhereUniqueWithoutCustomerInput {
  where: BagItemWhereUniqueInput!
  data: BagItemUpdateWithoutCustomerDataInput!
}

input BagItemUpsertWithWhereUniqueWithoutCustomerInput {
  where: BagItemWhereUniqueInput!
  update: BagItemUpdateWithoutCustomerDataInput!
  create: BagItemCreateWithoutCustomerInput!
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

type BottomSize implements Node {
  id: ID!
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

"""A connection to a list of items."""
type BottomSizeConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [BottomSizeEdge]!
  aggregate: AggregateBottomSize!
}

input BottomSizeCreateInput {
  id: ID
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

input BottomSizeCreateOneInput {
  create: BottomSizeCreateInput
  connect: BottomSizeWhereUniqueInput
}

"""An edge in a connection."""
type BottomSizeEdge {
  """The item at the end of the edge."""
  node: BottomSize!

  """A cursor for use in pagination."""
  cursor: String!
}

enum BottomSizeOrderByInput {
  id_ASC
  id_DESC
  type_ASC
  type_DESC
  value_ASC
  value_DESC
  waist_ASC
  waist_DESC
  rise_ASC
  rise_DESC
  hem_ASC
  hem_DESC
  inseam_ASC
  inseam_DESC
}

type BottomSizePreviousValues {
  id: ID!
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

type BottomSizeSubscriptionPayload {
  mutation: MutationType!
  node: BottomSize
  updatedFields: [String!]
  previousValues: BottomSizePreviousValues
}

input BottomSizeSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [BottomSizeSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [BottomSizeSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BottomSizeSubscriptionWhereInput!]

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
  node: BottomSizeWhereInput
}

enum BottomSizeType {
  WxL
  US
  EU
  JP
  Letter
}

input BottomSizeUpdateDataInput {
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

input BottomSizeUpdateInput {
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

input BottomSizeUpdateManyMutationInput {
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

input BottomSizeUpdateOneInput {
  create: BottomSizeCreateInput
  connect: BottomSizeWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: BottomSizeUpdateDataInput
  upsert: BottomSizeUpsertNestedInput
}

input BottomSizeUpsertNestedInput {
  update: BottomSizeUpdateDataInput!
  create: BottomSizeCreateInput!
}

input BottomSizeWhereInput {
  """Logical AND on all given filters."""
  AND: [BottomSizeWhereInput!]

  """Logical OR on all given filters."""
  OR: [BottomSizeWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [BottomSizeWhereInput!]
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
  type: BottomSizeType

  """All values that are not equal to given value."""
  type_not: BottomSizeType

  """All values that are contained in given list."""
  type_in: [BottomSizeType!]

  """All values that are not contained in given list."""
  type_not_in: [BottomSizeType!]
  value: String

  """All values that are not equal to given value."""
  value_not: String

  """All values that are contained in given list."""
  value_in: [String!]

  """All values that are not contained in given list."""
  value_not_in: [String!]

  """All values less than the given value."""
  value_lt: String

  """All values less than or equal the given value."""
  value_lte: String

  """All values greater than the given value."""
  value_gt: String

  """All values greater than or equal the given value."""
  value_gte: String

  """All values containing the given string."""
  value_contains: String

  """All values not containing the given string."""
  value_not_contains: String

  """All values starting with the given string."""
  value_starts_with: String

  """All values not starting with the given string."""
  value_not_starts_with: String

  """All values ending with the given string."""
  value_ends_with: String

  """All values not ending with the given string."""
  value_not_ends_with: String
  waist: Float

  """All values that are not equal to given value."""
  waist_not: Float

  """All values that are contained in given list."""
  waist_in: [Float!]

  """All values that are not contained in given list."""
  waist_not_in: [Float!]

  """All values less than the given value."""
  waist_lt: Float

  """All values less than or equal the given value."""
  waist_lte: Float

  """All values greater than the given value."""
  waist_gt: Float

  """All values greater than or equal the given value."""
  waist_gte: Float
  rise: Float

  """All values that are not equal to given value."""
  rise_not: Float

  """All values that are contained in given list."""
  rise_in: [Float!]

  """All values that are not contained in given list."""
  rise_not_in: [Float!]

  """All values less than the given value."""
  rise_lt: Float

  """All values less than or equal the given value."""
  rise_lte: Float

  """All values greater than the given value."""
  rise_gt: Float

  """All values greater than or equal the given value."""
  rise_gte: Float
  hem: Float

  """All values that are not equal to given value."""
  hem_not: Float

  """All values that are contained in given list."""
  hem_in: [Float!]

  """All values that are not contained in given list."""
  hem_not_in: [Float!]

  """All values less than the given value."""
  hem_lt: Float

  """All values less than or equal the given value."""
  hem_lte: Float

  """All values greater than the given value."""
  hem_gt: Float

  """All values greater than or equal the given value."""
  hem_gte: Float
  inseam: Float

  """All values that are not equal to given value."""
  inseam_not: Float

  """All values that are contained in given list."""
  inseam_in: [Float!]

  """All values that are not contained in given list."""
  inseam_not_in: [Float!]

  """All values less than the given value."""
  inseam_lt: Float

  """All values less than or equal the given value."""
  inseam_lte: Float

  """All values greater than the given value."""
  inseam_gt: Float

  """All values greater than or equal the given value."""
  inseam_gte: Float
}

input BottomSizeWhereUniqueInput {
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
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem!]
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
  bagItems: BagItemCreateManyWithoutCustomerInput
  reservations: ReservationCreateManyWithoutCustomerInput
}

input CustomerCreateOneInput {
  create: CustomerCreateInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateOneWithoutBagItemsInput {
  create: CustomerCreateWithoutBagItemsInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateOneWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateWithoutBagItemsInput {
  id: ID
  status: CustomerStatus
  plan: Plan
  user: UserCreateOneInput!
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  reservations: ReservationCreateManyWithoutCustomerInput
}

input CustomerCreateWithoutReservationsInput {
  id: ID
  status: CustomerStatus
  plan: Plan
  user: UserCreateOneInput!
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  bagItems: BagItemCreateManyWithoutCustomerInput
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
  bagItems: BagItemUpdateManyWithoutCustomerInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  bagItems: BagItemUpdateManyWithoutCustomerInput
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

input CustomerUpdateOneRequiredWithoutBagItemsInput {
  create: CustomerCreateWithoutBagItemsInput
  connect: CustomerWhereUniqueInput
  update: CustomerUpdateWithoutBagItemsDataInput
  upsert: CustomerUpsertWithoutBagItemsInput
}

input CustomerUpdateOneRequiredWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  connect: CustomerWhereUniqueInput
  update: CustomerUpdateWithoutReservationsDataInput
  upsert: CustomerUpsertWithoutReservationsInput
}

input CustomerUpdateWithoutBagItemsDataInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateWithoutReservationsDataInput {
  status: CustomerStatus
  plan: Plan
  user: UserUpdateOneRequiredInput
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  bagItems: BagItemUpdateManyWithoutCustomerInput
}

input CustomerUpsertNestedInput {
  update: CustomerUpdateDataInput!
  create: CustomerCreateInput!
}

input CustomerUpsertWithoutBagItemsInput {
  update: CustomerUpdateWithoutBagItemsDataInput!
  create: CustomerCreateWithoutBagItemsInput!
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
  bagItems_every: BagItemWhereInput
  bagItems_some: BagItemWhereInput
  bagItems_none: BagItemWhereInput
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
  url: String
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
  url: String
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
  url_ASC
  url_DESC
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
  url: String
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
  url: String
  originalHeight: Int
  originalUrl: String
  originalWidth: Int
  resizedUrl: String
  title: String
}

input ImageUpdateManyMutationInput {
  caption: String
  url: String
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

enum LetterSize {
  XS
  S
  M
  L
  XL
  XXL
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

input LocationUpdateOneWithoutPhysicalProductsInput {
  create: LocationCreateWithoutPhysicalProductsInput
  connect: LocationWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
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

type Mutation {
  createBrand(data: BrandCreateInput!): Brand!
  createCollectionGroup(data: CollectionGroupCreateInput!): CollectionGroup!
  createHomepageProductRail(data: HomepageProductRailCreateInput!): HomepageProductRail!
  createImage(data: ImageCreateInput!): Image!
  createProductModel(data: ProductModelCreateInput!): ProductModel!
  createBagItem(data: BagItemCreateInput!): BagItem!
  createRecentlyViewedProduct(data: RecentlyViewedProductCreateInput!): RecentlyViewedProduct!
  createOrder(data: OrderCreateInput!): Order!
  createProductRequest(data: ProductRequestCreateInput!): ProductRequest!
  createProductVariantWant(data: ProductVariantWantCreateInput!): ProductVariantWant!
  createReservationFeedback(data: ReservationFeedbackCreateInput!): ReservationFeedback!
  createProductVariantFeedback(data: ProductVariantFeedbackCreateInput!): ProductVariantFeedback!
  createProductVariantFeedbackQuestion(data: ProductVariantFeedbackQuestionCreateInput!): ProductVariantFeedbackQuestion!
  createCollection(data: CollectionCreateInput!): Collection!
  createCategory(data: CategoryCreateInput!): Category!
  createCustomerDetail(data: CustomerDetailCreateInput!): CustomerDetail!
  createBillingInfo(data: BillingInfoCreateInput!): BillingInfo!
  createLocation(data: LocationCreateInput!): Location!
  createPackage(data: PackageCreateInput!): Package!
  createSize(data: SizeCreateInput!): Size!
  createProductFunction(data: ProductFunctionCreateInput!): ProductFunction!
  createColor(data: ColorCreateInput!): Color!
  createTopSize(data: TopSizeCreateInput!): TopSize!
  createCustomer(data: CustomerCreateInput!): Customer!
  createBottomSize(data: BottomSizeCreateInput!): BottomSize!
  createLabel(data: LabelCreateInput!): Label!
  createPhysicalProduct(data: PhysicalProductCreateInput!): PhysicalProduct!
  createProductVariant(data: ProductVariantCreateInput!): ProductVariant!
  createProduct(data: ProductCreateInput!): Product!
  createReservation(data: ReservationCreateInput!): Reservation!
  createUser(data: UserCreateInput!): User!
  updateBrand(data: BrandUpdateInput!, where: BrandWhereUniqueInput!): Brand
  updateCollectionGroup(data: CollectionGroupUpdateInput!, where: CollectionGroupWhereUniqueInput!): CollectionGroup
  updateHomepageProductRail(data: HomepageProductRailUpdateInput!, where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  updateImage(data: ImageUpdateInput!, where: ImageWhereUniqueInput!): Image
  updateProductModel(data: ProductModelUpdateInput!, where: ProductModelWhereUniqueInput!): ProductModel
  updateBagItem(data: BagItemUpdateInput!, where: BagItemWhereUniqueInput!): BagItem
  updateRecentlyViewedProduct(data: RecentlyViewedProductUpdateInput!, where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  updateProductRequest(data: ProductRequestUpdateInput!, where: ProductRequestWhereUniqueInput!): ProductRequest
  updateProductVariantWant(data: ProductVariantWantUpdateInput!, where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  updateReservationFeedback(data: ReservationFeedbackUpdateInput!, where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  updateProductVariantFeedback(data: ProductVariantFeedbackUpdateInput!, where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  updateProductVariantFeedbackQuestion(data: ProductVariantFeedbackQuestionUpdateInput!, where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  updateCollection(data: CollectionUpdateInput!, where: CollectionWhereUniqueInput!): Collection
  updateCategory(data: CategoryUpdateInput!, where: CategoryWhereUniqueInput!): Category
  updateCustomerDetail(data: CustomerDetailUpdateInput!, where: CustomerDetailWhereUniqueInput!): CustomerDetail
  updateBillingInfo(data: BillingInfoUpdateInput!, where: BillingInfoWhereUniqueInput!): BillingInfo
  updateLocation(data: LocationUpdateInput!, where: LocationWhereUniqueInput!): Location
  updatePackage(data: PackageUpdateInput!, where: PackageWhereUniqueInput!): Package
  updateSize(data: SizeUpdateInput!, where: SizeWhereUniqueInput!): Size
  updateProductFunction(data: ProductFunctionUpdateInput!, where: ProductFunctionWhereUniqueInput!): ProductFunction
  updateColor(data: ColorUpdateInput!, where: ColorWhereUniqueInput!): Color
  updateTopSize(data: TopSizeUpdateInput!, where: TopSizeWhereUniqueInput!): TopSize
  updateCustomer(data: CustomerUpdateInput!, where: CustomerWhereUniqueInput!): Customer
  updateBottomSize(data: BottomSizeUpdateInput!, where: BottomSizeWhereUniqueInput!): BottomSize
  updateLabel(data: LabelUpdateInput!, where: LabelWhereUniqueInput!): Label
  updatePhysicalProduct(data: PhysicalProductUpdateInput!, where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  updateProductVariant(data: ProductVariantUpdateInput!, where: ProductVariantWhereUniqueInput!): ProductVariant
  updateProduct(data: ProductUpdateInput!, where: ProductWhereUniqueInput!): Product
  updateReservation(data: ReservationUpdateInput!, where: ReservationWhereUniqueInput!): Reservation
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteBrand(where: BrandWhereUniqueInput!): Brand
  deleteCollectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  deleteHomepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  deleteImage(where: ImageWhereUniqueInput!): Image
  deleteProductModel(where: ProductModelWhereUniqueInput!): ProductModel
  deleteBagItem(where: BagItemWhereUniqueInput!): BagItem
  deleteRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  deleteOrder(where: OrderWhereUniqueInput!): Order
  deleteProductRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  deleteProductVariantWant(where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  deleteReservationFeedback(where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  deleteProductVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  deleteProductVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  deleteCollection(where: CollectionWhereUniqueInput!): Collection
  deleteCategory(where: CategoryWhereUniqueInput!): Category
  deleteCustomerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  deleteBillingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  deleteLocation(where: LocationWhereUniqueInput!): Location
  deletePackage(where: PackageWhereUniqueInput!): Package
  deleteSize(where: SizeWhereUniqueInput!): Size
  deleteProductFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  deleteColor(where: ColorWhereUniqueInput!): Color
  deleteTopSize(where: TopSizeWhereUniqueInput!): TopSize
  deleteCustomer(where: CustomerWhereUniqueInput!): Customer
  deleteBottomSize(where: BottomSizeWhereUniqueInput!): BottomSize
  deleteLabel(where: LabelWhereUniqueInput!): Label
  deletePhysicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  deleteProductVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  deleteProduct(where: ProductWhereUniqueInput!): Product
  deleteReservation(where: ReservationWhereUniqueInput!): Reservation
  deleteUser(where: UserWhereUniqueInput!): User
  upsertBrand(where: BrandWhereUniqueInput!, create: BrandCreateInput!, update: BrandUpdateInput!): Brand!
  upsertCollectionGroup(where: CollectionGroupWhereUniqueInput!, create: CollectionGroupCreateInput!, update: CollectionGroupUpdateInput!): CollectionGroup!
  upsertHomepageProductRail(where: HomepageProductRailWhereUniqueInput!, create: HomepageProductRailCreateInput!, update: HomepageProductRailUpdateInput!): HomepageProductRail!
  upsertImage(where: ImageWhereUniqueInput!, create: ImageCreateInput!, update: ImageUpdateInput!): Image!
  upsertProductModel(where: ProductModelWhereUniqueInput!, create: ProductModelCreateInput!, update: ProductModelUpdateInput!): ProductModel!
  upsertBagItem(where: BagItemWhereUniqueInput!, create: BagItemCreateInput!, update: BagItemUpdateInput!): BagItem!
  upsertRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!, create: RecentlyViewedProductCreateInput!, update: RecentlyViewedProductUpdateInput!): RecentlyViewedProduct!
  upsertProductRequest(where: ProductRequestWhereUniqueInput!, create: ProductRequestCreateInput!, update: ProductRequestUpdateInput!): ProductRequest!
  upsertProductVariantWant(where: ProductVariantWantWhereUniqueInput!, create: ProductVariantWantCreateInput!, update: ProductVariantWantUpdateInput!): ProductVariantWant!
  upsertReservationFeedback(where: ReservationFeedbackWhereUniqueInput!, create: ReservationFeedbackCreateInput!, update: ReservationFeedbackUpdateInput!): ReservationFeedback!
  upsertProductVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!, create: ProductVariantFeedbackCreateInput!, update: ProductVariantFeedbackUpdateInput!): ProductVariantFeedback!
  upsertProductVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!, create: ProductVariantFeedbackQuestionCreateInput!, update: ProductVariantFeedbackQuestionUpdateInput!): ProductVariantFeedbackQuestion!
  upsertCollection(where: CollectionWhereUniqueInput!, create: CollectionCreateInput!, update: CollectionUpdateInput!): Collection!
  upsertCategory(where: CategoryWhereUniqueInput!, create: CategoryCreateInput!, update: CategoryUpdateInput!): Category!
  upsertCustomerDetail(where: CustomerDetailWhereUniqueInput!, create: CustomerDetailCreateInput!, update: CustomerDetailUpdateInput!): CustomerDetail!
  upsertBillingInfo(where: BillingInfoWhereUniqueInput!, create: BillingInfoCreateInput!, update: BillingInfoUpdateInput!): BillingInfo!
  upsertLocation(where: LocationWhereUniqueInput!, create: LocationCreateInput!, update: LocationUpdateInput!): Location!
  upsertPackage(where: PackageWhereUniqueInput!, create: PackageCreateInput!, update: PackageUpdateInput!): Package!
  upsertSize(where: SizeWhereUniqueInput!, create: SizeCreateInput!, update: SizeUpdateInput!): Size!
  upsertProductFunction(where: ProductFunctionWhereUniqueInput!, create: ProductFunctionCreateInput!, update: ProductFunctionUpdateInput!): ProductFunction!
  upsertColor(where: ColorWhereUniqueInput!, create: ColorCreateInput!, update: ColorUpdateInput!): Color!
  upsertTopSize(where: TopSizeWhereUniqueInput!, create: TopSizeCreateInput!, update: TopSizeUpdateInput!): TopSize!
  upsertCustomer(where: CustomerWhereUniqueInput!, create: CustomerCreateInput!, update: CustomerUpdateInput!): Customer!
  upsertBottomSize(where: BottomSizeWhereUniqueInput!, create: BottomSizeCreateInput!, update: BottomSizeUpdateInput!): BottomSize!
  upsertLabel(where: LabelWhereUniqueInput!, create: LabelCreateInput!, update: LabelUpdateInput!): Label!
  upsertPhysicalProduct(where: PhysicalProductWhereUniqueInput!, create: PhysicalProductCreateInput!, update: PhysicalProductUpdateInput!): PhysicalProduct!
  upsertProductVariant(where: ProductVariantWhereUniqueInput!, create: ProductVariantCreateInput!, update: ProductVariantUpdateInput!): ProductVariant!
  upsertProduct(where: ProductWhereUniqueInput!, create: ProductCreateInput!, update: ProductUpdateInput!): Product!
  upsertReservation(where: ReservationWhereUniqueInput!, create: ReservationCreateInput!, update: ReservationUpdateInput!): Reservation!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  updateManyBrands(data: BrandUpdateManyMutationInput!, where: BrandWhereInput): BatchPayload!
  updateManyCollectionGroups(data: CollectionGroupUpdateManyMutationInput!, where: CollectionGroupWhereInput): BatchPayload!
  updateManyHomepageProductRails(data: HomepageProductRailUpdateManyMutationInput!, where: HomepageProductRailWhereInput): BatchPayload!
  updateManyImages(data: ImageUpdateManyMutationInput!, where: ImageWhereInput): BatchPayload!
  updateManyProductModels(data: ProductModelUpdateManyMutationInput!, where: ProductModelWhereInput): BatchPayload!
  updateManyBagItems(data: BagItemUpdateManyMutationInput!, where: BagItemWhereInput): BatchPayload!
  updateManyRecentlyViewedProducts(data: RecentlyViewedProductUpdateManyMutationInput!, where: RecentlyViewedProductWhereInput): BatchPayload!
  updateManyProductRequests(data: ProductRequestUpdateManyMutationInput!, where: ProductRequestWhereInput): BatchPayload!
  updateManyProductVariantWants(data: ProductVariantWantUpdateManyMutationInput!, where: ProductVariantWantWhereInput): BatchPayload!
  updateManyReservationFeedbacks(data: ReservationFeedbackUpdateManyMutationInput!, where: ReservationFeedbackWhereInput): BatchPayload!
  updateManyProductVariantFeedbacks(data: ProductVariantFeedbackUpdateManyMutationInput!, where: ProductVariantFeedbackWhereInput): BatchPayload!
  updateManyProductVariantFeedbackQuestions(data: ProductVariantFeedbackQuestionUpdateManyMutationInput!, where: ProductVariantFeedbackQuestionWhereInput): BatchPayload!
  updateManyCollections(data: CollectionUpdateManyMutationInput!, where: CollectionWhereInput): BatchPayload!
  updateManyCategories(data: CategoryUpdateManyMutationInput!, where: CategoryWhereInput): BatchPayload!
  updateManyCustomerDetails(data: CustomerDetailUpdateManyMutationInput!, where: CustomerDetailWhereInput): BatchPayload!
  updateManyBillingInfoes(data: BillingInfoUpdateManyMutationInput!, where: BillingInfoWhereInput): BatchPayload!
  updateManyLocations(data: LocationUpdateManyMutationInput!, where: LocationWhereInput): BatchPayload!
  updateManyPackages(data: PackageUpdateManyMutationInput!, where: PackageWhereInput): BatchPayload!
  updateManySizes(data: SizeUpdateManyMutationInput!, where: SizeWhereInput): BatchPayload!
  updateManyProductFunctions(data: ProductFunctionUpdateManyMutationInput!, where: ProductFunctionWhereInput): BatchPayload!
  updateManyColors(data: ColorUpdateManyMutationInput!, where: ColorWhereInput): BatchPayload!
  updateManyTopSizes(data: TopSizeUpdateManyMutationInput!, where: TopSizeWhereInput): BatchPayload!
  updateManyCustomers(data: CustomerUpdateManyMutationInput!, where: CustomerWhereInput): BatchPayload!
  updateManyBottomSizes(data: BottomSizeUpdateManyMutationInput!, where: BottomSizeWhereInput): BatchPayload!
  updateManyLabels(data: LabelUpdateManyMutationInput!, where: LabelWhereInput): BatchPayload!
  updateManyPhysicalProducts(data: PhysicalProductUpdateManyMutationInput!, where: PhysicalProductWhereInput): BatchPayload!
  updateManyProductVariants(data: ProductVariantUpdateManyMutationInput!, where: ProductVariantWhereInput): BatchPayload!
  updateManyProducts(data: ProductUpdateManyMutationInput!, where: ProductWhereInput): BatchPayload!
  updateManyReservations(data: ReservationUpdateManyMutationInput!, where: ReservationWhereInput): BatchPayload!
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  deleteManyBrands(where: BrandWhereInput): BatchPayload!
  deleteManyCollectionGroups(where: CollectionGroupWhereInput): BatchPayload!
  deleteManyHomepageProductRails(where: HomepageProductRailWhereInput): BatchPayload!
  deleteManyImages(where: ImageWhereInput): BatchPayload!
  deleteManyProductModels(where: ProductModelWhereInput): BatchPayload!
  deleteManyBagItems(where: BagItemWhereInput): BatchPayload!
  deleteManyRecentlyViewedProducts(where: RecentlyViewedProductWhereInput): BatchPayload!
  deleteManyOrders(where: OrderWhereInput): BatchPayload!
  deleteManyProductRequests(where: ProductRequestWhereInput): BatchPayload!
  deleteManyProductVariantWants(where: ProductVariantWantWhereInput): BatchPayload!
  deleteManyReservationFeedbacks(where: ReservationFeedbackWhereInput): BatchPayload!
  deleteManyProductVariantFeedbacks(where: ProductVariantFeedbackWhereInput): BatchPayload!
  deleteManyProductVariantFeedbackQuestions(where: ProductVariantFeedbackQuestionWhereInput): BatchPayload!
  deleteManyCollections(where: CollectionWhereInput): BatchPayload!
  deleteManyCategories(where: CategoryWhereInput): BatchPayload!
  deleteManyCustomerDetails(where: CustomerDetailWhereInput): BatchPayload!
  deleteManyBillingInfoes(where: BillingInfoWhereInput): BatchPayload!
  deleteManyLocations(where: LocationWhereInput): BatchPayload!
  deleteManyPackages(where: PackageWhereInput): BatchPayload!
  deleteManySizes(where: SizeWhereInput): BatchPayload!
  deleteManyProductFunctions(where: ProductFunctionWhereInput): BatchPayload!
  deleteManyColors(where: ColorWhereInput): BatchPayload!
  deleteManyTopSizes(where: TopSizeWhereInput): BatchPayload!
  deleteManyCustomers(where: CustomerWhereInput): BatchPayload!
  deleteManyBottomSizes(where: BottomSizeWhereInput): BatchPayload!
  deleteManyLabels(where: LabelWhereInput): BatchPayload!
  deleteManyPhysicalProducts(where: PhysicalProductWhereInput): BatchPayload!
  deleteManyProductVariants(where: ProductVariantWhereInput): BatchPayload!
  deleteManyProducts(where: ProductWhereInput): BatchPayload!
  deleteManyReservations(where: ReservationWhereInput): BatchPayload!
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
  location: Location
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
  location: LocationCreateOneWithoutPhysicalProductsInput
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
  location: LocationCreateOneWithoutPhysicalProductsInput
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
  location: LocationUpdateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
}

input PhysicalProductUpdateInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location: LocationUpdateOneWithoutPhysicalProductsInput
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
  location: LocationUpdateOneWithoutPhysicalProductsInput
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
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  model: ProductModel
  modelSize: Size
  color: Color!
  secondaryColor: Color
  tags: Json
  functions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction!]
  innerMaterials: [String!]!
  outerMaterials: [String!]!
  variants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant!]
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ProductArchitecture {
  Fashion
  Showstopper
  Staple
}

"""A connection to a list of items."""
type ProductConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductEdge]!
  aggregate: AggregateProduct!
}

input ProductCreateinnerMaterialsInput {
  set: [String!]
}

input ProductCreateInput {
  id: ID
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
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

input ProductCreateManyWithoutModelInput {
  create: [ProductCreateWithoutModelInput!]
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
  set: [String!]
}

input ProductCreateWithoutBrandInput {
  id: ID
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  category: CategoryCreateOneWithoutProductsInput!
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateWithoutCategoryInput {
  id: ID
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateWithoutModelInput {
  id: ID
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  variants: ProductVariantCreateManyWithoutProductInput
}

input ProductCreateWithoutVariantsInput {
  id: ID
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
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

type ProductModel implements Node {
  id: ID!
  name: String!
  height: Float!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

"""A connection to a list of items."""
type ProductModelConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductModelEdge]!
  aggregate: AggregateProductModel!
}

input ProductModelCreateInput {
  id: ID
  name: String!
  height: Float!
  products: ProductCreateManyWithoutModelInput
}

input ProductModelCreateOneWithoutProductsInput {
  create: ProductModelCreateWithoutProductsInput
  connect: ProductModelWhereUniqueInput
}

input ProductModelCreateWithoutProductsInput {
  id: ID
  name: String!
  height: Float!
}

"""An edge in a connection."""
type ProductModelEdge {
  """The item at the end of the edge."""
  node: ProductModel!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductModelOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  height_ASC
  height_DESC
}

type ProductModelPreviousValues {
  id: ID!
  name: String!
  height: Float!
}

type ProductModelSubscriptionPayload {
  mutation: MutationType!
  node: ProductModel
  updatedFields: [String!]
  previousValues: ProductModelPreviousValues
}

input ProductModelSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductModelSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductModelSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductModelSubscriptionWhereInput!]

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
  node: ProductModelWhereInput
}

input ProductModelUpdateInput {
  name: String
  height: Float
  products: ProductUpdateManyWithoutModelInput
}

input ProductModelUpdateManyMutationInput {
  name: String
  height: Float
}

input ProductModelUpdateOneWithoutProductsInput {
  create: ProductModelCreateWithoutProductsInput
  connect: ProductModelWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: ProductModelUpdateWithoutProductsDataInput
  upsert: ProductModelUpsertWithoutProductsInput
}

input ProductModelUpdateWithoutProductsDataInput {
  name: String
  height: Float
}

input ProductModelUpsertWithoutProductsInput {
  update: ProductModelUpdateWithoutProductsDataInput!
  create: ProductModelCreateWithoutProductsInput!
}

input ProductModelWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductModelWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductModelWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductModelWhereInput!]
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
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
}

input ProductModelWhereUniqueInput {
  id: ID
}

enum ProductOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  name_ASC
  name_DESC
  type_ASC
  type_DESC
  description_ASC
  description_DESC
  externalURL_ASC
  externalURL_DESC
  images_ASC
  images_DESC
  modelHeight_ASC
  modelHeight_DESC
  retailPrice_ASC
  retailPrice_DESC
  tags_ASC
  tags_DESC
  status_ASC
  status_DESC
  season_ASC
  season_DESC
  architecture_ASC
  architecture_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ProductPreviousValues {
  id: ID!
  slug: String!
  name: String!
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  innerMaterials: [String!]!
  outerMaterials: [String!]!
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
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
  type: ProductType

  """All values that are not equal to given value."""
  type_not: ProductType

  """All values that are contained in given list."""
  type_in: [ProductType!]

  """All values that are not contained in given list."""
  type_not_in: [ProductType!]
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
  season: String

  """All values that are not equal to given value."""
  season_not: String

  """All values that are contained in given list."""
  season_in: [String!]

  """All values that are not contained in given list."""
  season_not_in: [String!]

  """All values less than the given value."""
  season_lt: String

  """All values less than or equal the given value."""
  season_lte: String

  """All values greater than the given value."""
  season_gt: String

  """All values greater than or equal the given value."""
  season_gte: String

  """All values containing the given string."""
  season_contains: String

  """All values not containing the given string."""
  season_not_contains: String

  """All values starting with the given string."""
  season_starts_with: String

  """All values not starting with the given string."""
  season_not_starts_with: String

  """All values ending with the given string."""
  season_ends_with: String

  """All values not ending with the given string."""
  season_not_ends_with: String
  architecture: ProductArchitecture

  """All values that are not equal to given value."""
  architecture_not: ProductArchitecture

  """All values that are contained in given list."""
  architecture_in: [ProductArchitecture!]

  """All values that are not contained in given list."""
  architecture_not_in: [ProductArchitecture!]
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

enum ProductType {
  Top
  Bottom
  Accessory
  Shoe
}

input ProductUpdateDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateinnerMaterialsInput {
  set: [String!]
}

input ProductUpdateInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateManyDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
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
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
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

input ProductUpdateManyWithoutModelInput {
  create: [ProductCreateWithoutModelInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  delete: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutModelInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductScalarWhereInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutModelInput!]
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
  set: [String!]
}

input ProductUpdateWithoutBrandDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateWithoutCategoryDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateWithoutModelDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  variants: ProductVariantUpdateManyWithoutProductInput
}

input ProductUpdateWithoutVariantsDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  images: Json
  modelHeight: Int
  retailPrice: Int
  tags: Json
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
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

input ProductUpdateWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutModelDataInput!
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

input ProductUpsertWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutModelDataInput!
  create: ProductCreateWithoutModelInput!
}

type ProductVariant implements Node {
  id: ID!
  sku: String
  color: Color!
  internalSize: Size
  manufacturerSizes(where: SizeWhereInput, orderBy: SizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Size!]
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
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
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
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
  product: ProductCreateOneWithoutVariantsInput!
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
}

input ProductVariantCreateWithoutPhysicalProductsInput {
  id: ID
  sku: String
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
  product: ProductCreateOneWithoutVariantsInput!
}

input ProductVariantCreateWithoutProductInput {
  id: ID
  sku: String
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  color: ColorCreateOneWithoutProductVariantsInput!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
}

"""An edge in a connection."""
type ProductVariantEdge {
  """The item at the end of the edge."""
  node: ProductVariant!

  """A cursor for use in pagination."""
  cursor: String!
}

type ProductVariantFeedback implements Node {
  id: ID!
  isCompleted: Boolean!
  questions(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedbackQuestion!]
  reservationFeedback: ReservationFeedback!
  variant: ProductVariant!
}

"""A connection to a list of items."""
type ProductVariantFeedbackConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductVariantFeedbackEdge]!
  aggregate: AggregateProductVariantFeedback!
}

input ProductVariantFeedbackCreateInput {
  id: ID
  isCompleted: Boolean!
  questions: ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput
  reservationFeedback: ReservationFeedbackCreateOneWithoutFeedbacksInput!
  variant: ProductVariantCreateOneInput!
}

input ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput {
  create: [ProductVariantFeedbackCreateWithoutReservationFeedbackInput!]
  connect: [ProductVariantFeedbackWhereUniqueInput!]
}

input ProductVariantFeedbackCreateOneWithoutQuestionsInput {
  create: ProductVariantFeedbackCreateWithoutQuestionsInput
  connect: ProductVariantFeedbackWhereUniqueInput
}

input ProductVariantFeedbackCreateWithoutQuestionsInput {
  id: ID
  isCompleted: Boolean!
  reservationFeedback: ReservationFeedbackCreateOneWithoutFeedbacksInput!
  variant: ProductVariantCreateOneInput!
}

input ProductVariantFeedbackCreateWithoutReservationFeedbackInput {
  id: ID
  isCompleted: Boolean!
  questions: ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput
  variant: ProductVariantCreateOneInput!
}

"""An edge in a connection."""
type ProductVariantFeedbackEdge {
  """The item at the end of the edge."""
  node: ProductVariantFeedback!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductVariantFeedbackOrderByInput {
  id_ASC
  id_DESC
  isCompleted_ASC
  isCompleted_DESC
}

type ProductVariantFeedbackPreviousValues {
  id: ID!
  isCompleted: Boolean!
}

type ProductVariantFeedbackQuestion implements Node {
  id: ID!
  options: [String!]!
  question: String!
  responses: [String!]!
  type: QuestionType!
  variantFeedback: ProductVariantFeedback!
}

"""A connection to a list of items."""
type ProductVariantFeedbackQuestionConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductVariantFeedbackQuestionEdge]!
  aggregate: AggregateProductVariantFeedbackQuestion!
}

input ProductVariantFeedbackQuestionCreateInput {
  id: ID
  question: String!
  type: QuestionType!
  options: ProductVariantFeedbackQuestionCreateoptionsInput
  responses: ProductVariantFeedbackQuestionCreateresponsesInput
  variantFeedback: ProductVariantFeedbackCreateOneWithoutQuestionsInput!
}

input ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput {
  create: [ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput!]
  connect: [ProductVariantFeedbackQuestionWhereUniqueInput!]
}

input ProductVariantFeedbackQuestionCreateoptionsInput {
  set: [String!]
}

input ProductVariantFeedbackQuestionCreateresponsesInput {
  set: [String!]
}

input ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput {
  id: ID
  question: String!
  type: QuestionType!
  options: ProductVariantFeedbackQuestionCreateoptionsInput
  responses: ProductVariantFeedbackQuestionCreateresponsesInput
}

"""An edge in a connection."""
type ProductVariantFeedbackQuestionEdge {
  """The item at the end of the edge."""
  node: ProductVariantFeedbackQuestion!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductVariantFeedbackQuestionOrderByInput {
  id_ASC
  id_DESC
  question_ASC
  question_DESC
  type_ASC
  type_DESC
}

type ProductVariantFeedbackQuestionPreviousValues {
  id: ID!
  options: [String!]!
  question: String!
  responses: [String!]!
  type: QuestionType!
}

input ProductVariantFeedbackQuestionScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackQuestionScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackQuestionScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackQuestionScalarWhereInput!]
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
  question: String

  """All values that are not equal to given value."""
  question_not: String

  """All values that are contained in given list."""
  question_in: [String!]

  """All values that are not contained in given list."""
  question_not_in: [String!]

  """All values less than the given value."""
  question_lt: String

  """All values less than or equal the given value."""
  question_lte: String

  """All values greater than the given value."""
  question_gt: String

  """All values greater than or equal the given value."""
  question_gte: String

  """All values containing the given string."""
  question_contains: String

  """All values not containing the given string."""
  question_not_contains: String

  """All values starting with the given string."""
  question_starts_with: String

  """All values not starting with the given string."""
  question_not_starts_with: String

  """All values ending with the given string."""
  question_ends_with: String

  """All values not ending with the given string."""
  question_not_ends_with: String
  type: QuestionType

  """All values that are not equal to given value."""
  type_not: QuestionType

  """All values that are contained in given list."""
  type_in: [QuestionType!]

  """All values that are not contained in given list."""
  type_not_in: [QuestionType!]
}

type ProductVariantFeedbackQuestionSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariantFeedbackQuestion
  updatedFields: [String!]
  previousValues: ProductVariantFeedbackQuestionPreviousValues
}

input ProductVariantFeedbackQuestionSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]

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
  node: ProductVariantFeedbackQuestionWhereInput
}

input ProductVariantFeedbackQuestionUpdateInput {
  question: String
  type: QuestionType
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
  variantFeedback: ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput
}

input ProductVariantFeedbackQuestionUpdateManyDataInput {
  question: String
  type: QuestionType
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
}

input ProductVariantFeedbackQuestionUpdateManyMutationInput {
  question: String
  type: QuestionType
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
}

input ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput {
  create: [ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput!]
  connect: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  set: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  disconnect: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  delete: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  update: [ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput!]
  updateMany: [ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductVariantFeedbackQuestionScalarWhereInput!]
  upsert: [ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput!]
}

input ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackQuestionScalarWhereInput!
  data: ProductVariantFeedbackQuestionUpdateManyDataInput!
}

input ProductVariantFeedbackQuestionUpdateoptionsInput {
  set: [String!]
}

input ProductVariantFeedbackQuestionUpdateresponsesInput {
  set: [String!]
}

input ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput {
  question: String
  type: QuestionType
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
}

input ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput {
  where: ProductVariantFeedbackQuestionWhereUniqueInput!
  data: ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput!
}

input ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput {
  where: ProductVariantFeedbackQuestionWhereUniqueInput!
  update: ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput!
  create: ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput!
}

input ProductVariantFeedbackQuestionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackQuestionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackQuestionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackQuestionWhereInput!]
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
  question: String

  """All values that are not equal to given value."""
  question_not: String

  """All values that are contained in given list."""
  question_in: [String!]

  """All values that are not contained in given list."""
  question_not_in: [String!]

  """All values less than the given value."""
  question_lt: String

  """All values less than or equal the given value."""
  question_lte: String

  """All values greater than the given value."""
  question_gt: String

  """All values greater than or equal the given value."""
  question_gte: String

  """All values containing the given string."""
  question_contains: String

  """All values not containing the given string."""
  question_not_contains: String

  """All values starting with the given string."""
  question_starts_with: String

  """All values not starting with the given string."""
  question_not_starts_with: String

  """All values ending with the given string."""
  question_ends_with: String

  """All values not ending with the given string."""
  question_not_ends_with: String
  type: QuestionType

  """All values that are not equal to given value."""
  type_not: QuestionType

  """All values that are contained in given list."""
  type_in: [QuestionType!]

  """All values that are not contained in given list."""
  type_not_in: [QuestionType!]
  variantFeedback: ProductVariantFeedbackWhereInput
}

input ProductVariantFeedbackQuestionWhereUniqueInput {
  id: ID
}

input ProductVariantFeedbackScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackScalarWhereInput!]
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
  isCompleted: Boolean

  """All values that are not equal to given value."""
  isCompleted_not: Boolean
}

type ProductVariantFeedbackSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariantFeedback
  updatedFields: [String!]
  previousValues: ProductVariantFeedbackPreviousValues
}

input ProductVariantFeedbackSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackSubscriptionWhereInput!]

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
  node: ProductVariantFeedbackWhereInput
}

input ProductVariantFeedbackUpdateInput {
  isCompleted: Boolean
  questions: ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput
  reservationFeedback: ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput
  variant: ProductVariantUpdateOneRequiredInput
}

input ProductVariantFeedbackUpdateManyDataInput {
  isCompleted: Boolean
}

input ProductVariantFeedbackUpdateManyMutationInput {
  isCompleted: Boolean
}

input ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput {
  create: [ProductVariantFeedbackCreateWithoutReservationFeedbackInput!]
  connect: [ProductVariantFeedbackWhereUniqueInput!]
  set: [ProductVariantFeedbackWhereUniqueInput!]
  disconnect: [ProductVariantFeedbackWhereUniqueInput!]
  delete: [ProductVariantFeedbackWhereUniqueInput!]
  update: [ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput!]
  updateMany: [ProductVariantFeedbackUpdateManyWithWhereNestedInput!]
  deleteMany: [ProductVariantFeedbackScalarWhereInput!]
  upsert: [ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput!]
}

input ProductVariantFeedbackUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackScalarWhereInput!
  data: ProductVariantFeedbackUpdateManyDataInput!
}

input ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput {
  create: ProductVariantFeedbackCreateWithoutQuestionsInput
  connect: ProductVariantFeedbackWhereUniqueInput
  update: ProductVariantFeedbackUpdateWithoutQuestionsDataInput
  upsert: ProductVariantFeedbackUpsertWithoutQuestionsInput
}

input ProductVariantFeedbackUpdateWithoutQuestionsDataInput {
  isCompleted: Boolean
  reservationFeedback: ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput
  variant: ProductVariantUpdateOneRequiredInput
}

input ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput {
  isCompleted: Boolean
  questions: ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput
  variant: ProductVariantUpdateOneRequiredInput
}

input ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput {
  where: ProductVariantFeedbackWhereUniqueInput!
  data: ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput!
}

input ProductVariantFeedbackUpsertWithoutQuestionsInput {
  update: ProductVariantFeedbackUpdateWithoutQuestionsDataInput!
  create: ProductVariantFeedbackCreateWithoutQuestionsInput!
}

input ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput {
  where: ProductVariantFeedbackWhereUniqueInput!
  update: ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput!
  create: ProductVariantFeedbackCreateWithoutReservationFeedbackInput!
}

input ProductVariantFeedbackWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantFeedbackWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantFeedbackWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantFeedbackWhereInput!]
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
  isCompleted: Boolean

  """All values that are not equal to given value."""
  isCompleted_not: Boolean
  questions_every: ProductVariantFeedbackQuestionWhereInput
  questions_some: ProductVariantFeedbackQuestionWhereInput
  questions_none: ProductVariantFeedbackQuestionWhereInput
  reservationFeedback: ReservationFeedbackWhereInput
  variant: ProductVariantWhereInput
}

input ProductVariantFeedbackWhereUniqueInput {
  id: ID
}

enum ProductVariantOrderByInput {
  id_ASC
  id_DESC
  sku_ASC
  sku_DESC
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
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateInput {
  sku: String
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateManyDataInput {
  sku: String
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
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
}

input ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku: String
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  product: ProductUpdateOneRequiredWithoutVariantsInput
}

input ProductVariantUpdateWithoutProductDataInput {
  sku: String
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
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

type ProductVariantWant implements Node {
  id: ID!
  productVariant: ProductVariant!
  user: User!
  isFulfilled: Boolean!
}

"""A connection to a list of items."""
type ProductVariantWantConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ProductVariantWantEdge]!
  aggregate: AggregateProductVariantWant!
}

input ProductVariantWantCreateInput {
  id: ID
  isFulfilled: Boolean!
  productVariant: ProductVariantCreateOneInput!
  user: UserCreateOneInput!
}

"""An edge in a connection."""
type ProductVariantWantEdge {
  """The item at the end of the edge."""
  node: ProductVariantWant!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ProductVariantWantOrderByInput {
  id_ASC
  id_DESC
  isFulfilled_ASC
  isFulfilled_DESC
}

type ProductVariantWantPreviousValues {
  id: ID!
  isFulfilled: Boolean!
}

type ProductVariantWantSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariantWant
  updatedFields: [String!]
  previousValues: ProductVariantWantPreviousValues
}

input ProductVariantWantSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantWantSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantWantSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantWantSubscriptionWhereInput!]

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
  node: ProductVariantWantWhereInput
}

input ProductVariantWantUpdateInput {
  isFulfilled: Boolean
  productVariant: ProductVariantUpdateOneRequiredInput
  user: UserUpdateOneRequiredInput
}

input ProductVariantWantUpdateManyMutationInput {
  isFulfilled: Boolean
}

input ProductVariantWantWhereInput {
  """Logical AND on all given filters."""
  AND: [ProductVariantWantWhereInput!]

  """Logical OR on all given filters."""
  OR: [ProductVariantWantWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ProductVariantWantWhereInput!]
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
  isFulfilled: Boolean

  """All values that are not equal to given value."""
  isFulfilled_not: Boolean
  productVariant: ProductVariantWhereInput
  user: UserWhereInput
}

input ProductVariantWantWhereUniqueInput {
  id: ID
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
  internalSize: SizeWhereInput
  manufacturerSizes_every: SizeWhereInput
  manufacturerSizes_some: SizeWhereInput
  manufacturerSizes_none: SizeWhereInput
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
  type: ProductType

  """All values that are not equal to given value."""
  type_not: ProductType

  """All values that are contained in given list."""
  type_in: [ProductType!]

  """All values that are not contained in given list."""
  type_not_in: [ProductType!]
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
  season: String

  """All values that are not equal to given value."""
  season_not: String

  """All values that are contained in given list."""
  season_in: [String!]

  """All values that are not contained in given list."""
  season_not_in: [String!]

  """All values less than the given value."""
  season_lt: String

  """All values less than or equal the given value."""
  season_lte: String

  """All values greater than the given value."""
  season_gt: String

  """All values greater than or equal the given value."""
  season_gte: String

  """All values containing the given string."""
  season_contains: String

  """All values not containing the given string."""
  season_not_contains: String

  """All values starting with the given string."""
  season_starts_with: String

  """All values not starting with the given string."""
  season_not_starts_with: String

  """All values ending with the given string."""
  season_ends_with: String

  """All values not ending with the given string."""
  season_not_ends_with: String
  architecture: ProductArchitecture

  """All values that are not equal to given value."""
  architecture_not: ProductArchitecture

  """All values that are contained in given list."""
  architecture_in: [ProductArchitecture!]

  """All values that are not contained in given list."""
  architecture_not_in: [ProductArchitecture!]
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
  model: ProductModelWhereInput
  modelSize: SizeWhereInput
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

enum PushNotificationStatus {
  Blocked
  Granted
  Denied
}

type Query {
  brands(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Brand]!
  collectionGroups(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CollectionGroup]!
  homepageProductRails(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [HomepageProductRail]!
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image]!
  productModels(where: ProductModelWhereInput, orderBy: ProductModelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductModel]!
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem]!
  recentlyViewedProducts(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [RecentlyViewedProduct]!
  orders(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Order]!
  productRequests(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductRequest]!
  productVariantWants(where: ProductVariantWantWhereInput, orderBy: ProductVariantWantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantWant]!
  reservationFeedbacks(where: ReservationFeedbackWhereInput, orderBy: ReservationFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ReservationFeedback]!
  productVariantFeedbacks(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedback]!
  productVariantFeedbackQuestions(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedbackQuestion]!
  collections(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Collection]!
  categories(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Category]!
  customerDetails(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CustomerDetail]!
  billingInfoes(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BillingInfo]!
  locations(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Location]!
  packages(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Package]!
  sizes(where: SizeWhereInput, orderBy: SizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Size]!
  productFunctions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction]!
  colors(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Color]!
  topSizes(where: TopSizeWhereInput, orderBy: TopSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [TopSize]!
  customers(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Customer]!
  bottomSizes(where: BottomSizeWhereInput, orderBy: BottomSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BottomSize]!
  labels(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Label]!
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct]!
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant]!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product]!
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation]!
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  brand(where: BrandWhereUniqueInput!): Brand
  collectionGroup(where: CollectionGroupWhereUniqueInput!): CollectionGroup
  homepageProductRail(where: HomepageProductRailWhereUniqueInput!): HomepageProductRail
  image(where: ImageWhereUniqueInput!): Image
  productModel(where: ProductModelWhereUniqueInput!): ProductModel
  bagItem(where: BagItemWhereUniqueInput!): BagItem
  recentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  order(where: OrderWhereUniqueInput!): Order
  productRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  productVariantWant(where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  reservationFeedback(where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  productVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  productVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  collection(where: CollectionWhereUniqueInput!): Collection
  category(where: CategoryWhereUniqueInput!): Category
  customerDetail(where: CustomerDetailWhereUniqueInput!): CustomerDetail
  billingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  location(where: LocationWhereUniqueInput!): Location
  package(where: PackageWhereUniqueInput!): Package
  size(where: SizeWhereUniqueInput!): Size
  productFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  color(where: ColorWhereUniqueInput!): Color
  topSize(where: TopSizeWhereUniqueInput!): TopSize
  customer(where: CustomerWhereUniqueInput!): Customer
  bottomSize(where: BottomSizeWhereUniqueInput!): BottomSize
  label(where: LabelWhereUniqueInput!): Label
  physicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  productVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  product(where: ProductWhereUniqueInput!): Product
  reservation(where: ReservationWhereUniqueInput!): Reservation
  user(where: UserWhereUniqueInput!): User
  brandsConnection(where: BrandWhereInput, orderBy: BrandOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BrandConnection!
  collectionGroupsConnection(where: CollectionGroupWhereInput, orderBy: CollectionGroupOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionGroupConnection!
  homepageProductRailsConnection(where: HomepageProductRailWhereInput, orderBy: HomepageProductRailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): HomepageProductRailConnection!
  imagesConnection(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ImageConnection!
  productModelsConnection(where: ProductModelWhereInput, orderBy: ProductModelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductModelConnection!
  bagItemsConnection(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BagItemConnection!
  recentlyViewedProductsConnection(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): RecentlyViewedProductConnection!
  ordersConnection(where: OrderWhereInput, orderBy: OrderOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): OrderConnection!
  productRequestsConnection(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductRequestConnection!
  productVariantWantsConnection(where: ProductVariantWantWhereInput, orderBy: ProductVariantWantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantWantConnection!
  reservationFeedbacksConnection(where: ReservationFeedbackWhereInput, orderBy: ReservationFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationFeedbackConnection!
  productVariantFeedbacksConnection(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantFeedbackConnection!
  productVariantFeedbackQuestionsConnection(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantFeedbackQuestionConnection!
  collectionsConnection(where: CollectionWhereInput, orderBy: CollectionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CollectionConnection!
  categoriesConnection(where: CategoryWhereInput, orderBy: CategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CategoryConnection!
  customerDetailsConnection(where: CustomerDetailWhereInput, orderBy: CustomerDetailOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerDetailConnection!
  billingInfoesConnection(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BillingInfoConnection!
  locationsConnection(where: LocationWhereInput, orderBy: LocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LocationConnection!
  packagesConnection(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PackageConnection!
  sizesConnection(where: SizeWhereInput, orderBy: SizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): SizeConnection!
  productFunctionsConnection(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductFunctionConnection!
  colorsConnection(where: ColorWhereInput, orderBy: ColorOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ColorConnection!
  topSizesConnection(where: TopSizeWhereInput, orderBy: TopSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): TopSizeConnection!
  customersConnection(where: CustomerWhereInput, orderBy: CustomerOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerConnection!
  bottomSizesConnection(where: BottomSizeWhereInput, orderBy: BottomSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BottomSizeConnection!
  labelsConnection(where: LabelWhereInput, orderBy: LabelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): LabelConnection!
  physicalProductsConnection(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PhysicalProductConnection!
  productVariantsConnection(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantConnection!
  productsConnection(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductConnection!
  reservationsConnection(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationConnection!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!

  """Fetches an object given its ID"""
  node(
    """The ID of an object"""
    id: ID!
  ): Node
}

enum QuestionType {
  MultipleChoice
  FreeResponse
}

enum Rating {
  Disliked
  Ok
  Loved
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
  reminderSentAt: DateTime
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
  reminderSentAt: DateTime
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

input ReservationCreateOneInput {
  create: ReservationCreateInput
  connect: ReservationWhereUniqueInput
}

input ReservationCreateWithoutCustomerInput {
  id: ID
  reservationNumber: Int!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
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

type ReservationFeedback implements Node {
  id: ID!
  comment: String
  feedbacks(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedback!]
  rating: Rating
  user: User!
  reservation: Reservation!
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""A connection to a list of items."""
type ReservationFeedbackConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [ReservationFeedbackEdge]!
  aggregate: AggregateReservationFeedback!
}

input ReservationFeedbackCreateInput {
  id: ID
  comment: String
  rating: Rating
  feedbacks: ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput
  user: UserCreateOneInput!
  reservation: ReservationCreateOneInput!
}

input ReservationFeedbackCreateOneWithoutFeedbacksInput {
  create: ReservationFeedbackCreateWithoutFeedbacksInput
  connect: ReservationFeedbackWhereUniqueInput
}

input ReservationFeedbackCreateWithoutFeedbacksInput {
  id: ID
  comment: String
  rating: Rating
  user: UserCreateOneInput!
  reservation: ReservationCreateOneInput!
}

"""An edge in a connection."""
type ReservationFeedbackEdge {
  """The item at the end of the edge."""
  node: ReservationFeedback!

  """A cursor for use in pagination."""
  cursor: String!
}

enum ReservationFeedbackOrderByInput {
  id_ASC
  id_DESC
  comment_ASC
  comment_DESC
  rating_ASC
  rating_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ReservationFeedbackPreviousValues {
  id: ID!
  comment: String
  rating: Rating
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ReservationFeedbackSubscriptionPayload {
  mutation: MutationType!
  node: ReservationFeedback
  updatedFields: [String!]
  previousValues: ReservationFeedbackPreviousValues
}

input ReservationFeedbackSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [ReservationFeedbackSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [ReservationFeedbackSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ReservationFeedbackSubscriptionWhereInput!]

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
  node: ReservationFeedbackWhereInput
}

input ReservationFeedbackUpdateInput {
  comment: String
  rating: Rating
  feedbacks: ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput
  user: UserUpdateOneRequiredInput
  reservation: ReservationUpdateOneRequiredInput
}

input ReservationFeedbackUpdateManyMutationInput {
  comment: String
  rating: Rating
}

input ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput {
  create: ReservationFeedbackCreateWithoutFeedbacksInput
  connect: ReservationFeedbackWhereUniqueInput
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput
  upsert: ReservationFeedbackUpsertWithoutFeedbacksInput
}

input ReservationFeedbackUpdateWithoutFeedbacksDataInput {
  comment: String
  rating: Rating
  user: UserUpdateOneRequiredInput
  reservation: ReservationUpdateOneRequiredInput
}

input ReservationFeedbackUpsertWithoutFeedbacksInput {
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput!
  create: ReservationFeedbackCreateWithoutFeedbacksInput!
}

input ReservationFeedbackWhereInput {
  """Logical AND on all given filters."""
  AND: [ReservationFeedbackWhereInput!]

  """Logical OR on all given filters."""
  OR: [ReservationFeedbackWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [ReservationFeedbackWhereInput!]
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
  comment: String

  """All values that are not equal to given value."""
  comment_not: String

  """All values that are contained in given list."""
  comment_in: [String!]

  """All values that are not contained in given list."""
  comment_not_in: [String!]

  """All values less than the given value."""
  comment_lt: String

  """All values less than or equal the given value."""
  comment_lte: String

  """All values greater than the given value."""
  comment_gt: String

  """All values greater than or equal the given value."""
  comment_gte: String

  """All values containing the given string."""
  comment_contains: String

  """All values not containing the given string."""
  comment_not_contains: String

  """All values starting with the given string."""
  comment_starts_with: String

  """All values not starting with the given string."""
  comment_not_starts_with: String

  """All values ending with the given string."""
  comment_ends_with: String

  """All values not ending with the given string."""
  comment_not_ends_with: String
  rating: Rating

  """All values that are not equal to given value."""
  rating_not: Rating

  """All values that are contained in given list."""
  rating_in: [Rating!]

  """All values that are not contained in given list."""
  rating_not_in: [Rating!]
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
  feedbacks_every: ProductVariantFeedbackWhereInput
  feedbacks_some: ProductVariantFeedbackWhereInput
  feedbacks_none: ProductVariantFeedbackWhereInput
  user: UserWhereInput
  reservation: ReservationWhereInput
}

input ReservationFeedbackWhereUniqueInput {
  id: ID
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
  reminderSentAt_ASC
  reminderSentAt_DESC
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
  reminderSentAt: DateTime
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
  reminderSentAt: DateTime

  """All values that are not equal to given value."""
  reminderSentAt_not: DateTime

  """All values that are contained in given list."""
  reminderSentAt_in: [DateTime!]

  """All values that are not contained in given list."""
  reminderSentAt_not_in: [DateTime!]

  """All values less than the given value."""
  reminderSentAt_lt: DateTime

  """All values less than or equal the given value."""
  reminderSentAt_lte: DateTime

  """All values greater than the given value."""
  reminderSentAt_gt: DateTime

  """All values greater than or equal the given value."""
  reminderSentAt_gte: DateTime
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

input ReservationUpdateDataInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  location: LocationUpdateOneInput
  products: PhysicalProductUpdateManyInput
}

input ReservationUpdateInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
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
  reminderSentAt: DateTime
}

input ReservationUpdateManyMutationInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
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

input ReservationUpdateOneRequiredInput {
  create: ReservationCreateInput
  connect: ReservationWhereUniqueInput
  update: ReservationUpdateDataInput
  upsert: ReservationUpsertNestedInput
}

input ReservationUpdateWithoutCustomerDataInput {
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
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

input ReservationUpsertNestedInput {
  update: ReservationUpdateDataInput!
  create: ReservationCreateInput!
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
  reminderSentAt: DateTime

  """All values that are not equal to given value."""
  reminderSentAt_not: DateTime

  """All values that are contained in given list."""
  reminderSentAt_in: [DateTime!]

  """All values that are not contained in given list."""
  reminderSentAt_not_in: [DateTime!]

  """All values less than the given value."""
  reminderSentAt_lt: DateTime

  """All values less than or equal the given value."""
  reminderSentAt_lte: DateTime

  """All values greater than the given value."""
  reminderSentAt_gt: DateTime

  """All values greater than or equal the given value."""
  reminderSentAt_gte: DateTime
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

type Size implements Node {
  id: ID!
  slug: String!
  productType: ProductType
  top: TopSize
  bottom: BottomSize
  display: String!
}

"""A connection to a list of items."""
type SizeConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [SizeEdge]!
  aggregate: AggregateSize!
}

input SizeCreateInput {
  id: ID
  slug: String!
  productType: ProductType
  display: String!
  top: TopSizeCreateOneInput
  bottom: BottomSizeCreateOneInput
}

input SizeCreateManyInput {
  create: [SizeCreateInput!]
  connect: [SizeWhereUniqueInput!]
}

input SizeCreateOneInput {
  create: SizeCreateInput
  connect: SizeWhereUniqueInput
}

"""An edge in a connection."""
type SizeEdge {
  """The item at the end of the edge."""
  node: Size!

  """A cursor for use in pagination."""
  cursor: String!
}

enum SizeOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  productType_ASC
  productType_DESC
  display_ASC
  display_DESC
}

type SizePreviousValues {
  id: ID!
  slug: String!
  productType: ProductType
  display: String!
}

input SizeScalarWhereInput {
  """Logical AND on all given filters."""
  AND: [SizeScalarWhereInput!]

  """Logical OR on all given filters."""
  OR: [SizeScalarWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [SizeScalarWhereInput!]
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
  productType: ProductType

  """All values that are not equal to given value."""
  productType_not: ProductType

  """All values that are contained in given list."""
  productType_in: [ProductType!]

  """All values that are not contained in given list."""
  productType_not_in: [ProductType!]
  display: String

  """All values that are not equal to given value."""
  display_not: String

  """All values that are contained in given list."""
  display_in: [String!]

  """All values that are not contained in given list."""
  display_not_in: [String!]

  """All values less than the given value."""
  display_lt: String

  """All values less than or equal the given value."""
  display_lte: String

  """All values greater than the given value."""
  display_gt: String

  """All values greater than or equal the given value."""
  display_gte: String

  """All values containing the given string."""
  display_contains: String

  """All values not containing the given string."""
  display_not_contains: String

  """All values starting with the given string."""
  display_starts_with: String

  """All values not starting with the given string."""
  display_not_starts_with: String

  """All values ending with the given string."""
  display_ends_with: String

  """All values not ending with the given string."""
  display_not_ends_with: String
}

type SizeSubscriptionPayload {
  mutation: MutationType!
  node: Size
  updatedFields: [String!]
  previousValues: SizePreviousValues
}

input SizeSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [SizeSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [SizeSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [SizeSubscriptionWhereInput!]

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
  node: SizeWhereInput
}

input SizeUpdateDataInput {
  slug: String
  productType: ProductType
  display: String
  top: TopSizeUpdateOneInput
  bottom: BottomSizeUpdateOneInput
}

input SizeUpdateInput {
  slug: String
  productType: ProductType
  display: String
  top: TopSizeUpdateOneInput
  bottom: BottomSizeUpdateOneInput
}

input SizeUpdateManyDataInput {
  slug: String
  productType: ProductType
  display: String
}

input SizeUpdateManyInput {
  create: [SizeCreateInput!]
  connect: [SizeWhereUniqueInput!]
  set: [SizeWhereUniqueInput!]
  disconnect: [SizeWhereUniqueInput!]
  delete: [SizeWhereUniqueInput!]
  update: [SizeUpdateWithWhereUniqueNestedInput!]
  updateMany: [SizeUpdateManyWithWhereNestedInput!]
  deleteMany: [SizeScalarWhereInput!]
  upsert: [SizeUpsertWithWhereUniqueNestedInput!]
}

input SizeUpdateManyMutationInput {
  slug: String
  productType: ProductType
  display: String
}

input SizeUpdateManyWithWhereNestedInput {
  where: SizeScalarWhereInput!
  data: SizeUpdateManyDataInput!
}

input SizeUpdateOneInput {
  create: SizeCreateInput
  connect: SizeWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: SizeUpdateDataInput
  upsert: SizeUpsertNestedInput
}

input SizeUpdateWithWhereUniqueNestedInput {
  where: SizeWhereUniqueInput!
  data: SizeUpdateDataInput!
}

input SizeUpsertNestedInput {
  update: SizeUpdateDataInput!
  create: SizeCreateInput!
}

input SizeUpsertWithWhereUniqueNestedInput {
  where: SizeWhereUniqueInput!
  update: SizeUpdateDataInput!
  create: SizeCreateInput!
}

input SizeWhereInput {
  """Logical AND on all given filters."""
  AND: [SizeWhereInput!]

  """Logical OR on all given filters."""
  OR: [SizeWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [SizeWhereInput!]
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
  productType: ProductType

  """All values that are not equal to given value."""
  productType_not: ProductType

  """All values that are contained in given list."""
  productType_in: [ProductType!]

  """All values that are not contained in given list."""
  productType_not_in: [ProductType!]
  display: String

  """All values that are not equal to given value."""
  display_not: String

  """All values that are contained in given list."""
  display_in: [String!]

  """All values that are not contained in given list."""
  display_not_in: [String!]

  """All values less than the given value."""
  display_lt: String

  """All values less than or equal the given value."""
  display_lte: String

  """All values greater than the given value."""
  display_gt: String

  """All values greater than or equal the given value."""
  display_gte: String

  """All values containing the given string."""
  display_contains: String

  """All values not containing the given string."""
  display_not_contains: String

  """All values starting with the given string."""
  display_starts_with: String

  """All values not starting with the given string."""
  display_not_starts_with: String

  """All values ending with the given string."""
  display_ends_with: String

  """All values not ending with the given string."""
  display_not_ends_with: String
  top: TopSizeWhereInput
  bottom: BottomSizeWhereInput
}

input SizeWhereUniqueInput {
  id: ID
  slug: String
}

type Subscription {
  brand(where: BrandSubscriptionWhereInput): BrandSubscriptionPayload
  collectionGroup(where: CollectionGroupSubscriptionWhereInput): CollectionGroupSubscriptionPayload
  homepageProductRail(where: HomepageProductRailSubscriptionWhereInput): HomepageProductRailSubscriptionPayload
  image(where: ImageSubscriptionWhereInput): ImageSubscriptionPayload
  productModel(where: ProductModelSubscriptionWhereInput): ProductModelSubscriptionPayload
  bagItem(where: BagItemSubscriptionWhereInput): BagItemSubscriptionPayload
  recentlyViewedProduct(where: RecentlyViewedProductSubscriptionWhereInput): RecentlyViewedProductSubscriptionPayload
  order(where: OrderSubscriptionWhereInput): OrderSubscriptionPayload
  productRequest(where: ProductRequestSubscriptionWhereInput): ProductRequestSubscriptionPayload
  productVariantWant(where: ProductVariantWantSubscriptionWhereInput): ProductVariantWantSubscriptionPayload
  reservationFeedback(where: ReservationFeedbackSubscriptionWhereInput): ReservationFeedbackSubscriptionPayload
  productVariantFeedback(where: ProductVariantFeedbackSubscriptionWhereInput): ProductVariantFeedbackSubscriptionPayload
  productVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionSubscriptionWhereInput): ProductVariantFeedbackQuestionSubscriptionPayload
  collection(where: CollectionSubscriptionWhereInput): CollectionSubscriptionPayload
  category(where: CategorySubscriptionWhereInput): CategorySubscriptionPayload
  customerDetail(where: CustomerDetailSubscriptionWhereInput): CustomerDetailSubscriptionPayload
  billingInfo(where: BillingInfoSubscriptionWhereInput): BillingInfoSubscriptionPayload
  location(where: LocationSubscriptionWhereInput): LocationSubscriptionPayload
  package(where: PackageSubscriptionWhereInput): PackageSubscriptionPayload
  size(where: SizeSubscriptionWhereInput): SizeSubscriptionPayload
  productFunction(where: ProductFunctionSubscriptionWhereInput): ProductFunctionSubscriptionPayload
  color(where: ColorSubscriptionWhereInput): ColorSubscriptionPayload
  topSize(where: TopSizeSubscriptionWhereInput): TopSizeSubscriptionPayload
  customer(where: CustomerSubscriptionWhereInput): CustomerSubscriptionPayload
  bottomSize(where: BottomSizeSubscriptionWhereInput): BottomSizeSubscriptionPayload
  label(where: LabelSubscriptionWhereInput): LabelSubscriptionPayload
  physicalProduct(where: PhysicalProductSubscriptionWhereInput): PhysicalProductSubscriptionPayload
  productVariant(where: ProductVariantSubscriptionWhereInput): ProductVariantSubscriptionPayload
  product(where: ProductSubscriptionWhereInput): ProductSubscriptionPayload
  reservation(where: ReservationSubscriptionWhereInput): ReservationSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}

type TopSize implements Node {
  id: ID!
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

"""A connection to a list of items."""
type TopSizeConnection {
  """Information to aid in pagination."""
  pageInfo: PageInfo!

  """A list of edges."""
  edges: [TopSizeEdge]!
  aggregate: AggregateTopSize!
}

input TopSizeCreateInput {
  id: ID
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

input TopSizeCreateOneInput {
  create: TopSizeCreateInput
  connect: TopSizeWhereUniqueInput
}

"""An edge in a connection."""
type TopSizeEdge {
  """The item at the end of the edge."""
  node: TopSize!

  """A cursor for use in pagination."""
  cursor: String!
}

enum TopSizeOrderByInput {
  id_ASC
  id_DESC
  letter_ASC
  letter_DESC
  sleeve_ASC
  sleeve_DESC
  shoulder_ASC
  shoulder_DESC
  chest_ASC
  chest_DESC
  neck_ASC
  neck_DESC
  length_ASC
  length_DESC
}

type TopSizePreviousValues {
  id: ID!
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

type TopSizeSubscriptionPayload {
  mutation: MutationType!
  node: TopSize
  updatedFields: [String!]
  previousValues: TopSizePreviousValues
}

input TopSizeSubscriptionWhereInput {
  """Logical AND on all given filters."""
  AND: [TopSizeSubscriptionWhereInput!]

  """Logical OR on all given filters."""
  OR: [TopSizeSubscriptionWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [TopSizeSubscriptionWhereInput!]

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
  node: TopSizeWhereInput
}

input TopSizeUpdateDataInput {
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

input TopSizeUpdateInput {
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

input TopSizeUpdateManyMutationInput {
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

input TopSizeUpdateOneInput {
  create: TopSizeCreateInput
  connect: TopSizeWhereUniqueInput
  disconnect: Boolean
  delete: Boolean
  update: TopSizeUpdateDataInput
  upsert: TopSizeUpsertNestedInput
}

input TopSizeUpsertNestedInput {
  update: TopSizeUpdateDataInput!
  create: TopSizeCreateInput!
}

input TopSizeWhereInput {
  """Logical AND on all given filters."""
  AND: [TopSizeWhereInput!]

  """Logical OR on all given filters."""
  OR: [TopSizeWhereInput!]

  """Logical NOT on all given filters combined by AND."""
  NOT: [TopSizeWhereInput!]
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
  letter: LetterSize

  """All values that are not equal to given value."""
  letter_not: LetterSize

  """All values that are contained in given list."""
  letter_in: [LetterSize!]

  """All values that are not contained in given list."""
  letter_not_in: [LetterSize!]
  sleeve: Float

  """All values that are not equal to given value."""
  sleeve_not: Float

  """All values that are contained in given list."""
  sleeve_in: [Float!]

  """All values that are not contained in given list."""
  sleeve_not_in: [Float!]

  """All values less than the given value."""
  sleeve_lt: Float

  """All values less than or equal the given value."""
  sleeve_lte: Float

  """All values greater than the given value."""
  sleeve_gt: Float

  """All values greater than or equal the given value."""
  sleeve_gte: Float
  shoulder: Float

  """All values that are not equal to given value."""
  shoulder_not: Float

  """All values that are contained in given list."""
  shoulder_in: [Float!]

  """All values that are not contained in given list."""
  shoulder_not_in: [Float!]

  """All values less than the given value."""
  shoulder_lt: Float

  """All values less than or equal the given value."""
  shoulder_lte: Float

  """All values greater than the given value."""
  shoulder_gt: Float

  """All values greater than or equal the given value."""
  shoulder_gte: Float
  chest: Float

  """All values that are not equal to given value."""
  chest_not: Float

  """All values that are contained in given list."""
  chest_in: [Float!]

  """All values that are not contained in given list."""
  chest_not_in: [Float!]

  """All values less than the given value."""
  chest_lt: Float

  """All values less than or equal the given value."""
  chest_lte: Float

  """All values greater than the given value."""
  chest_gt: Float

  """All values greater than or equal the given value."""
  chest_gte: Float
  neck: Float

  """All values that are not equal to given value."""
  neck_not: Float

  """All values that are contained in given list."""
  neck_in: [Float!]

  """All values that are not contained in given list."""
  neck_not_in: [Float!]

  """All values less than the given value."""
  neck_lt: Float

  """All values less than or equal the given value."""
  neck_lte: Float

  """All values greater than the given value."""
  neck_gt: Float

  """All values greater than or equal the given value."""
  neck_gte: Float
  length: Float

  """All values that are not equal to given value."""
  length_not: Float

  """All values that are contained in given list."""
  length_in: [Float!]

  """All values that are not contained in given list."""
  length_not_in: [Float!]

  """All values less than the given value."""
  length_lt: Float

  """All values less than or equal the given value."""
  length_lte: Float

  """All values greater than the given value."""
  length_gt: Float

  """All values greater than or equal the given value."""
  length_gte: Float
}

input TopSizeWhereUniqueInput {
  id: ID
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
  pushNotifications: PushNotificationStatus!
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
  pushNotifications: PushNotificationStatus
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
  pushNotifications_ASC
  pushNotifications_DESC
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
  pushNotifications: PushNotificationStatus!
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
  pushNotifications: PushNotificationStatus
}

input UserUpdateInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  pushNotifications: PushNotificationStatus
}

input UserUpdateManyMutationInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  pushNotifications: PushNotificationStatus
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
  pushNotifications: PushNotificationStatus

  """All values that are not equal to given value."""
  pushNotifications_not: PushNotificationStatus

  """All values that are contained in given list."""
  pushNotifications_in: [PushNotificationStatus!]

  """All values that are not contained in given list."""
  pushNotifications_not_in: [PushNotificationStatus!]
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

export type BottomSizeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'type_ASC' |
  'type_DESC' |
  'value_ASC' |
  'value_DESC' |
  'waist_ASC' |
  'waist_DESC' |
  'rise_ASC' |
  'rise_DESC' |
  'hem_ASC' |
  'hem_DESC' |
  'inseam_ASC' |
  'inseam_DESC'

export type BottomSizeType =   'WxL' |
  'US' |
  'EU' |
  'JP' |
  'Letter'

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
  'insureShipment_ASC' |
  'insureShipment_DESC' |
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
  'url_ASC' |
  'url_DESC' |
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

export type LetterSize =   'XS' |
  'S' |
  'M' |
  'L' |
  'XL' |
  'XXL'

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

export type ProductArchitecture =   'Fashion' |
  'Showstopper' |
  'Staple'

export type ProductFunctionOrderByInput =   'id_ASC' |
  'id_DESC' |
  'name_ASC' |
  'name_DESC'

export type ProductModelOrderByInput =   'id_ASC' |
  'id_DESC' |
  'name_ASC' |
  'name_DESC' |
  'height_ASC' |
  'height_DESC'

export type ProductOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'name_ASC' |
  'name_DESC' |
  'type_ASC' |
  'type_DESC' |
  'description_ASC' |
  'description_DESC' |
  'externalURL_ASC' |
  'externalURL_DESC' |
  'images_ASC' |
  'images_DESC' |
  'modelHeight_ASC' |
  'modelHeight_DESC' |
  'retailPrice_ASC' |
  'retailPrice_DESC' |
  'tags_ASC' |
  'tags_DESC' |
  'status_ASC' |
  'status_DESC' |
  'season_ASC' |
  'season_DESC' |
  'architecture_ASC' |
  'architecture_DESC' |
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

export type ProductType =   'Top' |
  'Bottom' |
  'Accessory' |
  'Shoe'

export type ProductVariantFeedbackOrderByInput =   'id_ASC' |
  'id_DESC' |
  'isCompleted_ASC' |
  'isCompleted_DESC'

export type ProductVariantFeedbackQuestionOrderByInput =   'id_ASC' |
  'id_DESC' |
  'question_ASC' |
  'question_DESC' |
  'type_ASC' |
  'type_DESC'

export type ProductVariantOrderByInput =   'id_ASC' |
  'id_DESC' |
  'sku_ASC' |
  'sku_DESC' |
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

export type ProductVariantWantOrderByInput =   'id_ASC' |
  'id_DESC' |
  'isFulfilled_ASC' |
  'isFulfilled_DESC'

export type PushNotificationStatus =   'Blocked' |
  'Granted' |
  'Denied'

export type QuestionType =   'MultipleChoice' |
  'FreeResponse'

export type Rating =   'Disliked' |
  'Ok' |
  'Loved'

export type RecentlyViewedProductOrderByInput =   'id_ASC' |
  'id_DESC' |
  'viewCount_ASC' |
  'viewCount_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ReservationFeedbackOrderByInput =   'id_ASC' |
  'id_DESC' |
  'comment_ASC' |
  'comment_DESC' |
  'rating_ASC' |
  'rating_DESC' |
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
  'reminderSentAt_ASC' |
  'reminderSentAt_DESC' |
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

export type SizeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'productType_ASC' |
  'productType_DESC' |
  'display_ASC' |
  'display_DESC'

export type TopSizeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'letter_ASC' |
  'letter_DESC' |
  'sleeve_ASC' |
  'sleeve_DESC' |
  'shoulder_ASC' |
  'shoulder_DESC' |
  'chest_ASC' |
  'chest_DESC' |
  'neck_ASC' |
  'neck_DESC' |
  'length_ASC' |
  'length_DESC'

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
  'updatedAt_DESC' |
  'pushNotifications_ASC' |
  'pushNotifications_DESC'

export type UserRole =   'Admin' |
  'Customer' |
  'Partner'

export interface BagItemCreateInput {
  id?: ID_Input | null
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
  customer: CustomerCreateOneWithoutBagItemsInput
  productVariant: ProductVariantCreateOneInput
}

export interface BagItemCreateManyWithoutCustomerInput {
  create?: BagItemCreateWithoutCustomerInput[] | BagItemCreateWithoutCustomerInput | null
  connect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
}

export interface BagItemCreateWithoutCustomerInput {
  id?: ID_Input | null
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
  productVariant: ProductVariantCreateOneInput
}

export interface BagItemScalarWhereInput {
  AND?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  OR?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  NOT?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
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
}

export interface BagItemSubscriptionWhereInput {
  AND?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
  OR?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
  NOT?: BagItemSubscriptionWhereInput[] | BagItemSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BagItemWhereInput | null
}

export interface BagItemUpdateInput {
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
  customer?: CustomerUpdateOneRequiredWithoutBagItemsInput | null
  productVariant?: ProductVariantUpdateOneRequiredInput | null
}

export interface BagItemUpdateManyDataInput {
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
}

export interface BagItemUpdateManyMutationInput {
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
}

export interface BagItemUpdateManyWithoutCustomerInput {
  create?: BagItemCreateWithoutCustomerInput[] | BagItemCreateWithoutCustomerInput | null
  connect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  set?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  disconnect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  delete?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  update?: BagItemUpdateWithWhereUniqueWithoutCustomerInput[] | BagItemUpdateWithWhereUniqueWithoutCustomerInput | null
  updateMany?: BagItemUpdateManyWithWhereNestedInput[] | BagItemUpdateManyWithWhereNestedInput | null
  deleteMany?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  upsert?: BagItemUpsertWithWhereUniqueWithoutCustomerInput[] | BagItemUpsertWithWhereUniqueWithoutCustomerInput | null
}

export interface BagItemUpdateManyWithWhereNestedInput {
  where: BagItemScalarWhereInput
  data: BagItemUpdateManyDataInput
}

export interface BagItemUpdateWithoutCustomerDataInput {
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
  productVariant?: ProductVariantUpdateOneRequiredInput | null
}

export interface BagItemUpdateWithWhereUniqueWithoutCustomerInput {
  where: BagItemWhereUniqueInput
  data: BagItemUpdateWithoutCustomerDataInput
}

export interface BagItemUpsertWithWhereUniqueWithoutCustomerInput {
  where: BagItemWhereUniqueInput
  update: BagItemUpdateWithoutCustomerDataInput
  create: BagItemCreateWithoutCustomerInput
}

export interface BagItemWhereInput {
  AND?: BagItemWhereInput[] | BagItemWhereInput | null
  OR?: BagItemWhereInput[] | BagItemWhereInput | null
  NOT?: BagItemWhereInput[] | BagItemWhereInput | null
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
  customer?: CustomerWhereInput | null
  productVariant?: ProductVariantWhereInput | null
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
  AND?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
  OR?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
  NOT?: BillingInfoSubscriptionWhereInput[] | BillingInfoSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BillingInfoWhereInput | null
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
  connect?: BillingInfoWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: BillingInfoUpdateDataInput | null
  upsert?: BillingInfoUpsertNestedInput | null
}

export interface BillingInfoUpsertNestedInput {
  update: BillingInfoUpdateDataInput
  create: BillingInfoCreateInput
}

export interface BillingInfoWhereInput {
  AND?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
  OR?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
  NOT?: BillingInfoWhereInput[] | BillingInfoWhereInput | null
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
}

export interface BillingInfoWhereUniqueInput {
  id?: ID_Input | null
}

export interface BottomSizeCreateInput {
  id?: ID_Input | null
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeCreateOneInput {
  create?: BottomSizeCreateInput | null
  connect?: BottomSizeWhereUniqueInput | null
}

export interface BottomSizeSubscriptionWhereInput {
  AND?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
  OR?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
  NOT?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BottomSizeWhereInput | null
}

export interface BottomSizeUpdateDataInput {
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeUpdateInput {
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeUpdateManyMutationInput {
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeUpdateOneInput {
  create?: BottomSizeCreateInput | null
  connect?: BottomSizeWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: BottomSizeUpdateDataInput | null
  upsert?: BottomSizeUpsertNestedInput | null
}

export interface BottomSizeUpsertNestedInput {
  update: BottomSizeUpdateDataInput
  create: BottomSizeCreateInput
}

export interface BottomSizeWhereInput {
  AND?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
  OR?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
  NOT?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
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
  type?: BottomSizeType | null
  type_not?: BottomSizeType | null
  type_in?: BottomSizeType[] | BottomSizeType | null
  type_not_in?: BottomSizeType[] | BottomSizeType | null
  value?: String | null
  value_not?: String | null
  value_in?: String[] | String | null
  value_not_in?: String[] | String | null
  value_lt?: String | null
  value_lte?: String | null
  value_gt?: String | null
  value_gte?: String | null
  value_contains?: String | null
  value_not_contains?: String | null
  value_starts_with?: String | null
  value_not_starts_with?: String | null
  value_ends_with?: String | null
  value_not_ends_with?: String | null
  waist?: Float | null
  waist_not?: Float | null
  waist_in?: Float[] | Float | null
  waist_not_in?: Float[] | Float | null
  waist_lt?: Float | null
  waist_lte?: Float | null
  waist_gt?: Float | null
  waist_gte?: Float | null
  rise?: Float | null
  rise_not?: Float | null
  rise_in?: Float[] | Float | null
  rise_not_in?: Float[] | Float | null
  rise_lt?: Float | null
  rise_lte?: Float | null
  rise_gt?: Float | null
  rise_gte?: Float | null
  hem?: Float | null
  hem_not?: Float | null
  hem_in?: Float[] | Float | null
  hem_not_in?: Float[] | Float | null
  hem_lt?: Float | null
  hem_lte?: Float | null
  hem_gt?: Float | null
  hem_gte?: Float | null
  inseam?: Float | null
  inseam_not?: Float | null
  inseam_in?: Float[] | Float | null
  inseam_not_in?: Float[] | Float | null
  inseam_lt?: Float | null
  inseam_lte?: Float | null
  inseam_gt?: Float | null
  inseam_gte?: Float | null
}

export interface BottomSizeWhereUniqueInput {
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
  since?: DateTime | null
  tier: BrandTier
  websiteUrl?: String | null
  products?: ProductCreateManyWithoutBrandInput | null
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
  AND?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
  OR?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
  NOT?: BrandSubscriptionWhereInput[] | BrandSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BrandWhereInput | null
}

export interface BrandUpdateInput {
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
  products?: ProductUpdateManyWithoutBrandInput | null
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
  connect?: BrandWhereUniqueInput | null
  update?: BrandUpdateWithoutProductsDataInput | null
  upsert?: BrandUpsertWithoutProductsInput | null
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
  AND?: BrandWhereInput[] | BrandWhereInput | null
  OR?: BrandWhereInput[] | BrandWhereInput | null
  NOT?: BrandWhereInput[] | BrandWhereInput | null
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
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
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
  children?: CategoryCreateManyInput | null
}

export interface CategoryCreateManyInput {
  create?: CategoryCreateInput[] | CategoryCreateInput | null
  connect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
}

export interface CategoryCreateOneWithoutProductsInput {
  create?: CategoryCreateWithoutProductsInput | null
  connect?: CategoryWhereUniqueInput | null
}

export interface CategoryCreateWithoutProductsInput {
  id?: ID_Input | null
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  children?: CategoryCreateManyInput | null
}

export interface CategoryScalarWhereInput {
  AND?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  OR?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  NOT?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
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
}

export interface CategorySubscriptionWhereInput {
  AND?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
  OR?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
  NOT?: CategorySubscriptionWhereInput[] | CategorySubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CategoryWhereInput | null
}

export interface CategoryUpdateDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductUpdateManyWithoutCategoryInput | null
  children?: CategoryUpdateManyInput | null
}

export interface CategoryUpdateInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductUpdateManyWithoutCategoryInput | null
  children?: CategoryUpdateManyInput | null
}

export interface CategoryUpdateManyDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
}

export interface CategoryUpdateManyInput {
  create?: CategoryCreateInput[] | CategoryCreateInput | null
  connect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  set?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  disconnect?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  delete?: CategoryWhereUniqueInput[] | CategoryWhereUniqueInput | null
  update?: CategoryUpdateWithWhereUniqueNestedInput[] | CategoryUpdateWithWhereUniqueNestedInput | null
  updateMany?: CategoryUpdateManyWithWhereNestedInput[] | CategoryUpdateManyWithWhereNestedInput | null
  deleteMany?: CategoryScalarWhereInput[] | CategoryScalarWhereInput | null
  upsert?: CategoryUpsertWithWhereUniqueNestedInput[] | CategoryUpsertWithWhereUniqueNestedInput | null
}

export interface CategoryUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
}

export interface CategoryUpdateManyWithWhereNestedInput {
  where: CategoryScalarWhereInput
  data: CategoryUpdateManyDataInput
}

export interface CategoryUpdateOneRequiredWithoutProductsInput {
  create?: CategoryCreateWithoutProductsInput | null
  connect?: CategoryWhereUniqueInput | null
  update?: CategoryUpdateWithoutProductsDataInput | null
  upsert?: CategoryUpsertWithoutProductsInput | null
}

export interface CategoryUpdateWithoutProductsDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  children?: CategoryUpdateManyInput | null
}

export interface CategoryUpdateWithWhereUniqueNestedInput {
  where: CategoryWhereUniqueInput
  data: CategoryUpdateDataInput
}

export interface CategoryUpsertWithoutProductsInput {
  update: CategoryUpdateWithoutProductsDataInput
  create: CategoryCreateWithoutProductsInput
}

export interface CategoryUpsertWithWhereUniqueNestedInput {
  where: CategoryWhereUniqueInput
  update: CategoryUpdateDataInput
  create: CategoryCreateInput
}

export interface CategoryWhereInput {
  AND?: CategoryWhereInput[] | CategoryWhereInput | null
  OR?: CategoryWhereInput[] | CategoryWhereInput | null
  NOT?: CategoryWhereInput[] | CategoryWhereInput | null
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
  AND?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
  OR?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
  NOT?: CollectionGroupSubscriptionWhereInput[] | CollectionGroupSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CollectionGroupWhereInput | null
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
  AND?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
  OR?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
  NOT?: CollectionGroupWhereInput[] | CollectionGroupWhereInput | null
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
}

export interface CollectionGroupWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface CollectionScalarWhereInput {
  AND?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  OR?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  NOT?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
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
}

export interface CollectionSubscriptionWhereInput {
  AND?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
  OR?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
  NOT?: CollectionSubscriptionWhereInput[] | CollectionSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CollectionWhereInput | null
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
  connect?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  set?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  disconnect?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  delete?: CollectionWhereUniqueInput[] | CollectionWhereUniqueInput | null
  update?: CollectionUpdateWithWhereUniqueNestedInput[] | CollectionUpdateWithWhereUniqueNestedInput | null
  updateMany?: CollectionUpdateManyWithWhereNestedInput[] | CollectionUpdateManyWithWhereNestedInput | null
  deleteMany?: CollectionScalarWhereInput[] | CollectionScalarWhereInput | null
  upsert?: CollectionUpsertWithWhereUniqueNestedInput[] | CollectionUpsertWithWhereUniqueNestedInput | null
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
  AND?: CollectionWhereInput[] | CollectionWhereInput | null
  OR?: CollectionWhereInput[] | CollectionWhereInput | null
  NOT?: CollectionWhereInput[] | CollectionWhereInput | null
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
  AND?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
  OR?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
  NOT?: ColorSubscriptionWhereInput[] | ColorSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ColorWhereInput | null
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
  connect?: ColorWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: ColorUpdateDataInput | null
  upsert?: ColorUpsertNestedInput | null
}

export interface ColorUpdateOneRequiredInput {
  create?: ColorCreateInput | null
  connect?: ColorWhereUniqueInput | null
  update?: ColorUpdateDataInput | null
  upsert?: ColorUpsertNestedInput | null
}

export interface ColorUpdateOneRequiredWithoutProductVariantsInput {
  create?: ColorCreateWithoutProductVariantsInput | null
  connect?: ColorWhereUniqueInput | null
  update?: ColorUpdateWithoutProductVariantsDataInput | null
  upsert?: ColorUpsertWithoutProductVariantsInput | null
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
  AND?: ColorWhereInput[] | ColorWhereInput | null
  OR?: ColorWhereInput[] | ColorWhereInput | null
  NOT?: ColorWhereInput[] | ColorWhereInput | null
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
}

export interface ColorWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
  colorCode?: String | null
}

export interface CustomerCreateInput {
  id?: ID_Input | null
  status?: CustomerStatus | null
  plan?: Plan | null
  user: UserCreateOneInput
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  bagItems?: BagItemCreateManyWithoutCustomerInput | null
  reservations?: ReservationCreateManyWithoutCustomerInput | null
}

export interface CustomerCreateOneInput {
  create?: CustomerCreateInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateOneWithoutBagItemsInput {
  create?: CustomerCreateWithoutBagItemsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateOneWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateWithoutBagItemsInput {
  id?: ID_Input | null
  status?: CustomerStatus | null
  plan?: Plan | null
  user: UserCreateOneInput
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  reservations?: ReservationCreateManyWithoutCustomerInput | null
}

export interface CustomerCreateWithoutReservationsInput {
  id?: ID_Input | null
  status?: CustomerStatus | null
  plan?: Plan | null
  user: UserCreateOneInput
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  bagItems?: BagItemCreateManyWithoutCustomerInput | null
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
  phoneOS?: String | null
  insureShipment?: Boolean | null
  shippingAddress?: LocationCreateOneInput | null
}

export interface CustomerDetailCreateOneInput {
  create?: CustomerDetailCreateInput | null
  connect?: CustomerDetailWhereUniqueInput | null
}

export interface CustomerDetailSubscriptionWhereInput {
  AND?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
  OR?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
  NOT?: CustomerDetailSubscriptionWhereInput[] | CustomerDetailSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CustomerDetailWhereInput | null
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
  phoneOS?: String | null
  insureShipment?: Boolean | null
  shippingAddress?: LocationUpdateOneInput | null
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
  phoneOS?: String | null
  insureShipment?: Boolean | null
  shippingAddress?: LocationUpdateOneInput | null
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
  insureShipment?: Boolean | null
}

export interface CustomerDetailUpdateOneInput {
  create?: CustomerDetailCreateInput | null
  connect?: CustomerDetailWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: CustomerDetailUpdateDataInput | null
  upsert?: CustomerDetailUpsertNestedInput | null
}

export interface CustomerDetailUpsertNestedInput {
  update: CustomerDetailUpdateDataInput
  create: CustomerDetailCreateInput
}

export interface CustomerDetailWhereInput {
  AND?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  OR?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  NOT?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
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
  insureShipment?: Boolean | null
  insureShipment_not?: Boolean | null
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
  shippingAddress?: LocationWhereInput | null
}

export interface CustomerDetailWhereUniqueInput {
  id?: ID_Input | null
}

export interface CustomerSubscriptionWhereInput {
  AND?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
  OR?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
  NOT?: CustomerSubscriptionWhereInput[] | CustomerSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CustomerWhereInput | null
}

export interface CustomerUpdateDataInput {
  status?: CustomerStatus | null
  plan?: Plan | null
  user?: UserUpdateOneRequiredInput | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateInput {
  status?: CustomerStatus | null
  plan?: Plan | null
  user?: UserUpdateOneRequiredInput | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateManyMutationInput {
  status?: CustomerStatus | null
  plan?: Plan | null
}

export interface CustomerUpdateOneRequiredInput {
  create?: CustomerCreateInput | null
  connect?: CustomerWhereUniqueInput | null
  update?: CustomerUpdateDataInput | null
  upsert?: CustomerUpsertNestedInput | null
}

export interface CustomerUpdateOneRequiredWithoutBagItemsInput {
  create?: CustomerCreateWithoutBagItemsInput | null
  connect?: CustomerWhereUniqueInput | null
  update?: CustomerUpdateWithoutBagItemsDataInput | null
  upsert?: CustomerUpsertWithoutBagItemsInput | null
}

export interface CustomerUpdateOneRequiredWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
  update?: CustomerUpdateWithoutReservationsDataInput | null
  upsert?: CustomerUpsertWithoutReservationsInput | null
}

export interface CustomerUpdateWithoutBagItemsDataInput {
  status?: CustomerStatus | null
  plan?: Plan | null
  user?: UserUpdateOneRequiredInput | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateWithoutReservationsDataInput {
  status?: CustomerStatus | null
  plan?: Plan | null
  user?: UserUpdateOneRequiredInput | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpsertNestedInput {
  update: CustomerUpdateDataInput
  create: CustomerCreateInput
}

export interface CustomerUpsertWithoutBagItemsInput {
  update: CustomerUpdateWithoutBagItemsDataInput
  create: CustomerCreateWithoutBagItemsInput
}

export interface CustomerUpsertWithoutReservationsInput {
  update: CustomerUpdateWithoutReservationsDataInput
  create: CustomerCreateWithoutReservationsInput
}

export interface CustomerWhereInput {
  AND?: CustomerWhereInput[] | CustomerWhereInput | null
  OR?: CustomerWhereInput[] | CustomerWhereInput | null
  NOT?: CustomerWhereInput[] | CustomerWhereInput | null
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
  status?: CustomerStatus | null
  status_not?: CustomerStatus | null
  status_in?: CustomerStatus[] | CustomerStatus | null
  status_not_in?: CustomerStatus[] | CustomerStatus | null
  plan?: Plan | null
  plan_not?: Plan | null
  plan_in?: Plan[] | Plan | null
  plan_not_in?: Plan[] | Plan | null
  user?: UserWhereInput | null
  detail?: CustomerDetailWhereInput | null
  billingInfo?: BillingInfoWhereInput | null
  bagItems_every?: BagItemWhereInput | null
  bagItems_some?: BagItemWhereInput | null
  bagItems_none?: BagItemWhereInput | null
  reservations_every?: ReservationWhereInput | null
  reservations_some?: ReservationWhereInput | null
  reservations_none?: ReservationWhereInput | null
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
  AND?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
  OR?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
  NOT?: HomepageProductRailSubscriptionWhereInput[] | HomepageProductRailSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: HomepageProductRailWhereInput | null
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
  AND?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
  OR?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
  NOT?: HomepageProductRailWhereInput[] | HomepageProductRailWhereInput | null
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
}

export interface HomepageProductRailWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface ImageCreateInput {
  id?: ID_Input | null
  caption?: String | null
  url?: String | null
  originalHeight?: Int | null
  originalUrl: String
  originalWidth?: Int | null
  resizedUrl: String
  title?: String | null
}

export interface ImageSubscriptionWhereInput {
  AND?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
  OR?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
  NOT?: ImageSubscriptionWhereInput[] | ImageSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ImageWhereInput | null
}

export interface ImageUpdateInput {
  caption?: String | null
  url?: String | null
  originalHeight?: Int | null
  originalUrl?: String | null
  originalWidth?: Int | null
  resizedUrl?: String | null
  title?: String | null
}

export interface ImageUpdateManyMutationInput {
  caption?: String | null
  url?: String | null
  originalHeight?: Int | null
  originalUrl?: String | null
  originalWidth?: Int | null
  resizedUrl?: String | null
  title?: String | null
}

export interface ImageWhereInput {
  AND?: ImageWhereInput[] | ImageWhereInput | null
  OR?: ImageWhereInput[] | ImageWhereInput | null
  NOT?: ImageWhereInput[] | ImageWhereInput | null
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
  AND?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
  OR?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
  NOT?: LabelSubscriptionWhereInput[] | LabelSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: LabelWhereInput | null
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
  connect?: LabelWhereUniqueInput | null
  update?: LabelUpdateDataInput | null
  upsert?: LabelUpsertNestedInput | null
}

export interface LabelUpsertNestedInput {
  update: LabelUpdateDataInput
  create: LabelCreateInput
}

export interface LabelWhereInput {
  AND?: LabelWhereInput[] | LabelWhereInput | null
  OR?: LabelWhereInput[] | LabelWhereInput | null
  NOT?: LabelWhereInput[] | LabelWhereInput | null
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
  lat?: Float | null
  lng?: Float | null
  user?: UserCreateOneInput | null
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
  lat?: Float | null
  lng?: Float | null
  user?: UserCreateOneInput | null
}

export interface LocationSubscriptionWhereInput {
  AND?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
  OR?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
  NOT?: LocationSubscriptionWhereInput[] | LocationSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: LocationWhereInput | null
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
  lat?: Float | null
  lng?: Float | null
  user?: UserUpdateOneInput | null
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
  lat?: Float | null
  lng?: Float | null
  user?: UserUpdateOneInput | null
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
  connect?: LocationWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: LocationUpdateDataInput | null
  upsert?: LocationUpsertNestedInput | null
}

export interface LocationUpdateOneRequiredInput {
  create?: LocationCreateInput | null
  connect?: LocationWhereUniqueInput | null
  update?: LocationUpdateDataInput | null
  upsert?: LocationUpsertNestedInput | null
}

export interface LocationUpdateOneWithoutPhysicalProductsInput {
  create?: LocationCreateWithoutPhysicalProductsInput | null
  connect?: LocationWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: LocationUpdateWithoutPhysicalProductsDataInput | null
  upsert?: LocationUpsertWithoutPhysicalProductsInput | null
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
  lat?: Float | null
  lng?: Float | null
  user?: UserUpdateOneInput | null
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
  AND?: LocationWhereInput[] | LocationWhereInput | null
  OR?: LocationWhereInput[] | LocationWhereInput | null
  NOT?: LocationWhereInput[] | LocationWhereInput | null
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
  user?: UserWhereInput | null
  physicalProducts_every?: PhysicalProductWhereInput | null
  physicalProducts_some?: PhysicalProductWhereInput | null
  physicalProducts_none?: PhysicalProductWhereInput | null
}

export interface LocationWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface OrderCreateInput {
  id?: ID_Input | null
}

export interface OrderSubscriptionWhereInput {
  AND?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
  OR?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
  NOT?: OrderSubscriptionWhereInput[] | OrderSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: OrderWhereInput | null
}

export interface OrderWhereInput {
  AND?: OrderWhereInput[] | OrderWhereInput | null
  OR?: OrderWhereInput[] | OrderWhereInput | null
  NOT?: OrderWhereInput[] | OrderWhereInput | null
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
}

export interface OrderWhereUniqueInput {
  id?: ID_Input | null
}

export interface PackageCreateInput {
  id?: ID_Input | null
  weight?: Float | null
  items?: PhysicalProductCreateManyInput | null
  shippingLabel: LabelCreateOneInput
  fromAddress: LocationCreateOneInput
  toAddress: LocationCreateOneInput
}

export interface PackageCreateOneInput {
  create?: PackageCreateInput | null
  connect?: PackageWhereUniqueInput | null
}

export interface PackageSubscriptionWhereInput {
  AND?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
  OR?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
  NOT?: PackageSubscriptionWhereInput[] | PackageSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PackageWhereInput | null
}

export interface PackageUpdateDataInput {
  weight?: Float | null
  items?: PhysicalProductUpdateManyInput | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
}

export interface PackageUpdateInput {
  weight?: Float | null
  items?: PhysicalProductUpdateManyInput | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
}

export interface PackageUpdateManyMutationInput {
  weight?: Float | null
}

export interface PackageUpdateOneInput {
  create?: PackageCreateInput | null
  connect?: PackageWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: PackageUpdateDataInput | null
  upsert?: PackageUpsertNestedInput | null
}

export interface PackageUpsertNestedInput {
  update: PackageUpdateDataInput
  create: PackageCreateInput
}

export interface PackageWhereInput {
  AND?: PackageWhereInput[] | PackageWhereInput | null
  OR?: PackageWhereInput[] | PackageWhereInput | null
  NOT?: PackageWhereInput[] | PackageWhereInput | null
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
  items_every?: PhysicalProductWhereInput | null
  items_some?: PhysicalProductWhereInput | null
  items_none?: PhysicalProductWhereInput | null
  shippingLabel?: LabelWhereInput | null
  fromAddress?: LocationWhereInput | null
  toAddress?: LocationWhereInput | null
}

export interface PackageWhereUniqueInput {
  id?: ID_Input | null
}

export interface PhysicalProductCreateInput {
  id?: ID_Input | null
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
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
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
}

export interface PhysicalProductCreateWithoutProductVariantInput {
  id?: ID_Input | null
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
}

export interface PhysicalProductScalarWhereInput {
  AND?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  OR?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  NOT?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
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
}

export interface PhysicalProductSubscriptionWhereInput {
  AND?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
  OR?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
  NOT?: PhysicalProductSubscriptionWhereInput[] | PhysicalProductSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PhysicalProductWhereInput | null
}

export interface PhysicalProductUpdateDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
}

export interface PhysicalProductUpdateInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
}

export interface PhysicalProductUpdateManyDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateManyInput {
  create?: PhysicalProductCreateInput[] | PhysicalProductCreateInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueNestedInput[] | PhysicalProductUpdateWithWhereUniqueNestedInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueNestedInput[] | PhysicalProductUpsertWithWhereUniqueNestedInput | null
}

export interface PhysicalProductUpdateManyMutationInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
}

export interface PhysicalProductUpdateManyWithoutLocationInput {
  create?: PhysicalProductCreateWithoutLocationInput[] | PhysicalProductCreateWithoutLocationInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueWithoutLocationInput[] | PhysicalProductUpdateWithWhereUniqueWithoutLocationInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueWithoutLocationInput[] | PhysicalProductUpsertWithWhereUniqueWithoutLocationInput | null
}

export interface PhysicalProductUpdateManyWithoutProductVariantInput {
  create?: PhysicalProductCreateWithoutProductVariantInput[] | PhysicalProductCreateWithoutProductVariantInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput[] | PhysicalProductUpdateWithWhereUniqueWithoutProductVariantInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput[] | PhysicalProductUpsertWithWhereUniqueWithoutProductVariantInput | null
}

export interface PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput
  data: PhysicalProductUpdateManyDataInput
}

export interface PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
}

export interface PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
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
  AND?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
  OR?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
  NOT?: PhysicalProductWhereInput[] | PhysicalProductWhereInput | null
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
  location?: LocationWhereInput | null
  productVariant?: ProductVariantWhereInput | null
}

export interface PhysicalProductWhereUniqueInput {
  id?: ID_Input | null
  seasonsUID?: String | null
}

export interface ProductCreateinnerMaterialsInput {
  set?: String[] | String | null
}

export interface ProductCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
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

export interface ProductCreateManyWithoutModelInput {
  create?: ProductCreateWithoutModelInput[] | ProductCreateWithoutModelInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateOneInput {
  create?: ProductCreateInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductCreateOneWithoutVariantsInput {
  create?: ProductCreateWithoutVariantsInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductCreateouterMaterialsInput {
  set?: String[] | String | null
}

export interface ProductCreateWithoutBrandInput {
  id?: ID_Input | null
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  category: CategoryCreateOneWithoutProductsInput
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
}

export interface ProductCreateWithoutCategoryInput {
  id?: ID_Input | null
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  brand: BrandCreateOneWithoutProductsInput
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
}

export interface ProductCreateWithoutModelInput {
  id?: ID_Input | null
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
}

export interface ProductCreateWithoutVariantsInput {
  id?: ID_Input | null
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
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
  AND?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  OR?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  NOT?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
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
}

export interface ProductFunctionSubscriptionWhereInput {
  AND?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
  OR?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
  NOT?: ProductFunctionSubscriptionWhereInput[] | ProductFunctionSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductFunctionWhereInput | null
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
  connect?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  set?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  disconnect?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  delete?: ProductFunctionWhereUniqueInput[] | ProductFunctionWhereUniqueInput | null
  update?: ProductFunctionUpdateWithWhereUniqueNestedInput[] | ProductFunctionUpdateWithWhereUniqueNestedInput | null
  updateMany?: ProductFunctionUpdateManyWithWhereNestedInput[] | ProductFunctionUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductFunctionScalarWhereInput[] | ProductFunctionScalarWhereInput | null
  upsert?: ProductFunctionUpsertWithWhereUniqueNestedInput[] | ProductFunctionUpsertWithWhereUniqueNestedInput | null
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
  AND?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
  OR?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
  NOT?: ProductFunctionWhereInput[] | ProductFunctionWhereInput | null
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
}

export interface ProductFunctionWhereUniqueInput {
  id?: ID_Input | null
  name?: String | null
}

export interface ProductModelCreateInput {
  id?: ID_Input | null
  name: String
  height: Float
  products?: ProductCreateManyWithoutModelInput | null
}

export interface ProductModelCreateOneWithoutProductsInput {
  create?: ProductModelCreateWithoutProductsInput | null
  connect?: ProductModelWhereUniqueInput | null
}

export interface ProductModelCreateWithoutProductsInput {
  id?: ID_Input | null
  name: String
  height: Float
}

export interface ProductModelSubscriptionWhereInput {
  AND?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
  OR?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
  NOT?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductModelWhereInput | null
}

export interface ProductModelUpdateInput {
  name?: String | null
  height?: Float | null
  products?: ProductUpdateManyWithoutModelInput | null
}

export interface ProductModelUpdateManyMutationInput {
  name?: String | null
  height?: Float | null
}

export interface ProductModelUpdateOneWithoutProductsInput {
  create?: ProductModelCreateWithoutProductsInput | null
  connect?: ProductModelWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: ProductModelUpdateWithoutProductsDataInput | null
  upsert?: ProductModelUpsertWithoutProductsInput | null
}

export interface ProductModelUpdateWithoutProductsDataInput {
  name?: String | null
  height?: Float | null
}

export interface ProductModelUpsertWithoutProductsInput {
  update: ProductModelUpdateWithoutProductsDataInput
  create: ProductModelCreateWithoutProductsInput
}

export interface ProductModelWhereInput {
  AND?: ProductModelWhereInput[] | ProductModelWhereInput | null
  OR?: ProductModelWhereInput[] | ProductModelWhereInput | null
  NOT?: ProductModelWhereInput[] | ProductModelWhereInput | null
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
  height?: Float | null
  height_not?: Float | null
  height_in?: Float[] | Float | null
  height_not_in?: Float[] | Float | null
  height_lt?: Float | null
  height_lte?: Float | null
  height_gt?: Float | null
  height_gte?: Float | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
}

export interface ProductModelWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductRequestCreateimagesInput {
  set?: String[] | String | null
}

export interface ProductRequestCreateInput {
  id?: ID_Input | null
  brand?: String | null
  description?: String | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason: String
  sku?: String | null
  url: String
  images?: ProductRequestCreateimagesInput | null
  user: UserCreateOneInput
}

export interface ProductRequestSubscriptionWhereInput {
  AND?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
  OR?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
  NOT?: ProductRequestSubscriptionWhereInput[] | ProductRequestSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductRequestWhereInput | null
}

export interface ProductRequestUpdateimagesInput {
  set?: String[] | String | null
}

export interface ProductRequestUpdateInput {
  brand?: String | null
  description?: String | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason?: String | null
  sku?: String | null
  url?: String | null
  images?: ProductRequestUpdateimagesInput | null
  user?: UserUpdateOneRequiredInput | null
}

export interface ProductRequestUpdateManyMutationInput {
  brand?: String | null
  description?: String | null
  name?: String | null
  price?: Int | null
  priceCurrency?: String | null
  productID?: String | null
  reason?: String | null
  sku?: String | null
  url?: String | null
  images?: ProductRequestUpdateimagesInput | null
}

export interface ProductRequestWhereInput {
  AND?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
  OR?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
  NOT?: ProductRequestWhereInput[] | ProductRequestWhereInput | null
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
}

export interface ProductRequestWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductScalarWhereInput {
  AND?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  OR?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  NOT?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
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
  type?: ProductType | null
  type_not?: ProductType | null
  type_in?: ProductType[] | ProductType | null
  type_not_in?: ProductType[] | ProductType | null
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
  season?: String | null
  season_not?: String | null
  season_in?: String[] | String | null
  season_not_in?: String[] | String | null
  season_lt?: String | null
  season_lte?: String | null
  season_gt?: String | null
  season_gte?: String | null
  season_contains?: String | null
  season_not_contains?: String | null
  season_starts_with?: String | null
  season_not_starts_with?: String | null
  season_ends_with?: String | null
  season_not_ends_with?: String | null
  architecture?: ProductArchitecture | null
  architecture_not?: ProductArchitecture | null
  architecture_in?: ProductArchitecture[] | ProductArchitecture | null
  architecture_not_in?: ProductArchitecture[] | ProductArchitecture | null
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
}

export interface ProductSubscriptionWhereInput {
  AND?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
  OR?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
  NOT?: ProductSubscriptionWhereInput[] | ProductSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductWhereInput | null
}

export interface ProductUpdateDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
}

export interface ProductUpdateinnerMaterialsInput {
  set?: String[] | String | null
}

export interface ProductUpdateInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
}

export interface ProductUpdateManyDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
}

export interface ProductUpdateManyInput {
  create?: ProductCreateInput[] | ProductCreateInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueNestedInput[] | ProductUpdateWithWhereUniqueNestedInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  upsert?: ProductUpsertWithWhereUniqueNestedInput[] | ProductUpsertWithWhereUniqueNestedInput | null
}

export interface ProductUpdateManyMutationInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
}

export interface ProductUpdateManyWithoutBrandInput {
  create?: ProductCreateWithoutBrandInput[] | ProductCreateWithoutBrandInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutBrandInput[] | ProductUpdateWithWhereUniqueWithoutBrandInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutBrandInput[] | ProductUpsertWithWhereUniqueWithoutBrandInput | null
}

export interface ProductUpdateManyWithoutCategoryInput {
  create?: ProductCreateWithoutCategoryInput[] | ProductCreateWithoutCategoryInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutCategoryInput[] | ProductUpdateWithWhereUniqueWithoutCategoryInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutCategoryInput[] | ProductUpsertWithWhereUniqueWithoutCategoryInput | null
}

export interface ProductUpdateManyWithoutModelInput {
  create?: ProductCreateWithoutModelInput[] | ProductCreateWithoutModelInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutModelInput[] | ProductUpdateWithWhereUniqueWithoutModelInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutModelInput[] | ProductUpsertWithWhereUniqueWithoutModelInput | null
}

export interface ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput
  data: ProductUpdateManyDataInput
}

export interface ProductUpdateOneRequiredInput {
  create?: ProductCreateInput | null
  connect?: ProductWhereUniqueInput | null
  update?: ProductUpdateDataInput | null
  upsert?: ProductUpsertNestedInput | null
}

export interface ProductUpdateOneRequiredWithoutVariantsInput {
  create?: ProductCreateWithoutVariantsInput | null
  connect?: ProductWhereUniqueInput | null
  update?: ProductUpdateWithoutVariantsDataInput | null
  upsert?: ProductUpsertWithoutVariantsInput | null
}

export interface ProductUpdateouterMaterialsInput {
  set?: String[] | String | null
}

export interface ProductUpdateWithoutBrandDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
}

export interface ProductUpdateWithoutCategoryDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
}

export interface ProductUpdateWithoutModelDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
}

export interface ProductUpdateWithoutVariantsDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
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

export interface ProductUpdateWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutModelDataInput
}

export interface ProductUpsertNestedInput {
  update: ProductUpdateDataInput
  create: ProductCreateInput
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

export interface ProductUpsertWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutModelDataInput
  create: ProductCreateWithoutModelInput
}

export interface ProductVariantCreateInput {
  id?: ID_Input | null
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  product: ProductCreateOneWithoutVariantsInput
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
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
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  product: ProductCreateOneWithoutVariantsInput
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
}

export interface ProductVariantCreateWithoutPhysicalProductsInput {
  id?: ID_Input | null
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  product: ProductCreateOneWithoutVariantsInput
}

export interface ProductVariantCreateWithoutProductInput {
  id?: ID_Input | null
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
}

export interface ProductVariantFeedbackCreateInput {
  id?: ID_Input | null
  isCompleted: Boolean
  questions?: ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput | null
  reservationFeedback: ReservationFeedbackCreateOneWithoutFeedbacksInput
  variant: ProductVariantCreateOneInput
}

export interface ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput {
  create?: ProductVariantFeedbackCreateWithoutReservationFeedbackInput[] | ProductVariantFeedbackCreateWithoutReservationFeedbackInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
}

export interface ProductVariantFeedbackCreateOneWithoutQuestionsInput {
  create?: ProductVariantFeedbackCreateWithoutQuestionsInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput | null
}

export interface ProductVariantFeedbackCreateWithoutQuestionsInput {
  id?: ID_Input | null
  isCompleted: Boolean
  reservationFeedback: ReservationFeedbackCreateOneWithoutFeedbacksInput
  variant: ProductVariantCreateOneInput
}

export interface ProductVariantFeedbackCreateWithoutReservationFeedbackInput {
  id?: ID_Input | null
  isCompleted: Boolean
  questions?: ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput | null
  variant: ProductVariantCreateOneInput
}

export interface ProductVariantFeedbackQuestionCreateInput {
  id?: ID_Input | null
  question: String
  type: QuestionType
  options?: ProductVariantFeedbackQuestionCreateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionCreateresponsesInput | null
  variantFeedback: ProductVariantFeedbackCreateOneWithoutQuestionsInput
}

export interface ProductVariantFeedbackQuestionCreateManyWithoutVariantFeedbackInput {
  create?: ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput | null
  connect?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
}

export interface ProductVariantFeedbackQuestionCreateoptionsInput {
  set?: String[] | String | null
}

export interface ProductVariantFeedbackQuestionCreateresponsesInput {
  set?: String[] | String | null
}

export interface ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput {
  id?: ID_Input | null
  question: String
  type: QuestionType
  options?: ProductVariantFeedbackQuestionCreateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionCreateresponsesInput | null
}

export interface ProductVariantFeedbackQuestionScalarWhereInput {
  AND?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  OR?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  NOT?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
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
  question?: String | null
  question_not?: String | null
  question_in?: String[] | String | null
  question_not_in?: String[] | String | null
  question_lt?: String | null
  question_lte?: String | null
  question_gt?: String | null
  question_gte?: String | null
  question_contains?: String | null
  question_not_contains?: String | null
  question_starts_with?: String | null
  question_not_starts_with?: String | null
  question_ends_with?: String | null
  question_not_ends_with?: String | null
  type?: QuestionType | null
  type_not?: QuestionType | null
  type_in?: QuestionType[] | QuestionType | null
  type_not_in?: QuestionType[] | QuestionType | null
}

export interface ProductVariantFeedbackQuestionSubscriptionWhereInput {
  AND?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
  OR?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
  NOT?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantFeedbackQuestionWhereInput | null
}

export interface ProductVariantFeedbackQuestionUpdateInput {
  question?: String | null
  type?: QuestionType | null
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
  variantFeedback?: ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput | null
}

export interface ProductVariantFeedbackQuestionUpdateManyDataInput {
  question?: String | null
  type?: QuestionType | null
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
}

export interface ProductVariantFeedbackQuestionUpdateManyMutationInput {
  question?: String | null
  type?: QuestionType | null
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
}

export interface ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput {
  create?: ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput | null
  connect?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  set?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  disconnect?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  delete?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  update?: ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput | null
  updateMany?: ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput[] | ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  upsert?: ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput | null
}

export interface ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackQuestionScalarWhereInput
  data: ProductVariantFeedbackQuestionUpdateManyDataInput
}

export interface ProductVariantFeedbackQuestionUpdateoptionsInput {
  set?: String[] | String | null
}

export interface ProductVariantFeedbackQuestionUpdateresponsesInput {
  set?: String[] | String | null
}

export interface ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput {
  question?: String | null
  type?: QuestionType | null
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
}

export interface ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput {
  where: ProductVariantFeedbackQuestionWhereUniqueInput
  data: ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput
}

export interface ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput {
  where: ProductVariantFeedbackQuestionWhereUniqueInput
  update: ProductVariantFeedbackQuestionUpdateWithoutVariantFeedbackDataInput
  create: ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput
}

export interface ProductVariantFeedbackQuestionWhereInput {
  AND?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
  OR?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
  NOT?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
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
  question?: String | null
  question_not?: String | null
  question_in?: String[] | String | null
  question_not_in?: String[] | String | null
  question_lt?: String | null
  question_lte?: String | null
  question_gt?: String | null
  question_gte?: String | null
  question_contains?: String | null
  question_not_contains?: String | null
  question_starts_with?: String | null
  question_not_starts_with?: String | null
  question_ends_with?: String | null
  question_not_ends_with?: String | null
  type?: QuestionType | null
  type_not?: QuestionType | null
  type_in?: QuestionType[] | QuestionType | null
  type_not_in?: QuestionType[] | QuestionType | null
  variantFeedback?: ProductVariantFeedbackWhereInput | null
}

export interface ProductVariantFeedbackQuestionWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductVariantFeedbackScalarWhereInput {
  AND?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  OR?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  NOT?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
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
  isCompleted?: Boolean | null
  isCompleted_not?: Boolean | null
}

export interface ProductVariantFeedbackSubscriptionWhereInput {
  AND?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
  OR?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
  NOT?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantFeedbackWhereInput | null
}

export interface ProductVariantFeedbackUpdateInput {
  isCompleted?: Boolean | null
  questions?: ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput | null
  reservationFeedback?: ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput | null
  variant?: ProductVariantUpdateOneRequiredInput | null
}

export interface ProductVariantFeedbackUpdateManyDataInput {
  isCompleted?: Boolean | null
}

export interface ProductVariantFeedbackUpdateManyMutationInput {
  isCompleted?: Boolean | null
}

export interface ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput {
  create?: ProductVariantFeedbackCreateWithoutReservationFeedbackInput[] | ProductVariantFeedbackCreateWithoutReservationFeedbackInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  set?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  disconnect?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  delete?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  update?: ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput[] | ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput | null
  updateMany?: ProductVariantFeedbackUpdateManyWithWhereNestedInput[] | ProductVariantFeedbackUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  upsert?: ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput[] | ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput | null
}

export interface ProductVariantFeedbackUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackScalarWhereInput
  data: ProductVariantFeedbackUpdateManyDataInput
}

export interface ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput {
  create?: ProductVariantFeedbackCreateWithoutQuestionsInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput | null
  update?: ProductVariantFeedbackUpdateWithoutQuestionsDataInput | null
  upsert?: ProductVariantFeedbackUpsertWithoutQuestionsInput | null
}

export interface ProductVariantFeedbackUpdateWithoutQuestionsDataInput {
  isCompleted?: Boolean | null
  reservationFeedback?: ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput | null
  variant?: ProductVariantUpdateOneRequiredInput | null
}

export interface ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput {
  isCompleted?: Boolean | null
  questions?: ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput | null
  variant?: ProductVariantUpdateOneRequiredInput | null
}

export interface ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput {
  where: ProductVariantFeedbackWhereUniqueInput
  data: ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput
}

export interface ProductVariantFeedbackUpsertWithoutQuestionsInput {
  update: ProductVariantFeedbackUpdateWithoutQuestionsDataInput
  create: ProductVariantFeedbackCreateWithoutQuestionsInput
}

export interface ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput {
  where: ProductVariantFeedbackWhereUniqueInput
  update: ProductVariantFeedbackUpdateWithoutReservationFeedbackDataInput
  create: ProductVariantFeedbackCreateWithoutReservationFeedbackInput
}

export interface ProductVariantFeedbackWhereInput {
  AND?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
  OR?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
  NOT?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
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
  isCompleted?: Boolean | null
  isCompleted_not?: Boolean | null
  questions_every?: ProductVariantFeedbackQuestionWhereInput | null
  questions_some?: ProductVariantFeedbackQuestionWhereInput | null
  questions_none?: ProductVariantFeedbackQuestionWhereInput | null
  reservationFeedback?: ReservationFeedbackWhereInput | null
  variant?: ProductVariantWhereInput | null
}

export interface ProductVariantFeedbackWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductVariantScalarWhereInput {
  AND?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  OR?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  NOT?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
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
}

export interface ProductVariantSubscriptionWhereInput {
  AND?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
  OR?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
  NOT?: ProductVariantSubscriptionWhereInput[] | ProductVariantSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantWhereInput | null
}

export interface ProductVariantUpdateDataInput {
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
}

export interface ProductVariantUpdateInput {
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
}

export interface ProductVariantUpdateManyDataInput {
  sku?: String | null
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
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  set?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  disconnect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  delete?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateWithWhereUniqueWithoutColorInput[] | ProductVariantUpdateWithWhereUniqueWithoutColorInput | null
  updateMany?: ProductVariantUpdateManyWithWhereNestedInput[] | ProductVariantUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  upsert?: ProductVariantUpsertWithWhereUniqueWithoutColorInput[] | ProductVariantUpsertWithWhereUniqueWithoutColorInput | null
}

export interface ProductVariantUpdateManyWithoutProductInput {
  create?: ProductVariantCreateWithoutProductInput[] | ProductVariantCreateWithoutProductInput | null
  connect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  set?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  disconnect?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  delete?: ProductVariantWhereUniqueInput[] | ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateWithWhereUniqueWithoutProductInput[] | ProductVariantUpdateWithWhereUniqueWithoutProductInput | null
  updateMany?: ProductVariantUpdateManyWithWhereNestedInput[] | ProductVariantUpdateManyWithWhereNestedInput | null
  deleteMany?: ProductVariantScalarWhereInput[] | ProductVariantScalarWhereInput | null
  upsert?: ProductVariantUpsertWithWhereUniqueWithoutProductInput[] | ProductVariantUpsertWithWhereUniqueWithoutProductInput | null
}

export interface ProductVariantUpdateManyWithWhereNestedInput {
  where: ProductVariantScalarWhereInput
  data: ProductVariantUpdateManyDataInput
}

export interface ProductVariantUpdateOneRequiredInput {
  create?: ProductVariantCreateInput | null
  connect?: ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateDataInput | null
  upsert?: ProductVariantUpsertNestedInput | null
}

export interface ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput {
  create?: ProductVariantCreateWithoutPhysicalProductsInput | null
  connect?: ProductVariantWhereUniqueInput | null
  update?: ProductVariantUpdateWithoutPhysicalProductsDataInput | null
  upsert?: ProductVariantUpsertWithoutPhysicalProductsInput | null
}

export interface ProductVariantUpdateWithoutColorDataInput {
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
}

export interface ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
}

export interface ProductVariantUpdateWithoutProductDataInput {
  sku?: String | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
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

export interface ProductVariantWantCreateInput {
  id?: ID_Input | null
  isFulfilled: Boolean
  productVariant: ProductVariantCreateOneInput
  user: UserCreateOneInput
}

export interface ProductVariantWantSubscriptionWhereInput {
  AND?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
  OR?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
  NOT?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantWantWhereInput | null
}

export interface ProductVariantWantUpdateInput {
  isFulfilled?: Boolean | null
  productVariant?: ProductVariantUpdateOneRequiredInput | null
  user?: UserUpdateOneRequiredInput | null
}

export interface ProductVariantWantUpdateManyMutationInput {
  isFulfilled?: Boolean | null
}

export interface ProductVariantWantWhereInput {
  AND?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
  OR?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
  NOT?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
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
  isFulfilled?: Boolean | null
  isFulfilled_not?: Boolean | null
  productVariant?: ProductVariantWhereInput | null
  user?: UserWhereInput | null
}

export interface ProductVariantWantWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductVariantWhereInput {
  AND?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
  OR?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
  NOT?: ProductVariantWhereInput[] | ProductVariantWhereInput | null
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
  color?: ColorWhereInput | null
  internalSize?: SizeWhereInput | null
  manufacturerSizes_every?: SizeWhereInput | null
  manufacturerSizes_some?: SizeWhereInput | null
  manufacturerSizes_none?: SizeWhereInput | null
  product?: ProductWhereInput | null
  physicalProducts_every?: PhysicalProductWhereInput | null
  physicalProducts_some?: PhysicalProductWhereInput | null
  physicalProducts_none?: PhysicalProductWhereInput | null
}

export interface ProductVariantWhereUniqueInput {
  id?: ID_Input | null
  sku?: String | null
}

export interface ProductWhereInput {
  AND?: ProductWhereInput[] | ProductWhereInput | null
  OR?: ProductWhereInput[] | ProductWhereInput | null
  NOT?: ProductWhereInput[] | ProductWhereInput | null
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
  type?: ProductType | null
  type_not?: ProductType | null
  type_in?: ProductType[] | ProductType | null
  type_not_in?: ProductType[] | ProductType | null
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
  season?: String | null
  season_not?: String | null
  season_in?: String[] | String | null
  season_not_in?: String[] | String | null
  season_lt?: String | null
  season_lte?: String | null
  season_gt?: String | null
  season_gte?: String | null
  season_contains?: String | null
  season_not_contains?: String | null
  season_starts_with?: String | null
  season_not_starts_with?: String | null
  season_ends_with?: String | null
  season_not_ends_with?: String | null
  architecture?: ProductArchitecture | null
  architecture_not?: ProductArchitecture | null
  architecture_in?: ProductArchitecture[] | ProductArchitecture | null
  architecture_not_in?: ProductArchitecture[] | ProductArchitecture | null
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
  brand?: BrandWhereInput | null
  category?: CategoryWhereInput | null
  model?: ProductModelWhereInput | null
  modelSize?: SizeWhereInput | null
  color?: ColorWhereInput | null
  secondaryColor?: ColorWhereInput | null
  functions_every?: ProductFunctionWhereInput | null
  functions_some?: ProductFunctionWhereInput | null
  functions_none?: ProductFunctionWhereInput | null
  variants_every?: ProductVariantWhereInput | null
  variants_some?: ProductVariantWhereInput | null
  variants_none?: ProductVariantWhereInput | null
}

export interface ProductWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface RecentlyViewedProductCreateInput {
  id?: ID_Input | null
  viewCount?: Int | null
  product: ProductCreateOneInput
  customer: CustomerCreateOneInput
}

export interface RecentlyViewedProductSubscriptionWhereInput {
  AND?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
  OR?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
  NOT?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: RecentlyViewedProductWhereInput | null
}

export interface RecentlyViewedProductUpdateInput {
  viewCount?: Int | null
  product?: ProductUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredInput | null
}

export interface RecentlyViewedProductUpdateManyMutationInput {
  viewCount?: Int | null
}

export interface RecentlyViewedProductWhereInput {
  AND?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
  OR?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
  NOT?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
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
  viewCount?: Int | null
  viewCount_not?: Int | null
  viewCount_in?: Int[] | Int | null
  viewCount_not_in?: Int[] | Int | null
  viewCount_lt?: Int | null
  viewCount_lte?: Int | null
  viewCount_gt?: Int | null
  viewCount_gte?: Int | null
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
  product?: ProductWhereInput | null
  customer?: CustomerWhereInput | null
}

export interface RecentlyViewedProductWhereUniqueInput {
  id?: ID_Input | null
}

export interface ReservationCreateInput {
  id?: ID_Input | null
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  user: UserCreateOneInput
  customer: CustomerCreateOneWithoutReservationsInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  location?: LocationCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
}

export interface ReservationCreateManyWithoutCustomerInput {
  create?: ReservationCreateWithoutCustomerInput[] | ReservationCreateWithoutCustomerInput | null
  connect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
}

export interface ReservationCreateOneInput {
  create?: ReservationCreateInput | null
  connect?: ReservationWhereUniqueInput | null
}

export interface ReservationCreateWithoutCustomerInput {
  id?: ID_Input | null
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  user: UserCreateOneInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  location?: LocationCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
}

export interface ReservationFeedbackCreateInput {
  id?: ID_Input | null
  comment?: String | null
  rating?: Rating | null
  feedbacks?: ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput | null
  user: UserCreateOneInput
  reservation: ReservationCreateOneInput
}

export interface ReservationFeedbackCreateOneWithoutFeedbacksInput {
  create?: ReservationFeedbackCreateWithoutFeedbacksInput | null
  connect?: ReservationFeedbackWhereUniqueInput | null
}

export interface ReservationFeedbackCreateWithoutFeedbacksInput {
  id?: ID_Input | null
  comment?: String | null
  rating?: Rating | null
  user: UserCreateOneInput
  reservation: ReservationCreateOneInput
}

export interface ReservationFeedbackSubscriptionWhereInput {
  AND?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
  OR?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
  NOT?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationFeedbackWhereInput | null
}

export interface ReservationFeedbackUpdateInput {
  comment?: String | null
  rating?: Rating | null
  feedbacks?: ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput | null
  user?: UserUpdateOneRequiredInput | null
  reservation?: ReservationUpdateOneRequiredInput | null
}

export interface ReservationFeedbackUpdateManyMutationInput {
  comment?: String | null
  rating?: Rating | null
}

export interface ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput {
  create?: ReservationFeedbackCreateWithoutFeedbacksInput | null
  connect?: ReservationFeedbackWhereUniqueInput | null
  update?: ReservationFeedbackUpdateWithoutFeedbacksDataInput | null
  upsert?: ReservationFeedbackUpsertWithoutFeedbacksInput | null
}

export interface ReservationFeedbackUpdateWithoutFeedbacksDataInput {
  comment?: String | null
  rating?: Rating | null
  user?: UserUpdateOneRequiredInput | null
  reservation?: ReservationUpdateOneRequiredInput | null
}

export interface ReservationFeedbackUpsertWithoutFeedbacksInput {
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput
  create: ReservationFeedbackCreateWithoutFeedbacksInput
}

export interface ReservationFeedbackWhereInput {
  AND?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
  OR?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
  NOT?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
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
  comment?: String | null
  comment_not?: String | null
  comment_in?: String[] | String | null
  comment_not_in?: String[] | String | null
  comment_lt?: String | null
  comment_lte?: String | null
  comment_gt?: String | null
  comment_gte?: String | null
  comment_contains?: String | null
  comment_not_contains?: String | null
  comment_starts_with?: String | null
  comment_not_starts_with?: String | null
  comment_ends_with?: String | null
  comment_not_ends_with?: String | null
  rating?: Rating | null
  rating_not?: Rating | null
  rating_in?: Rating[] | Rating | null
  rating_not_in?: Rating[] | Rating | null
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
  feedbacks_every?: ProductVariantFeedbackWhereInput | null
  feedbacks_some?: ProductVariantFeedbackWhereInput | null
  feedbacks_none?: ProductVariantFeedbackWhereInput | null
  user?: UserWhereInput | null
  reservation?: ReservationWhereInput | null
}

export interface ReservationFeedbackWhereUniqueInput {
  id?: ID_Input | null
}

export interface ReservationScalarWhereInput {
  AND?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  OR?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  NOT?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
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
  reminderSentAt?: DateTime | null
  reminderSentAt_not?: DateTime | null
  reminderSentAt_in?: DateTime[] | DateTime | null
  reminderSentAt_not_in?: DateTime[] | DateTime | null
  reminderSentAt_lt?: DateTime | null
  reminderSentAt_lte?: DateTime | null
  reminderSentAt_gt?: DateTime | null
  reminderSentAt_gte?: DateTime | null
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
}

export interface ReservationSubscriptionWhereInput {
  AND?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
  OR?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
  NOT?: ReservationSubscriptionWhereInput[] | ReservationSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationWhereInput | null
}

export interface ReservationUpdateDataInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  location?: LocationUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
}

export interface ReservationUpdateInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  location?: LocationUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
}

export interface ReservationUpdateManyDataInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
}

export interface ReservationUpdateManyMutationInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
}

export interface ReservationUpdateManyWithoutCustomerInput {
  create?: ReservationCreateWithoutCustomerInput[] | ReservationCreateWithoutCustomerInput | null
  connect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  set?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  disconnect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  delete?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
  update?: ReservationUpdateWithWhereUniqueWithoutCustomerInput[] | ReservationUpdateWithWhereUniqueWithoutCustomerInput | null
  updateMany?: ReservationUpdateManyWithWhereNestedInput[] | ReservationUpdateManyWithWhereNestedInput | null
  deleteMany?: ReservationScalarWhereInput[] | ReservationScalarWhereInput | null
  upsert?: ReservationUpsertWithWhereUniqueWithoutCustomerInput[] | ReservationUpsertWithWhereUniqueWithoutCustomerInput | null
}

export interface ReservationUpdateManyWithWhereNestedInput {
  where: ReservationScalarWhereInput
  data: ReservationUpdateManyDataInput
}

export interface ReservationUpdateOneRequiredInput {
  create?: ReservationCreateInput | null
  connect?: ReservationWhereUniqueInput | null
  update?: ReservationUpdateDataInput | null
  upsert?: ReservationUpsertNestedInput | null
}

export interface ReservationUpdateWithoutCustomerDataInput {
  reservationNumber?: Int | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  user?: UserUpdateOneRequiredInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  location?: LocationUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
}

export interface ReservationUpdateWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput
  data: ReservationUpdateWithoutCustomerDataInput
}

export interface ReservationUpsertNestedInput {
  update: ReservationUpdateDataInput
  create: ReservationCreateInput
}

export interface ReservationUpsertWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput
  update: ReservationUpdateWithoutCustomerDataInput
  create: ReservationCreateWithoutCustomerInput
}

export interface ReservationWhereInput {
  AND?: ReservationWhereInput[] | ReservationWhereInput | null
  OR?: ReservationWhereInput[] | ReservationWhereInput | null
  NOT?: ReservationWhereInput[] | ReservationWhereInput | null
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
  reminderSentAt?: DateTime | null
  reminderSentAt_not?: DateTime | null
  reminderSentAt_in?: DateTime[] | DateTime | null
  reminderSentAt_not_in?: DateTime[] | DateTime | null
  reminderSentAt_lt?: DateTime | null
  reminderSentAt_lte?: DateTime | null
  reminderSentAt_gt?: DateTime | null
  reminderSentAt_gte?: DateTime | null
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
  user?: UserWhereInput | null
  customer?: CustomerWhereInput | null
  sentPackage?: PackageWhereInput | null
  returnedPackage?: PackageWhereInput | null
  location?: LocationWhereInput | null
  products_every?: PhysicalProductWhereInput | null
  products_some?: PhysicalProductWhereInput | null
  products_none?: PhysicalProductWhereInput | null
}

export interface ReservationWhereUniqueInput {
  id?: ID_Input | null
  reservationNumber?: Int | null
}

export interface SizeCreateInput {
  id?: ID_Input | null
  slug: String
  productType?: ProductType | null
  display: String
  top?: TopSizeCreateOneInput | null
  bottom?: BottomSizeCreateOneInput | null
}

export interface SizeCreateManyInput {
  create?: SizeCreateInput[] | SizeCreateInput | null
  connect?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
}

export interface SizeCreateOneInput {
  create?: SizeCreateInput | null
  connect?: SizeWhereUniqueInput | null
}

export interface SizeScalarWhereInput {
  AND?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  OR?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  NOT?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
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
  productType?: ProductType | null
  productType_not?: ProductType | null
  productType_in?: ProductType[] | ProductType | null
  productType_not_in?: ProductType[] | ProductType | null
  display?: String | null
  display_not?: String | null
  display_in?: String[] | String | null
  display_not_in?: String[] | String | null
  display_lt?: String | null
  display_lte?: String | null
  display_gt?: String | null
  display_gte?: String | null
  display_contains?: String | null
  display_not_contains?: String | null
  display_starts_with?: String | null
  display_not_starts_with?: String | null
  display_ends_with?: String | null
  display_not_ends_with?: String | null
}

export interface SizeSubscriptionWhereInput {
  AND?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
  OR?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
  NOT?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: SizeWhereInput | null
}

export interface SizeUpdateDataInput {
  slug?: String | null
  productType?: ProductType | null
  display?: String | null
  top?: TopSizeUpdateOneInput | null
  bottom?: BottomSizeUpdateOneInput | null
}

export interface SizeUpdateInput {
  slug?: String | null
  productType?: ProductType | null
  display?: String | null
  top?: TopSizeUpdateOneInput | null
  bottom?: BottomSizeUpdateOneInput | null
}

export interface SizeUpdateManyDataInput {
  slug?: String | null
  productType?: ProductType | null
  display?: String | null
}

export interface SizeUpdateManyInput {
  create?: SizeCreateInput[] | SizeCreateInput | null
  connect?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  set?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  disconnect?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  delete?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  update?: SizeUpdateWithWhereUniqueNestedInput[] | SizeUpdateWithWhereUniqueNestedInput | null
  updateMany?: SizeUpdateManyWithWhereNestedInput[] | SizeUpdateManyWithWhereNestedInput | null
  deleteMany?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  upsert?: SizeUpsertWithWhereUniqueNestedInput[] | SizeUpsertWithWhereUniqueNestedInput | null
}

export interface SizeUpdateManyMutationInput {
  slug?: String | null
  productType?: ProductType | null
  display?: String | null
}

export interface SizeUpdateManyWithWhereNestedInput {
  where: SizeScalarWhereInput
  data: SizeUpdateManyDataInput
}

export interface SizeUpdateOneInput {
  create?: SizeCreateInput | null
  connect?: SizeWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: SizeUpdateDataInput | null
  upsert?: SizeUpsertNestedInput | null
}

export interface SizeUpdateWithWhereUniqueNestedInput {
  where: SizeWhereUniqueInput
  data: SizeUpdateDataInput
}

export interface SizeUpsertNestedInput {
  update: SizeUpdateDataInput
  create: SizeCreateInput
}

export interface SizeUpsertWithWhereUniqueNestedInput {
  where: SizeWhereUniqueInput
  update: SizeUpdateDataInput
  create: SizeCreateInput
}

export interface SizeWhereInput {
  AND?: SizeWhereInput[] | SizeWhereInput | null
  OR?: SizeWhereInput[] | SizeWhereInput | null
  NOT?: SizeWhereInput[] | SizeWhereInput | null
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
  productType?: ProductType | null
  productType_not?: ProductType | null
  productType_in?: ProductType[] | ProductType | null
  productType_not_in?: ProductType[] | ProductType | null
  display?: String | null
  display_not?: String | null
  display_in?: String[] | String | null
  display_not_in?: String[] | String | null
  display_lt?: String | null
  display_lte?: String | null
  display_gt?: String | null
  display_gte?: String | null
  display_contains?: String | null
  display_not_contains?: String | null
  display_starts_with?: String | null
  display_not_starts_with?: String | null
  display_ends_with?: String | null
  display_not_ends_with?: String | null
  top?: TopSizeWhereInput | null
  bottom?: BottomSizeWhereInput | null
}

export interface SizeWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface TopSizeCreateInput {
  id?: ID_Input | null
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeCreateOneInput {
  create?: TopSizeCreateInput | null
  connect?: TopSizeWhereUniqueInput | null
}

export interface TopSizeSubscriptionWhereInput {
  AND?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
  OR?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
  NOT?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: TopSizeWhereInput | null
}

export interface TopSizeUpdateDataInput {
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeUpdateInput {
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeUpdateManyMutationInput {
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeUpdateOneInput {
  create?: TopSizeCreateInput | null
  connect?: TopSizeWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: TopSizeUpdateDataInput | null
  upsert?: TopSizeUpsertNestedInput | null
}

export interface TopSizeUpsertNestedInput {
  update: TopSizeUpdateDataInput
  create: TopSizeCreateInput
}

export interface TopSizeWhereInput {
  AND?: TopSizeWhereInput[] | TopSizeWhereInput | null
  OR?: TopSizeWhereInput[] | TopSizeWhereInput | null
  NOT?: TopSizeWhereInput[] | TopSizeWhereInput | null
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
  letter?: LetterSize | null
  letter_not?: LetterSize | null
  letter_in?: LetterSize[] | LetterSize | null
  letter_not_in?: LetterSize[] | LetterSize | null
  sleeve?: Float | null
  sleeve_not?: Float | null
  sleeve_in?: Float[] | Float | null
  sleeve_not_in?: Float[] | Float | null
  sleeve_lt?: Float | null
  sleeve_lte?: Float | null
  sleeve_gt?: Float | null
  sleeve_gte?: Float | null
  shoulder?: Float | null
  shoulder_not?: Float | null
  shoulder_in?: Float[] | Float | null
  shoulder_not_in?: Float[] | Float | null
  shoulder_lt?: Float | null
  shoulder_lte?: Float | null
  shoulder_gt?: Float | null
  shoulder_gte?: Float | null
  chest?: Float | null
  chest_not?: Float | null
  chest_in?: Float[] | Float | null
  chest_not_in?: Float[] | Float | null
  chest_lt?: Float | null
  chest_lte?: Float | null
  chest_gt?: Float | null
  chest_gte?: Float | null
  neck?: Float | null
  neck_not?: Float | null
  neck_in?: Float[] | Float | null
  neck_not_in?: Float[] | Float | null
  neck_lt?: Float | null
  neck_lte?: Float | null
  neck_gt?: Float | null
  neck_gte?: Float | null
  length?: Float | null
  length_not?: Float | null
  length_in?: Float[] | Float | null
  length_not_in?: Float[] | Float | null
  length_lt?: Float | null
  length_lte?: Float | null
  length_gt?: Float | null
  length_gte?: Float | null
}

export interface TopSizeWhereUniqueInput {
  id?: ID_Input | null
}

export interface UserCreateInput {
  id?: ID_Input | null
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role?: UserRole | null
  pushNotifications?: PushNotificationStatus | null
}

export interface UserCreateOneInput {
  create?: UserCreateInput | null
  connect?: UserWhereUniqueInput | null
}

export interface UserSubscriptionWhereInput {
  AND?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
  OR?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
  NOT?: UserSubscriptionWhereInput[] | UserSubscriptionWhereInput | null
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: UserWhereInput | null
}

export interface UserUpdateDataInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  pushNotifications?: PushNotificationStatus | null
}

export interface UserUpdateInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  pushNotifications?: PushNotificationStatus | null
}

export interface UserUpdateManyMutationInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  pushNotifications?: PushNotificationStatus | null
}

export interface UserUpdateOneInput {
  create?: UserCreateInput | null
  connect?: UserWhereUniqueInput | null
  disconnect?: Boolean | null
  delete?: Boolean | null
  update?: UserUpdateDataInput | null
  upsert?: UserUpsertNestedInput | null
}

export interface UserUpdateOneRequiredInput {
  create?: UserCreateInput | null
  connect?: UserWhereUniqueInput | null
  update?: UserUpdateDataInput | null
  upsert?: UserUpsertNestedInput | null
}

export interface UserUpsertNestedInput {
  update: UserUpdateDataInput
  create: UserCreateInput
}

export interface UserWhereInput {
  AND?: UserWhereInput[] | UserWhereInput | null
  OR?: UserWhereInput[] | UserWhereInput | null
  NOT?: UserWhereInput[] | UserWhereInput | null
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
  pushNotifications?: PushNotificationStatus | null
  pushNotifications_not?: PushNotificationStatus | null
  pushNotifications_in?: PushNotificationStatus[] | PushNotificationStatus | null
  pushNotifications_not_in?: PushNotificationStatus[] | PushNotificationStatus | null
}

export interface UserWhereUniqueInput {
  id?: ID_Input | null
  auth0Id?: String | null
  email?: String | null
}

/*
 * An object with an ID

 */
export interface Node {
  id: ID_Output
}

export interface AggregateBagItem {
  count: Int
}

export interface AggregateBillingInfo {
  count: Int
}

export interface AggregateBottomSize {
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

export interface AggregateProductModel {
  count: Int
}

export interface AggregateProductRequest {
  count: Int
}

export interface AggregateProductVariant {
  count: Int
}

export interface AggregateProductVariantFeedback {
  count: Int
}

export interface AggregateProductVariantFeedbackQuestion {
  count: Int
}

export interface AggregateProductVariantWant {
  count: Int
}

export interface AggregateRecentlyViewedProduct {
  count: Int
}

export interface AggregateReservation {
  count: Int
}

export interface AggregateReservationFeedback {
  count: Int
}

export interface AggregateSize {
  count: Int
}

export interface AggregateTopSize {
  count: Int
}

export interface AggregateUser {
  count: Int
}

export interface BagItem extends Node {
  id: ID_Output
  customer: Customer
  productVariant: ProductVariant
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

/*
 * A connection to a list of items.

 */
export interface BagItemConnection {
  pageInfo: PageInfo
  edges: Array<BagItemEdge | null>
  aggregate: AggregateBagItem
}

/*
 * An edge in a connection.

 */
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

export interface BillingInfo extends Node {
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

/*
 * A connection to a list of items.

 */
export interface BillingInfoConnection {
  pageInfo: PageInfo
  edges: Array<BillingInfoEdge | null>
  aggregate: AggregateBillingInfo
}

/*
 * An edge in a connection.

 */
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

export interface BottomSize extends Node {
  id: ID_Output
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

/*
 * A connection to a list of items.

 */
export interface BottomSizeConnection {
  pageInfo: PageInfo
  edges: Array<BottomSizeEdge | null>
  aggregate: AggregateBottomSize
}

/*
 * An edge in a connection.

 */
export interface BottomSizeEdge {
  node: BottomSize
  cursor: String
}

export interface BottomSizePreviousValues {
  id: ID_Output
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeSubscriptionPayload {
  mutation: MutationType
  node?: BottomSize | null
  updatedFields?: Array<String> | null
  previousValues?: BottomSizePreviousValues | null
}

export interface Brand extends Node {
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

/*
 * A connection to a list of items.

 */
export interface BrandConnection {
  pageInfo: PageInfo
  edges: Array<BrandEdge | null>
  aggregate: AggregateBrand
}

/*
 * An edge in a connection.

 */
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

export interface Category extends Node {
  id: ID_Output
  slug: String
  name: String
  image?: Json | null
  description?: String | null
  visible: Boolean
  products?: Array<Product> | null
  children?: Array<Category> | null
}

/*
 * A connection to a list of items.

 */
export interface CategoryConnection {
  pageInfo: PageInfo
  edges: Array<CategoryEdge | null>
  aggregate: AggregateCategory
}

/*
 * An edge in a connection.

 */
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

export interface Collection extends Node {
  id: ID_Output
  slug: String
  images: Json
  title?: String | null
  subTitle?: String | null
  descriptionTop?: String | null
  descriptionBottom?: String | null
  products?: Array<Product> | null
}

/*
 * A connection to a list of items.

 */
export interface CollectionConnection {
  pageInfo: PageInfo
  edges: Array<CollectionEdge | null>
  aggregate: AggregateCollection
}

/*
 * An edge in a connection.

 */
export interface CollectionEdge {
  node: Collection
  cursor: String
}

export interface CollectionGroup extends Node {
  id: ID_Output
  slug: String
  title?: String | null
  collectionCount?: Int | null
  collections?: Array<Collection> | null
}

/*
 * A connection to a list of items.

 */
export interface CollectionGroupConnection {
  pageInfo: PageInfo
  edges: Array<CollectionGroupEdge | null>
  aggregate: AggregateCollectionGroup
}

/*
 * An edge in a connection.

 */
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

export interface Color extends Node {
  id: ID_Output
  slug: String
  name: String
  colorCode: String
  hexCode: String
  productVariants?: Array<ProductVariant> | null
}

/*
 * A connection to a list of items.

 */
export interface ColorConnection {
  pageInfo: PageInfo
  edges: Array<ColorEdge | null>
  aggregate: AggregateColor
}

/*
 * An edge in a connection.

 */
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

export interface Customer extends Node {
  id: ID_Output
  user: User
  status?: CustomerStatus | null
  detail?: CustomerDetail | null
  billingInfo?: BillingInfo | null
  plan?: Plan | null
  bagItems?: Array<BagItem> | null
  reservations?: Array<Reservation> | null
}

/*
 * A connection to a list of items.

 */
export interface CustomerConnection {
  pageInfo: PageInfo
  edges: Array<CustomerEdge | null>
  aggregate: AggregateCustomer
}

export interface CustomerDetail extends Node {
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
  insureShipment: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface CustomerDetailConnection {
  pageInfo: PageInfo
  edges: Array<CustomerDetailEdge | null>
  aggregate: AggregateCustomerDetail
}

/*
 * An edge in a connection.

 */
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
  insureShipment: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}

export interface CustomerDetailSubscriptionPayload {
  mutation: MutationType
  node?: CustomerDetail | null
  updatedFields?: Array<String> | null
  previousValues?: CustomerDetailPreviousValues | null
}

/*
 * An edge in a connection.

 */
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

export interface HomepageProductRail extends Node {
  id: ID_Output
  slug: String
  name: String
  products?: Array<Product> | null
}

/*
 * A connection to a list of items.

 */
export interface HomepageProductRailConnection {
  pageInfo: PageInfo
  edges: Array<HomepageProductRailEdge | null>
  aggregate: AggregateHomepageProductRail
}

/*
 * An edge in a connection.

 */
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

export interface Image extends Node {
  id: ID_Output
  caption?: String | null
  url?: String | null
  originalHeight?: Int | null
  originalUrl: String
  originalWidth?: Int | null
  resizedUrl: String
  title?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface ImageConnection {
  pageInfo: PageInfo
  edges: Array<ImageEdge | null>
  aggregate: AggregateImage
}

/*
 * An edge in a connection.

 */
export interface ImageEdge {
  node: Image
  cursor: String
}

export interface ImagePreviousValues {
  id: ID_Output
  caption?: String | null
  url?: String | null
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

export interface Label extends Node {
  id: ID_Output
  name?: String | null
  image?: String | null
  trackingNumber?: String | null
  trackingURL?: String | null
}

/*
 * A connection to a list of items.

 */
export interface LabelConnection {
  pageInfo: PageInfo
  edges: Array<LabelEdge | null>
  aggregate: AggregateLabel
}

/*
 * An edge in a connection.

 */
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

export interface Location extends Node {
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

/*
 * A connection to a list of items.

 */
export interface LocationConnection {
  pageInfo: PageInfo
  edges: Array<LocationEdge | null>
  aggregate: AggregateLocation
}

/*
 * An edge in a connection.

 */
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

export interface Order extends Node {
  id: ID_Output
}

/*
 * A connection to a list of items.

 */
export interface OrderConnection {
  pageInfo: PageInfo
  edges: Array<OrderEdge | null>
  aggregate: AggregateOrder
}

/*
 * An edge in a connection.

 */
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

export interface Package extends Node {
  id: ID_Output
  items?: Array<PhysicalProduct> | null
  shippingLabel: Label
  fromAddress: Location
  toAddress: Location
  weight?: Float | null
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface PackageConnection {
  pageInfo: PageInfo
  edges: Array<PackageEdge | null>
  aggregate: AggregatePackage
}

/*
 * An edge in a connection.

 */
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

/*
 * Information about pagination in a connection.

 */
export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface PhysicalProduct extends Node {
  id: ID_Output
  seasonsUID: String
  location?: Location | null
  productVariant: ProductVariant
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface PhysicalProductConnection {
  pageInfo: PageInfo
  edges: Array<PhysicalProductEdge | null>
  aggregate: AggregatePhysicalProduct
}

/*
 * An edge in a connection.

 */
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

export interface Product extends Node {
  id: ID_Output
  slug: String
  name: String
  brand: Brand
  category: Category
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModel | null
  modelSize?: Size | null
  color: Color
  secondaryColor?: Color | null
  tags?: Json | null
  functions?: Array<ProductFunction> | null
  innerMaterials: Array<String>
  outerMaterials: Array<String>
  variants?: Array<ProductVariant> | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface ProductConnection {
  pageInfo: PageInfo
  edges: Array<ProductEdge | null>
  aggregate: AggregateProduct
}

/*
 * An edge in a connection.

 */
export interface ProductEdge {
  node: Product
  cursor: String
}

export interface ProductFunction extends Node {
  id: ID_Output
  name?: String | null
}

/*
 * A connection to a list of items.

 */
export interface ProductFunctionConnection {
  pageInfo: PageInfo
  edges: Array<ProductFunctionEdge | null>
  aggregate: AggregateProductFunction
}

/*
 * An edge in a connection.

 */
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

export interface ProductModel extends Node {
  id: ID_Output
  name: String
  height: Float
  products?: Array<Product> | null
}

/*
 * A connection to a list of items.

 */
export interface ProductModelConnection {
  pageInfo: PageInfo
  edges: Array<ProductModelEdge | null>
  aggregate: AggregateProductModel
}

/*
 * An edge in a connection.

 */
export interface ProductModelEdge {
  node: ProductModel
  cursor: String
}

export interface ProductModelPreviousValues {
  id: ID_Output
  name: String
  height: Float
}

export interface ProductModelSubscriptionPayload {
  mutation: MutationType
  node?: ProductModel | null
  updatedFields?: Array<String> | null
  previousValues?: ProductModelPreviousValues | null
}

export interface ProductPreviousValues {
  id: ID_Output
  slug: String
  name: String
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Json | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  tags?: Json | null
  innerMaterials: Array<String>
  outerMaterials: Array<String>
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductRequest extends Node {
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

/*
 * A connection to a list of items.

 */
export interface ProductRequestConnection {
  pageInfo: PageInfo
  edges: Array<ProductRequestEdge | null>
  aggregate: AggregateProductRequest
}

/*
 * An edge in a connection.

 */
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

export interface ProductVariant extends Node {
  id: ID_Output
  sku?: String | null
  color: Color
  internalSize?: Size | null
  manufacturerSizes?: Array<Size> | null
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

/*
 * A connection to a list of items.

 */
export interface ProductVariantConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantEdge | null>
  aggregate: AggregateProductVariant
}

/*
 * An edge in a connection.

 */
export interface ProductVariantEdge {
  node: ProductVariant
  cursor: String
}

export interface ProductVariantFeedback extends Node {
  id: ID_Output
  isCompleted: Boolean
  questions?: Array<ProductVariantFeedbackQuestion> | null
  reservationFeedback: ReservationFeedback
  variant: ProductVariant
}

/*
 * A connection to a list of items.

 */
export interface ProductVariantFeedbackConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantFeedbackEdge | null>
  aggregate: AggregateProductVariantFeedback
}

/*
 * An edge in a connection.

 */
export interface ProductVariantFeedbackEdge {
  node: ProductVariantFeedback
  cursor: String
}

export interface ProductVariantFeedbackPreviousValues {
  id: ID_Output
  isCompleted: Boolean
}

export interface ProductVariantFeedbackQuestion extends Node {
  id: ID_Output
  options: Array<String>
  question: String
  responses: Array<String>
  type: QuestionType
  variantFeedback: ProductVariantFeedback
}

/*
 * A connection to a list of items.

 */
export interface ProductVariantFeedbackQuestionConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantFeedbackQuestionEdge | null>
  aggregate: AggregateProductVariantFeedbackQuestion
}

/*
 * An edge in a connection.

 */
export interface ProductVariantFeedbackQuestionEdge {
  node: ProductVariantFeedbackQuestion
  cursor: String
}

export interface ProductVariantFeedbackQuestionPreviousValues {
  id: ID_Output
  options: Array<String>
  question: String
  responses: Array<String>
  type: QuestionType
}

export interface ProductVariantFeedbackQuestionSubscriptionPayload {
  mutation: MutationType
  node?: ProductVariantFeedbackQuestion | null
  updatedFields?: Array<String> | null
  previousValues?: ProductVariantFeedbackQuestionPreviousValues | null
}

export interface ProductVariantFeedbackSubscriptionPayload {
  mutation: MutationType
  node?: ProductVariantFeedback | null
  updatedFields?: Array<String> | null
  previousValues?: ProductVariantFeedbackPreviousValues | null
}

export interface ProductVariantPreviousValues {
  id: ID_Output
  sku?: String | null
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

export interface ProductVariantWant extends Node {
  id: ID_Output
  productVariant: ProductVariant
  user: User
  isFulfilled: Boolean
}

/*
 * A connection to a list of items.

 */
export interface ProductVariantWantConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantWantEdge | null>
  aggregate: AggregateProductVariantWant
}

/*
 * An edge in a connection.

 */
export interface ProductVariantWantEdge {
  node: ProductVariantWant
  cursor: String
}

export interface ProductVariantWantPreviousValues {
  id: ID_Output
  isFulfilled: Boolean
}

export interface ProductVariantWantSubscriptionPayload {
  mutation: MutationType
  node?: ProductVariantWant | null
  updatedFields?: Array<String> | null
  previousValues?: ProductVariantWantPreviousValues | null
}

export interface RecentlyViewedProduct extends Node {
  id: ID_Output
  product: Product
  customer: Customer
  viewCount: Int
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface RecentlyViewedProductConnection {
  pageInfo: PageInfo
  edges: Array<RecentlyViewedProductEdge | null>
  aggregate: AggregateRecentlyViewedProduct
}

/*
 * An edge in a connection.

 */
export interface RecentlyViewedProductEdge {
  node: RecentlyViewedProduct
  cursor: String
}

export interface RecentlyViewedProductPreviousValues {
  id: ID_Output
  viewCount: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface RecentlyViewedProductSubscriptionPayload {
  mutation: MutationType
  node?: RecentlyViewedProduct | null
  updatedFields?: Array<String> | null
  previousValues?: RecentlyViewedProductPreviousValues | null
}

export interface Reservation extends Node {
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
  reminderSentAt?: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface ReservationConnection {
  pageInfo: PageInfo
  edges: Array<ReservationEdge | null>
  aggregate: AggregateReservation
}

/*
 * An edge in a connection.

 */
export interface ReservationEdge {
  node: Reservation
  cursor: String
}

export interface ReservationFeedback extends Node {
  id: ID_Output
  comment?: String | null
  feedbacks?: Array<ProductVariantFeedback> | null
  rating?: Rating | null
  user: User
  reservation: Reservation
  createdAt: DateTime
  updatedAt: DateTime
}

/*
 * A connection to a list of items.

 */
export interface ReservationFeedbackConnection {
  pageInfo: PageInfo
  edges: Array<ReservationFeedbackEdge | null>
  aggregate: AggregateReservationFeedback
}

/*
 * An edge in a connection.

 */
export interface ReservationFeedbackEdge {
  node: ReservationFeedback
  cursor: String
}

export interface ReservationFeedbackPreviousValues {
  id: ID_Output
  comment?: String | null
  rating?: Rating | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationFeedbackSubscriptionPayload {
  mutation: MutationType
  node?: ReservationFeedback | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationFeedbackPreviousValues | null
}

export interface ReservationPreviousValues {
  id: ID_Output
  reservationNumber: Int
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationSubscriptionPayload {
  mutation: MutationType
  node?: Reservation | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationPreviousValues | null
}

export interface Size extends Node {
  id: ID_Output
  slug: String
  productType?: ProductType | null
  top?: TopSize | null
  bottom?: BottomSize | null
  display: String
}

/*
 * A connection to a list of items.

 */
export interface SizeConnection {
  pageInfo: PageInfo
  edges: Array<SizeEdge | null>
  aggregate: AggregateSize
}

/*
 * An edge in a connection.

 */
export interface SizeEdge {
  node: Size
  cursor: String
}

export interface SizePreviousValues {
  id: ID_Output
  slug: String
  productType?: ProductType | null
  display: String
}

export interface SizeSubscriptionPayload {
  mutation: MutationType
  node?: Size | null
  updatedFields?: Array<String> | null
  previousValues?: SizePreviousValues | null
}

export interface TopSize extends Node {
  id: ID_Output
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

/*
 * A connection to a list of items.

 */
export interface TopSizeConnection {
  pageInfo: PageInfo
  edges: Array<TopSizeEdge | null>
  aggregate: AggregateTopSize
}

/*
 * An edge in a connection.

 */
export interface TopSizeEdge {
  node: TopSize
  cursor: String
}

export interface TopSizePreviousValues {
  id: ID_Output
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeSubscriptionPayload {
  mutation: MutationType
  node?: TopSize | null
  updatedFields?: Array<String> | null
  previousValues?: TopSizePreviousValues | null
}

export interface User extends Node {
  id: ID_Output
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  createdAt: DateTime
  updatedAt: DateTime
  pushNotifications: PushNotificationStatus
}

/*
 * A connection to a list of items.

 */
export interface UserConnection {
  pageInfo: PageInfo
  edges: Array<UserEdge | null>
  aggregate: AggregateUser
}

/*
 * An edge in a connection.

 */
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
  pushNotifications: PushNotificationStatus
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

/*
Raw JSON value
*/
export type Json = any

/*
The `Long` scalar type represents non-fractional signed whole numeric values.
Long can represent values between -(2^63) and 2^63 - 1.
*/
export type Long = string

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string