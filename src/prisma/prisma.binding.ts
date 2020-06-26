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
    bottomSize: <T = BottomSize | null>(args: { where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    bottomSizes: <T = Array<BottomSize | null>>(args: { where?: BottomSizeWhereInput | null, orderBy?: BottomSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    bottomSizesConnection: <T = BottomSizeConnection>(args: { where?: BottomSizeWhereInput | null, orderBy?: BottomSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    customerMembership: <T = CustomerMembership | null>(args: { where: CustomerMembershipWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    customerMemberships: <T = Array<CustomerMembership | null>>(args: { where?: CustomerMembershipWhereInput | null, orderBy?: CustomerMembershipOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    customerMembershipsConnection: <T = CustomerMembershipConnection>(args: { where?: CustomerMembershipWhereInput | null, orderBy?: CustomerMembershipOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    emailReceipt: <T = EmailReceipt | null>(args: { where: EmailReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    emailReceipts: <T = Array<EmailReceipt | null>>(args: { where?: EmailReceiptWhereInput | null, orderBy?: EmailReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    emailReceiptsConnection: <T = EmailReceiptConnection>(args: { where?: EmailReceiptWhereInput | null, orderBy?: EmailReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    package: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    packages: <T = Array<Package | null>>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packagesConnection: <T = PackageConnection>(args: { where?: PackageWhereInput | null, orderBy?: PackageOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packageTransitEvent: <T = PackageTransitEvent | null>(args: { where: PackageTransitEventWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    packageTransitEvents: <T = Array<PackageTransitEvent | null>>(args: { where?: PackageTransitEventWhereInput | null, orderBy?: PackageTransitEventOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    packageTransitEventsConnection: <T = PackageTransitEventConnection>(args: { where?: PackageTransitEventWhereInput | null, orderBy?: PackageTransitEventOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    pauseRequest: <T = PauseRequest | null>(args: { where: PauseRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    pauseRequests: <T = Array<PauseRequest | null>>(args: { where?: PauseRequestWhereInput | null, orderBy?: PauseRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    pauseRequestsConnection: <T = PauseRequestConnection>(args: { where?: PauseRequestWhereInput | null, orderBy?: PauseRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    physicalProducts: <T = Array<PhysicalProduct | null>>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProductsConnection: <T = PhysicalProductConnection>(args: { where?: PhysicalProductWhereInput | null, orderBy?: PhysicalProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChange | null>(args: { where: PhysicalProductInventoryStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    physicalProductInventoryStatusChanges: <T = Array<PhysicalProductInventoryStatusChange | null>>(args: { where?: PhysicalProductInventoryStatusChangeWhereInput | null, orderBy?: PhysicalProductInventoryStatusChangeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    physicalProductInventoryStatusChangesConnection: <T = PhysicalProductInventoryStatusChangeConnection>(args: { where?: PhysicalProductInventoryStatusChangeWhereInput | null, orderBy?: PhysicalProductInventoryStatusChangeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    product: <T = Product | null>(args: { where: ProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    products: <T = Array<Product | null>>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productsConnection: <T = ProductConnection>(args: { where?: ProductWhereInput | null, orderBy?: ProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunction: <T = ProductFunction | null>(args: { where: ProductFunctionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productFunctions: <T = Array<ProductFunction | null>>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productFunctionsConnection: <T = ProductFunctionConnection>(args: { where?: ProductFunctionWhereInput | null, orderBy?: ProductFunctionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productMaterialCategory: <T = ProductMaterialCategory | null>(args: { where: ProductMaterialCategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productMaterialCategories: <T = Array<ProductMaterialCategory | null>>(args: { where?: ProductMaterialCategoryWhereInput | null, orderBy?: ProductMaterialCategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productMaterialCategoriesConnection: <T = ProductMaterialCategoryConnection>(args: { where?: ProductMaterialCategoryWhereInput | null, orderBy?: ProductMaterialCategoryOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productModel: <T = ProductModel | null>(args: { where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productModels: <T = Array<ProductModel | null>>(args: { where?: ProductModelWhereInput | null, orderBy?: ProductModelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productModelsConnection: <T = ProductModelConnection>(args: { where?: ProductModelWhereInput | null, orderBy?: ProductModelOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productRequests: <T = Array<ProductRequest | null>>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productRequestsConnection: <T = ProductRequestConnection>(args: { where?: ProductRequestWhereInput | null, orderBy?: ProductRequestOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productStatusChange: <T = ProductStatusChange | null>(args: { where: ProductStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productStatusChanges: <T = Array<ProductStatusChange | null>>(args: { where?: ProductStatusChangeWhereInput | null, orderBy?: ProductStatusChangeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productStatusChangesConnection: <T = ProductStatusChangeConnection>(args: { where?: ProductStatusChangeWhereInput | null, orderBy?: ProductStatusChangeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariants: <T = Array<ProductVariant | null>>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantsConnection: <T = ProductVariantConnection>(args: { where?: ProductVariantWhereInput | null, orderBy?: ProductVariantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedback: <T = ProductVariantFeedback | null>(args: { where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantFeedbacks: <T = Array<ProductVariantFeedback | null>>(args: { where?: ProductVariantFeedbackWhereInput | null, orderBy?: ProductVariantFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbacksConnection: <T = ProductVariantFeedbackConnection>(args: { where?: ProductVariantFeedbackWhereInput | null, orderBy?: ProductVariantFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantFeedbackQuestions: <T = Array<ProductVariantFeedbackQuestion | null>>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null, orderBy?: ProductVariantFeedbackQuestionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantFeedbackQuestionsConnection: <T = ProductVariantFeedbackQuestionConnection>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null, orderBy?: ProductVariantFeedbackQuestionOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantWant: <T = ProductVariantWant | null>(args: { where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    productVariantWants: <T = Array<ProductVariantWant | null>>(args: { where?: ProductVariantWantWhereInput | null, orderBy?: ProductVariantWantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    productVariantWantsConnection: <T = ProductVariantWantConnection>(args: { where?: ProductVariantWantWhereInput | null, orderBy?: ProductVariantWantOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    pushNotificationReceipt: <T = PushNotificationReceipt | null>(args: { where: PushNotificationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    pushNotificationReceipts: <T = Array<PushNotificationReceipt | null>>(args: { where?: PushNotificationReceiptWhereInput | null, orderBy?: PushNotificationReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    pushNotificationReceiptsConnection: <T = PushNotificationReceiptConnection>(args: { where?: PushNotificationReceiptWhereInput | null, orderBy?: PushNotificationReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    recentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    recentlyViewedProducts: <T = Array<RecentlyViewedProduct | null>>(args: { where?: RecentlyViewedProductWhereInput | null, orderBy?: RecentlyViewedProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    recentlyViewedProductsConnection: <T = RecentlyViewedProductConnection>(args: { where?: RecentlyViewedProductWhereInput | null, orderBy?: RecentlyViewedProductOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservations: <T = Array<Reservation | null>>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationsConnection: <T = ReservationConnection>(args: { where?: ReservationWhereInput | null, orderBy?: ReservationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationFeedback: <T = ReservationFeedback | null>(args: { where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservationFeedbacks: <T = Array<ReservationFeedback | null>>(args: { where?: ReservationFeedbackWhereInput | null, orderBy?: ReservationFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationFeedbacksConnection: <T = ReservationFeedbackConnection>(args: { where?: ReservationFeedbackWhereInput | null, orderBy?: ReservationFeedbackOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationReceipt: <T = ReservationReceipt | null>(args: { where: ReservationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservationReceipts: <T = Array<ReservationReceipt | null>>(args: { where?: ReservationReceiptWhereInput | null, orderBy?: ReservationReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationReceiptsConnection: <T = ReservationReceiptConnection>(args: { where?: ReservationReceiptWhereInput | null, orderBy?: ReservationReceiptOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationReceiptItem: <T = ReservationReceiptItem | null>(args: { where: ReservationReceiptItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    reservationReceiptItems: <T = Array<ReservationReceiptItem | null>>(args: { where?: ReservationReceiptItemWhereInput | null, orderBy?: ReservationReceiptItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    reservationReceiptItemsConnection: <T = ReservationReceiptItemConnection>(args: { where?: ReservationReceiptItemWhereInput | null, orderBy?: ReservationReceiptItemOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    size: <T = Size | null>(args: { where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    sizes: <T = Array<Size | null>>(args: { where?: SizeWhereInput | null, orderBy?: SizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    sizesConnection: <T = SizeConnection>(args: { where?: SizeWhereInput | null, orderBy?: SizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    tag: <T = Tag | null>(args: { where: TagWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    tags: <T = Array<Tag | null>>(args: { where?: TagWhereInput | null, orderBy?: TagOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    tagsConnection: <T = TagConnection>(args: { where?: TagWhereInput | null, orderBy?: TagOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    topSize: <T = TopSize | null>(args: { where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    topSizes: <T = Array<TopSize | null>>(args: { where?: TopSizeWhereInput | null, orderBy?: TopSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    topSizesConnection: <T = TopSizeConnection>(args: { where?: TopSizeWhereInput | null, orderBy?: TopSizeOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    user: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    users: <T = Array<User | null>>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    usersConnection: <T = UserConnection>(args: { where?: UserWhereInput | null, orderBy?: UserOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    warehouseLocation: <T = WarehouseLocation | null>(args: { where: WarehouseLocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    warehouseLocations: <T = Array<WarehouseLocation | null>>(args: { where?: WarehouseLocationWhereInput | null, orderBy?: WarehouseLocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    warehouseLocationsConnection: <T = WarehouseLocationConnection>(args: { where?: WarehouseLocationWhereInput | null, orderBy?: WarehouseLocationOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    warehouseLocationConstraint: <T = WarehouseLocationConstraint | null>(args: { where: WarehouseLocationConstraintWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    warehouseLocationConstraints: <T = Array<WarehouseLocationConstraint | null>>(args: { where?: WarehouseLocationConstraintWhereInput | null, orderBy?: WarehouseLocationConstraintOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    warehouseLocationConstraintsConnection: <T = WarehouseLocationConstraintConnection>(args: { where?: WarehouseLocationConstraintWhereInput | null, orderBy?: WarehouseLocationConstraintOrderByInput | null, skip?: Int | null, after?: String | null, before?: String | null, first?: Int | null, last?: Int | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    createBottomSize: <T = BottomSize>(args: { data: BottomSizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateBottomSize: <T = BottomSize | null>(args: { data: BottomSizeUpdateInput, where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyBottomSizes: <T = BatchPayload>(args: { data: BottomSizeUpdateManyMutationInput, where?: BottomSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertBottomSize: <T = BottomSize>(args: { where: BottomSizeWhereUniqueInput, create: BottomSizeCreateInput, update: BottomSizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteBottomSize: <T = BottomSize | null>(args: { where: BottomSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyBottomSizes: <T = BatchPayload>(args: { where?: BottomSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    createCustomerMembership: <T = CustomerMembership>(args: { data: CustomerMembershipCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateCustomerMembership: <T = CustomerMembership | null>(args: { data: CustomerMembershipUpdateInput, where: CustomerMembershipWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyCustomerMemberships: <T = BatchPayload>(args: { data: CustomerMembershipUpdateManyMutationInput, where?: CustomerMembershipWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertCustomerMembership: <T = CustomerMembership>(args: { where: CustomerMembershipWhereUniqueInput, create: CustomerMembershipCreateInput, update: CustomerMembershipUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteCustomerMembership: <T = CustomerMembership | null>(args: { where: CustomerMembershipWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyCustomerMemberships: <T = BatchPayload>(args: { where?: CustomerMembershipWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createEmailReceipt: <T = EmailReceipt>(args: { data: EmailReceiptCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateEmailReceipt: <T = EmailReceipt | null>(args: { data: EmailReceiptUpdateInput, where: EmailReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyEmailReceipts: <T = BatchPayload>(args: { data: EmailReceiptUpdateManyMutationInput, where?: EmailReceiptWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertEmailReceipt: <T = EmailReceipt>(args: { where: EmailReceiptWhereUniqueInput, create: EmailReceiptCreateInput, update: EmailReceiptUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteEmailReceipt: <T = EmailReceipt | null>(args: { where: EmailReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyEmailReceipts: <T = BatchPayload>(args: { where?: EmailReceiptWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    createPackage: <T = Package>(args: { data: PackageCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePackage: <T = Package | null>(args: { data: PackageUpdateInput, where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPackages: <T = BatchPayload>(args: { data: PackageUpdateManyMutationInput, where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPackage: <T = Package>(args: { where: PackageWhereUniqueInput, create: PackageCreateInput, update: PackageUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePackage: <T = Package | null>(args: { where: PackageWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPackages: <T = BatchPayload>(args: { where?: PackageWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPackageTransitEvent: <T = PackageTransitEvent>(args: { data: PackageTransitEventCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePackageTransitEvent: <T = PackageTransitEvent | null>(args: { data: PackageTransitEventUpdateInput, where: PackageTransitEventWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPackageTransitEvents: <T = BatchPayload>(args: { data: PackageTransitEventUpdateManyMutationInput, where?: PackageTransitEventWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPackageTransitEvent: <T = PackageTransitEvent>(args: { where: PackageTransitEventWhereUniqueInput, create: PackageTransitEventCreateInput, update: PackageTransitEventUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePackageTransitEvent: <T = PackageTransitEvent | null>(args: { where: PackageTransitEventWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPackageTransitEvents: <T = BatchPayload>(args: { where?: PackageTransitEventWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPauseRequest: <T = PauseRequest>(args: { data: PauseRequestCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePauseRequest: <T = PauseRequest | null>(args: { data: PauseRequestUpdateInput, where: PauseRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPauseRequests: <T = BatchPayload>(args: { data: PauseRequestUpdateManyMutationInput, where?: PauseRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPauseRequest: <T = PauseRequest>(args: { where: PauseRequestWhereUniqueInput, create: PauseRequestCreateInput, update: PauseRequestUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePauseRequest: <T = PauseRequest | null>(args: { where: PauseRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPauseRequests: <T = BatchPayload>(args: { where?: PauseRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPhysicalProduct: <T = PhysicalProduct>(args: { data: PhysicalProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePhysicalProduct: <T = PhysicalProduct | null>(args: { data: PhysicalProductUpdateInput, where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPhysicalProducts: <T = BatchPayload>(args: { data: PhysicalProductUpdateManyMutationInput, where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPhysicalProduct: <T = PhysicalProduct>(args: { where: PhysicalProductWhereUniqueInput, create: PhysicalProductCreateInput, update: PhysicalProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePhysicalProduct: <T = PhysicalProduct | null>(args: { where: PhysicalProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPhysicalProducts: <T = BatchPayload>(args: { where?: PhysicalProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPhysicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChange>(args: { data: PhysicalProductInventoryStatusChangeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePhysicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChange | null>(args: { data: PhysicalProductInventoryStatusChangeUpdateInput, where: PhysicalProductInventoryStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPhysicalProductInventoryStatusChanges: <T = BatchPayload>(args: { data: PhysicalProductInventoryStatusChangeUpdateManyMutationInput, where?: PhysicalProductInventoryStatusChangeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPhysicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChange>(args: { where: PhysicalProductInventoryStatusChangeWhereUniqueInput, create: PhysicalProductInventoryStatusChangeCreateInput, update: PhysicalProductInventoryStatusChangeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePhysicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChange | null>(args: { where: PhysicalProductInventoryStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPhysicalProductInventoryStatusChanges: <T = BatchPayload>(args: { where?: PhysicalProductInventoryStatusChangeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
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
    createProductMaterialCategory: <T = ProductMaterialCategory>(args: { data: ProductMaterialCategoryCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductMaterialCategory: <T = ProductMaterialCategory | null>(args: { data: ProductMaterialCategoryUpdateInput, where: ProductMaterialCategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductMaterialCategories: <T = BatchPayload>(args: { data: ProductMaterialCategoryUpdateManyMutationInput, where?: ProductMaterialCategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductMaterialCategory: <T = ProductMaterialCategory>(args: { where: ProductMaterialCategoryWhereUniqueInput, create: ProductMaterialCategoryCreateInput, update: ProductMaterialCategoryUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductMaterialCategory: <T = ProductMaterialCategory | null>(args: { where: ProductMaterialCategoryWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductMaterialCategories: <T = BatchPayload>(args: { where?: ProductMaterialCategoryWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductModel: <T = ProductModel>(args: { data: ProductModelCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductModel: <T = ProductModel | null>(args: { data: ProductModelUpdateInput, where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductModels: <T = BatchPayload>(args: { data: ProductModelUpdateManyMutationInput, where?: ProductModelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductModel: <T = ProductModel>(args: { where: ProductModelWhereUniqueInput, create: ProductModelCreateInput, update: ProductModelUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductModel: <T = ProductModel | null>(args: { where: ProductModelWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductModels: <T = BatchPayload>(args: { where?: ProductModelWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductRequest: <T = ProductRequest>(args: { data: ProductRequestCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductRequest: <T = ProductRequest | null>(args: { data: ProductRequestUpdateInput, where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductRequests: <T = BatchPayload>(args: { data: ProductRequestUpdateManyMutationInput, where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductRequest: <T = ProductRequest>(args: { where: ProductRequestWhereUniqueInput, create: ProductRequestCreateInput, update: ProductRequestUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductRequest: <T = ProductRequest | null>(args: { where: ProductRequestWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductRequests: <T = BatchPayload>(args: { where?: ProductRequestWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductStatusChange: <T = ProductStatusChange>(args: { data: ProductStatusChangeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductStatusChange: <T = ProductStatusChange | null>(args: { data: ProductStatusChangeUpdateInput, where: ProductStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductStatusChanges: <T = BatchPayload>(args: { data: ProductStatusChangeUpdateManyMutationInput, where?: ProductStatusChangeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductStatusChange: <T = ProductStatusChange>(args: { where: ProductStatusChangeWhereUniqueInput, create: ProductStatusChangeCreateInput, update: ProductStatusChangeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductStatusChange: <T = ProductStatusChange | null>(args: { where: ProductStatusChangeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductStatusChanges: <T = BatchPayload>(args: { where?: ProductStatusChangeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariant: <T = ProductVariant>(args: { data: ProductVariantCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductVariant: <T = ProductVariant | null>(args: { data: ProductVariantUpdateInput, where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductVariants: <T = BatchPayload>(args: { data: ProductVariantUpdateManyMutationInput, where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariant: <T = ProductVariant>(args: { where: ProductVariantWhereUniqueInput, create: ProductVariantCreateInput, update: ProductVariantUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductVariant: <T = ProductVariant | null>(args: { where: ProductVariantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductVariants: <T = BatchPayload>(args: { where?: ProductVariantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantFeedback: <T = ProductVariantFeedback>(args: { data: ProductVariantFeedbackCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductVariantFeedback: <T = ProductVariantFeedback | null>(args: { data: ProductVariantFeedbackUpdateInput, where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductVariantFeedbacks: <T = BatchPayload>(args: { data: ProductVariantFeedbackUpdateManyMutationInput, where?: ProductVariantFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantFeedback: <T = ProductVariantFeedback>(args: { where: ProductVariantFeedbackWhereUniqueInput, create: ProductVariantFeedbackCreateInput, update: ProductVariantFeedbackUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductVariantFeedback: <T = ProductVariantFeedback | null>(args: { where: ProductVariantFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductVariantFeedbacks: <T = BatchPayload>(args: { where?: ProductVariantFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion>(args: { data: ProductVariantFeedbackQuestionCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { data: ProductVariantFeedbackQuestionUpdateInput, where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductVariantFeedbackQuestions: <T = BatchPayload>(args: { data: ProductVariantFeedbackQuestionUpdateManyMutationInput, where?: ProductVariantFeedbackQuestionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput, create: ProductVariantFeedbackQuestionCreateInput, update: ProductVariantFeedbackQuestionUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestion | null>(args: { where: ProductVariantFeedbackQuestionWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductVariantFeedbackQuestions: <T = BatchPayload>(args: { where?: ProductVariantFeedbackQuestionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createProductVariantWant: <T = ProductVariantWant>(args: { data: ProductVariantWantCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateProductVariantWant: <T = ProductVariantWant | null>(args: { data: ProductVariantWantUpdateInput, where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyProductVariantWants: <T = BatchPayload>(args: { data: ProductVariantWantUpdateManyMutationInput, where?: ProductVariantWantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertProductVariantWant: <T = ProductVariantWant>(args: { where: ProductVariantWantWhereUniqueInput, create: ProductVariantWantCreateInput, update: ProductVariantWantUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteProductVariantWant: <T = ProductVariantWant | null>(args: { where: ProductVariantWantWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyProductVariantWants: <T = BatchPayload>(args: { where?: ProductVariantWantWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createPushNotificationReceipt: <T = PushNotificationReceipt>(args: { data: PushNotificationReceiptCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updatePushNotificationReceipt: <T = PushNotificationReceipt | null>(args: { data: PushNotificationReceiptUpdateInput, where: PushNotificationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyPushNotificationReceipts: <T = BatchPayload>(args: { data: PushNotificationReceiptUpdateManyMutationInput, where?: PushNotificationReceiptWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertPushNotificationReceipt: <T = PushNotificationReceipt>(args: { where: PushNotificationReceiptWhereUniqueInput, create: PushNotificationReceiptCreateInput, update: PushNotificationReceiptUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deletePushNotificationReceipt: <T = PushNotificationReceipt | null>(args: { where: PushNotificationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyPushNotificationReceipts: <T = BatchPayload>(args: { where?: PushNotificationReceiptWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createRecentlyViewedProduct: <T = RecentlyViewedProduct>(args: { data: RecentlyViewedProductCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateRecentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { data: RecentlyViewedProductUpdateInput, where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyRecentlyViewedProducts: <T = BatchPayload>(args: { data: RecentlyViewedProductUpdateManyMutationInput, where?: RecentlyViewedProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertRecentlyViewedProduct: <T = RecentlyViewedProduct>(args: { where: RecentlyViewedProductWhereUniqueInput, create: RecentlyViewedProductCreateInput, update: RecentlyViewedProductUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteRecentlyViewedProduct: <T = RecentlyViewedProduct | null>(args: { where: RecentlyViewedProductWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyRecentlyViewedProducts: <T = BatchPayload>(args: { where?: RecentlyViewedProductWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservation: <T = Reservation>(args: { data: ReservationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateReservation: <T = Reservation | null>(args: { data: ReservationUpdateInput, where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyReservations: <T = BatchPayload>(args: { data: ReservationUpdateManyMutationInput, where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservation: <T = Reservation>(args: { where: ReservationWhereUniqueInput, create: ReservationCreateInput, update: ReservationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteReservation: <T = Reservation | null>(args: { where: ReservationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyReservations: <T = BatchPayload>(args: { where?: ReservationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservationFeedback: <T = ReservationFeedback>(args: { data: ReservationFeedbackCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateReservationFeedback: <T = ReservationFeedback | null>(args: { data: ReservationFeedbackUpdateInput, where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyReservationFeedbacks: <T = BatchPayload>(args: { data: ReservationFeedbackUpdateManyMutationInput, where?: ReservationFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservationFeedback: <T = ReservationFeedback>(args: { where: ReservationFeedbackWhereUniqueInput, create: ReservationFeedbackCreateInput, update: ReservationFeedbackUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteReservationFeedback: <T = ReservationFeedback | null>(args: { where: ReservationFeedbackWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyReservationFeedbacks: <T = BatchPayload>(args: { where?: ReservationFeedbackWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservationReceipt: <T = ReservationReceipt>(args: { data: ReservationReceiptCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateReservationReceipt: <T = ReservationReceipt | null>(args: { data: ReservationReceiptUpdateInput, where: ReservationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    upsertReservationReceipt: <T = ReservationReceipt>(args: { where: ReservationReceiptWhereUniqueInput, create: ReservationReceiptCreateInput, update: ReservationReceiptUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteReservationReceipt: <T = ReservationReceipt | null>(args: { where: ReservationReceiptWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyReservationReceipts: <T = BatchPayload>(args: { where?: ReservationReceiptWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createReservationReceiptItem: <T = ReservationReceiptItem>(args: { data: ReservationReceiptItemCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateReservationReceiptItem: <T = ReservationReceiptItem | null>(args: { data: ReservationReceiptItemUpdateInput, where: ReservationReceiptItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyReservationReceiptItems: <T = BatchPayload>(args: { data: ReservationReceiptItemUpdateManyMutationInput, where?: ReservationReceiptItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertReservationReceiptItem: <T = ReservationReceiptItem>(args: { where: ReservationReceiptItemWhereUniqueInput, create: ReservationReceiptItemCreateInput, update: ReservationReceiptItemUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteReservationReceiptItem: <T = ReservationReceiptItem | null>(args: { where: ReservationReceiptItemWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyReservationReceiptItems: <T = BatchPayload>(args: { where?: ReservationReceiptItemWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createSize: <T = Size>(args: { data: SizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateSize: <T = Size | null>(args: { data: SizeUpdateInput, where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManySizes: <T = BatchPayload>(args: { data: SizeUpdateManyMutationInput, where?: SizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertSize: <T = Size>(args: { where: SizeWhereUniqueInput, create: SizeCreateInput, update: SizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteSize: <T = Size | null>(args: { where: SizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManySizes: <T = BatchPayload>(args: { where?: SizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createTag: <T = Tag>(args: { data: TagCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateTag: <T = Tag | null>(args: { data: TagUpdateInput, where: TagWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyTags: <T = BatchPayload>(args: { data: TagUpdateManyMutationInput, where?: TagWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertTag: <T = Tag>(args: { where: TagWhereUniqueInput, create: TagCreateInput, update: TagUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteTag: <T = Tag | null>(args: { where: TagWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyTags: <T = BatchPayload>(args: { where?: TagWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createTopSize: <T = TopSize>(args: { data: TopSizeCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateTopSize: <T = TopSize | null>(args: { data: TopSizeUpdateInput, where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyTopSizes: <T = BatchPayload>(args: { data: TopSizeUpdateManyMutationInput, where?: TopSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertTopSize: <T = TopSize>(args: { where: TopSizeWhereUniqueInput, create: TopSizeCreateInput, update: TopSizeUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteTopSize: <T = TopSize | null>(args: { where: TopSizeWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyTopSizes: <T = BatchPayload>(args: { where?: TopSizeWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createUser: <T = User>(args: { data: UserCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateUser: <T = User | null>(args: { data: UserUpdateInput, where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyUsers: <T = BatchPayload>(args: { data: UserUpdateManyMutationInput, where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertUser: <T = User>(args: { where: UserWhereUniqueInput, create: UserCreateInput, update: UserUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteUser: <T = User | null>(args: { where: UserWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyUsers: <T = BatchPayload>(args: { where?: UserWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createWarehouseLocation: <T = WarehouseLocation>(args: { data: WarehouseLocationCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateWarehouseLocation: <T = WarehouseLocation | null>(args: { data: WarehouseLocationUpdateInput, where: WarehouseLocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyWarehouseLocations: <T = BatchPayload>(args: { data: WarehouseLocationUpdateManyMutationInput, where?: WarehouseLocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertWarehouseLocation: <T = WarehouseLocation>(args: { where: WarehouseLocationWhereUniqueInput, create: WarehouseLocationCreateInput, update: WarehouseLocationUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteWarehouseLocation: <T = WarehouseLocation | null>(args: { where: WarehouseLocationWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyWarehouseLocations: <T = BatchPayload>(args: { where?: WarehouseLocationWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    createWarehouseLocationConstraint: <T = WarehouseLocationConstraint>(args: { data: WarehouseLocationConstraintCreateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    updateWarehouseLocationConstraint: <T = WarehouseLocationConstraint | null>(args: { data: WarehouseLocationConstraintUpdateInput, where: WarehouseLocationConstraintWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    updateManyWarehouseLocationConstraints: <T = BatchPayload>(args: { data: WarehouseLocationConstraintUpdateManyMutationInput, where?: WarehouseLocationConstraintWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    upsertWarehouseLocationConstraint: <T = WarehouseLocationConstraint>(args: { where: WarehouseLocationConstraintWhereUniqueInput, create: WarehouseLocationConstraintCreateInput, update: WarehouseLocationConstraintUpdateInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> ,
    deleteWarehouseLocationConstraint: <T = WarehouseLocationConstraint | null>(args: { where: WarehouseLocationConstraintWhereUniqueInput }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T | null> ,
    deleteManyWarehouseLocationConstraints: <T = BatchPayload>(args: { where?: WarehouseLocationConstraintWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<T> 
  }

export interface Subscription {
    bagItem: <T = BagItemSubscriptionPayload | null>(args: { where?: BagItemSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    billingInfo: <T = BillingInfoSubscriptionPayload | null>(args: { where?: BillingInfoSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    bottomSize: <T = BottomSizeSubscriptionPayload | null>(args: { where?: BottomSizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    brand: <T = BrandSubscriptionPayload | null>(args: { where?: BrandSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    category: <T = CategorySubscriptionPayload | null>(args: { where?: CategorySubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collection: <T = CollectionSubscriptionPayload | null>(args: { where?: CollectionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    collectionGroup: <T = CollectionGroupSubscriptionPayload | null>(args: { where?: CollectionGroupSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    color: <T = ColorSubscriptionPayload | null>(args: { where?: ColorSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customer: <T = CustomerSubscriptionPayload | null>(args: { where?: CustomerSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customerDetail: <T = CustomerDetailSubscriptionPayload | null>(args: { where?: CustomerDetailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    customerMembership: <T = CustomerMembershipSubscriptionPayload | null>(args: { where?: CustomerMembershipSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    emailReceipt: <T = EmailReceiptSubscriptionPayload | null>(args: { where?: EmailReceiptSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    homepageProductRail: <T = HomepageProductRailSubscriptionPayload | null>(args: { where?: HomepageProductRailSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    image: <T = ImageSubscriptionPayload | null>(args: { where?: ImageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    label: <T = LabelSubscriptionPayload | null>(args: { where?: LabelSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    location: <T = LocationSubscriptionPayload | null>(args: { where?: LocationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    package: <T = PackageSubscriptionPayload | null>(args: { where?: PackageSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    packageTransitEvent: <T = PackageTransitEventSubscriptionPayload | null>(args: { where?: PackageTransitEventSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    pauseRequest: <T = PauseRequestSubscriptionPayload | null>(args: { where?: PauseRequestSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    physicalProduct: <T = PhysicalProductSubscriptionPayload | null>(args: { where?: PhysicalProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    physicalProductInventoryStatusChange: <T = PhysicalProductInventoryStatusChangeSubscriptionPayload | null>(args: { where?: PhysicalProductInventoryStatusChangeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    product: <T = ProductSubscriptionPayload | null>(args: { where?: ProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productFunction: <T = ProductFunctionSubscriptionPayload | null>(args: { where?: ProductFunctionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productMaterialCategory: <T = ProductMaterialCategorySubscriptionPayload | null>(args: { where?: ProductMaterialCategorySubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productModel: <T = ProductModelSubscriptionPayload | null>(args: { where?: ProductModelSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productRequest: <T = ProductRequestSubscriptionPayload | null>(args: { where?: ProductRequestSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productStatusChange: <T = ProductStatusChangeSubscriptionPayload | null>(args: { where?: ProductStatusChangeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariant: <T = ProductVariantSubscriptionPayload | null>(args: { where?: ProductVariantSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantFeedback: <T = ProductVariantFeedbackSubscriptionPayload | null>(args: { where?: ProductVariantFeedbackSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantFeedbackQuestion: <T = ProductVariantFeedbackQuestionSubscriptionPayload | null>(args: { where?: ProductVariantFeedbackQuestionSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    productVariantWant: <T = ProductVariantWantSubscriptionPayload | null>(args: { where?: ProductVariantWantSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    pushNotificationReceipt: <T = PushNotificationReceiptSubscriptionPayload | null>(args: { where?: PushNotificationReceiptSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    recentlyViewedProduct: <T = RecentlyViewedProductSubscriptionPayload | null>(args: { where?: RecentlyViewedProductSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservation: <T = ReservationSubscriptionPayload | null>(args: { where?: ReservationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservationFeedback: <T = ReservationFeedbackSubscriptionPayload | null>(args: { where?: ReservationFeedbackSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservationReceipt: <T = ReservationReceiptSubscriptionPayload | null>(args: { where?: ReservationReceiptSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    reservationReceiptItem: <T = ReservationReceiptItemSubscriptionPayload | null>(args: { where?: ReservationReceiptItemSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    size: <T = SizeSubscriptionPayload | null>(args: { where?: SizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    tag: <T = TagSubscriptionPayload | null>(args: { where?: TagSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    topSize: <T = TopSizeSubscriptionPayload | null>(args: { where?: TopSizeSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    user: <T = UserSubscriptionPayload | null>(args: { where?: UserSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    warehouseLocation: <T = WarehouseLocationSubscriptionPayload | null>(args: { where?: WarehouseLocationSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> ,
    warehouseLocationConstraint: <T = WarehouseLocationConstraintSubscriptionPayload | null>(args: { where?: WarehouseLocationConstraintSubscriptionWhereInput | null }, info?: GraphQLResolveInfo | string, options?: Options) => Promise<AsyncIterator<T | null>> 
  }

export interface Exists {
  BagItem: (where?: BagItemWhereInput) => Promise<boolean>
  BillingInfo: (where?: BillingInfoWhereInput) => Promise<boolean>
  BottomSize: (where?: BottomSizeWhereInput) => Promise<boolean>
  Brand: (where?: BrandWhereInput) => Promise<boolean>
  Category: (where?: CategoryWhereInput) => Promise<boolean>
  Collection: (where?: CollectionWhereInput) => Promise<boolean>
  CollectionGroup: (where?: CollectionGroupWhereInput) => Promise<boolean>
  Color: (where?: ColorWhereInput) => Promise<boolean>
  Customer: (where?: CustomerWhereInput) => Promise<boolean>
  CustomerDetail: (where?: CustomerDetailWhereInput) => Promise<boolean>
  CustomerMembership: (where?: CustomerMembershipWhereInput) => Promise<boolean>
  EmailReceipt: (where?: EmailReceiptWhereInput) => Promise<boolean>
  HomepageProductRail: (where?: HomepageProductRailWhereInput) => Promise<boolean>
  Image: (where?: ImageWhereInput) => Promise<boolean>
  Label: (where?: LabelWhereInput) => Promise<boolean>
  Location: (where?: LocationWhereInput) => Promise<boolean>
  Package: (where?: PackageWhereInput) => Promise<boolean>
  PackageTransitEvent: (where?: PackageTransitEventWhereInput) => Promise<boolean>
  PauseRequest: (where?: PauseRequestWhereInput) => Promise<boolean>
  PhysicalProduct: (where?: PhysicalProductWhereInput) => Promise<boolean>
  PhysicalProductInventoryStatusChange: (where?: PhysicalProductInventoryStatusChangeWhereInput) => Promise<boolean>
  Product: (where?: ProductWhereInput) => Promise<boolean>
  ProductFunction: (where?: ProductFunctionWhereInput) => Promise<boolean>
  ProductMaterialCategory: (where?: ProductMaterialCategoryWhereInput) => Promise<boolean>
  ProductModel: (where?: ProductModelWhereInput) => Promise<boolean>
  ProductRequest: (where?: ProductRequestWhereInput) => Promise<boolean>
  ProductStatusChange: (where?: ProductStatusChangeWhereInput) => Promise<boolean>
  ProductVariant: (where?: ProductVariantWhereInput) => Promise<boolean>
  ProductVariantFeedback: (where?: ProductVariantFeedbackWhereInput) => Promise<boolean>
  ProductVariantFeedbackQuestion: (where?: ProductVariantFeedbackQuestionWhereInput) => Promise<boolean>
  ProductVariantWant: (where?: ProductVariantWantWhereInput) => Promise<boolean>
  PushNotificationReceipt: (where?: PushNotificationReceiptWhereInput) => Promise<boolean>
  RecentlyViewedProduct: (where?: RecentlyViewedProductWhereInput) => Promise<boolean>
  Reservation: (where?: ReservationWhereInput) => Promise<boolean>
  ReservationFeedback: (where?: ReservationFeedbackWhereInput) => Promise<boolean>
  ReservationReceipt: (where?: ReservationReceiptWhereInput) => Promise<boolean>
  ReservationReceiptItem: (where?: ReservationReceiptItemWhereInput) => Promise<boolean>
  Size: (where?: SizeWhereInput) => Promise<boolean>
  Tag: (where?: TagWhereInput) => Promise<boolean>
  TopSize: (where?: TopSizeWhereInput) => Promise<boolean>
  User: (where?: UserWhereInput) => Promise<boolean>
  WarehouseLocation: (where?: WarehouseLocationWhereInput) => Promise<boolean>
  WarehouseLocationConstraint: (where?: WarehouseLocationConstraintWhereInput) => Promise<boolean>
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

type AggregateCustomerMembership {
  count: Int!
}

type AggregateEmailReceipt {
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

type AggregatePackage {
  count: Int!
}

type AggregatePackageTransitEvent {
  count: Int!
}

type AggregatePauseRequest {
  count: Int!
}

type AggregatePhysicalProduct {
  count: Int!
}

type AggregatePhysicalProductInventoryStatusChange {
  count: Int!
}

type AggregateProduct {
  count: Int!
}

type AggregateProductFunction {
  count: Int!
}

type AggregateProductMaterialCategory {
  count: Int!
}

type AggregateProductModel {
  count: Int!
}

type AggregateProductRequest {
  count: Int!
}

type AggregateProductStatusChange {
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

type AggregatePushNotificationReceipt {
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

type AggregateReservationReceipt {
  count: Int!
}

type AggregateReservationReceiptItem {
  count: Int!
}

type AggregateSize {
  count: Int!
}

type AggregateTag {
  count: Int!
}

type AggregateTopSize {
  count: Int!
}

type AggregateUser {
  count: Int!
}

type AggregateWarehouseLocation {
  count: Int!
}

type AggregateWarehouseLocationConstraint {
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
  customer: CustomerCreateOneWithoutBagItemsInput!
  productVariant: ProductVariantCreateOneInput!
  position: Int
  saved: Boolean
  status: BagItemStatus!
}

input BagItemCreateManyWithoutCustomerInput {
  create: [BagItemCreateWithoutCustomerInput!]
  connect: [BagItemWhereUniqueInput!]
}

input BagItemCreateWithoutCustomerInput {
  id: ID
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

input BagItemScalarWhereInput {
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
  AND: [BagItemScalarWhereInput!]
  OR: [BagItemScalarWhereInput!]
  NOT: [BagItemScalarWhereInput!]
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
  customer: CustomerUpdateOneRequiredWithoutBagItemsInput
  productVariant: ProductVariantUpdateOneRequiredInput
  position: Int
  saved: Boolean
  status: BagItemStatus
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
  delete: [BagItemWhereUniqueInput!]
  connect: [BagItemWhereUniqueInput!]
  set: [BagItemWhereUniqueInput!]
  disconnect: [BagItemWhereUniqueInput!]
  update: [BagItemUpdateWithWhereUniqueWithoutCustomerInput!]
  upsert: [BagItemUpsertWithWhereUniqueWithoutCustomerInput!]
  deleteMany: [BagItemScalarWhereInput!]
  updateMany: [BagItemUpdateManyWithWhereNestedInput!]
}

input BagItemUpdateManyWithWhereNestedInput {
  where: BagItemScalarWhereInput!
  data: BagItemUpdateManyDataInput!
}

input BagItemUpdateWithoutCustomerDataInput {
  productVariant: ProductVariantUpdateOneRequiredInput
  position: Int
  saved: Boolean
  status: BagItemStatus
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

type BottomSize {
  id: ID!
  type: BottomSizeType
  value: String
  waist: Float
  rise: Float
  hem: Float
  inseam: Float
}

type BottomSizeConnection {
  pageInfo: PageInfo!
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

type BottomSizeEdge {
  node: BottomSize!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: BottomSizeWhereInput
  AND: [BottomSizeSubscriptionWhereInput!]
  OR: [BottomSizeSubscriptionWhereInput!]
  NOT: [BottomSizeSubscriptionWhereInput!]
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
  update: BottomSizeUpdateDataInput
  upsert: BottomSizeUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: BottomSizeWhereUniqueInput
}

input BottomSizeUpsertNestedInput {
  update: BottomSizeUpdateDataInput!
  create: BottomSizeCreateInput!
}

input BottomSizeWhereInput {
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
  type: BottomSizeType
  type_not: BottomSizeType
  type_in: [BottomSizeType!]
  type_not_in: [BottomSizeType!]
  value: String
  value_not: String
  value_in: [String!]
  value_not_in: [String!]
  value_lt: String
  value_lte: String
  value_gt: String
  value_gte: String
  value_contains: String
  value_not_contains: String
  value_starts_with: String
  value_not_starts_with: String
  value_ends_with: String
  value_not_ends_with: String
  waist: Float
  waist_not: Float
  waist_in: [Float!]
  waist_not_in: [Float!]
  waist_lt: Float
  waist_lte: Float
  waist_gt: Float
  waist_gte: Float
  rise: Float
  rise_not: Float
  rise_in: [Float!]
  rise_not_in: [Float!]
  rise_lt: Float
  rise_lte: Float
  rise_gt: Float
  rise_gte: Float
  hem: Float
  hem_not: Float
  hem_in: [Float!]
  hem_not_in: [Float!]
  hem_lt: Float
  hem_lte: Float
  hem_gt: Float
  hem_gte: Float
  inseam: Float
  inseam_not: Float
  inseam_in: [Float!]
  inseam_not_in: [Float!]
  inseam_lt: Float
  inseam_lte: Float
  inseam_gt: Float
  inseam_gte: Float
  AND: [BottomSizeWhereInput!]
  OR: [BottomSizeWhereInput!]
  NOT: [BottomSizeWhereInput!]
}

input BottomSizeWhereUniqueInput {
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

input CategoryCreateOneInput {
  create: CategoryCreateInput
  connect: CategoryWhereUniqueInput
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

input CategoryUpdateDataInput {
  slug: String
  name: String
  image: Json
  description: String
  visible: Boolean
  products: ProductUpdateManyWithoutCategoryInput
  children: CategoryUpdateManyWithoutChildrenInput
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

input CategoryUpdateOneRequiredInput {
  create: CategoryCreateInput
  update: CategoryUpdateDataInput
  upsert: CategoryUpsertNestedInput
  connect: CategoryWhereUniqueInput
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

input CategoryUpsertNestedInput {
  update: CategoryUpdateDataInput!
  create: CategoryCreateInput!
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
  membership: CustomerMembership
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem!]
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
  membership: CustomerMembershipCreateOneWithoutCustomerInput
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

input CustomerCreateOneWithoutMembershipInput {
  create: CustomerCreateWithoutMembershipInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateOneWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  connect: CustomerWhereUniqueInput
}

input CustomerCreateWithoutBagItemsInput {
  id: ID
  user: UserCreateOneInput!
  status: CustomerStatus
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  plan: Plan
  membership: CustomerMembershipCreateOneWithoutCustomerInput
  reservations: ReservationCreateManyWithoutCustomerInput
}

input CustomerCreateWithoutMembershipInput {
  id: ID
  user: UserCreateOneInput!
  status: CustomerStatus
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  plan: Plan
  bagItems: BagItemCreateManyWithoutCustomerInput
  reservations: ReservationCreateManyWithoutCustomerInput
}

input CustomerCreateWithoutReservationsInput {
  id: ID
  user: UserCreateOneInput!
  status: CustomerStatus
  detail: CustomerDetailCreateOneInput
  billingInfo: BillingInfoCreateOneInput
  plan: Plan
  membership: CustomerMembershipCreateOneWithoutCustomerInput
  bagItems: BagItemCreateManyWithoutCustomerInput
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
  insureShipment: Boolean!
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
  insureShipment: Boolean
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
  insureShipment: Boolean
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
  insureShipment: Boolean
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
  insureShipment: Boolean
  insureShipment_not: Boolean
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

type CustomerMembership {
  id: ID!
  subscriptionId: String!
  customer: Customer!
  pauseRequests(where: PauseRequestWhereInput, orderBy: PauseRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PauseRequest!]
}

type CustomerMembershipConnection {
  pageInfo: PageInfo!
  edges: [CustomerMembershipEdge]!
  aggregate: AggregateCustomerMembership!
}

input CustomerMembershipCreateInput {
  id: ID
  subscriptionId: String!
  customer: CustomerCreateOneWithoutMembershipInput!
  pauseRequests: PauseRequestCreateManyWithoutMembershipInput
}

input CustomerMembershipCreateOneWithoutCustomerInput {
  create: CustomerMembershipCreateWithoutCustomerInput
  connect: CustomerMembershipWhereUniqueInput
}

input CustomerMembershipCreateOneWithoutPauseRequestsInput {
  create: CustomerMembershipCreateWithoutPauseRequestsInput
  connect: CustomerMembershipWhereUniqueInput
}

input CustomerMembershipCreateWithoutCustomerInput {
  id: ID
  subscriptionId: String!
  pauseRequests: PauseRequestCreateManyWithoutMembershipInput
}

input CustomerMembershipCreateWithoutPauseRequestsInput {
  id: ID
  subscriptionId: String!
  customer: CustomerCreateOneWithoutMembershipInput!
}

type CustomerMembershipEdge {
  node: CustomerMembership!
  cursor: String!
}

enum CustomerMembershipOrderByInput {
  id_ASC
  id_DESC
  subscriptionId_ASC
  subscriptionId_DESC
}

type CustomerMembershipPreviousValues {
  id: ID!
  subscriptionId: String!
}

type CustomerMembershipSubscriptionPayload {
  mutation: MutationType!
  node: CustomerMembership
  updatedFields: [String!]
  previousValues: CustomerMembershipPreviousValues
}

input CustomerMembershipSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: CustomerMembershipWhereInput
  AND: [CustomerMembershipSubscriptionWhereInput!]
  OR: [CustomerMembershipSubscriptionWhereInput!]
  NOT: [CustomerMembershipSubscriptionWhereInput!]
}

input CustomerMembershipUpdateInput {
  subscriptionId: String
  customer: CustomerUpdateOneRequiredWithoutMembershipInput
  pauseRequests: PauseRequestUpdateManyWithoutMembershipInput
}

input CustomerMembershipUpdateManyMutationInput {
  subscriptionId: String
}

input CustomerMembershipUpdateOneRequiredWithoutPauseRequestsInput {
  create: CustomerMembershipCreateWithoutPauseRequestsInput
  update: CustomerMembershipUpdateWithoutPauseRequestsDataInput
  upsert: CustomerMembershipUpsertWithoutPauseRequestsInput
  connect: CustomerMembershipWhereUniqueInput
}

input CustomerMembershipUpdateOneWithoutCustomerInput {
  create: CustomerMembershipCreateWithoutCustomerInput
  update: CustomerMembershipUpdateWithoutCustomerDataInput
  upsert: CustomerMembershipUpsertWithoutCustomerInput
  delete: Boolean
  disconnect: Boolean
  connect: CustomerMembershipWhereUniqueInput
}

input CustomerMembershipUpdateWithoutCustomerDataInput {
  subscriptionId: String
  pauseRequests: PauseRequestUpdateManyWithoutMembershipInput
}

input CustomerMembershipUpdateWithoutPauseRequestsDataInput {
  subscriptionId: String
  customer: CustomerUpdateOneRequiredWithoutMembershipInput
}

input CustomerMembershipUpsertWithoutCustomerInput {
  update: CustomerMembershipUpdateWithoutCustomerDataInput!
  create: CustomerMembershipCreateWithoutCustomerInput!
}

input CustomerMembershipUpsertWithoutPauseRequestsInput {
  update: CustomerMembershipUpdateWithoutPauseRequestsDataInput!
  create: CustomerMembershipCreateWithoutPauseRequestsInput!
}

input CustomerMembershipWhereInput {
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
  subscriptionId: String
  subscriptionId_not: String
  subscriptionId_in: [String!]
  subscriptionId_not_in: [String!]
  subscriptionId_lt: String
  subscriptionId_lte: String
  subscriptionId_gt: String
  subscriptionId_gte: String
  subscriptionId_contains: String
  subscriptionId_not_contains: String
  subscriptionId_starts_with: String
  subscriptionId_not_starts_with: String
  subscriptionId_ends_with: String
  subscriptionId_not_ends_with: String
  customer: CustomerWhereInput
  pauseRequests_every: PauseRequestWhereInput
  pauseRequests_some: PauseRequestWhereInput
  pauseRequests_none: PauseRequestWhereInput
  AND: [CustomerMembershipWhereInput!]
  OR: [CustomerMembershipWhereInput!]
  NOT: [CustomerMembershipWhereInput!]
}

input CustomerMembershipWhereUniqueInput {
  id: ID
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
  membership: CustomerMembershipUpdateOneWithoutCustomerInput
  bagItems: BagItemUpdateManyWithoutCustomerInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  membership: CustomerMembershipUpdateOneWithoutCustomerInput
  bagItems: BagItemUpdateManyWithoutCustomerInput
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

input CustomerUpdateOneRequiredWithoutBagItemsInput {
  create: CustomerCreateWithoutBagItemsInput
  update: CustomerUpdateWithoutBagItemsDataInput
  upsert: CustomerUpsertWithoutBagItemsInput
  connect: CustomerWhereUniqueInput
}

input CustomerUpdateOneRequiredWithoutMembershipInput {
  create: CustomerCreateWithoutMembershipInput
  update: CustomerUpdateWithoutMembershipDataInput
  upsert: CustomerUpsertWithoutMembershipInput
  connect: CustomerWhereUniqueInput
}

input CustomerUpdateOneRequiredWithoutReservationsInput {
  create: CustomerCreateWithoutReservationsInput
  update: CustomerUpdateWithoutReservationsDataInput
  upsert: CustomerUpsertWithoutReservationsInput
  connect: CustomerWhereUniqueInput
}

input CustomerUpdateWithoutBagItemsDataInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  membership: CustomerMembershipUpdateOneWithoutCustomerInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateWithoutMembershipDataInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  bagItems: BagItemUpdateManyWithoutCustomerInput
  reservations: ReservationUpdateManyWithoutCustomerInput
}

input CustomerUpdateWithoutReservationsDataInput {
  user: UserUpdateOneRequiredInput
  status: CustomerStatus
  detail: CustomerDetailUpdateOneInput
  billingInfo: BillingInfoUpdateOneInput
  plan: Plan
  membership: CustomerMembershipUpdateOneWithoutCustomerInput
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

input CustomerUpsertWithoutMembershipInput {
  update: CustomerUpdateWithoutMembershipDataInput!
  create: CustomerCreateWithoutMembershipInput!
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
  membership: CustomerMembershipWhereInput
  bagItems_every: BagItemWhereInput
  bagItems_some: BagItemWhereInput
  bagItems_none: BagItemWhereInput
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

enum EmailId {
  ReservationReturnConfirmation
  ReservationConfirmation
  CompleteAccount
  FreeToReserve
  WelcomeToSeasons
  ReturnReminder
}

type EmailReceipt {
  id: ID!
  emailId: EmailId!
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type EmailReceiptConnection {
  pageInfo: PageInfo!
  edges: [EmailReceiptEdge]!
  aggregate: AggregateEmailReceipt!
}

input EmailReceiptCreateInput {
  id: ID
  emailId: EmailId!
  user: UserCreateOneInput!
}

type EmailReceiptEdge {
  node: EmailReceipt!
  cursor: String!
}

enum EmailReceiptOrderByInput {
  id_ASC
  id_DESC
  emailId_ASC
  emailId_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type EmailReceiptPreviousValues {
  id: ID!
  emailId: EmailId!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type EmailReceiptSubscriptionPayload {
  mutation: MutationType!
  node: EmailReceipt
  updatedFields: [String!]
  previousValues: EmailReceiptPreviousValues
}

input EmailReceiptSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: EmailReceiptWhereInput
  AND: [EmailReceiptSubscriptionWhereInput!]
  OR: [EmailReceiptSubscriptionWhereInput!]
  NOT: [EmailReceiptSubscriptionWhereInput!]
}

input EmailReceiptUpdateInput {
  emailId: EmailId
  user: UserUpdateOneRequiredInput
}

input EmailReceiptUpdateManyMutationInput {
  emailId: EmailId
}

input EmailReceiptWhereInput {
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
  emailId: EmailId
  emailId_not: EmailId
  emailId_in: [EmailId!]
  emailId_not_in: [EmailId!]
  user: UserWhereInput
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
  AND: [EmailReceiptWhereInput!]
  OR: [EmailReceiptWhereInput!]
  NOT: [EmailReceiptWhereInput!]
}

input EmailReceiptWhereUniqueInput {
  id: ID
}

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
  url: String!
  height: Int
  width: Int
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
  url: String!
  height: Int
  width: Int
  title: String
}

input ImageCreateManyInput {
  create: [ImageCreateInput!]
  connect: [ImageWhereUniqueInput!]
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
  url_ASC
  url_DESC
  height_ASC
  height_DESC
  width_ASC
  width_DESC
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
  url: String!
  height: Int
  width: Int
  title: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ImageScalarWhereInput {
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
  height: Int
  height_not: Int
  height_in: [Int!]
  height_not_in: [Int!]
  height_lt: Int
  height_lte: Int
  height_gt: Int
  height_gte: Int
  width: Int
  width_not: Int
  width_in: [Int!]
  width_not_in: [Int!]
  width_lt: Int
  width_lte: Int
  width_gt: Int
  width_gte: Int
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
  AND: [ImageScalarWhereInput!]
  OR: [ImageScalarWhereInput!]
  NOT: [ImageScalarWhereInput!]
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

input ImageUpdateDataInput {
  caption: String
  url: String
  height: Int
  width: Int
  title: String
}

input ImageUpdateInput {
  caption: String
  url: String
  height: Int
  width: Int
  title: String
}

input ImageUpdateManyDataInput {
  caption: String
  url: String
  height: Int
  width: Int
  title: String
}

input ImageUpdateManyInput {
  create: [ImageCreateInput!]
  update: [ImageUpdateWithWhereUniqueNestedInput!]
  upsert: [ImageUpsertWithWhereUniqueNestedInput!]
  delete: [ImageWhereUniqueInput!]
  connect: [ImageWhereUniqueInput!]
  set: [ImageWhereUniqueInput!]
  disconnect: [ImageWhereUniqueInput!]
  deleteMany: [ImageScalarWhereInput!]
  updateMany: [ImageUpdateManyWithWhereNestedInput!]
}

input ImageUpdateManyMutationInput {
  caption: String
  url: String
  height: Int
  width: Int
  title: String
}

input ImageUpdateManyWithWhereNestedInput {
  where: ImageScalarWhereInput!
  data: ImageUpdateManyDataInput!
}

input ImageUpdateWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput!
  data: ImageUpdateDataInput!
}

input ImageUpsertWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput!
  update: ImageUpdateDataInput!
  create: ImageCreateInput!
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
  height: Int
  height_not: Int
  height_in: [Int!]
  height_not_in: [Int!]
  height_lt: Int
  height_lte: Int
  height_gt: Int
  height_gte: Int
  width: Int
  width_not: Int
  width_in: [Int!]
  width_not_in: [Int!]
  width_lt: Int
  width_lte: Int
  width_gt: Int
  width_gte: Int
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
  url: String
}

enum InventoryStatus {
  NonReservable
  Reservable
  Reserved
  Stored
  Offloaded
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

enum LetterSize {
  XS
  S
  M
  L
  XL
  XXL
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

input LocationUpdateOneWithoutPhysicalProductsInput {
  create: LocationCreateWithoutPhysicalProductsInput
  update: LocationUpdateWithoutPhysicalProductsDataInput
  upsert: LocationUpsertWithoutPhysicalProductsInput
  delete: Boolean
  disconnect: Boolean
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
  createBottomSize(data: BottomSizeCreateInput!): BottomSize!
  updateBottomSize(data: BottomSizeUpdateInput!, where: BottomSizeWhereUniqueInput!): BottomSize
  updateManyBottomSizes(data: BottomSizeUpdateManyMutationInput!, where: BottomSizeWhereInput): BatchPayload!
  upsertBottomSize(where: BottomSizeWhereUniqueInput!, create: BottomSizeCreateInput!, update: BottomSizeUpdateInput!): BottomSize!
  deleteBottomSize(where: BottomSizeWhereUniqueInput!): BottomSize
  deleteManyBottomSizes(where: BottomSizeWhereInput): BatchPayload!
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
  createCustomerMembership(data: CustomerMembershipCreateInput!): CustomerMembership!
  updateCustomerMembership(data: CustomerMembershipUpdateInput!, where: CustomerMembershipWhereUniqueInput!): CustomerMembership
  updateManyCustomerMemberships(data: CustomerMembershipUpdateManyMutationInput!, where: CustomerMembershipWhereInput): BatchPayload!
  upsertCustomerMembership(where: CustomerMembershipWhereUniqueInput!, create: CustomerMembershipCreateInput!, update: CustomerMembershipUpdateInput!): CustomerMembership!
  deleteCustomerMembership(where: CustomerMembershipWhereUniqueInput!): CustomerMembership
  deleteManyCustomerMemberships(where: CustomerMembershipWhereInput): BatchPayload!
  createEmailReceipt(data: EmailReceiptCreateInput!): EmailReceipt!
  updateEmailReceipt(data: EmailReceiptUpdateInput!, where: EmailReceiptWhereUniqueInput!): EmailReceipt
  updateManyEmailReceipts(data: EmailReceiptUpdateManyMutationInput!, where: EmailReceiptWhereInput): BatchPayload!
  upsertEmailReceipt(where: EmailReceiptWhereUniqueInput!, create: EmailReceiptCreateInput!, update: EmailReceiptUpdateInput!): EmailReceipt!
  deleteEmailReceipt(where: EmailReceiptWhereUniqueInput!): EmailReceipt
  deleteManyEmailReceipts(where: EmailReceiptWhereInput): BatchPayload!
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
  createPackage(data: PackageCreateInput!): Package!
  updatePackage(data: PackageUpdateInput!, where: PackageWhereUniqueInput!): Package
  updateManyPackages(data: PackageUpdateManyMutationInput!, where: PackageWhereInput): BatchPayload!
  upsertPackage(where: PackageWhereUniqueInput!, create: PackageCreateInput!, update: PackageUpdateInput!): Package!
  deletePackage(where: PackageWhereUniqueInput!): Package
  deleteManyPackages(where: PackageWhereInput): BatchPayload!
  createPackageTransitEvent(data: PackageTransitEventCreateInput!): PackageTransitEvent!
  updatePackageTransitEvent(data: PackageTransitEventUpdateInput!, where: PackageTransitEventWhereUniqueInput!): PackageTransitEvent
  updateManyPackageTransitEvents(data: PackageTransitEventUpdateManyMutationInput!, where: PackageTransitEventWhereInput): BatchPayload!
  upsertPackageTransitEvent(where: PackageTransitEventWhereUniqueInput!, create: PackageTransitEventCreateInput!, update: PackageTransitEventUpdateInput!): PackageTransitEvent!
  deletePackageTransitEvent(where: PackageTransitEventWhereUniqueInput!): PackageTransitEvent
  deleteManyPackageTransitEvents(where: PackageTransitEventWhereInput): BatchPayload!
  createPauseRequest(data: PauseRequestCreateInput!): PauseRequest!
  updatePauseRequest(data: PauseRequestUpdateInput!, where: PauseRequestWhereUniqueInput!): PauseRequest
  updateManyPauseRequests(data: PauseRequestUpdateManyMutationInput!, where: PauseRequestWhereInput): BatchPayload!
  upsertPauseRequest(where: PauseRequestWhereUniqueInput!, create: PauseRequestCreateInput!, update: PauseRequestUpdateInput!): PauseRequest!
  deletePauseRequest(where: PauseRequestWhereUniqueInput!): PauseRequest
  deleteManyPauseRequests(where: PauseRequestWhereInput): BatchPayload!
  createPhysicalProduct(data: PhysicalProductCreateInput!): PhysicalProduct!
  updatePhysicalProduct(data: PhysicalProductUpdateInput!, where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  updateManyPhysicalProducts(data: PhysicalProductUpdateManyMutationInput!, where: PhysicalProductWhereInput): BatchPayload!
  upsertPhysicalProduct(where: PhysicalProductWhereUniqueInput!, create: PhysicalProductCreateInput!, update: PhysicalProductUpdateInput!): PhysicalProduct!
  deletePhysicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  deleteManyPhysicalProducts(where: PhysicalProductWhereInput): BatchPayload!
  createPhysicalProductInventoryStatusChange(data: PhysicalProductInventoryStatusChangeCreateInput!): PhysicalProductInventoryStatusChange!
  updatePhysicalProductInventoryStatusChange(data: PhysicalProductInventoryStatusChangeUpdateInput!, where: PhysicalProductInventoryStatusChangeWhereUniqueInput!): PhysicalProductInventoryStatusChange
  updateManyPhysicalProductInventoryStatusChanges(data: PhysicalProductInventoryStatusChangeUpdateManyMutationInput!, where: PhysicalProductInventoryStatusChangeWhereInput): BatchPayload!
  upsertPhysicalProductInventoryStatusChange(where: PhysicalProductInventoryStatusChangeWhereUniqueInput!, create: PhysicalProductInventoryStatusChangeCreateInput!, update: PhysicalProductInventoryStatusChangeUpdateInput!): PhysicalProductInventoryStatusChange!
  deletePhysicalProductInventoryStatusChange(where: PhysicalProductInventoryStatusChangeWhereUniqueInput!): PhysicalProductInventoryStatusChange
  deleteManyPhysicalProductInventoryStatusChanges(where: PhysicalProductInventoryStatusChangeWhereInput): BatchPayload!
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
  createProductMaterialCategory(data: ProductMaterialCategoryCreateInput!): ProductMaterialCategory!
  updateProductMaterialCategory(data: ProductMaterialCategoryUpdateInput!, where: ProductMaterialCategoryWhereUniqueInput!): ProductMaterialCategory
  updateManyProductMaterialCategories(data: ProductMaterialCategoryUpdateManyMutationInput!, where: ProductMaterialCategoryWhereInput): BatchPayload!
  upsertProductMaterialCategory(where: ProductMaterialCategoryWhereUniqueInput!, create: ProductMaterialCategoryCreateInput!, update: ProductMaterialCategoryUpdateInput!): ProductMaterialCategory!
  deleteProductMaterialCategory(where: ProductMaterialCategoryWhereUniqueInput!): ProductMaterialCategory
  deleteManyProductMaterialCategories(where: ProductMaterialCategoryWhereInput): BatchPayload!
  createProductModel(data: ProductModelCreateInput!): ProductModel!
  updateProductModel(data: ProductModelUpdateInput!, where: ProductModelWhereUniqueInput!): ProductModel
  updateManyProductModels(data: ProductModelUpdateManyMutationInput!, where: ProductModelWhereInput): BatchPayload!
  upsertProductModel(where: ProductModelWhereUniqueInput!, create: ProductModelCreateInput!, update: ProductModelUpdateInput!): ProductModel!
  deleteProductModel(where: ProductModelWhereUniqueInput!): ProductModel
  deleteManyProductModels(where: ProductModelWhereInput): BatchPayload!
  createProductRequest(data: ProductRequestCreateInput!): ProductRequest!
  updateProductRequest(data: ProductRequestUpdateInput!, where: ProductRequestWhereUniqueInput!): ProductRequest
  updateManyProductRequests(data: ProductRequestUpdateManyMutationInput!, where: ProductRequestWhereInput): BatchPayload!
  upsertProductRequest(where: ProductRequestWhereUniqueInput!, create: ProductRequestCreateInput!, update: ProductRequestUpdateInput!): ProductRequest!
  deleteProductRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  deleteManyProductRequests(where: ProductRequestWhereInput): BatchPayload!
  createProductStatusChange(data: ProductStatusChangeCreateInput!): ProductStatusChange!
  updateProductStatusChange(data: ProductStatusChangeUpdateInput!, where: ProductStatusChangeWhereUniqueInput!): ProductStatusChange
  updateManyProductStatusChanges(data: ProductStatusChangeUpdateManyMutationInput!, where: ProductStatusChangeWhereInput): BatchPayload!
  upsertProductStatusChange(where: ProductStatusChangeWhereUniqueInput!, create: ProductStatusChangeCreateInput!, update: ProductStatusChangeUpdateInput!): ProductStatusChange!
  deleteProductStatusChange(where: ProductStatusChangeWhereUniqueInput!): ProductStatusChange
  deleteManyProductStatusChanges(where: ProductStatusChangeWhereInput): BatchPayload!
  createProductVariant(data: ProductVariantCreateInput!): ProductVariant!
  updateProductVariant(data: ProductVariantUpdateInput!, where: ProductVariantWhereUniqueInput!): ProductVariant
  updateManyProductVariants(data: ProductVariantUpdateManyMutationInput!, where: ProductVariantWhereInput): BatchPayload!
  upsertProductVariant(where: ProductVariantWhereUniqueInput!, create: ProductVariantCreateInput!, update: ProductVariantUpdateInput!): ProductVariant!
  deleteProductVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  deleteManyProductVariants(where: ProductVariantWhereInput): BatchPayload!
  createProductVariantFeedback(data: ProductVariantFeedbackCreateInput!): ProductVariantFeedback!
  updateProductVariantFeedback(data: ProductVariantFeedbackUpdateInput!, where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  updateManyProductVariantFeedbacks(data: ProductVariantFeedbackUpdateManyMutationInput!, where: ProductVariantFeedbackWhereInput): BatchPayload!
  upsertProductVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!, create: ProductVariantFeedbackCreateInput!, update: ProductVariantFeedbackUpdateInput!): ProductVariantFeedback!
  deleteProductVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  deleteManyProductVariantFeedbacks(where: ProductVariantFeedbackWhereInput): BatchPayload!
  createProductVariantFeedbackQuestion(data: ProductVariantFeedbackQuestionCreateInput!): ProductVariantFeedbackQuestion!
  updateProductVariantFeedbackQuestion(data: ProductVariantFeedbackQuestionUpdateInput!, where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  updateManyProductVariantFeedbackQuestions(data: ProductVariantFeedbackQuestionUpdateManyMutationInput!, where: ProductVariantFeedbackQuestionWhereInput): BatchPayload!
  upsertProductVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!, create: ProductVariantFeedbackQuestionCreateInput!, update: ProductVariantFeedbackQuestionUpdateInput!): ProductVariantFeedbackQuestion!
  deleteProductVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  deleteManyProductVariantFeedbackQuestions(where: ProductVariantFeedbackQuestionWhereInput): BatchPayload!
  createProductVariantWant(data: ProductVariantWantCreateInput!): ProductVariantWant!
  updateProductVariantWant(data: ProductVariantWantUpdateInput!, where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  updateManyProductVariantWants(data: ProductVariantWantUpdateManyMutationInput!, where: ProductVariantWantWhereInput): BatchPayload!
  upsertProductVariantWant(where: ProductVariantWantWhereUniqueInput!, create: ProductVariantWantCreateInput!, update: ProductVariantWantUpdateInput!): ProductVariantWant!
  deleteProductVariantWant(where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  deleteManyProductVariantWants(where: ProductVariantWantWhereInput): BatchPayload!
  createPushNotificationReceipt(data: PushNotificationReceiptCreateInput!): PushNotificationReceipt!
  updatePushNotificationReceipt(data: PushNotificationReceiptUpdateInput!, where: PushNotificationReceiptWhereUniqueInput!): PushNotificationReceipt
  updateManyPushNotificationReceipts(data: PushNotificationReceiptUpdateManyMutationInput!, where: PushNotificationReceiptWhereInput): BatchPayload!
  upsertPushNotificationReceipt(where: PushNotificationReceiptWhereUniqueInput!, create: PushNotificationReceiptCreateInput!, update: PushNotificationReceiptUpdateInput!): PushNotificationReceipt!
  deletePushNotificationReceipt(where: PushNotificationReceiptWhereUniqueInput!): PushNotificationReceipt
  deleteManyPushNotificationReceipts(where: PushNotificationReceiptWhereInput): BatchPayload!
  createRecentlyViewedProduct(data: RecentlyViewedProductCreateInput!): RecentlyViewedProduct!
  updateRecentlyViewedProduct(data: RecentlyViewedProductUpdateInput!, where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  updateManyRecentlyViewedProducts(data: RecentlyViewedProductUpdateManyMutationInput!, where: RecentlyViewedProductWhereInput): BatchPayload!
  upsertRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!, create: RecentlyViewedProductCreateInput!, update: RecentlyViewedProductUpdateInput!): RecentlyViewedProduct!
  deleteRecentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  deleteManyRecentlyViewedProducts(where: RecentlyViewedProductWhereInput): BatchPayload!
  createReservation(data: ReservationCreateInput!): Reservation!
  updateReservation(data: ReservationUpdateInput!, where: ReservationWhereUniqueInput!): Reservation
  updateManyReservations(data: ReservationUpdateManyMutationInput!, where: ReservationWhereInput): BatchPayload!
  upsertReservation(where: ReservationWhereUniqueInput!, create: ReservationCreateInput!, update: ReservationUpdateInput!): Reservation!
  deleteReservation(where: ReservationWhereUniqueInput!): Reservation
  deleteManyReservations(where: ReservationWhereInput): BatchPayload!
  createReservationFeedback(data: ReservationFeedbackCreateInput!): ReservationFeedback!
  updateReservationFeedback(data: ReservationFeedbackUpdateInput!, where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  updateManyReservationFeedbacks(data: ReservationFeedbackUpdateManyMutationInput!, where: ReservationFeedbackWhereInput): BatchPayload!
  upsertReservationFeedback(where: ReservationFeedbackWhereUniqueInput!, create: ReservationFeedbackCreateInput!, update: ReservationFeedbackUpdateInput!): ReservationFeedback!
  deleteReservationFeedback(where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  deleteManyReservationFeedbacks(where: ReservationFeedbackWhereInput): BatchPayload!
  createReservationReceipt(data: ReservationReceiptCreateInput!): ReservationReceipt!
  updateReservationReceipt(data: ReservationReceiptUpdateInput!, where: ReservationReceiptWhereUniqueInput!): ReservationReceipt
  upsertReservationReceipt(where: ReservationReceiptWhereUniqueInput!, create: ReservationReceiptCreateInput!, update: ReservationReceiptUpdateInput!): ReservationReceipt!
  deleteReservationReceipt(where: ReservationReceiptWhereUniqueInput!): ReservationReceipt
  deleteManyReservationReceipts(where: ReservationReceiptWhereInput): BatchPayload!
  createReservationReceiptItem(data: ReservationReceiptItemCreateInput!): ReservationReceiptItem!
  updateReservationReceiptItem(data: ReservationReceiptItemUpdateInput!, where: ReservationReceiptItemWhereUniqueInput!): ReservationReceiptItem
  updateManyReservationReceiptItems(data: ReservationReceiptItemUpdateManyMutationInput!, where: ReservationReceiptItemWhereInput): BatchPayload!
  upsertReservationReceiptItem(where: ReservationReceiptItemWhereUniqueInput!, create: ReservationReceiptItemCreateInput!, update: ReservationReceiptItemUpdateInput!): ReservationReceiptItem!
  deleteReservationReceiptItem(where: ReservationReceiptItemWhereUniqueInput!): ReservationReceiptItem
  deleteManyReservationReceiptItems(where: ReservationReceiptItemWhereInput): BatchPayload!
  createSize(data: SizeCreateInput!): Size!
  updateSize(data: SizeUpdateInput!, where: SizeWhereUniqueInput!): Size
  updateManySizes(data: SizeUpdateManyMutationInput!, where: SizeWhereInput): BatchPayload!
  upsertSize(where: SizeWhereUniqueInput!, create: SizeCreateInput!, update: SizeUpdateInput!): Size!
  deleteSize(where: SizeWhereUniqueInput!): Size
  deleteManySizes(where: SizeWhereInput): BatchPayload!
  createTag(data: TagCreateInput!): Tag!
  updateTag(data: TagUpdateInput!, where: TagWhereUniqueInput!): Tag
  updateManyTags(data: TagUpdateManyMutationInput!, where: TagWhereInput): BatchPayload!
  upsertTag(where: TagWhereUniqueInput!, create: TagCreateInput!, update: TagUpdateInput!): Tag!
  deleteTag(where: TagWhereUniqueInput!): Tag
  deleteManyTags(where: TagWhereInput): BatchPayload!
  createTopSize(data: TopSizeCreateInput!): TopSize!
  updateTopSize(data: TopSizeUpdateInput!, where: TopSizeWhereUniqueInput!): TopSize
  updateManyTopSizes(data: TopSizeUpdateManyMutationInput!, where: TopSizeWhereInput): BatchPayload!
  upsertTopSize(where: TopSizeWhereUniqueInput!, create: TopSizeCreateInput!, update: TopSizeUpdateInput!): TopSize!
  deleteTopSize(where: TopSizeWhereUniqueInput!): TopSize
  deleteManyTopSizes(where: TopSizeWhereInput): BatchPayload!
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  updateManyUsers(data: UserUpdateManyMutationInput!, where: UserWhereInput): BatchPayload!
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User!
  deleteUser(where: UserWhereUniqueInput!): User
  deleteManyUsers(where: UserWhereInput): BatchPayload!
  createWarehouseLocation(data: WarehouseLocationCreateInput!): WarehouseLocation!
  updateWarehouseLocation(data: WarehouseLocationUpdateInput!, where: WarehouseLocationWhereUniqueInput!): WarehouseLocation
  updateManyWarehouseLocations(data: WarehouseLocationUpdateManyMutationInput!, where: WarehouseLocationWhereInput): BatchPayload!
  upsertWarehouseLocation(where: WarehouseLocationWhereUniqueInput!, create: WarehouseLocationCreateInput!, update: WarehouseLocationUpdateInput!): WarehouseLocation!
  deleteWarehouseLocation(where: WarehouseLocationWhereUniqueInput!): WarehouseLocation
  deleteManyWarehouseLocations(where: WarehouseLocationWhereInput): BatchPayload!
  createWarehouseLocationConstraint(data: WarehouseLocationConstraintCreateInput!): WarehouseLocationConstraint!
  updateWarehouseLocationConstraint(data: WarehouseLocationConstraintUpdateInput!, where: WarehouseLocationConstraintWhereUniqueInput!): WarehouseLocationConstraint
  updateManyWarehouseLocationConstraints(data: WarehouseLocationConstraintUpdateManyMutationInput!, where: WarehouseLocationConstraintWhereInput): BatchPayload!
  upsertWarehouseLocationConstraint(where: WarehouseLocationConstraintWhereUniqueInput!, create: WarehouseLocationConstraintCreateInput!, update: WarehouseLocationConstraintUpdateInput!): WarehouseLocationConstraint!
  deleteWarehouseLocationConstraint(where: WarehouseLocationConstraintWhereUniqueInput!): WarehouseLocationConstraint
  deleteManyWarehouseLocationConstraints(where: WarehouseLocationConstraintWhereInput): BatchPayload!
}

enum MutationType {
  CREATED
  UPDATED
  DELETED
}

interface Node {
  id: ID!
}

type Package {
  id: ID!
  items(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  transactionID: String!
  shippingLabel: Label!
  fromAddress: Location!
  toAddress: Location!
  weight: Float
  events(where: PackageTransitEventWhereInput, orderBy: PackageTransitEventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PackageTransitEvent!]
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
  transactionID: String!
  shippingLabel: LabelCreateOneInput!
  fromAddress: LocationCreateOneInput!
  toAddress: LocationCreateOneInput!
  weight: Float
  events: PackageTransitEventCreateManyInput
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
  transactionID_ASC
  transactionID_DESC
  weight_ASC
  weight_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PackagePreviousValues {
  id: ID!
  transactionID: String!
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

type PackageTransitEvent {
  id: ID!
  status: PackageTransitEventStatus!
  subStatus: PackageTransitEventSubStatus!
  data: Json!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PackageTransitEventConnection {
  pageInfo: PageInfo!
  edges: [PackageTransitEventEdge]!
  aggregate: AggregatePackageTransitEvent!
}

input PackageTransitEventCreateInput {
  id: ID
  status: PackageTransitEventStatus!
  subStatus: PackageTransitEventSubStatus!
  data: Json!
}

input PackageTransitEventCreateManyInput {
  create: [PackageTransitEventCreateInput!]
  connect: [PackageTransitEventWhereUniqueInput!]
}

type PackageTransitEventEdge {
  node: PackageTransitEvent!
  cursor: String!
}

enum PackageTransitEventOrderByInput {
  id_ASC
  id_DESC
  status_ASC
  status_DESC
  subStatus_ASC
  subStatus_DESC
  data_ASC
  data_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PackageTransitEventPreviousValues {
  id: ID!
  status: PackageTransitEventStatus!
  subStatus: PackageTransitEventSubStatus!
  data: Json!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input PackageTransitEventScalarWhereInput {
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
  status: PackageTransitEventStatus
  status_not: PackageTransitEventStatus
  status_in: [PackageTransitEventStatus!]
  status_not_in: [PackageTransitEventStatus!]
  subStatus: PackageTransitEventSubStatus
  subStatus_not: PackageTransitEventSubStatus
  subStatus_in: [PackageTransitEventSubStatus!]
  subStatus_not_in: [PackageTransitEventSubStatus!]
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
  AND: [PackageTransitEventScalarWhereInput!]
  OR: [PackageTransitEventScalarWhereInput!]
  NOT: [PackageTransitEventScalarWhereInput!]
}

enum PackageTransitEventStatus {
  PreTransit
  Transit
  Delivered
  Returned
  Failure
  Unknown
}

type PackageTransitEventSubscriptionPayload {
  mutation: MutationType!
  node: PackageTransitEvent
  updatedFields: [String!]
  previousValues: PackageTransitEventPreviousValues
}

input PackageTransitEventSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PackageTransitEventWhereInput
  AND: [PackageTransitEventSubscriptionWhereInput!]
  OR: [PackageTransitEventSubscriptionWhereInput!]
  NOT: [PackageTransitEventSubscriptionWhereInput!]
}

enum PackageTransitEventSubStatus {
  InformationReceived
  AddressIssue
  ContactCarrier
  Delayed
  DeliveryAttempted
  DeliveryRescheduled
  DeliveryScheduled
  LocationInaccessible
  NoticeLeft
  OutForDelivery
  PackageAccepted
  PackageArrived
  PackageDamaged
  PackageDeparted
  PackageForwarded
  PackageHeld
  PackageProcessed
  PackageProcessing
  PickupAvailable
  RescheduleDelivery
  Delivered
  ReturnToSender
  PackageUnclaimed
  PackageUndeliverable
  PackageDisposed
  PackageLost
  Other
}

input PackageTransitEventUpdateDataInput {
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
}

input PackageTransitEventUpdateInput {
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
}

input PackageTransitEventUpdateManyDataInput {
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
}

input PackageTransitEventUpdateManyInput {
  create: [PackageTransitEventCreateInput!]
  update: [PackageTransitEventUpdateWithWhereUniqueNestedInput!]
  upsert: [PackageTransitEventUpsertWithWhereUniqueNestedInput!]
  delete: [PackageTransitEventWhereUniqueInput!]
  connect: [PackageTransitEventWhereUniqueInput!]
  set: [PackageTransitEventWhereUniqueInput!]
  disconnect: [PackageTransitEventWhereUniqueInput!]
  deleteMany: [PackageTransitEventScalarWhereInput!]
  updateMany: [PackageTransitEventUpdateManyWithWhereNestedInput!]
}

input PackageTransitEventUpdateManyMutationInput {
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
}

input PackageTransitEventUpdateManyWithWhereNestedInput {
  where: PackageTransitEventScalarWhereInput!
  data: PackageTransitEventUpdateManyDataInput!
}

input PackageTransitEventUpdateWithWhereUniqueNestedInput {
  where: PackageTransitEventWhereUniqueInput!
  data: PackageTransitEventUpdateDataInput!
}

input PackageTransitEventUpsertWithWhereUniqueNestedInput {
  where: PackageTransitEventWhereUniqueInput!
  update: PackageTransitEventUpdateDataInput!
  create: PackageTransitEventCreateInput!
}

input PackageTransitEventWhereInput {
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
  status: PackageTransitEventStatus
  status_not: PackageTransitEventStatus
  status_in: [PackageTransitEventStatus!]
  status_not_in: [PackageTransitEventStatus!]
  subStatus: PackageTransitEventSubStatus
  subStatus_not: PackageTransitEventSubStatus
  subStatus_in: [PackageTransitEventSubStatus!]
  subStatus_not_in: [PackageTransitEventSubStatus!]
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
  AND: [PackageTransitEventWhereInput!]
  OR: [PackageTransitEventWhereInput!]
  NOT: [PackageTransitEventWhereInput!]
}

input PackageTransitEventWhereUniqueInput {
  id: ID
}

input PackageUpdateDataInput {
  items: PhysicalProductUpdateManyInput
  transactionID: String
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
  weight: Float
  events: PackageTransitEventUpdateManyInput
}

input PackageUpdateInput {
  items: PhysicalProductUpdateManyInput
  transactionID: String
  shippingLabel: LabelUpdateOneRequiredInput
  fromAddress: LocationUpdateOneRequiredInput
  toAddress: LocationUpdateOneRequiredInput
  weight: Float
  events: PackageTransitEventUpdateManyInput
}

input PackageUpdateManyMutationInput {
  transactionID: String
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
  transactionID: String
  transactionID_not: String
  transactionID_in: [String!]
  transactionID_not_in: [String!]
  transactionID_lt: String
  transactionID_lte: String
  transactionID_gt: String
  transactionID_gte: String
  transactionID_contains: String
  transactionID_not_contains: String
  transactionID_starts_with: String
  transactionID_not_starts_with: String
  transactionID_ends_with: String
  transactionID_not_ends_with: String
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
  events_every: PackageTransitEventWhereInput
  events_some: PackageTransitEventWhereInput
  events_none: PackageTransitEventWhereInput
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

type PauseRequest {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  pausePending: Boolean!
  pauseDate: DateTime
  resumeDate: DateTime
  membership: CustomerMembership!
}

type PauseRequestConnection {
  pageInfo: PageInfo!
  edges: [PauseRequestEdge]!
  aggregate: AggregatePauseRequest!
}

input PauseRequestCreateInput {
  id: ID
  pausePending: Boolean!
  pauseDate: DateTime
  resumeDate: DateTime
  membership: CustomerMembershipCreateOneWithoutPauseRequestsInput!
}

input PauseRequestCreateManyWithoutMembershipInput {
  create: [PauseRequestCreateWithoutMembershipInput!]
  connect: [PauseRequestWhereUniqueInput!]
}

input PauseRequestCreateWithoutMembershipInput {
  id: ID
  pausePending: Boolean!
  pauseDate: DateTime
  resumeDate: DateTime
}

type PauseRequestEdge {
  node: PauseRequest!
  cursor: String!
}

enum PauseRequestOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
  pausePending_ASC
  pausePending_DESC
  pauseDate_ASC
  pauseDate_DESC
  resumeDate_ASC
  resumeDate_DESC
}

type PauseRequestPreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
  pausePending: Boolean!
  pauseDate: DateTime
  resumeDate: DateTime
}

input PauseRequestScalarWhereInput {
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
  pausePending: Boolean
  pausePending_not: Boolean
  pauseDate: DateTime
  pauseDate_not: DateTime
  pauseDate_in: [DateTime!]
  pauseDate_not_in: [DateTime!]
  pauseDate_lt: DateTime
  pauseDate_lte: DateTime
  pauseDate_gt: DateTime
  pauseDate_gte: DateTime
  resumeDate: DateTime
  resumeDate_not: DateTime
  resumeDate_in: [DateTime!]
  resumeDate_not_in: [DateTime!]
  resumeDate_lt: DateTime
  resumeDate_lte: DateTime
  resumeDate_gt: DateTime
  resumeDate_gte: DateTime
  AND: [PauseRequestScalarWhereInput!]
  OR: [PauseRequestScalarWhereInput!]
  NOT: [PauseRequestScalarWhereInput!]
}

type PauseRequestSubscriptionPayload {
  mutation: MutationType!
  node: PauseRequest
  updatedFields: [String!]
  previousValues: PauseRequestPreviousValues
}

input PauseRequestSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PauseRequestWhereInput
  AND: [PauseRequestSubscriptionWhereInput!]
  OR: [PauseRequestSubscriptionWhereInput!]
  NOT: [PauseRequestSubscriptionWhereInput!]
}

input PauseRequestUpdateInput {
  pausePending: Boolean
  pauseDate: DateTime
  resumeDate: DateTime
  membership: CustomerMembershipUpdateOneRequiredWithoutPauseRequestsInput
}

input PauseRequestUpdateManyDataInput {
  pausePending: Boolean
  pauseDate: DateTime
  resumeDate: DateTime
}

input PauseRequestUpdateManyMutationInput {
  pausePending: Boolean
  pauseDate: DateTime
  resumeDate: DateTime
}

input PauseRequestUpdateManyWithoutMembershipInput {
  create: [PauseRequestCreateWithoutMembershipInput!]
  delete: [PauseRequestWhereUniqueInput!]
  connect: [PauseRequestWhereUniqueInput!]
  set: [PauseRequestWhereUniqueInput!]
  disconnect: [PauseRequestWhereUniqueInput!]
  update: [PauseRequestUpdateWithWhereUniqueWithoutMembershipInput!]
  upsert: [PauseRequestUpsertWithWhereUniqueWithoutMembershipInput!]
  deleteMany: [PauseRequestScalarWhereInput!]
  updateMany: [PauseRequestUpdateManyWithWhereNestedInput!]
}

input PauseRequestUpdateManyWithWhereNestedInput {
  where: PauseRequestScalarWhereInput!
  data: PauseRequestUpdateManyDataInput!
}

input PauseRequestUpdateWithoutMembershipDataInput {
  pausePending: Boolean
  pauseDate: DateTime
  resumeDate: DateTime
}

input PauseRequestUpdateWithWhereUniqueWithoutMembershipInput {
  where: PauseRequestWhereUniqueInput!
  data: PauseRequestUpdateWithoutMembershipDataInput!
}

input PauseRequestUpsertWithWhereUniqueWithoutMembershipInput {
  where: PauseRequestWhereUniqueInput!
  update: PauseRequestUpdateWithoutMembershipDataInput!
  create: PauseRequestCreateWithoutMembershipInput!
}

input PauseRequestWhereInput {
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
  pausePending: Boolean
  pausePending_not: Boolean
  pauseDate: DateTime
  pauseDate_not: DateTime
  pauseDate_in: [DateTime!]
  pauseDate_not_in: [DateTime!]
  pauseDate_lt: DateTime
  pauseDate_lte: DateTime
  pauseDate_gt: DateTime
  pauseDate_gte: DateTime
  resumeDate: DateTime
  resumeDate_not: DateTime
  resumeDate_in: [DateTime!]
  resumeDate_not_in: [DateTime!]
  resumeDate_lt: DateTime
  resumeDate_lte: DateTime
  resumeDate_gt: DateTime
  resumeDate_gte: DateTime
  membership: CustomerMembershipWhereInput
  AND: [PauseRequestWhereInput!]
  OR: [PauseRequestWhereInput!]
  NOT: [PauseRequestWhereInput!]
}

input PauseRequestWhereUniqueInput {
  id: ID
}

enum PhotographyStatus {
  Done
  InProgress
  ReadyForEditing
  ReadyToShoot
  Steam
}

type PhysicalProduct {
  id: ID!
  seasonsUID: String!
  location: Location
  productVariant: ProductVariant!
  inventoryStatus: InventoryStatus!
  inventoryStatusChanges(where: PhysicalProductInventoryStatusChangeWhereInput, orderBy: PhysicalProductInventoryStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProductInventoryStatusChange!]
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  warehouseLocation: WarehouseLocation
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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
  location: LocationCreateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  warehouseLocation: WarehouseLocationCreateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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

input PhysicalProductCreateManyWithoutWarehouseLocationInput {
  create: [PhysicalProductCreateWithoutWarehouseLocationInput!]
  connect: [PhysicalProductWhereUniqueInput!]
}

input PhysicalProductCreateOneInput {
  create: PhysicalProductCreateInput
  connect: PhysicalProductWhereUniqueInput
}

input PhysicalProductCreateOneWithoutInventoryStatusChangesInput {
  create: PhysicalProductCreateWithoutInventoryStatusChangesInput
  connect: PhysicalProductWhereUniqueInput
}

input PhysicalProductCreateWithoutInventoryStatusChangesInput {
  id: ID
  seasonsUID: String!
  location: LocationCreateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  warehouseLocation: WarehouseLocationCreateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductCreateWithoutLocationInput {
  id: ID
  seasonsUID: String!
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  warehouseLocation: WarehouseLocationCreateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductCreateWithoutProductVariantInput {
  id: ID
  seasonsUID: String!
  location: LocationCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus!
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  warehouseLocation: WarehouseLocationCreateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductCreateWithoutWarehouseLocationInput {
  id: ID
  seasonsUID: String!
  location: LocationCreateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput!
  inventoryStatus: InventoryStatus!
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus!
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

type PhysicalProductEdge {
  node: PhysicalProduct!
  cursor: String!
}

type PhysicalProductInventoryStatusChange {
  id: ID!
  old: InventoryStatus!
  new: InventoryStatus!
  physicalProduct: PhysicalProduct!
  createdAt: DateTime!
  updatedAt: DateTime
}

type PhysicalProductInventoryStatusChangeConnection {
  pageInfo: PageInfo!
  edges: [PhysicalProductInventoryStatusChangeEdge]!
  aggregate: AggregatePhysicalProductInventoryStatusChange!
}

input PhysicalProductInventoryStatusChangeCreateInput {
  id: ID
  old: InventoryStatus!
  new: InventoryStatus!
  physicalProduct: PhysicalProductCreateOneWithoutInventoryStatusChangesInput!
}

input PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput {
  create: [PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput!]
  connect: [PhysicalProductInventoryStatusChangeWhereUniqueInput!]
}

input PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput {
  id: ID
  old: InventoryStatus!
  new: InventoryStatus!
}

type PhysicalProductInventoryStatusChangeEdge {
  node: PhysicalProductInventoryStatusChange!
  cursor: String!
}

enum PhysicalProductInventoryStatusChangeOrderByInput {
  id_ASC
  id_DESC
  old_ASC
  old_DESC
  new_ASC
  new_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PhysicalProductInventoryStatusChangePreviousValues {
  id: ID!
  old: InventoryStatus!
  new: InventoryStatus!
  createdAt: DateTime!
  updatedAt: DateTime
}

input PhysicalProductInventoryStatusChangeScalarWhereInput {
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
  old: InventoryStatus
  old_not: InventoryStatus
  old_in: [InventoryStatus!]
  old_not_in: [InventoryStatus!]
  new: InventoryStatus
  new_not: InventoryStatus
  new_in: [InventoryStatus!]
  new_not_in: [InventoryStatus!]
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
  AND: [PhysicalProductInventoryStatusChangeScalarWhereInput!]
  OR: [PhysicalProductInventoryStatusChangeScalarWhereInput!]
  NOT: [PhysicalProductInventoryStatusChangeScalarWhereInput!]
}

type PhysicalProductInventoryStatusChangeSubscriptionPayload {
  mutation: MutationType!
  node: PhysicalProductInventoryStatusChange
  updatedFields: [String!]
  previousValues: PhysicalProductInventoryStatusChangePreviousValues
}

input PhysicalProductInventoryStatusChangeSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PhysicalProductInventoryStatusChangeWhereInput
  AND: [PhysicalProductInventoryStatusChangeSubscriptionWhereInput!]
  OR: [PhysicalProductInventoryStatusChangeSubscriptionWhereInput!]
  NOT: [PhysicalProductInventoryStatusChangeSubscriptionWhereInput!]
}

input PhysicalProductInventoryStatusChangeUpdateInput {
  old: InventoryStatus
  new: InventoryStatus
  physicalProduct: PhysicalProductUpdateOneRequiredWithoutInventoryStatusChangesInput
}

input PhysicalProductInventoryStatusChangeUpdateManyDataInput {
  old: InventoryStatus
  new: InventoryStatus
}

input PhysicalProductInventoryStatusChangeUpdateManyMutationInput {
  old: InventoryStatus
  new: InventoryStatus
}

input PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput {
  create: [PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput!]
  delete: [PhysicalProductInventoryStatusChangeWhereUniqueInput!]
  connect: [PhysicalProductInventoryStatusChangeWhereUniqueInput!]
  set: [PhysicalProductInventoryStatusChangeWhereUniqueInput!]
  disconnect: [PhysicalProductInventoryStatusChangeWhereUniqueInput!]
  update: [PhysicalProductInventoryStatusChangeUpdateWithWhereUniqueWithoutPhysicalProductInput!]
  upsert: [PhysicalProductInventoryStatusChangeUpsertWithWhereUniqueWithoutPhysicalProductInput!]
  deleteMany: [PhysicalProductInventoryStatusChangeScalarWhereInput!]
  updateMany: [PhysicalProductInventoryStatusChangeUpdateManyWithWhereNestedInput!]
}

input PhysicalProductInventoryStatusChangeUpdateManyWithWhereNestedInput {
  where: PhysicalProductInventoryStatusChangeScalarWhereInput!
  data: PhysicalProductInventoryStatusChangeUpdateManyDataInput!
}

input PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput {
  old: InventoryStatus
  new: InventoryStatus
}

input PhysicalProductInventoryStatusChangeUpdateWithWhereUniqueWithoutPhysicalProductInput {
  where: PhysicalProductInventoryStatusChangeWhereUniqueInput!
  data: PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput!
}

input PhysicalProductInventoryStatusChangeUpsertWithWhereUniqueWithoutPhysicalProductInput {
  where: PhysicalProductInventoryStatusChangeWhereUniqueInput!
  update: PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput!
  create: PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput!
}

input PhysicalProductInventoryStatusChangeWhereInput {
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
  old: InventoryStatus
  old_not: InventoryStatus
  old_in: [InventoryStatus!]
  old_not_in: [InventoryStatus!]
  new: InventoryStatus
  new_not: InventoryStatus
  new_in: [InventoryStatus!]
  new_not_in: [InventoryStatus!]
  physicalProduct: PhysicalProductWhereInput
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
  AND: [PhysicalProductInventoryStatusChangeWhereInput!]
  OR: [PhysicalProductInventoryStatusChangeWhereInput!]
  NOT: [PhysicalProductInventoryStatusChangeWhereInput!]
}

input PhysicalProductInventoryStatusChangeWhereUniqueInput {
  id: ID
}

enum PhysicalProductOffloadMethod {
  SoldToUser
  SoldToThirdParty
  ReturnedToVendor
  Recycled
  Unknown
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
  offloadMethod_ASC
  offloadMethod_DESC
  offloadNotes_ASC
  offloadNotes_DESC
  sequenceNumber_ASC
  sequenceNumber_DESC
  barcoded_ASC
  barcoded_DESC
  dateOrdered_ASC
  dateOrdered_DESC
  dateReceived_ASC
  dateReceived_DESC
  unitCost_ASC
  unitCost_DESC
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
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int!
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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
  offloadMethod: PhysicalProductOffloadMethod
  offloadMethod_not: PhysicalProductOffloadMethod
  offloadMethod_in: [PhysicalProductOffloadMethod!]
  offloadMethod_not_in: [PhysicalProductOffloadMethod!]
  offloadNotes: String
  offloadNotes_not: String
  offloadNotes_in: [String!]
  offloadNotes_not_in: [String!]
  offloadNotes_lt: String
  offloadNotes_lte: String
  offloadNotes_gt: String
  offloadNotes_gte: String
  offloadNotes_contains: String
  offloadNotes_not_contains: String
  offloadNotes_starts_with: String
  offloadNotes_not_starts_with: String
  offloadNotes_ends_with: String
  offloadNotes_not_ends_with: String
  sequenceNumber: Int
  sequenceNumber_not: Int
  sequenceNumber_in: [Int!]
  sequenceNumber_not_in: [Int!]
  sequenceNumber_lt: Int
  sequenceNumber_lte: Int
  sequenceNumber_gt: Int
  sequenceNumber_gte: Int
  barcoded: Boolean
  barcoded_not: Boolean
  dateOrdered: DateTime
  dateOrdered_not: DateTime
  dateOrdered_in: [DateTime!]
  dateOrdered_not_in: [DateTime!]
  dateOrdered_lt: DateTime
  dateOrdered_lte: DateTime
  dateOrdered_gt: DateTime
  dateOrdered_gte: DateTime
  dateReceived: DateTime
  dateReceived_not: DateTime
  dateReceived_in: [DateTime!]
  dateReceived_not_in: [DateTime!]
  dateReceived_lt: DateTime
  dateReceived_lte: DateTime
  dateReceived_gt: DateTime
  dateReceived_gte: DateTime
  unitCost: Float
  unitCost_not: Float
  unitCost_in: [Float!]
  unitCost_not_in: [Float!]
  unitCost_lt: Float
  unitCost_lte: Float
  unitCost_gt: Float
  unitCost_gte: Float
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
  Dirty
  Damaged
  PermanentlyDamaged
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
  location: LocationUpdateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  warehouseLocation: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductUpdateInput {
  seasonsUID: String
  location: LocationUpdateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  warehouseLocation: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductUpdateManyDataInput {
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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

input PhysicalProductUpdateManyWithoutWarehouseLocationInput {
  create: [PhysicalProductCreateWithoutWarehouseLocationInput!]
  delete: [PhysicalProductWhereUniqueInput!]
  connect: [PhysicalProductWhereUniqueInput!]
  set: [PhysicalProductWhereUniqueInput!]
  disconnect: [PhysicalProductWhereUniqueInput!]
  update: [PhysicalProductUpdateWithWhereUniqueWithoutWarehouseLocationInput!]
  upsert: [PhysicalProductUpsertWithWhereUniqueWithoutWarehouseLocationInput!]
  deleteMany: [PhysicalProductScalarWhereInput!]
  updateMany: [PhysicalProductUpdateManyWithWhereNestedInput!]
}

input PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput!
  data: PhysicalProductUpdateManyDataInput!
}

input PhysicalProductUpdateOneRequiredInput {
  create: PhysicalProductCreateInput
  update: PhysicalProductUpdateDataInput
  upsert: PhysicalProductUpsertNestedInput
  connect: PhysicalProductWhereUniqueInput
}

input PhysicalProductUpdateOneRequiredWithoutInventoryStatusChangesInput {
  create: PhysicalProductCreateWithoutInventoryStatusChangesInput
  update: PhysicalProductUpdateWithoutInventoryStatusChangesDataInput
  upsert: PhysicalProductUpsertWithoutInventoryStatusChangesInput
  connect: PhysicalProductWhereUniqueInput
}

input PhysicalProductUpdateWithoutInventoryStatusChangesDataInput {
  seasonsUID: String
  location: LocationUpdateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  warehouseLocation: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID: String
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  warehouseLocation: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID: String
  location: LocationUpdateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  warehouseLocation: WarehouseLocationUpdateOneWithoutPhysicalProductsInput
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
}

input PhysicalProductUpdateWithoutWarehouseLocationDataInput {
  seasonsUID: String
  location: LocationUpdateOneWithoutPhysicalProductsInput
  productVariant: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput
  productStatus: PhysicalProductStatus
  offloadMethod: PhysicalProductOffloadMethod
  offloadNotes: String
  sequenceNumber: Int
  barcoded: Boolean
  dateOrdered: DateTime
  dateReceived: DateTime
  unitCost: Float
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

input PhysicalProductUpdateWithWhereUniqueWithoutWarehouseLocationInput {
  where: PhysicalProductWhereUniqueInput!
  data: PhysicalProductUpdateWithoutWarehouseLocationDataInput!
}

input PhysicalProductUpsertNestedInput {
  update: PhysicalProductUpdateDataInput!
  create: PhysicalProductCreateInput!
}

input PhysicalProductUpsertWithoutInventoryStatusChangesInput {
  update: PhysicalProductUpdateWithoutInventoryStatusChangesDataInput!
  create: PhysicalProductCreateWithoutInventoryStatusChangesInput!
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

input PhysicalProductUpsertWithWhereUniqueWithoutWarehouseLocationInput {
  where: PhysicalProductWhereUniqueInput!
  update: PhysicalProductUpdateWithoutWarehouseLocationDataInput!
  create: PhysicalProductCreateWithoutWarehouseLocationInput!
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
  inventoryStatusChanges_every: PhysicalProductInventoryStatusChangeWhereInput
  inventoryStatusChanges_some: PhysicalProductInventoryStatusChangeWhereInput
  inventoryStatusChanges_none: PhysicalProductInventoryStatusChangeWhereInput
  productStatus: PhysicalProductStatus
  productStatus_not: PhysicalProductStatus
  productStatus_in: [PhysicalProductStatus!]
  productStatus_not_in: [PhysicalProductStatus!]
  offloadMethod: PhysicalProductOffloadMethod
  offloadMethod_not: PhysicalProductOffloadMethod
  offloadMethod_in: [PhysicalProductOffloadMethod!]
  offloadMethod_not_in: [PhysicalProductOffloadMethod!]
  offloadNotes: String
  offloadNotes_not: String
  offloadNotes_in: [String!]
  offloadNotes_not_in: [String!]
  offloadNotes_lt: String
  offloadNotes_lte: String
  offloadNotes_gt: String
  offloadNotes_gte: String
  offloadNotes_contains: String
  offloadNotes_not_contains: String
  offloadNotes_starts_with: String
  offloadNotes_not_starts_with: String
  offloadNotes_ends_with: String
  offloadNotes_not_ends_with: String
  sequenceNumber: Int
  sequenceNumber_not: Int
  sequenceNumber_in: [Int!]
  sequenceNumber_not_in: [Int!]
  sequenceNumber_lt: Int
  sequenceNumber_lte: Int
  sequenceNumber_gt: Int
  sequenceNumber_gte: Int
  warehouseLocation: WarehouseLocationWhereInput
  barcoded: Boolean
  barcoded_not: Boolean
  dateOrdered: DateTime
  dateOrdered_not: DateTime
  dateOrdered_in: [DateTime!]
  dateOrdered_not_in: [DateTime!]
  dateOrdered_lt: DateTime
  dateOrdered_lte: DateTime
  dateOrdered_gt: DateTime
  dateOrdered_gte: DateTime
  dateReceived: DateTime
  dateReceived_not: DateTime
  dateReceived_in: [DateTime!]
  dateReceived_not_in: [DateTime!]
  dateReceived_lt: DateTime
  dateReceived_lte: DateTime
  dateReceived_gt: DateTime
  dateReceived_gte: DateTime
  unitCost: Float
  unitCost_not: Float
  unitCost_in: [Float!]
  unitCost_not_in: [Float!]
  unitCost_lt: Float
  unitCost_lte: Float
  unitCost_gt: Float
  unitCost_gte: Float
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
  type: ProductType
  description: String
  externalURL: String
  images(where: ImageWhereInput, orderBy: ImageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Image!]
  modelHeight: Int
  retailPrice: Int
  model: ProductModel
  modelSize: Size
  color: Color!
  secondaryColor: Color
  tags(where: TagWhereInput, orderBy: TagOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Tag!]
  functions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction!]
  materialCategory: ProductMaterialCategory
  innerMaterials: [String!]!
  outerMaterials: [String!]!
  variants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant!]
  status: ProductStatus
  statusChanges(where: ProductStatusChangeWhereInput, orderBy: ProductStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductStatusChange!]
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum ProductArchitecture {
  Fashion
  Showstopper
  Staple
}

type ProductConnection {
  pageInfo: PageInfo!
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
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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

input ProductCreateManyWithoutMaterialCategoryInput {
  create: [ProductCreateWithoutMaterialCategoryInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateManyWithoutModelInput {
  create: [ProductCreateWithoutModelInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateManyWithoutTagsInput {
  create: [ProductCreateWithoutTagsInput!]
  connect: [ProductWhereUniqueInput!]
}

input ProductCreateOneInput {
  create: ProductCreateInput
  connect: ProductWhereUniqueInput
}

input ProductCreateOneWithoutStatusChangesInput {
  create: ProductCreateWithoutStatusChangesInput
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
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutCategoryInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutMaterialCategoryInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutModelInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutStatusChangesInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutTagsInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  variants: ProductVariantCreateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductCreateWithoutVariantsInput {
  id: ID
  slug: String!
  name: String!
  brand: BrandCreateOneWithoutProductsInput!
  category: CategoryCreateOneWithoutProductsInput!
  type: ProductType
  description: String
  externalURL: String
  images: ImageCreateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelCreateOneWithoutProductsInput
  modelSize: SizeCreateOneInput
  color: ColorCreateOneInput!
  secondaryColor: ColorCreateOneInput
  tags: TagCreateManyWithoutProductsInput
  functions: ProductFunctionCreateManyInput
  materialCategory: ProductMaterialCategoryCreateOneWithoutProductsInput
  innerMaterials: ProductCreateinnerMaterialsInput
  outerMaterials: ProductCreateouterMaterialsInput
  status: ProductStatus
  statusChanges: ProductStatusChangeCreateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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

type ProductMaterialCategory {
  id: ID!
  slug: String!
  lifeExpectancy: Float!
  category: Category!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

type ProductMaterialCategoryConnection {
  pageInfo: PageInfo!
  edges: [ProductMaterialCategoryEdge]!
  aggregate: AggregateProductMaterialCategory!
}

input ProductMaterialCategoryCreateInput {
  id: ID
  slug: String!
  lifeExpectancy: Float!
  category: CategoryCreateOneInput!
  products: ProductCreateManyWithoutMaterialCategoryInput
}

input ProductMaterialCategoryCreateOneWithoutProductsInput {
  create: ProductMaterialCategoryCreateWithoutProductsInput
  connect: ProductMaterialCategoryWhereUniqueInput
}

input ProductMaterialCategoryCreateWithoutProductsInput {
  id: ID
  slug: String!
  lifeExpectancy: Float!
  category: CategoryCreateOneInput!
}

type ProductMaterialCategoryEdge {
  node: ProductMaterialCategory!
  cursor: String!
}

enum ProductMaterialCategoryOrderByInput {
  id_ASC
  id_DESC
  slug_ASC
  slug_DESC
  lifeExpectancy_ASC
  lifeExpectancy_DESC
}

type ProductMaterialCategoryPreviousValues {
  id: ID!
  slug: String!
  lifeExpectancy: Float!
}

type ProductMaterialCategorySubscriptionPayload {
  mutation: MutationType!
  node: ProductMaterialCategory
  updatedFields: [String!]
  previousValues: ProductMaterialCategoryPreviousValues
}

input ProductMaterialCategorySubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductMaterialCategoryWhereInput
  AND: [ProductMaterialCategorySubscriptionWhereInput!]
  OR: [ProductMaterialCategorySubscriptionWhereInput!]
  NOT: [ProductMaterialCategorySubscriptionWhereInput!]
}

input ProductMaterialCategoryUpdateInput {
  slug: String
  lifeExpectancy: Float
  category: CategoryUpdateOneRequiredInput
  products: ProductUpdateManyWithoutMaterialCategoryInput
}

input ProductMaterialCategoryUpdateManyMutationInput {
  slug: String
  lifeExpectancy: Float
}

input ProductMaterialCategoryUpdateOneWithoutProductsInput {
  create: ProductMaterialCategoryCreateWithoutProductsInput
  update: ProductMaterialCategoryUpdateWithoutProductsDataInput
  upsert: ProductMaterialCategoryUpsertWithoutProductsInput
  delete: Boolean
  disconnect: Boolean
  connect: ProductMaterialCategoryWhereUniqueInput
}

input ProductMaterialCategoryUpdateWithoutProductsDataInput {
  slug: String
  lifeExpectancy: Float
  category: CategoryUpdateOneRequiredInput
}

input ProductMaterialCategoryUpsertWithoutProductsInput {
  update: ProductMaterialCategoryUpdateWithoutProductsDataInput!
  create: ProductMaterialCategoryCreateWithoutProductsInput!
}

input ProductMaterialCategoryWhereInput {
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
  lifeExpectancy: Float
  lifeExpectancy_not: Float
  lifeExpectancy_in: [Float!]
  lifeExpectancy_not_in: [Float!]
  lifeExpectancy_lt: Float
  lifeExpectancy_lte: Float
  lifeExpectancy_gt: Float
  lifeExpectancy_gte: Float
  category: CategoryWhereInput
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  AND: [ProductMaterialCategoryWhereInput!]
  OR: [ProductMaterialCategoryWhereInput!]
  NOT: [ProductMaterialCategoryWhereInput!]
}

input ProductMaterialCategoryWhereUniqueInput {
  id: ID
  slug: String
}

type ProductModel {
  id: ID!
  name: String!
  height: Float!
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
}

type ProductModelConnection {
  pageInfo: PageInfo!
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

type ProductModelEdge {
  node: ProductModel!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductModelWhereInput
  AND: [ProductModelSubscriptionWhereInput!]
  OR: [ProductModelSubscriptionWhereInput!]
  NOT: [ProductModelSubscriptionWhereInput!]
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
  update: ProductModelUpdateWithoutProductsDataInput
  upsert: ProductModelUpsertWithoutProductsInput
  delete: Boolean
  disconnect: Boolean
  connect: ProductModelWhereUniqueInput
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
  height: Float
  height_not: Float
  height_in: [Float!]
  height_not_in: [Float!]
  height_lt: Float
  height_lte: Float
  height_gt: Float
  height_gte: Float
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
  AND: [ProductModelWhereInput!]
  OR: [ProductModelWhereInput!]
  NOT: [ProductModelWhereInput!]
}

input ProductModelWhereUniqueInput {
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
  type_ASC
  type_DESC
  description_ASC
  description_DESC
  externalURL_ASC
  externalURL_DESC
  modelHeight_ASC
  modelHeight_DESC
  retailPrice_ASC
  retailPrice_DESC
  status_ASC
  status_DESC
  season_ASC
  season_DESC
  architecture_ASC
  architecture_DESC
  photographyStatus_ASC
  photographyStatus_DESC
  publishedAt_ASC
  publishedAt_DESC
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
  modelHeight: Int
  retailPrice: Int
  innerMaterials: [String!]!
  outerMaterials: [String!]!
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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
  type: ProductType
  type_not: ProductType
  type_in: [ProductType!]
  type_not_in: [ProductType!]
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
  season: String
  season_not: String
  season_in: [String!]
  season_not_in: [String!]
  season_lt: String
  season_lte: String
  season_gt: String
  season_gte: String
  season_contains: String
  season_not_contains: String
  season_starts_with: String
  season_not_starts_with: String
  season_ends_with: String
  season_not_ends_with: String
  architecture: ProductArchitecture
  architecture_not: ProductArchitecture
  architecture_in: [ProductArchitecture!]
  architecture_not_in: [ProductArchitecture!]
  photographyStatus: PhotographyStatus
  photographyStatus_not: PhotographyStatus
  photographyStatus_in: [PhotographyStatus!]
  photographyStatus_not_in: [PhotographyStatus!]
  publishedAt: DateTime
  publishedAt_not: DateTime
  publishedAt_in: [DateTime!]
  publishedAt_not_in: [DateTime!]
  publishedAt_lt: DateTime
  publishedAt_lte: DateTime
  publishedAt_gt: DateTime
  publishedAt_gte: DateTime
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
  Stored
  Offloaded
}

type ProductStatusChange {
  id: ID!
  old: ProductStatus!
  new: ProductStatus!
  product: Product!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ProductStatusChangeConnection {
  pageInfo: PageInfo!
  edges: [ProductStatusChangeEdge]!
  aggregate: AggregateProductStatusChange!
}

input ProductStatusChangeCreateInput {
  id: ID
  old: ProductStatus!
  new: ProductStatus!
  product: ProductCreateOneWithoutStatusChangesInput!
}

input ProductStatusChangeCreateManyWithoutProductInput {
  create: [ProductStatusChangeCreateWithoutProductInput!]
  connect: [ProductStatusChangeWhereUniqueInput!]
}

input ProductStatusChangeCreateWithoutProductInput {
  id: ID
  old: ProductStatus!
  new: ProductStatus!
}

type ProductStatusChangeEdge {
  node: ProductStatusChange!
  cursor: String!
}

enum ProductStatusChangeOrderByInput {
  id_ASC
  id_DESC
  old_ASC
  old_DESC
  new_ASC
  new_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ProductStatusChangePreviousValues {
  id: ID!
  old: ProductStatus!
  new: ProductStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ProductStatusChangeScalarWhereInput {
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
  old: ProductStatus
  old_not: ProductStatus
  old_in: [ProductStatus!]
  old_not_in: [ProductStatus!]
  new: ProductStatus
  new_not: ProductStatus
  new_in: [ProductStatus!]
  new_not_in: [ProductStatus!]
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
  AND: [ProductStatusChangeScalarWhereInput!]
  OR: [ProductStatusChangeScalarWhereInput!]
  NOT: [ProductStatusChangeScalarWhereInput!]
}

type ProductStatusChangeSubscriptionPayload {
  mutation: MutationType!
  node: ProductStatusChange
  updatedFields: [String!]
  previousValues: ProductStatusChangePreviousValues
}

input ProductStatusChangeSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductStatusChangeWhereInput
  AND: [ProductStatusChangeSubscriptionWhereInput!]
  OR: [ProductStatusChangeSubscriptionWhereInput!]
  NOT: [ProductStatusChangeSubscriptionWhereInput!]
}

input ProductStatusChangeUpdateInput {
  old: ProductStatus
  new: ProductStatus
  product: ProductUpdateOneRequiredWithoutStatusChangesInput
}

input ProductStatusChangeUpdateManyDataInput {
  old: ProductStatus
  new: ProductStatus
}

input ProductStatusChangeUpdateManyMutationInput {
  old: ProductStatus
  new: ProductStatus
}

input ProductStatusChangeUpdateManyWithoutProductInput {
  create: [ProductStatusChangeCreateWithoutProductInput!]
  delete: [ProductStatusChangeWhereUniqueInput!]
  connect: [ProductStatusChangeWhereUniqueInput!]
  set: [ProductStatusChangeWhereUniqueInput!]
  disconnect: [ProductStatusChangeWhereUniqueInput!]
  update: [ProductStatusChangeUpdateWithWhereUniqueWithoutProductInput!]
  upsert: [ProductStatusChangeUpsertWithWhereUniqueWithoutProductInput!]
  deleteMany: [ProductStatusChangeScalarWhereInput!]
  updateMany: [ProductStatusChangeUpdateManyWithWhereNestedInput!]
}

input ProductStatusChangeUpdateManyWithWhereNestedInput {
  where: ProductStatusChangeScalarWhereInput!
  data: ProductStatusChangeUpdateManyDataInput!
}

input ProductStatusChangeUpdateWithoutProductDataInput {
  old: ProductStatus
  new: ProductStatus
}

input ProductStatusChangeUpdateWithWhereUniqueWithoutProductInput {
  where: ProductStatusChangeWhereUniqueInput!
  data: ProductStatusChangeUpdateWithoutProductDataInput!
}

input ProductStatusChangeUpsertWithWhereUniqueWithoutProductInput {
  where: ProductStatusChangeWhereUniqueInput!
  update: ProductStatusChangeUpdateWithoutProductDataInput!
  create: ProductStatusChangeCreateWithoutProductInput!
}

input ProductStatusChangeWhereInput {
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
  old: ProductStatus
  old_not: ProductStatus
  old_in: [ProductStatus!]
  old_not_in: [ProductStatus!]
  new: ProductStatus
  new_not: ProductStatus
  new_in: [ProductStatus!]
  new_not_in: [ProductStatus!]
  product: ProductWhereInput
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
  AND: [ProductStatusChangeWhereInput!]
  OR: [ProductStatusChangeWhereInput!]
  NOT: [ProductStatusChangeWhereInput!]
}

input ProductStatusChangeWhereUniqueInput {
  id: ID
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

enum ProductType {
  Top
  Bottom
  Accessory
  Shoe
}

input ProductUpdateDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateinnerMaterialsInput {
  set: [String!]
}

input ProductUpdateInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateManyDataInput {
  slug: String
  name: String
  type: ProductType
  description: String
  externalURL: String
  modelHeight: Int
  retailPrice: Int
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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
  type: ProductType
  description: String
  externalURL: String
  modelHeight: Int
  retailPrice: Int
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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

input ProductUpdateManyWithoutMaterialCategoryInput {
  create: [ProductCreateWithoutMaterialCategoryInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutMaterialCategoryInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutMaterialCategoryInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
}

input ProductUpdateManyWithoutModelInput {
  create: [ProductCreateWithoutModelInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutModelInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutModelInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
}

input ProductUpdateManyWithoutTagsInput {
  create: [ProductCreateWithoutTagsInput!]
  delete: [ProductWhereUniqueInput!]
  connect: [ProductWhereUniqueInput!]
  set: [ProductWhereUniqueInput!]
  disconnect: [ProductWhereUniqueInput!]
  update: [ProductUpdateWithWhereUniqueWithoutTagsInput!]
  upsert: [ProductUpsertWithWhereUniqueWithoutTagsInput!]
  deleteMany: [ProductScalarWhereInput!]
  updateMany: [ProductUpdateManyWithWhereNestedInput!]
}

input ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput!
  data: ProductUpdateManyDataInput!
}

input ProductUpdateOneRequiredInput {
  create: ProductCreateInput
  update: ProductUpdateDataInput
  upsert: ProductUpsertNestedInput
  connect: ProductWhereUniqueInput
}

input ProductUpdateOneRequiredWithoutStatusChangesInput {
  create: ProductCreateWithoutStatusChangesInput
  update: ProductUpdateWithoutStatusChangesDataInput
  upsert: ProductUpsertWithoutStatusChangesInput
  connect: ProductWhereUniqueInput
}

input ProductUpdateOneRequiredWithoutVariantsInput {
  create: ProductCreateWithoutVariantsInput
  update: ProductUpdateWithoutVariantsDataInput
  upsert: ProductUpsertWithoutVariantsInput
  connect: ProductWhereUniqueInput
}

input ProductUpdateouterMaterialsInput {
  set: [String!]
}

input ProductUpdateWithoutBrandDataInput {
  slug: String
  name: String
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutCategoryDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutMaterialCategoryDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutModelDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutStatusChangesDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutTagsDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  variants: ProductVariantUpdateManyWithoutProductInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
}

input ProductUpdateWithoutVariantsDataInput {
  slug: String
  name: String
  brand: BrandUpdateOneRequiredWithoutProductsInput
  category: CategoryUpdateOneRequiredWithoutProductsInput
  type: ProductType
  description: String
  externalURL: String
  images: ImageUpdateManyInput
  modelHeight: Int
  retailPrice: Int
  model: ProductModelUpdateOneWithoutProductsInput
  modelSize: SizeUpdateOneInput
  color: ColorUpdateOneRequiredInput
  secondaryColor: ColorUpdateOneInput
  tags: TagUpdateManyWithoutProductsInput
  functions: ProductFunctionUpdateManyInput
  materialCategory: ProductMaterialCategoryUpdateOneWithoutProductsInput
  innerMaterials: ProductUpdateinnerMaterialsInput
  outerMaterials: ProductUpdateouterMaterialsInput
  status: ProductStatus
  statusChanges: ProductStatusChangeUpdateManyWithoutProductInput
  season: String
  architecture: ProductArchitecture
  photographyStatus: PhotographyStatus
  publishedAt: DateTime
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

input ProductUpdateWithWhereUniqueWithoutMaterialCategoryInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutMaterialCategoryDataInput!
}

input ProductUpdateWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutModelDataInput!
}

input ProductUpdateWithWhereUniqueWithoutTagsInput {
  where: ProductWhereUniqueInput!
  data: ProductUpdateWithoutTagsDataInput!
}

input ProductUpsertNestedInput {
  update: ProductUpdateDataInput!
  create: ProductCreateInput!
}

input ProductUpsertWithoutStatusChangesInput {
  update: ProductUpdateWithoutStatusChangesDataInput!
  create: ProductCreateWithoutStatusChangesInput!
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

input ProductUpsertWithWhereUniqueWithoutMaterialCategoryInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutMaterialCategoryDataInput!
  create: ProductCreateWithoutMaterialCategoryInput!
}

input ProductUpsertWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutModelDataInput!
  create: ProductCreateWithoutModelInput!
}

input ProductUpsertWithWhereUniqueWithoutTagsInput {
  where: ProductWhereUniqueInput!
  update: ProductUpdateWithoutTagsDataInput!
  create: ProductCreateWithoutTagsInput!
}

type ProductVariant {
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
  offloaded: Int!
  stored: Int!
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
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
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
  offloaded: Int!
  stored: Int!
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
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
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
  offloaded: Int!
  stored: Int!
}

input ProductVariantCreateWithoutPhysicalProductsInput {
  id: ID
  sku: String
  color: ColorCreateOneWithoutProductVariantsInput!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
  weight: Float
  height: Float
  productID: String!
  product: ProductCreateOneWithoutVariantsInput!
  retailPrice: Float
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  offloaded: Int!
  stored: Int!
}

input ProductVariantCreateWithoutProductInput {
  id: ID
  sku: String
  color: ColorCreateOneWithoutProductVariantsInput!
  internalSize: SizeCreateOneInput
  manufacturerSizes: SizeCreateManyInput
  weight: Float
  height: Float
  productID: String!
  retailPrice: Float
  physicalProducts: PhysicalProductCreateManyWithoutProductVariantInput
  total: Int!
  reservable: Int!
  reserved: Int!
  nonReservable: Int!
  offloaded: Int!
  stored: Int!
}

type ProductVariantEdge {
  node: ProductVariant!
  cursor: String!
}

type ProductVariantFeedback {
  id: ID!
  isCompleted: Boolean!
  questions(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedbackQuestion!]
  reservationFeedback: ReservationFeedback!
  variant: ProductVariant!
}

type ProductVariantFeedbackConnection {
  pageInfo: PageInfo!
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

type ProductVariantFeedbackEdge {
  node: ProductVariantFeedback!
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

type ProductVariantFeedbackQuestion {
  id: ID!
  options: [String!]!
  question: String!
  responses: [String!]!
  type: QuestionType!
  variantFeedback: ProductVariantFeedback!
}

type ProductVariantFeedbackQuestionConnection {
  pageInfo: PageInfo!
  edges: [ProductVariantFeedbackQuestionEdge]!
  aggregate: AggregateProductVariantFeedbackQuestion!
}

input ProductVariantFeedbackQuestionCreateInput {
  id: ID
  options: ProductVariantFeedbackQuestionCreateoptionsInput
  question: String!
  responses: ProductVariantFeedbackQuestionCreateresponsesInput
  type: QuestionType!
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
  options: ProductVariantFeedbackQuestionCreateoptionsInput
  question: String!
  responses: ProductVariantFeedbackQuestionCreateresponsesInput
  type: QuestionType!
}

type ProductVariantFeedbackQuestionEdge {
  node: ProductVariantFeedbackQuestion!
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
  question: String
  question_not: String
  question_in: [String!]
  question_not_in: [String!]
  question_lt: String
  question_lte: String
  question_gt: String
  question_gte: String
  question_contains: String
  question_not_contains: String
  question_starts_with: String
  question_not_starts_with: String
  question_ends_with: String
  question_not_ends_with: String
  type: QuestionType
  type_not: QuestionType
  type_in: [QuestionType!]
  type_not_in: [QuestionType!]
  AND: [ProductVariantFeedbackQuestionScalarWhereInput!]
  OR: [ProductVariantFeedbackQuestionScalarWhereInput!]
  NOT: [ProductVariantFeedbackQuestionScalarWhereInput!]
}

type ProductVariantFeedbackQuestionSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariantFeedbackQuestion
  updatedFields: [String!]
  previousValues: ProductVariantFeedbackQuestionPreviousValues
}

input ProductVariantFeedbackQuestionSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductVariantFeedbackQuestionWhereInput
  AND: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]
  OR: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]
  NOT: [ProductVariantFeedbackQuestionSubscriptionWhereInput!]
}

input ProductVariantFeedbackQuestionUpdateInput {
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  question: String
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
  type: QuestionType
  variantFeedback: ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput
}

input ProductVariantFeedbackQuestionUpdateManyDataInput {
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  question: String
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
  type: QuestionType
}

input ProductVariantFeedbackQuestionUpdateManyMutationInput {
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  question: String
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
  type: QuestionType
}

input ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput {
  create: [ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput!]
  delete: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  connect: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  set: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  disconnect: [ProductVariantFeedbackQuestionWhereUniqueInput!]
  update: [ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput!]
  upsert: [ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput!]
  deleteMany: [ProductVariantFeedbackQuestionScalarWhereInput!]
  updateMany: [ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput!]
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
  options: ProductVariantFeedbackQuestionUpdateoptionsInput
  question: String
  responses: ProductVariantFeedbackQuestionUpdateresponsesInput
  type: QuestionType
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
  question: String
  question_not: String
  question_in: [String!]
  question_not_in: [String!]
  question_lt: String
  question_lte: String
  question_gt: String
  question_gte: String
  question_contains: String
  question_not_contains: String
  question_starts_with: String
  question_not_starts_with: String
  question_ends_with: String
  question_not_ends_with: String
  type: QuestionType
  type_not: QuestionType
  type_in: [QuestionType!]
  type_not_in: [QuestionType!]
  variantFeedback: ProductVariantFeedbackWhereInput
  AND: [ProductVariantFeedbackQuestionWhereInput!]
  OR: [ProductVariantFeedbackQuestionWhereInput!]
  NOT: [ProductVariantFeedbackQuestionWhereInput!]
}

input ProductVariantFeedbackQuestionWhereUniqueInput {
  id: ID
}

input ProductVariantFeedbackScalarWhereInput {
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
  isCompleted: Boolean
  isCompleted_not: Boolean
  AND: [ProductVariantFeedbackScalarWhereInput!]
  OR: [ProductVariantFeedbackScalarWhereInput!]
  NOT: [ProductVariantFeedbackScalarWhereInput!]
}

type ProductVariantFeedbackSubscriptionPayload {
  mutation: MutationType!
  node: ProductVariantFeedback
  updatedFields: [String!]
  previousValues: ProductVariantFeedbackPreviousValues
}

input ProductVariantFeedbackSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductVariantFeedbackWhereInput
  AND: [ProductVariantFeedbackSubscriptionWhereInput!]
  OR: [ProductVariantFeedbackSubscriptionWhereInput!]
  NOT: [ProductVariantFeedbackSubscriptionWhereInput!]
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
  delete: [ProductVariantFeedbackWhereUniqueInput!]
  connect: [ProductVariantFeedbackWhereUniqueInput!]
  set: [ProductVariantFeedbackWhereUniqueInput!]
  disconnect: [ProductVariantFeedbackWhereUniqueInput!]
  update: [ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput!]
  upsert: [ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput!]
  deleteMany: [ProductVariantFeedbackScalarWhereInput!]
  updateMany: [ProductVariantFeedbackUpdateManyWithWhereNestedInput!]
}

input ProductVariantFeedbackUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackScalarWhereInput!
  data: ProductVariantFeedbackUpdateManyDataInput!
}

input ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput {
  create: ProductVariantFeedbackCreateWithoutQuestionsInput
  update: ProductVariantFeedbackUpdateWithoutQuestionsDataInput
  upsert: ProductVariantFeedbackUpsertWithoutQuestionsInput
  connect: ProductVariantFeedbackWhereUniqueInput
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
  isCompleted: Boolean
  isCompleted_not: Boolean
  questions_every: ProductVariantFeedbackQuestionWhereInput
  questions_some: ProductVariantFeedbackQuestionWhereInput
  questions_none: ProductVariantFeedbackQuestionWhereInput
  reservationFeedback: ReservationFeedbackWhereInput
  variant: ProductVariantWhereInput
  AND: [ProductVariantFeedbackWhereInput!]
  OR: [ProductVariantFeedbackWhereInput!]
  NOT: [ProductVariantFeedbackWhereInput!]
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
  offloaded_ASC
  offloaded_DESC
  stored_ASC
  stored_DESC
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
  offloaded: Int!
  stored: Int!
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
  offloaded: Int
  offloaded_not: Int
  offloaded_in: [Int!]
  offloaded_not_in: [Int!]
  offloaded_lt: Int
  offloaded_lte: Int
  offloaded_gt: Int
  offloaded_gte: Int
  stored: Int
  stored_not: Int
  stored_in: [Int!]
  stored_not_in: [Int!]
  stored_lt: Int
  stored_lte: Int
  stored_gt: Int
  stored_gte: Int
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
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
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
  offloaded: Int
  stored: Int
}

input ProductVariantUpdateInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
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
  offloaded: Int
  stored: Int
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
  offloaded: Int
  stored: Int
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
  offloaded: Int
  stored: Int
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
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
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
  offloaded: Int
  stored: Int
}

input ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  weight: Float
  height: Float
  productID: String
  product: ProductUpdateOneRequiredWithoutVariantsInput
  retailPrice: Float
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  offloaded: Int
  stored: Int
}

input ProductVariantUpdateWithoutProductDataInput {
  sku: String
  color: ColorUpdateOneRequiredWithoutProductVariantsInput
  internalSize: SizeUpdateOneInput
  manufacturerSizes: SizeUpdateManyInput
  weight: Float
  height: Float
  productID: String
  retailPrice: Float
  physicalProducts: PhysicalProductUpdateManyWithoutProductVariantInput
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  offloaded: Int
  stored: Int
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

type ProductVariantWant {
  id: ID!
  productVariant: ProductVariant!
  user: User!
  isFulfilled: Boolean!
}

type ProductVariantWantConnection {
  pageInfo: PageInfo!
  edges: [ProductVariantWantEdge]!
  aggregate: AggregateProductVariantWant!
}

input ProductVariantWantCreateInput {
  id: ID
  productVariant: ProductVariantCreateOneInput!
  user: UserCreateOneInput!
  isFulfilled: Boolean!
}

type ProductVariantWantEdge {
  node: ProductVariantWant!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ProductVariantWantWhereInput
  AND: [ProductVariantWantSubscriptionWhereInput!]
  OR: [ProductVariantWantSubscriptionWhereInput!]
  NOT: [ProductVariantWantSubscriptionWhereInput!]
}

input ProductVariantWantUpdateInput {
  productVariant: ProductVariantUpdateOneRequiredInput
  user: UserUpdateOneRequiredInput
  isFulfilled: Boolean
}

input ProductVariantWantUpdateManyMutationInput {
  isFulfilled: Boolean
}

input ProductVariantWantWhereInput {
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
  productVariant: ProductVariantWhereInput
  user: UserWhereInput
  isFulfilled: Boolean
  isFulfilled_not: Boolean
  AND: [ProductVariantWantWhereInput!]
  OR: [ProductVariantWantWhereInput!]
  NOT: [ProductVariantWantWhereInput!]
}

input ProductVariantWantWhereUniqueInput {
  id: ID
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
  internalSize: SizeWhereInput
  manufacturerSizes_every: SizeWhereInput
  manufacturerSizes_some: SizeWhereInput
  manufacturerSizes_none: SizeWhereInput
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
  offloaded: Int
  offloaded_not: Int
  offloaded_in: [Int!]
  offloaded_not_in: [Int!]
  offloaded_lt: Int
  offloaded_lte: Int
  offloaded_gt: Int
  offloaded_gte: Int
  stored: Int
  stored_not: Int
  stored_in: [Int!]
  stored_not_in: [Int!]
  stored_lt: Int
  stored_lte: Int
  stored_gt: Int
  stored_gte: Int
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
  type: ProductType
  type_not: ProductType
  type_in: [ProductType!]
  type_not_in: [ProductType!]
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
  images_every: ImageWhereInput
  images_some: ImageWhereInput
  images_none: ImageWhereInput
  modelHeight: Int
  modelHeight_not: Int
  modelHeight_in: [Int!]
  modelHeight_not_in: [Int!]
  modelHeight_lt: Int
  modelHeight_lte: Int
  modelHeight_gt: Int
  modelHeight_gte: Int
  retailPrice: Int
  retailPrice_not: Int
  retailPrice_in: [Int!]
  retailPrice_not_in: [Int!]
  retailPrice_lt: Int
  retailPrice_lte: Int
  retailPrice_gt: Int
  retailPrice_gte: Int
  model: ProductModelWhereInput
  modelSize: SizeWhereInput
  color: ColorWhereInput
  secondaryColor: ColorWhereInput
  tags_every: TagWhereInput
  tags_some: TagWhereInput
  tags_none: TagWhereInput
  functions_every: ProductFunctionWhereInput
  functions_some: ProductFunctionWhereInput
  functions_none: ProductFunctionWhereInput
  materialCategory: ProductMaterialCategoryWhereInput
  variants_every: ProductVariantWhereInput
  variants_some: ProductVariantWhereInput
  variants_none: ProductVariantWhereInput
  status: ProductStatus
  status_not: ProductStatus
  status_in: [ProductStatus!]
  status_not_in: [ProductStatus!]
  statusChanges_every: ProductStatusChangeWhereInput
  statusChanges_some: ProductStatusChangeWhereInput
  statusChanges_none: ProductStatusChangeWhereInput
  season: String
  season_not: String
  season_in: [String!]
  season_not_in: [String!]
  season_lt: String
  season_lte: String
  season_gt: String
  season_gte: String
  season_contains: String
  season_not_contains: String
  season_starts_with: String
  season_not_starts_with: String
  season_ends_with: String
  season_not_ends_with: String
  architecture: ProductArchitecture
  architecture_not: ProductArchitecture
  architecture_in: [ProductArchitecture!]
  architecture_not_in: [ProductArchitecture!]
  photographyStatus: PhotographyStatus
  photographyStatus_not: PhotographyStatus
  photographyStatus_in: [PhotographyStatus!]
  photographyStatus_not_in: [PhotographyStatus!]
  publishedAt: DateTime
  publishedAt_not: DateTime
  publishedAt_in: [DateTime!]
  publishedAt_not_in: [DateTime!]
  publishedAt_lt: DateTime
  publishedAt_lte: DateTime
  publishedAt_gt: DateTime
  publishedAt_gte: DateTime
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

type PushNotificationReceipt {
  id: ID!
  route: String
  screen: String
  uri: String
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User!]
  interest: String
  body: String!
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type PushNotificationReceiptConnection {
  pageInfo: PageInfo!
  edges: [PushNotificationReceiptEdge]!
  aggregate: AggregatePushNotificationReceipt!
}

input PushNotificationReceiptCreateInput {
  id: ID
  route: String
  screen: String
  uri: String
  users: UserCreateManyWithoutPushNotificationsInput
  interest: String
  body: String!
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime!
}

input PushNotificationReceiptCreateManyWithoutUsersInput {
  create: [PushNotificationReceiptCreateWithoutUsersInput!]
  connect: [PushNotificationReceiptWhereUniqueInput!]
}

input PushNotificationReceiptCreateWithoutUsersInput {
  id: ID
  route: String
  screen: String
  uri: String
  interest: String
  body: String!
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime!
}

type PushNotificationReceiptEdge {
  node: PushNotificationReceipt!
  cursor: String!
}

enum PushNotificationReceiptOrderByInput {
  id_ASC
  id_DESC
  route_ASC
  route_DESC
  screen_ASC
  screen_DESC
  uri_ASC
  uri_DESC
  interest_ASC
  interest_DESC
  body_ASC
  body_DESC
  title_ASC
  title_DESC
  recordID_ASC
  recordID_DESC
  recordSlug_ASC
  recordSlug_DESC
  sentAt_ASC
  sentAt_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type PushNotificationReceiptPreviousValues {
  id: ID!
  route: String
  screen: String
  uri: String
  interest: String
  body: String!
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input PushNotificationReceiptScalarWhereInput {
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
  route: String
  route_not: String
  route_in: [String!]
  route_not_in: [String!]
  route_lt: String
  route_lte: String
  route_gt: String
  route_gte: String
  route_contains: String
  route_not_contains: String
  route_starts_with: String
  route_not_starts_with: String
  route_ends_with: String
  route_not_ends_with: String
  screen: String
  screen_not: String
  screen_in: [String!]
  screen_not_in: [String!]
  screen_lt: String
  screen_lte: String
  screen_gt: String
  screen_gte: String
  screen_contains: String
  screen_not_contains: String
  screen_starts_with: String
  screen_not_starts_with: String
  screen_ends_with: String
  screen_not_ends_with: String
  uri: String
  uri_not: String
  uri_in: [String!]
  uri_not_in: [String!]
  uri_lt: String
  uri_lte: String
  uri_gt: String
  uri_gte: String
  uri_contains: String
  uri_not_contains: String
  uri_starts_with: String
  uri_not_starts_with: String
  uri_ends_with: String
  uri_not_ends_with: String
  interest: String
  interest_not: String
  interest_in: [String!]
  interest_not_in: [String!]
  interest_lt: String
  interest_lte: String
  interest_gt: String
  interest_gte: String
  interest_contains: String
  interest_not_contains: String
  interest_starts_with: String
  interest_not_starts_with: String
  interest_ends_with: String
  interest_not_ends_with: String
  body: String
  body_not: String
  body_in: [String!]
  body_not_in: [String!]
  body_lt: String
  body_lte: String
  body_gt: String
  body_gte: String
  body_contains: String
  body_not_contains: String
  body_starts_with: String
  body_not_starts_with: String
  body_ends_with: String
  body_not_ends_with: String
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
  recordID: String
  recordID_not: String
  recordID_in: [String!]
  recordID_not_in: [String!]
  recordID_lt: String
  recordID_lte: String
  recordID_gt: String
  recordID_gte: String
  recordID_contains: String
  recordID_not_contains: String
  recordID_starts_with: String
  recordID_not_starts_with: String
  recordID_ends_with: String
  recordID_not_ends_with: String
  recordSlug: String
  recordSlug_not: String
  recordSlug_in: [String!]
  recordSlug_not_in: [String!]
  recordSlug_lt: String
  recordSlug_lte: String
  recordSlug_gt: String
  recordSlug_gte: String
  recordSlug_contains: String
  recordSlug_not_contains: String
  recordSlug_starts_with: String
  recordSlug_not_starts_with: String
  recordSlug_ends_with: String
  recordSlug_not_ends_with: String
  sentAt: DateTime
  sentAt_not: DateTime
  sentAt_in: [DateTime!]
  sentAt_not_in: [DateTime!]
  sentAt_lt: DateTime
  sentAt_lte: DateTime
  sentAt_gt: DateTime
  sentAt_gte: DateTime
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
  AND: [PushNotificationReceiptScalarWhereInput!]
  OR: [PushNotificationReceiptScalarWhereInput!]
  NOT: [PushNotificationReceiptScalarWhereInput!]
}

type PushNotificationReceiptSubscriptionPayload {
  mutation: MutationType!
  node: PushNotificationReceipt
  updatedFields: [String!]
  previousValues: PushNotificationReceiptPreviousValues
}

input PushNotificationReceiptSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: PushNotificationReceiptWhereInput
  AND: [PushNotificationReceiptSubscriptionWhereInput!]
  OR: [PushNotificationReceiptSubscriptionWhereInput!]
  NOT: [PushNotificationReceiptSubscriptionWhereInput!]
}

input PushNotificationReceiptUpdateInput {
  route: String
  screen: String
  uri: String
  users: UserUpdateManyWithoutPushNotificationsInput
  interest: String
  body: String
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime
}

input PushNotificationReceiptUpdateManyDataInput {
  route: String
  screen: String
  uri: String
  interest: String
  body: String
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime
}

input PushNotificationReceiptUpdateManyMutationInput {
  route: String
  screen: String
  uri: String
  interest: String
  body: String
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime
}

input PushNotificationReceiptUpdateManyWithoutUsersInput {
  create: [PushNotificationReceiptCreateWithoutUsersInput!]
  delete: [PushNotificationReceiptWhereUniqueInput!]
  connect: [PushNotificationReceiptWhereUniqueInput!]
  set: [PushNotificationReceiptWhereUniqueInput!]
  disconnect: [PushNotificationReceiptWhereUniqueInput!]
  update: [PushNotificationReceiptUpdateWithWhereUniqueWithoutUsersInput!]
  upsert: [PushNotificationReceiptUpsertWithWhereUniqueWithoutUsersInput!]
  deleteMany: [PushNotificationReceiptScalarWhereInput!]
  updateMany: [PushNotificationReceiptUpdateManyWithWhereNestedInput!]
}

input PushNotificationReceiptUpdateManyWithWhereNestedInput {
  where: PushNotificationReceiptScalarWhereInput!
  data: PushNotificationReceiptUpdateManyDataInput!
}

input PushNotificationReceiptUpdateWithoutUsersDataInput {
  route: String
  screen: String
  uri: String
  interest: String
  body: String
  title: String
  recordID: String
  recordSlug: String
  sentAt: DateTime
}

input PushNotificationReceiptUpdateWithWhereUniqueWithoutUsersInput {
  where: PushNotificationReceiptWhereUniqueInput!
  data: PushNotificationReceiptUpdateWithoutUsersDataInput!
}

input PushNotificationReceiptUpsertWithWhereUniqueWithoutUsersInput {
  where: PushNotificationReceiptWhereUniqueInput!
  update: PushNotificationReceiptUpdateWithoutUsersDataInput!
  create: PushNotificationReceiptCreateWithoutUsersInput!
}

input PushNotificationReceiptWhereInput {
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
  route: String
  route_not: String
  route_in: [String!]
  route_not_in: [String!]
  route_lt: String
  route_lte: String
  route_gt: String
  route_gte: String
  route_contains: String
  route_not_contains: String
  route_starts_with: String
  route_not_starts_with: String
  route_ends_with: String
  route_not_ends_with: String
  screen: String
  screen_not: String
  screen_in: [String!]
  screen_not_in: [String!]
  screen_lt: String
  screen_lte: String
  screen_gt: String
  screen_gte: String
  screen_contains: String
  screen_not_contains: String
  screen_starts_with: String
  screen_not_starts_with: String
  screen_ends_with: String
  screen_not_ends_with: String
  uri: String
  uri_not: String
  uri_in: [String!]
  uri_not_in: [String!]
  uri_lt: String
  uri_lte: String
  uri_gt: String
  uri_gte: String
  uri_contains: String
  uri_not_contains: String
  uri_starts_with: String
  uri_not_starts_with: String
  uri_ends_with: String
  uri_not_ends_with: String
  users_every: UserWhereInput
  users_some: UserWhereInput
  users_none: UserWhereInput
  interest: String
  interest_not: String
  interest_in: [String!]
  interest_not_in: [String!]
  interest_lt: String
  interest_lte: String
  interest_gt: String
  interest_gte: String
  interest_contains: String
  interest_not_contains: String
  interest_starts_with: String
  interest_not_starts_with: String
  interest_ends_with: String
  interest_not_ends_with: String
  body: String
  body_not: String
  body_in: [String!]
  body_not_in: [String!]
  body_lt: String
  body_lte: String
  body_gt: String
  body_gte: String
  body_contains: String
  body_not_contains: String
  body_starts_with: String
  body_not_starts_with: String
  body_ends_with: String
  body_not_ends_with: String
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
  recordID: String
  recordID_not: String
  recordID_in: [String!]
  recordID_not_in: [String!]
  recordID_lt: String
  recordID_lte: String
  recordID_gt: String
  recordID_gte: String
  recordID_contains: String
  recordID_not_contains: String
  recordID_starts_with: String
  recordID_not_starts_with: String
  recordID_ends_with: String
  recordID_not_ends_with: String
  recordSlug: String
  recordSlug_not: String
  recordSlug_in: [String!]
  recordSlug_not_in: [String!]
  recordSlug_lt: String
  recordSlug_lte: String
  recordSlug_gt: String
  recordSlug_gte: String
  recordSlug_contains: String
  recordSlug_not_contains: String
  recordSlug_starts_with: String
  recordSlug_not_starts_with: String
  recordSlug_ends_with: String
  recordSlug_not_ends_with: String
  sentAt: DateTime
  sentAt_not: DateTime
  sentAt_in: [DateTime!]
  sentAt_not_in: [DateTime!]
  sentAt_lt: DateTime
  sentAt_lte: DateTime
  sentAt_gt: DateTime
  sentAt_gte: DateTime
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
  AND: [PushNotificationReceiptWhereInput!]
  OR: [PushNotificationReceiptWhereInput!]
  NOT: [PushNotificationReceiptWhereInput!]
}

input PushNotificationReceiptWhereUniqueInput {
  id: ID
}

enum PushNotificationStatus {
  Blocked
  Granted
  Denied
}

type Query {
  bagItem(where: BagItemWhereUniqueInput!): BagItem
  bagItems(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BagItem]!
  bagItemsConnection(where: BagItemWhereInput, orderBy: BagItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BagItemConnection!
  billingInfo(where: BillingInfoWhereUniqueInput!): BillingInfo
  billingInfoes(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BillingInfo]!
  billingInfoesConnection(where: BillingInfoWhereInput, orderBy: BillingInfoOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BillingInfoConnection!
  bottomSize(where: BottomSizeWhereUniqueInput!): BottomSize
  bottomSizes(where: BottomSizeWhereInput, orderBy: BottomSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [BottomSize]!
  bottomSizesConnection(where: BottomSizeWhereInput, orderBy: BottomSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): BottomSizeConnection!
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
  customerMembership(where: CustomerMembershipWhereUniqueInput!): CustomerMembership
  customerMemberships(where: CustomerMembershipWhereInput, orderBy: CustomerMembershipOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [CustomerMembership]!
  customerMembershipsConnection(where: CustomerMembershipWhereInput, orderBy: CustomerMembershipOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): CustomerMembershipConnection!
  emailReceipt(where: EmailReceiptWhereUniqueInput!): EmailReceipt
  emailReceipts(where: EmailReceiptWhereInput, orderBy: EmailReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [EmailReceipt]!
  emailReceiptsConnection(where: EmailReceiptWhereInput, orderBy: EmailReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): EmailReceiptConnection!
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
  package(where: PackageWhereUniqueInput!): Package
  packages(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Package]!
  packagesConnection(where: PackageWhereInput, orderBy: PackageOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PackageConnection!
  packageTransitEvent(where: PackageTransitEventWhereUniqueInput!): PackageTransitEvent
  packageTransitEvents(where: PackageTransitEventWhereInput, orderBy: PackageTransitEventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PackageTransitEvent]!
  packageTransitEventsConnection(where: PackageTransitEventWhereInput, orderBy: PackageTransitEventOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PackageTransitEventConnection!
  pauseRequest(where: PauseRequestWhereUniqueInput!): PauseRequest
  pauseRequests(where: PauseRequestWhereInput, orderBy: PauseRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PauseRequest]!
  pauseRequestsConnection(where: PauseRequestWhereInput, orderBy: PauseRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PauseRequestConnection!
  physicalProduct(where: PhysicalProductWhereUniqueInput!): PhysicalProduct
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct]!
  physicalProductsConnection(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PhysicalProductConnection!
  physicalProductInventoryStatusChange(where: PhysicalProductInventoryStatusChangeWhereUniqueInput!): PhysicalProductInventoryStatusChange
  physicalProductInventoryStatusChanges(where: PhysicalProductInventoryStatusChangeWhereInput, orderBy: PhysicalProductInventoryStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProductInventoryStatusChange]!
  physicalProductInventoryStatusChangesConnection(where: PhysicalProductInventoryStatusChangeWhereInput, orderBy: PhysicalProductInventoryStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PhysicalProductInventoryStatusChangeConnection!
  product(where: ProductWhereUniqueInput!): Product
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product]!
  productsConnection(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductConnection!
  productFunction(where: ProductFunctionWhereUniqueInput!): ProductFunction
  productFunctions(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductFunction]!
  productFunctionsConnection(where: ProductFunctionWhereInput, orderBy: ProductFunctionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductFunctionConnection!
  productMaterialCategory(where: ProductMaterialCategoryWhereUniqueInput!): ProductMaterialCategory
  productMaterialCategories(where: ProductMaterialCategoryWhereInput, orderBy: ProductMaterialCategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductMaterialCategory]!
  productMaterialCategoriesConnection(where: ProductMaterialCategoryWhereInput, orderBy: ProductMaterialCategoryOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductMaterialCategoryConnection!
  productModel(where: ProductModelWhereUniqueInput!): ProductModel
  productModels(where: ProductModelWhereInput, orderBy: ProductModelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductModel]!
  productModelsConnection(where: ProductModelWhereInput, orderBy: ProductModelOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductModelConnection!
  productRequest(where: ProductRequestWhereUniqueInput!): ProductRequest
  productRequests(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductRequest]!
  productRequestsConnection(where: ProductRequestWhereInput, orderBy: ProductRequestOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductRequestConnection!
  productStatusChange(where: ProductStatusChangeWhereUniqueInput!): ProductStatusChange
  productStatusChanges(where: ProductStatusChangeWhereInput, orderBy: ProductStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductStatusChange]!
  productStatusChangesConnection(where: ProductStatusChangeWhereInput, orderBy: ProductStatusChangeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductStatusChangeConnection!
  productVariant(where: ProductVariantWhereUniqueInput!): ProductVariant
  productVariants(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariant]!
  productVariantsConnection(where: ProductVariantWhereInput, orderBy: ProductVariantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantConnection!
  productVariantFeedback(where: ProductVariantFeedbackWhereUniqueInput!): ProductVariantFeedback
  productVariantFeedbacks(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedback]!
  productVariantFeedbacksConnection(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantFeedbackConnection!
  productVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionWhereUniqueInput!): ProductVariantFeedbackQuestion
  productVariantFeedbackQuestions(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedbackQuestion]!
  productVariantFeedbackQuestionsConnection(where: ProductVariantFeedbackQuestionWhereInput, orderBy: ProductVariantFeedbackQuestionOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantFeedbackQuestionConnection!
  productVariantWant(where: ProductVariantWantWhereUniqueInput!): ProductVariantWant
  productVariantWants(where: ProductVariantWantWhereInput, orderBy: ProductVariantWantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantWant]!
  productVariantWantsConnection(where: ProductVariantWantWhereInput, orderBy: ProductVariantWantOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ProductVariantWantConnection!
  pushNotificationReceipt(where: PushNotificationReceiptWhereUniqueInput!): PushNotificationReceipt
  pushNotificationReceipts(where: PushNotificationReceiptWhereInput, orderBy: PushNotificationReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PushNotificationReceipt]!
  pushNotificationReceiptsConnection(where: PushNotificationReceiptWhereInput, orderBy: PushNotificationReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PushNotificationReceiptConnection!
  recentlyViewedProduct(where: RecentlyViewedProductWhereUniqueInput!): RecentlyViewedProduct
  recentlyViewedProducts(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [RecentlyViewedProduct]!
  recentlyViewedProductsConnection(where: RecentlyViewedProductWhereInput, orderBy: RecentlyViewedProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): RecentlyViewedProductConnection!
  reservation(where: ReservationWhereUniqueInput!): Reservation
  reservations(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Reservation]!
  reservationsConnection(where: ReservationWhereInput, orderBy: ReservationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationConnection!
  reservationFeedback(where: ReservationFeedbackWhereUniqueInput!): ReservationFeedback
  reservationFeedbacks(where: ReservationFeedbackWhereInput, orderBy: ReservationFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ReservationFeedback]!
  reservationFeedbacksConnection(where: ReservationFeedbackWhereInput, orderBy: ReservationFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationFeedbackConnection!
  reservationReceipt(where: ReservationReceiptWhereUniqueInput!): ReservationReceipt
  reservationReceipts(where: ReservationReceiptWhereInput, orderBy: ReservationReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ReservationReceipt]!
  reservationReceiptsConnection(where: ReservationReceiptWhereInput, orderBy: ReservationReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationReceiptConnection!
  reservationReceiptItem(where: ReservationReceiptItemWhereUniqueInput!): ReservationReceiptItem
  reservationReceiptItems(where: ReservationReceiptItemWhereInput, orderBy: ReservationReceiptItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ReservationReceiptItem]!
  reservationReceiptItemsConnection(where: ReservationReceiptItemWhereInput, orderBy: ReservationReceiptItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): ReservationReceiptItemConnection!
  size(where: SizeWhereUniqueInput!): Size
  sizes(where: SizeWhereInput, orderBy: SizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Size]!
  sizesConnection(where: SizeWhereInput, orderBy: SizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): SizeConnection!
  tag(where: TagWhereUniqueInput!): Tag
  tags(where: TagWhereInput, orderBy: TagOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Tag]!
  tagsConnection(where: TagWhereInput, orderBy: TagOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): TagConnection!
  topSize(where: TopSizeWhereUniqueInput!): TopSize
  topSizes(where: TopSizeWhereInput, orderBy: TopSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [TopSize]!
  topSizesConnection(where: TopSizeWhereInput, orderBy: TopSizeOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): TopSizeConnection!
  user(where: UserWhereUniqueInput!): User
  users(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [User]!
  usersConnection(where: UserWhereInput, orderBy: UserOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): UserConnection!
  warehouseLocation(where: WarehouseLocationWhereUniqueInput!): WarehouseLocation
  warehouseLocations(where: WarehouseLocationWhereInput, orderBy: WarehouseLocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [WarehouseLocation]!
  warehouseLocationsConnection(where: WarehouseLocationWhereInput, orderBy: WarehouseLocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): WarehouseLocationConnection!
  warehouseLocationConstraint(where: WarehouseLocationConstraintWhereUniqueInput!): WarehouseLocationConstraint
  warehouseLocationConstraints(where: WarehouseLocationConstraintWhereInput, orderBy: WarehouseLocationConstraintOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [WarehouseLocationConstraint]!
  warehouseLocationConstraintsConnection(where: WarehouseLocationConstraintWhereInput, orderBy: WarehouseLocationConstraintOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): WarehouseLocationConstraintConnection!
  node(id: ID!): Node
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

type RecentlyViewedProduct {
  id: ID!
  product: Product!
  customer: Customer!
  viewCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RecentlyViewedProductConnection {
  pageInfo: PageInfo!
  edges: [RecentlyViewedProductEdge]!
  aggregate: AggregateRecentlyViewedProduct!
}

input RecentlyViewedProductCreateInput {
  id: ID
  product: ProductCreateOneInput!
  customer: CustomerCreateOneInput!
  viewCount: Int
}

type RecentlyViewedProductEdge {
  node: RecentlyViewedProduct!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: RecentlyViewedProductWhereInput
  AND: [RecentlyViewedProductSubscriptionWhereInput!]
  OR: [RecentlyViewedProductSubscriptionWhereInput!]
  NOT: [RecentlyViewedProductSubscriptionWhereInput!]
}

input RecentlyViewedProductUpdateInput {
  product: ProductUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredInput
  viewCount: Int
}

input RecentlyViewedProductUpdateManyMutationInput {
  viewCount: Int
}

input RecentlyViewedProductWhereInput {
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
  product: ProductWhereInput
  customer: CustomerWhereInput
  viewCount: Int
  viewCount_not: Int
  viewCount_in: [Int!]
  viewCount_not_in: [Int!]
  viewCount_lt: Int
  viewCount_lte: Int
  viewCount_gt: Int
  viewCount_gte: Int
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
  AND: [RecentlyViewedProductWhereInput!]
  OR: [RecentlyViewedProductWhereInput!]
  NOT: [RecentlyViewedProductWhereInput!]
}

input RecentlyViewedProductWhereUniqueInput {
  id: ID
}

type Reservation {
  id: ID!
  user: User!
  customer: Customer!
  sentPackage: Package
  returnedPackage: Package
  products(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  reservationNumber: Int!
  phase: ReservationPhase!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceipt
  lastLocation: Location
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
  products: PhysicalProductCreateManyInput
  reservationNumber: Int!
  phase: ReservationPhase!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceiptCreateOneWithoutReservationInput
  lastLocation: LocationCreateOneInput
}

input ReservationCreateManyWithoutCustomerInput {
  create: [ReservationCreateWithoutCustomerInput!]
  connect: [ReservationWhereUniqueInput!]
}

input ReservationCreateOneInput {
  create: ReservationCreateInput
  connect: ReservationWhereUniqueInput
}

input ReservationCreateOneWithoutReceiptInput {
  create: ReservationCreateWithoutReceiptInput
  connect: ReservationWhereUniqueInput
}

input ReservationCreateWithoutCustomerInput {
  id: ID
  user: UserCreateOneInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  products: PhysicalProductCreateManyInput
  reservationNumber: Int!
  phase: ReservationPhase!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceiptCreateOneWithoutReservationInput
  lastLocation: LocationCreateOneInput
}

input ReservationCreateWithoutReceiptInput {
  id: ID
  user: UserCreateOneInput!
  customer: CustomerCreateOneWithoutReservationsInput!
  sentPackage: PackageCreateOneInput
  returnedPackage: PackageCreateOneInput
  products: PhysicalProductCreateManyInput
  reservationNumber: Int!
  phase: ReservationPhase!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  lastLocation: LocationCreateOneInput
}

type ReservationEdge {
  node: Reservation!
  cursor: String!
}

type ReservationFeedback {
  id: ID!
  comment: String
  feedbacks(where: ProductVariantFeedbackWhereInput, orderBy: ProductVariantFeedbackOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ProductVariantFeedback!]
  rating: Rating
  user: User!
  reservation: Reservation!
  createdAt: DateTime!
  updatedAt: DateTime!
  respondedAt: DateTime
}

type ReservationFeedbackConnection {
  pageInfo: PageInfo!
  edges: [ReservationFeedbackEdge]!
  aggregate: AggregateReservationFeedback!
}

input ReservationFeedbackCreateInput {
  id: ID
  comment: String
  feedbacks: ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput
  rating: Rating
  user: UserCreateOneInput!
  reservation: ReservationCreateOneInput!
  respondedAt: DateTime
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
  respondedAt: DateTime
}

type ReservationFeedbackEdge {
  node: ReservationFeedback!
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
  respondedAt_ASC
  respondedAt_DESC
}

type ReservationFeedbackPreviousValues {
  id: ID!
  comment: String
  rating: Rating
  createdAt: DateTime!
  updatedAt: DateTime!
  respondedAt: DateTime
}

type ReservationFeedbackSubscriptionPayload {
  mutation: MutationType!
  node: ReservationFeedback
  updatedFields: [String!]
  previousValues: ReservationFeedbackPreviousValues
}

input ReservationFeedbackSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ReservationFeedbackWhereInput
  AND: [ReservationFeedbackSubscriptionWhereInput!]
  OR: [ReservationFeedbackSubscriptionWhereInput!]
  NOT: [ReservationFeedbackSubscriptionWhereInput!]
}

input ReservationFeedbackUpdateInput {
  comment: String
  feedbacks: ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput
  rating: Rating
  user: UserUpdateOneRequiredInput
  reservation: ReservationUpdateOneRequiredInput
  respondedAt: DateTime
}

input ReservationFeedbackUpdateManyMutationInput {
  comment: String
  rating: Rating
  respondedAt: DateTime
}

input ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput {
  create: ReservationFeedbackCreateWithoutFeedbacksInput
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput
  upsert: ReservationFeedbackUpsertWithoutFeedbacksInput
  connect: ReservationFeedbackWhereUniqueInput
}

input ReservationFeedbackUpdateWithoutFeedbacksDataInput {
  comment: String
  rating: Rating
  user: UserUpdateOneRequiredInput
  reservation: ReservationUpdateOneRequiredInput
  respondedAt: DateTime
}

input ReservationFeedbackUpsertWithoutFeedbacksInput {
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput!
  create: ReservationFeedbackCreateWithoutFeedbacksInput!
}

input ReservationFeedbackWhereInput {
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
  comment: String
  comment_not: String
  comment_in: [String!]
  comment_not_in: [String!]
  comment_lt: String
  comment_lte: String
  comment_gt: String
  comment_gte: String
  comment_contains: String
  comment_not_contains: String
  comment_starts_with: String
  comment_not_starts_with: String
  comment_ends_with: String
  comment_not_ends_with: String
  feedbacks_every: ProductVariantFeedbackWhereInput
  feedbacks_some: ProductVariantFeedbackWhereInput
  feedbacks_none: ProductVariantFeedbackWhereInput
  rating: Rating
  rating_not: Rating
  rating_in: [Rating!]
  rating_not_in: [Rating!]
  user: UserWhereInput
  reservation: ReservationWhereInput
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
  respondedAt: DateTime
  respondedAt_not: DateTime
  respondedAt_in: [DateTime!]
  respondedAt_not_in: [DateTime!]
  respondedAt_lt: DateTime
  respondedAt_lte: DateTime
  respondedAt_gt: DateTime
  respondedAt_gte: DateTime
  AND: [ReservationFeedbackWhereInput!]
  OR: [ReservationFeedbackWhereInput!]
  NOT: [ReservationFeedbackWhereInput!]
}

input ReservationFeedbackWhereUniqueInput {
  id: ID
}

enum ReservationOrderByInput {
  id_ASC
  id_DESC
  reservationNumber_ASC
  reservationNumber_DESC
  phase_ASC
  phase_DESC
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

enum ReservationPhase {
  BusinessToCustomer
  CustomerToBusiness
}

type ReservationPreviousValues {
  id: ID!
  reservationNumber: Int!
  phase: ReservationPhase!
  shipped: Boolean!
  status: ReservationStatus!
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ReservationReceipt {
  id: ID!
  reservation: Reservation!
  items(where: ReservationReceiptItemWhereInput, orderBy: ReservationReceiptItemOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [ReservationReceiptItem!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ReservationReceiptConnection {
  pageInfo: PageInfo!
  edges: [ReservationReceiptEdge]!
  aggregate: AggregateReservationReceipt!
}

input ReservationReceiptCreateInput {
  id: ID
  reservation: ReservationCreateOneWithoutReceiptInput!
  items: ReservationReceiptItemCreateManyInput
}

input ReservationReceiptCreateOneWithoutReservationInput {
  create: ReservationReceiptCreateWithoutReservationInput
  connect: ReservationReceiptWhereUniqueInput
}

input ReservationReceiptCreateWithoutReservationInput {
  id: ID
  items: ReservationReceiptItemCreateManyInput
}

type ReservationReceiptEdge {
  node: ReservationReceipt!
  cursor: String!
}

type ReservationReceiptItem {
  id: ID!
  product: PhysicalProduct!
  productStatus: PhysicalProductStatus!
  notes: String
}

type ReservationReceiptItemConnection {
  pageInfo: PageInfo!
  edges: [ReservationReceiptItemEdge]!
  aggregate: AggregateReservationReceiptItem!
}

input ReservationReceiptItemCreateInput {
  id: ID
  product: PhysicalProductCreateOneInput!
  productStatus: PhysicalProductStatus!
  notes: String
}

input ReservationReceiptItemCreateManyInput {
  create: [ReservationReceiptItemCreateInput!]
  connect: [ReservationReceiptItemWhereUniqueInput!]
}

type ReservationReceiptItemEdge {
  node: ReservationReceiptItem!
  cursor: String!
}

enum ReservationReceiptItemOrderByInput {
  id_ASC
  id_DESC
  productStatus_ASC
  productStatus_DESC
  notes_ASC
  notes_DESC
}

type ReservationReceiptItemPreviousValues {
  id: ID!
  productStatus: PhysicalProductStatus!
  notes: String
}

input ReservationReceiptItemScalarWhereInput {
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
  productStatus: PhysicalProductStatus
  productStatus_not: PhysicalProductStatus
  productStatus_in: [PhysicalProductStatus!]
  productStatus_not_in: [PhysicalProductStatus!]
  notes: String
  notes_not: String
  notes_in: [String!]
  notes_not_in: [String!]
  notes_lt: String
  notes_lte: String
  notes_gt: String
  notes_gte: String
  notes_contains: String
  notes_not_contains: String
  notes_starts_with: String
  notes_not_starts_with: String
  notes_ends_with: String
  notes_not_ends_with: String
  AND: [ReservationReceiptItemScalarWhereInput!]
  OR: [ReservationReceiptItemScalarWhereInput!]
  NOT: [ReservationReceiptItemScalarWhereInput!]
}

type ReservationReceiptItemSubscriptionPayload {
  mutation: MutationType!
  node: ReservationReceiptItem
  updatedFields: [String!]
  previousValues: ReservationReceiptItemPreviousValues
}

input ReservationReceiptItemSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ReservationReceiptItemWhereInput
  AND: [ReservationReceiptItemSubscriptionWhereInput!]
  OR: [ReservationReceiptItemSubscriptionWhereInput!]
  NOT: [ReservationReceiptItemSubscriptionWhereInput!]
}

input ReservationReceiptItemUpdateDataInput {
  product: PhysicalProductUpdateOneRequiredInput
  productStatus: PhysicalProductStatus
  notes: String
}

input ReservationReceiptItemUpdateInput {
  product: PhysicalProductUpdateOneRequiredInput
  productStatus: PhysicalProductStatus
  notes: String
}

input ReservationReceiptItemUpdateManyDataInput {
  productStatus: PhysicalProductStatus
  notes: String
}

input ReservationReceiptItemUpdateManyInput {
  create: [ReservationReceiptItemCreateInput!]
  update: [ReservationReceiptItemUpdateWithWhereUniqueNestedInput!]
  upsert: [ReservationReceiptItemUpsertWithWhereUniqueNestedInput!]
  delete: [ReservationReceiptItemWhereUniqueInput!]
  connect: [ReservationReceiptItemWhereUniqueInput!]
  set: [ReservationReceiptItemWhereUniqueInput!]
  disconnect: [ReservationReceiptItemWhereUniqueInput!]
  deleteMany: [ReservationReceiptItemScalarWhereInput!]
  updateMany: [ReservationReceiptItemUpdateManyWithWhereNestedInput!]
}

input ReservationReceiptItemUpdateManyMutationInput {
  productStatus: PhysicalProductStatus
  notes: String
}

input ReservationReceiptItemUpdateManyWithWhereNestedInput {
  where: ReservationReceiptItemScalarWhereInput!
  data: ReservationReceiptItemUpdateManyDataInput!
}

input ReservationReceiptItemUpdateWithWhereUniqueNestedInput {
  where: ReservationReceiptItemWhereUniqueInput!
  data: ReservationReceiptItemUpdateDataInput!
}

input ReservationReceiptItemUpsertWithWhereUniqueNestedInput {
  where: ReservationReceiptItemWhereUniqueInput!
  update: ReservationReceiptItemUpdateDataInput!
  create: ReservationReceiptItemCreateInput!
}

input ReservationReceiptItemWhereInput {
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
  product: PhysicalProductWhereInput
  productStatus: PhysicalProductStatus
  productStatus_not: PhysicalProductStatus
  productStatus_in: [PhysicalProductStatus!]
  productStatus_not_in: [PhysicalProductStatus!]
  notes: String
  notes_not: String
  notes_in: [String!]
  notes_not_in: [String!]
  notes_lt: String
  notes_lte: String
  notes_gt: String
  notes_gte: String
  notes_contains: String
  notes_not_contains: String
  notes_starts_with: String
  notes_not_starts_with: String
  notes_ends_with: String
  notes_not_ends_with: String
  AND: [ReservationReceiptItemWhereInput!]
  OR: [ReservationReceiptItemWhereInput!]
  NOT: [ReservationReceiptItemWhereInput!]
}

input ReservationReceiptItemWhereUniqueInput {
  id: ID
}

enum ReservationReceiptOrderByInput {
  id_ASC
  id_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type ReservationReceiptPreviousValues {
  id: ID!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type ReservationReceiptSubscriptionPayload {
  mutation: MutationType!
  node: ReservationReceipt
  updatedFields: [String!]
  previousValues: ReservationReceiptPreviousValues
}

input ReservationReceiptSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: ReservationReceiptWhereInput
  AND: [ReservationReceiptSubscriptionWhereInput!]
  OR: [ReservationReceiptSubscriptionWhereInput!]
  NOT: [ReservationReceiptSubscriptionWhereInput!]
}

input ReservationReceiptUpdateInput {
  reservation: ReservationUpdateOneRequiredWithoutReceiptInput
  items: ReservationReceiptItemUpdateManyInput
}

input ReservationReceiptUpdateOneWithoutReservationInput {
  create: ReservationReceiptCreateWithoutReservationInput
  update: ReservationReceiptUpdateWithoutReservationDataInput
  upsert: ReservationReceiptUpsertWithoutReservationInput
  delete: Boolean
  disconnect: Boolean
  connect: ReservationReceiptWhereUniqueInput
}

input ReservationReceiptUpdateWithoutReservationDataInput {
  items: ReservationReceiptItemUpdateManyInput
}

input ReservationReceiptUpsertWithoutReservationInput {
  update: ReservationReceiptUpdateWithoutReservationDataInput!
  create: ReservationReceiptCreateWithoutReservationInput!
}

input ReservationReceiptWhereInput {
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
  reservation: ReservationWhereInput
  items_every: ReservationReceiptItemWhereInput
  items_some: ReservationReceiptItemWhereInput
  items_none: ReservationReceiptItemWhereInput
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
  AND: [ReservationReceiptWhereInput!]
  OR: [ReservationReceiptWhereInput!]
  NOT: [ReservationReceiptWhereInput!]
}

input ReservationReceiptWhereUniqueInput {
  id: ID
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
  phase: ReservationPhase
  phase_not: ReservationPhase
  phase_in: [ReservationPhase!]
  phase_not_in: [ReservationPhase!]
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
  reminderSentAt: DateTime
  reminderSentAt_not: DateTime
  reminderSentAt_in: [DateTime!]
  reminderSentAt_not_in: [DateTime!]
  reminderSentAt_lt: DateTime
  reminderSentAt_lte: DateTime
  reminderSentAt_gt: DateTime
  reminderSentAt_gte: DateTime
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
  Queued
  Packed
  Shipped
  Delivered
  Completed
  Cancelled
  Blocked
  Unknown
  Received
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

input ReservationUpdateDataInput {
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceiptUpdateOneWithoutReservationInput
  lastLocation: LocationUpdateOneInput
}

input ReservationUpdateInput {
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceiptUpdateOneWithoutReservationInput
  lastLocation: LocationUpdateOneInput
}

input ReservationUpdateManyDataInput {
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
}

input ReservationUpdateManyMutationInput {
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
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

input ReservationUpdateOneRequiredInput {
  create: ReservationCreateInput
  update: ReservationUpdateDataInput
  upsert: ReservationUpsertNestedInput
  connect: ReservationWhereUniqueInput
}

input ReservationUpdateOneRequiredWithoutReceiptInput {
  create: ReservationCreateWithoutReceiptInput
  update: ReservationUpdateWithoutReceiptDataInput
  upsert: ReservationUpsertWithoutReceiptInput
  connect: ReservationWhereUniqueInput
}

input ReservationUpdateWithoutCustomerDataInput {
  user: UserUpdateOneRequiredInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  receipt: ReservationReceiptUpdateOneWithoutReservationInput
  lastLocation: LocationUpdateOneInput
}

input ReservationUpdateWithoutReceiptDataInput {
  user: UserUpdateOneRequiredInput
  customer: CustomerUpdateOneRequiredWithoutReservationsInput
  sentPackage: PackageUpdateOneInput
  returnedPackage: PackageUpdateOneInput
  products: PhysicalProductUpdateManyInput
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt: DateTime
  receivedAt: DateTime
  reminderSentAt: DateTime
  lastLocation: LocationUpdateOneInput
}

input ReservationUpdateWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput!
  data: ReservationUpdateWithoutCustomerDataInput!
}

input ReservationUpsertNestedInput {
  update: ReservationUpdateDataInput!
  create: ReservationCreateInput!
}

input ReservationUpsertWithoutReceiptInput {
  update: ReservationUpdateWithoutReceiptDataInput!
  create: ReservationCreateWithoutReceiptInput!
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
  phase: ReservationPhase
  phase_not: ReservationPhase
  phase_in: [ReservationPhase!]
  phase_not_in: [ReservationPhase!]
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
  reminderSentAt: DateTime
  reminderSentAt_not: DateTime
  reminderSentAt_in: [DateTime!]
  reminderSentAt_not_in: [DateTime!]
  reminderSentAt_lt: DateTime
  reminderSentAt_lte: DateTime
  reminderSentAt_gt: DateTime
  reminderSentAt_gte: DateTime
  receipt: ReservationReceiptWhereInput
  lastLocation: LocationWhereInput
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

type Size {
  id: ID!
  slug: String!
  productType: ProductType
  top: TopSize
  bottom: BottomSize
  display: String!
}

type SizeConnection {
  pageInfo: PageInfo!
  edges: [SizeEdge]!
  aggregate: AggregateSize!
}

input SizeCreateInput {
  id: ID
  slug: String!
  productType: ProductType
  top: TopSizeCreateOneInput
  bottom: BottomSizeCreateOneInput
  display: String!
}

input SizeCreateManyInput {
  create: [SizeCreateInput!]
  connect: [SizeWhereUniqueInput!]
}

input SizeCreateOneInput {
  create: SizeCreateInput
  connect: SizeWhereUniqueInput
}

type SizeEdge {
  node: Size!
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
  productType: ProductType
  productType_not: ProductType
  productType_in: [ProductType!]
  productType_not_in: [ProductType!]
  display: String
  display_not: String
  display_in: [String!]
  display_not_in: [String!]
  display_lt: String
  display_lte: String
  display_gt: String
  display_gte: String
  display_contains: String
  display_not_contains: String
  display_starts_with: String
  display_not_starts_with: String
  display_ends_with: String
  display_not_ends_with: String
  AND: [SizeScalarWhereInput!]
  OR: [SizeScalarWhereInput!]
  NOT: [SizeScalarWhereInput!]
}

type SizeSubscriptionPayload {
  mutation: MutationType!
  node: Size
  updatedFields: [String!]
  previousValues: SizePreviousValues
}

input SizeSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: SizeWhereInput
  AND: [SizeSubscriptionWhereInput!]
  OR: [SizeSubscriptionWhereInput!]
  NOT: [SizeSubscriptionWhereInput!]
}

input SizeUpdateDataInput {
  slug: String
  productType: ProductType
  top: TopSizeUpdateOneInput
  bottom: BottomSizeUpdateOneInput
  display: String
}

input SizeUpdateInput {
  slug: String
  productType: ProductType
  top: TopSizeUpdateOneInput
  bottom: BottomSizeUpdateOneInput
  display: String
}

input SizeUpdateManyDataInput {
  slug: String
  productType: ProductType
  display: String
}

input SizeUpdateManyInput {
  create: [SizeCreateInput!]
  update: [SizeUpdateWithWhereUniqueNestedInput!]
  upsert: [SizeUpsertWithWhereUniqueNestedInput!]
  delete: [SizeWhereUniqueInput!]
  connect: [SizeWhereUniqueInput!]
  set: [SizeWhereUniqueInput!]
  disconnect: [SizeWhereUniqueInput!]
  deleteMany: [SizeScalarWhereInput!]
  updateMany: [SizeUpdateManyWithWhereNestedInput!]
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
  update: SizeUpdateDataInput
  upsert: SizeUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: SizeWhereUniqueInput
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
  productType: ProductType
  productType_not: ProductType
  productType_in: [ProductType!]
  productType_not_in: [ProductType!]
  top: TopSizeWhereInput
  bottom: BottomSizeWhereInput
  display: String
  display_not: String
  display_in: [String!]
  display_not_in: [String!]
  display_lt: String
  display_lte: String
  display_gt: String
  display_gte: String
  display_contains: String
  display_not_contains: String
  display_starts_with: String
  display_not_starts_with: String
  display_ends_with: String
  display_not_ends_with: String
  AND: [SizeWhereInput!]
  OR: [SizeWhereInput!]
  NOT: [SizeWhereInput!]
}

input SizeWhereUniqueInput {
  id: ID
  slug: String
}

type Subscription {
  bagItem(where: BagItemSubscriptionWhereInput): BagItemSubscriptionPayload
  billingInfo(where: BillingInfoSubscriptionWhereInput): BillingInfoSubscriptionPayload
  bottomSize(where: BottomSizeSubscriptionWhereInput): BottomSizeSubscriptionPayload
  brand(where: BrandSubscriptionWhereInput): BrandSubscriptionPayload
  category(where: CategorySubscriptionWhereInput): CategorySubscriptionPayload
  collection(where: CollectionSubscriptionWhereInput): CollectionSubscriptionPayload
  collectionGroup(where: CollectionGroupSubscriptionWhereInput): CollectionGroupSubscriptionPayload
  color(where: ColorSubscriptionWhereInput): ColorSubscriptionPayload
  customer(where: CustomerSubscriptionWhereInput): CustomerSubscriptionPayload
  customerDetail(where: CustomerDetailSubscriptionWhereInput): CustomerDetailSubscriptionPayload
  customerMembership(where: CustomerMembershipSubscriptionWhereInput): CustomerMembershipSubscriptionPayload
  emailReceipt(where: EmailReceiptSubscriptionWhereInput): EmailReceiptSubscriptionPayload
  homepageProductRail(where: HomepageProductRailSubscriptionWhereInput): HomepageProductRailSubscriptionPayload
  image(where: ImageSubscriptionWhereInput): ImageSubscriptionPayload
  label(where: LabelSubscriptionWhereInput): LabelSubscriptionPayload
  location(where: LocationSubscriptionWhereInput): LocationSubscriptionPayload
  package(where: PackageSubscriptionWhereInput): PackageSubscriptionPayload
  packageTransitEvent(where: PackageTransitEventSubscriptionWhereInput): PackageTransitEventSubscriptionPayload
  pauseRequest(where: PauseRequestSubscriptionWhereInput): PauseRequestSubscriptionPayload
  physicalProduct(where: PhysicalProductSubscriptionWhereInput): PhysicalProductSubscriptionPayload
  physicalProductInventoryStatusChange(where: PhysicalProductInventoryStatusChangeSubscriptionWhereInput): PhysicalProductInventoryStatusChangeSubscriptionPayload
  product(where: ProductSubscriptionWhereInput): ProductSubscriptionPayload
  productFunction(where: ProductFunctionSubscriptionWhereInput): ProductFunctionSubscriptionPayload
  productMaterialCategory(where: ProductMaterialCategorySubscriptionWhereInput): ProductMaterialCategorySubscriptionPayload
  productModel(where: ProductModelSubscriptionWhereInput): ProductModelSubscriptionPayload
  productRequest(where: ProductRequestSubscriptionWhereInput): ProductRequestSubscriptionPayload
  productStatusChange(where: ProductStatusChangeSubscriptionWhereInput): ProductStatusChangeSubscriptionPayload
  productVariant(where: ProductVariantSubscriptionWhereInput): ProductVariantSubscriptionPayload
  productVariantFeedback(where: ProductVariantFeedbackSubscriptionWhereInput): ProductVariantFeedbackSubscriptionPayload
  productVariantFeedbackQuestion(where: ProductVariantFeedbackQuestionSubscriptionWhereInput): ProductVariantFeedbackQuestionSubscriptionPayload
  productVariantWant(where: ProductVariantWantSubscriptionWhereInput): ProductVariantWantSubscriptionPayload
  pushNotificationReceipt(where: PushNotificationReceiptSubscriptionWhereInput): PushNotificationReceiptSubscriptionPayload
  recentlyViewedProduct(where: RecentlyViewedProductSubscriptionWhereInput): RecentlyViewedProductSubscriptionPayload
  reservation(where: ReservationSubscriptionWhereInput): ReservationSubscriptionPayload
  reservationFeedback(where: ReservationFeedbackSubscriptionWhereInput): ReservationFeedbackSubscriptionPayload
  reservationReceipt(where: ReservationReceiptSubscriptionWhereInput): ReservationReceiptSubscriptionPayload
  reservationReceiptItem(where: ReservationReceiptItemSubscriptionWhereInput): ReservationReceiptItemSubscriptionPayload
  size(where: SizeSubscriptionWhereInput): SizeSubscriptionPayload
  tag(where: TagSubscriptionWhereInput): TagSubscriptionPayload
  topSize(where: TopSizeSubscriptionWhereInput): TopSizeSubscriptionPayload
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
  warehouseLocation(where: WarehouseLocationSubscriptionWhereInput): WarehouseLocationSubscriptionPayload
  warehouseLocationConstraint(where: WarehouseLocationConstraintSubscriptionWhereInput): WarehouseLocationConstraintSubscriptionPayload
}

type Tag {
  id: ID!
  name: String!
  description: String
  products(where: ProductWhereInput, orderBy: ProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Product!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type TagConnection {
  pageInfo: PageInfo!
  edges: [TagEdge]!
  aggregate: AggregateTag!
}

input TagCreateInput {
  id: ID
  name: String!
  description: String
  products: ProductCreateManyWithoutTagsInput
}

input TagCreateManyWithoutProductsInput {
  create: [TagCreateWithoutProductsInput!]
  connect: [TagWhereUniqueInput!]
}

input TagCreateWithoutProductsInput {
  id: ID
  name: String!
  description: String
}

type TagEdge {
  node: Tag!
  cursor: String!
}

enum TagOrderByInput {
  id_ASC
  id_DESC
  name_ASC
  name_DESC
  description_ASC
  description_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type TagPreviousValues {
  id: ID!
  name: String!
  description: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input TagScalarWhereInput {
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
  AND: [TagScalarWhereInput!]
  OR: [TagScalarWhereInput!]
  NOT: [TagScalarWhereInput!]
}

type TagSubscriptionPayload {
  mutation: MutationType!
  node: Tag
  updatedFields: [String!]
  previousValues: TagPreviousValues
}

input TagSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: TagWhereInput
  AND: [TagSubscriptionWhereInput!]
  OR: [TagSubscriptionWhereInput!]
  NOT: [TagSubscriptionWhereInput!]
}

input TagUpdateInput {
  name: String
  description: String
  products: ProductUpdateManyWithoutTagsInput
}

input TagUpdateManyDataInput {
  name: String
  description: String
}

input TagUpdateManyMutationInput {
  name: String
  description: String
}

input TagUpdateManyWithoutProductsInput {
  create: [TagCreateWithoutProductsInput!]
  delete: [TagWhereUniqueInput!]
  connect: [TagWhereUniqueInput!]
  set: [TagWhereUniqueInput!]
  disconnect: [TagWhereUniqueInput!]
  update: [TagUpdateWithWhereUniqueWithoutProductsInput!]
  upsert: [TagUpsertWithWhereUniqueWithoutProductsInput!]
  deleteMany: [TagScalarWhereInput!]
  updateMany: [TagUpdateManyWithWhereNestedInput!]
}

input TagUpdateManyWithWhereNestedInput {
  where: TagScalarWhereInput!
  data: TagUpdateManyDataInput!
}

input TagUpdateWithoutProductsDataInput {
  name: String
  description: String
}

input TagUpdateWithWhereUniqueWithoutProductsInput {
  where: TagWhereUniqueInput!
  data: TagUpdateWithoutProductsDataInput!
}

input TagUpsertWithWhereUniqueWithoutProductsInput {
  where: TagWhereUniqueInput!
  update: TagUpdateWithoutProductsDataInput!
  create: TagCreateWithoutProductsInput!
}

input TagWhereInput {
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
  products_every: ProductWhereInput
  products_some: ProductWhereInput
  products_none: ProductWhereInput
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
  AND: [TagWhereInput!]
  OR: [TagWhereInput!]
  NOT: [TagWhereInput!]
}

input TagWhereUniqueInput {
  id: ID
  name: String
}

type TopSize {
  id: ID!
  letter: LetterSize
  sleeve: Float
  shoulder: Float
  chest: Float
  neck: Float
  length: Float
}

type TopSizeConnection {
  pageInfo: PageInfo!
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

type TopSizeEdge {
  node: TopSize!
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
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: TopSizeWhereInput
  AND: [TopSizeSubscriptionWhereInput!]
  OR: [TopSizeSubscriptionWhereInput!]
  NOT: [TopSizeSubscriptionWhereInput!]
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
  update: TopSizeUpdateDataInput
  upsert: TopSizeUpsertNestedInput
  delete: Boolean
  disconnect: Boolean
  connect: TopSizeWhereUniqueInput
}

input TopSizeUpsertNestedInput {
  update: TopSizeUpdateDataInput!
  create: TopSizeCreateInput!
}

input TopSizeWhereInput {
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
  letter: LetterSize
  letter_not: LetterSize
  letter_in: [LetterSize!]
  letter_not_in: [LetterSize!]
  sleeve: Float
  sleeve_not: Float
  sleeve_in: [Float!]
  sleeve_not_in: [Float!]
  sleeve_lt: Float
  sleeve_lte: Float
  sleeve_gt: Float
  sleeve_gte: Float
  shoulder: Float
  shoulder_not: Float
  shoulder_in: [Float!]
  shoulder_not_in: [Float!]
  shoulder_lt: Float
  shoulder_lte: Float
  shoulder_gt: Float
  shoulder_gte: Float
  chest: Float
  chest_not: Float
  chest_in: [Float!]
  chest_not_in: [Float!]
  chest_lt: Float
  chest_lte: Float
  chest_gt: Float
  chest_gte: Float
  neck: Float
  neck_not: Float
  neck_in: [Float!]
  neck_not_in: [Float!]
  neck_lt: Float
  neck_lte: Float
  neck_gt: Float
  neck_gte: Float
  length: Float
  length_not: Float
  length_in: [Float!]
  length_not_in: [Float!]
  length_lt: Float
  length_lte: Float
  length_gt: Float
  length_gte: Float
  AND: [TopSizeWhereInput!]
  OR: [TopSizeWhereInput!]
  NOT: [TopSizeWhereInput!]
}

input TopSizeWhereUniqueInput {
  id: ID
}

type User {
  id: ID!
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  roles: [UserRole!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  pushNotificationStatus: PushNotificationStatus!
  pushNotifications(where: PushNotificationReceiptWhereInput, orderBy: PushNotificationReceiptOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PushNotificationReceipt!]
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
  roles: UserCreaterolesInput
  pushNotificationStatus: PushNotificationStatus
  pushNotifications: PushNotificationReceiptCreateManyWithoutUsersInput
}

input UserCreateManyWithoutPushNotificationsInput {
  create: [UserCreateWithoutPushNotificationsInput!]
  connect: [UserWhereUniqueInput!]
}

input UserCreateOneInput {
  create: UserCreateInput
  connect: UserWhereUniqueInput
}

input UserCreaterolesInput {
  set: [UserRole!]
}

input UserCreateWithoutPushNotificationsInput {
  id: ID
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole
  roles: UserCreaterolesInput
  pushNotificationStatus: PushNotificationStatus
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
  pushNotificationStatus_ASC
  pushNotificationStatus_DESC
}

type UserPreviousValues {
  id: ID!
  auth0Id: String!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  roles: [UserRole!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  pushNotificationStatus: PushNotificationStatus!
}

enum UserRole {
  Admin
  Customer
  Partner
}

input UserScalarWhereInput {
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
  pushNotificationStatus: PushNotificationStatus
  pushNotificationStatus_not: PushNotificationStatus
  pushNotificationStatus_in: [PushNotificationStatus!]
  pushNotificationStatus_not_in: [PushNotificationStatus!]
  AND: [UserScalarWhereInput!]
  OR: [UserScalarWhereInput!]
  NOT: [UserScalarWhereInput!]
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
  roles: UserUpdaterolesInput
  pushNotificationStatus: PushNotificationStatus
  pushNotifications: PushNotificationReceiptUpdateManyWithoutUsersInput
}

input UserUpdateInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  roles: UserUpdaterolesInput
  pushNotificationStatus: PushNotificationStatus
  pushNotifications: PushNotificationReceiptUpdateManyWithoutUsersInput
}

input UserUpdateManyDataInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  roles: UserUpdaterolesInput
  pushNotificationStatus: PushNotificationStatus
}

input UserUpdateManyMutationInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  roles: UserUpdaterolesInput
  pushNotificationStatus: PushNotificationStatus
}

input UserUpdateManyWithoutPushNotificationsInput {
  create: [UserCreateWithoutPushNotificationsInput!]
  delete: [UserWhereUniqueInput!]
  connect: [UserWhereUniqueInput!]
  set: [UserWhereUniqueInput!]
  disconnect: [UserWhereUniqueInput!]
  update: [UserUpdateWithWhereUniqueWithoutPushNotificationsInput!]
  upsert: [UserUpsertWithWhereUniqueWithoutPushNotificationsInput!]
  deleteMany: [UserScalarWhereInput!]
  updateMany: [UserUpdateManyWithWhereNestedInput!]
}

input UserUpdateManyWithWhereNestedInput {
  where: UserScalarWhereInput!
  data: UserUpdateManyDataInput!
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

input UserUpdaterolesInput {
  set: [UserRole!]
}

input UserUpdateWithoutPushNotificationsDataInput {
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  roles: UserUpdaterolesInput
  pushNotificationStatus: PushNotificationStatus
}

input UserUpdateWithWhereUniqueWithoutPushNotificationsInput {
  where: UserWhereUniqueInput!
  data: UserUpdateWithoutPushNotificationsDataInput!
}

input UserUpsertNestedInput {
  update: UserUpdateDataInput!
  create: UserCreateInput!
}

input UserUpsertWithWhereUniqueWithoutPushNotificationsInput {
  where: UserWhereUniqueInput!
  update: UserUpdateWithoutPushNotificationsDataInput!
  create: UserCreateWithoutPushNotificationsInput!
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
  pushNotificationStatus: PushNotificationStatus
  pushNotificationStatus_not: PushNotificationStatus
  pushNotificationStatus_in: [PushNotificationStatus!]
  pushNotificationStatus_not_in: [PushNotificationStatus!]
  pushNotifications_every: PushNotificationReceiptWhereInput
  pushNotifications_some: PushNotificationReceiptWhereInput
  pushNotifications_none: PushNotificationReceiptWhereInput
  AND: [UserWhereInput!]
  OR: [UserWhereInput!]
  NOT: [UserWhereInput!]
}

input UserWhereUniqueInput {
  id: ID
  auth0Id: String
  email: String
}

type WarehouseLocation {
  id: ID!
  type: WarehouseLocationType!
  barcode: String!
  locationCode: String!
  itemCode: String!
  physicalProducts(where: PhysicalProductWhereInput, orderBy: PhysicalProductOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [PhysicalProduct!]
  constraints(where: WarehouseLocationConstraintWhereInput, orderBy: WarehouseLocationConstraintOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [WarehouseLocationConstraint!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WarehouseLocationConnection {
  pageInfo: PageInfo!
  edges: [WarehouseLocationEdge]!
  aggregate: AggregateWarehouseLocation!
}

type WarehouseLocationConstraint {
  id: ID!
  category: Category!
  limit: Int!
  locations(where: WarehouseLocationWhereInput, orderBy: WarehouseLocationOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [WarehouseLocation!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WarehouseLocationConstraintConnection {
  pageInfo: PageInfo!
  edges: [WarehouseLocationConstraintEdge]!
  aggregate: AggregateWarehouseLocationConstraint!
}

input WarehouseLocationConstraintCreateInput {
  id: ID
  category: CategoryCreateOneInput!
  limit: Int!
  locations: WarehouseLocationCreateManyWithoutConstraintsInput
}

input WarehouseLocationConstraintCreateManyWithoutLocationsInput {
  create: [WarehouseLocationConstraintCreateWithoutLocationsInput!]
  connect: [WarehouseLocationConstraintWhereUniqueInput!]
}

input WarehouseLocationConstraintCreateWithoutLocationsInput {
  id: ID
  category: CategoryCreateOneInput!
  limit: Int!
}

type WarehouseLocationConstraintEdge {
  node: WarehouseLocationConstraint!
  cursor: String!
}

enum WarehouseLocationConstraintOrderByInput {
  id_ASC
  id_DESC
  limit_ASC
  limit_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type WarehouseLocationConstraintPreviousValues {
  id: ID!
  limit: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input WarehouseLocationConstraintScalarWhereInput {
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
  limit: Int
  limit_not: Int
  limit_in: [Int!]
  limit_not_in: [Int!]
  limit_lt: Int
  limit_lte: Int
  limit_gt: Int
  limit_gte: Int
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
  AND: [WarehouseLocationConstraintScalarWhereInput!]
  OR: [WarehouseLocationConstraintScalarWhereInput!]
  NOT: [WarehouseLocationConstraintScalarWhereInput!]
}

type WarehouseLocationConstraintSubscriptionPayload {
  mutation: MutationType!
  node: WarehouseLocationConstraint
  updatedFields: [String!]
  previousValues: WarehouseLocationConstraintPreviousValues
}

input WarehouseLocationConstraintSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: WarehouseLocationConstraintWhereInput
  AND: [WarehouseLocationConstraintSubscriptionWhereInput!]
  OR: [WarehouseLocationConstraintSubscriptionWhereInput!]
  NOT: [WarehouseLocationConstraintSubscriptionWhereInput!]
}

input WarehouseLocationConstraintUpdateInput {
  category: CategoryUpdateOneRequiredInput
  limit: Int
  locations: WarehouseLocationUpdateManyWithoutConstraintsInput
}

input WarehouseLocationConstraintUpdateManyDataInput {
  limit: Int
}

input WarehouseLocationConstraintUpdateManyMutationInput {
  limit: Int
}

input WarehouseLocationConstraintUpdateManyWithoutLocationsInput {
  create: [WarehouseLocationConstraintCreateWithoutLocationsInput!]
  delete: [WarehouseLocationConstraintWhereUniqueInput!]
  connect: [WarehouseLocationConstraintWhereUniqueInput!]
  set: [WarehouseLocationConstraintWhereUniqueInput!]
  disconnect: [WarehouseLocationConstraintWhereUniqueInput!]
  update: [WarehouseLocationConstraintUpdateWithWhereUniqueWithoutLocationsInput!]
  upsert: [WarehouseLocationConstraintUpsertWithWhereUniqueWithoutLocationsInput!]
  deleteMany: [WarehouseLocationConstraintScalarWhereInput!]
  updateMany: [WarehouseLocationConstraintUpdateManyWithWhereNestedInput!]
}

input WarehouseLocationConstraintUpdateManyWithWhereNestedInput {
  where: WarehouseLocationConstraintScalarWhereInput!
  data: WarehouseLocationConstraintUpdateManyDataInput!
}

input WarehouseLocationConstraintUpdateWithoutLocationsDataInput {
  category: CategoryUpdateOneRequiredInput
  limit: Int
}

input WarehouseLocationConstraintUpdateWithWhereUniqueWithoutLocationsInput {
  where: WarehouseLocationConstraintWhereUniqueInput!
  data: WarehouseLocationConstraintUpdateWithoutLocationsDataInput!
}

input WarehouseLocationConstraintUpsertWithWhereUniqueWithoutLocationsInput {
  where: WarehouseLocationConstraintWhereUniqueInput!
  update: WarehouseLocationConstraintUpdateWithoutLocationsDataInput!
  create: WarehouseLocationConstraintCreateWithoutLocationsInput!
}

input WarehouseLocationConstraintWhereInput {
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
  category: CategoryWhereInput
  limit: Int
  limit_not: Int
  limit_in: [Int!]
  limit_not_in: [Int!]
  limit_lt: Int
  limit_lte: Int
  limit_gt: Int
  limit_gte: Int
  locations_every: WarehouseLocationWhereInput
  locations_some: WarehouseLocationWhereInput
  locations_none: WarehouseLocationWhereInput
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
  AND: [WarehouseLocationConstraintWhereInput!]
  OR: [WarehouseLocationConstraintWhereInput!]
  NOT: [WarehouseLocationConstraintWhereInput!]
}

input WarehouseLocationConstraintWhereUniqueInput {
  id: ID
}

input WarehouseLocationCreateInput {
  id: ID
  type: WarehouseLocationType!
  barcode: String!
  locationCode: String!
  itemCode: String!
  physicalProducts: PhysicalProductCreateManyWithoutWarehouseLocationInput
  constraints: WarehouseLocationConstraintCreateManyWithoutLocationsInput
}

input WarehouseLocationCreateManyWithoutConstraintsInput {
  create: [WarehouseLocationCreateWithoutConstraintsInput!]
  connect: [WarehouseLocationWhereUniqueInput!]
}

input WarehouseLocationCreateOneWithoutPhysicalProductsInput {
  create: WarehouseLocationCreateWithoutPhysicalProductsInput
  connect: WarehouseLocationWhereUniqueInput
}

input WarehouseLocationCreateWithoutConstraintsInput {
  id: ID
  type: WarehouseLocationType!
  barcode: String!
  locationCode: String!
  itemCode: String!
  physicalProducts: PhysicalProductCreateManyWithoutWarehouseLocationInput
}

input WarehouseLocationCreateWithoutPhysicalProductsInput {
  id: ID
  type: WarehouseLocationType!
  barcode: String!
  locationCode: String!
  itemCode: String!
  constraints: WarehouseLocationConstraintCreateManyWithoutLocationsInput
}

type WarehouseLocationEdge {
  node: WarehouseLocation!
  cursor: String!
}

enum WarehouseLocationOrderByInput {
  id_ASC
  id_DESC
  type_ASC
  type_DESC
  barcode_ASC
  barcode_DESC
  locationCode_ASC
  locationCode_DESC
  itemCode_ASC
  itemCode_DESC
  createdAt_ASC
  createdAt_DESC
  updatedAt_ASC
  updatedAt_DESC
}

type WarehouseLocationPreviousValues {
  id: ID!
  type: WarehouseLocationType!
  barcode: String!
  locationCode: String!
  itemCode: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input WarehouseLocationScalarWhereInput {
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
  type: WarehouseLocationType
  type_not: WarehouseLocationType
  type_in: [WarehouseLocationType!]
  type_not_in: [WarehouseLocationType!]
  barcode: String
  barcode_not: String
  barcode_in: [String!]
  barcode_not_in: [String!]
  barcode_lt: String
  barcode_lte: String
  barcode_gt: String
  barcode_gte: String
  barcode_contains: String
  barcode_not_contains: String
  barcode_starts_with: String
  barcode_not_starts_with: String
  barcode_ends_with: String
  barcode_not_ends_with: String
  locationCode: String
  locationCode_not: String
  locationCode_in: [String!]
  locationCode_not_in: [String!]
  locationCode_lt: String
  locationCode_lte: String
  locationCode_gt: String
  locationCode_gte: String
  locationCode_contains: String
  locationCode_not_contains: String
  locationCode_starts_with: String
  locationCode_not_starts_with: String
  locationCode_ends_with: String
  locationCode_not_ends_with: String
  itemCode: String
  itemCode_not: String
  itemCode_in: [String!]
  itemCode_not_in: [String!]
  itemCode_lt: String
  itemCode_lte: String
  itemCode_gt: String
  itemCode_gte: String
  itemCode_contains: String
  itemCode_not_contains: String
  itemCode_starts_with: String
  itemCode_not_starts_with: String
  itemCode_ends_with: String
  itemCode_not_ends_with: String
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
  AND: [WarehouseLocationScalarWhereInput!]
  OR: [WarehouseLocationScalarWhereInput!]
  NOT: [WarehouseLocationScalarWhereInput!]
}

type WarehouseLocationSubscriptionPayload {
  mutation: MutationType!
  node: WarehouseLocation
  updatedFields: [String!]
  previousValues: WarehouseLocationPreviousValues
}

input WarehouseLocationSubscriptionWhereInput {
  mutation_in: [MutationType!]
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  node: WarehouseLocationWhereInput
  AND: [WarehouseLocationSubscriptionWhereInput!]
  OR: [WarehouseLocationSubscriptionWhereInput!]
  NOT: [WarehouseLocationSubscriptionWhereInput!]
}

enum WarehouseLocationType {
  Conveyor
  Rail
  Bin
}

input WarehouseLocationUpdateInput {
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  physicalProducts: PhysicalProductUpdateManyWithoutWarehouseLocationInput
  constraints: WarehouseLocationConstraintUpdateManyWithoutLocationsInput
}

input WarehouseLocationUpdateManyDataInput {
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
}

input WarehouseLocationUpdateManyMutationInput {
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
}

input WarehouseLocationUpdateManyWithoutConstraintsInput {
  create: [WarehouseLocationCreateWithoutConstraintsInput!]
  delete: [WarehouseLocationWhereUniqueInput!]
  connect: [WarehouseLocationWhereUniqueInput!]
  set: [WarehouseLocationWhereUniqueInput!]
  disconnect: [WarehouseLocationWhereUniqueInput!]
  update: [WarehouseLocationUpdateWithWhereUniqueWithoutConstraintsInput!]
  upsert: [WarehouseLocationUpsertWithWhereUniqueWithoutConstraintsInput!]
  deleteMany: [WarehouseLocationScalarWhereInput!]
  updateMany: [WarehouseLocationUpdateManyWithWhereNestedInput!]
}

input WarehouseLocationUpdateManyWithWhereNestedInput {
  where: WarehouseLocationScalarWhereInput!
  data: WarehouseLocationUpdateManyDataInput!
}

input WarehouseLocationUpdateOneWithoutPhysicalProductsInput {
  create: WarehouseLocationCreateWithoutPhysicalProductsInput
  update: WarehouseLocationUpdateWithoutPhysicalProductsDataInput
  upsert: WarehouseLocationUpsertWithoutPhysicalProductsInput
  delete: Boolean
  disconnect: Boolean
  connect: WarehouseLocationWhereUniqueInput
}

input WarehouseLocationUpdateWithoutConstraintsDataInput {
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  physicalProducts: PhysicalProductUpdateManyWithoutWarehouseLocationInput
}

input WarehouseLocationUpdateWithoutPhysicalProductsDataInput {
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  constraints: WarehouseLocationConstraintUpdateManyWithoutLocationsInput
}

input WarehouseLocationUpdateWithWhereUniqueWithoutConstraintsInput {
  where: WarehouseLocationWhereUniqueInput!
  data: WarehouseLocationUpdateWithoutConstraintsDataInput!
}

input WarehouseLocationUpsertWithoutPhysicalProductsInput {
  update: WarehouseLocationUpdateWithoutPhysicalProductsDataInput!
  create: WarehouseLocationCreateWithoutPhysicalProductsInput!
}

input WarehouseLocationUpsertWithWhereUniqueWithoutConstraintsInput {
  where: WarehouseLocationWhereUniqueInput!
  update: WarehouseLocationUpdateWithoutConstraintsDataInput!
  create: WarehouseLocationCreateWithoutConstraintsInput!
}

input WarehouseLocationWhereInput {
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
  type: WarehouseLocationType
  type_not: WarehouseLocationType
  type_in: [WarehouseLocationType!]
  type_not_in: [WarehouseLocationType!]
  barcode: String
  barcode_not: String
  barcode_in: [String!]
  barcode_not_in: [String!]
  barcode_lt: String
  barcode_lte: String
  barcode_gt: String
  barcode_gte: String
  barcode_contains: String
  barcode_not_contains: String
  barcode_starts_with: String
  barcode_not_starts_with: String
  barcode_ends_with: String
  barcode_not_ends_with: String
  locationCode: String
  locationCode_not: String
  locationCode_in: [String!]
  locationCode_not_in: [String!]
  locationCode_lt: String
  locationCode_lte: String
  locationCode_gt: String
  locationCode_gte: String
  locationCode_contains: String
  locationCode_not_contains: String
  locationCode_starts_with: String
  locationCode_not_starts_with: String
  locationCode_ends_with: String
  locationCode_not_ends_with: String
  itemCode: String
  itemCode_not: String
  itemCode_in: [String!]
  itemCode_not_in: [String!]
  itemCode_lt: String
  itemCode_lte: String
  itemCode_gt: String
  itemCode_gte: String
  itemCode_contains: String
  itemCode_not_contains: String
  itemCode_starts_with: String
  itemCode_not_starts_with: String
  itemCode_ends_with: String
  itemCode_not_ends_with: String
  physicalProducts_every: PhysicalProductWhereInput
  physicalProducts_some: PhysicalProductWhereInput
  physicalProducts_none: PhysicalProductWhereInput
  constraints_every: WarehouseLocationConstraintWhereInput
  constraints_some: WarehouseLocationConstraintWhereInput
  constraints_none: WarehouseLocationConstraintWhereInput
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
  AND: [WarehouseLocationWhereInput!]
  OR: [WarehouseLocationWhereInput!]
  NOT: [WarehouseLocationWhereInput!]
}

input WarehouseLocationWhereUniqueInput {
  id: ID
  barcode: String
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

export type CustomerMembershipOrderByInput =   'id_ASC' |
  'id_DESC' |
  'subscriptionId_ASC' |
  'subscriptionId_DESC'

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

export type EmailId =   'ReservationReturnConfirmation' |
  'ReservationConfirmation' |
  'CompleteAccount' |
  'FreeToReserve' |
  'WelcomeToSeasons' |
  'ReturnReminder'

export type EmailReceiptOrderByInput =   'id_ASC' |
  'id_DESC' |
  'emailId_ASC' |
  'emailId_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

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
  'height_ASC' |
  'height_DESC' |
  'width_ASC' |
  'width_DESC' |
  'title_ASC' |
  'title_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type InventoryStatus =   'NonReservable' |
  'Reservable' |
  'Reserved' |
  'Stored' |
  'Offloaded'

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

export type PackageOrderByInput =   'id_ASC' |
  'id_DESC' |
  'transactionID_ASC' |
  'transactionID_DESC' |
  'weight_ASC' |
  'weight_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PackageTransitEventOrderByInput =   'id_ASC' |
  'id_DESC' |
  'status_ASC' |
  'status_DESC' |
  'subStatus_ASC' |
  'subStatus_DESC' |
  'data_ASC' |
  'data_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PackageTransitEventStatus =   'PreTransit' |
  'Transit' |
  'Delivered' |
  'Returned' |
  'Failure' |
  'Unknown'

export type PackageTransitEventSubStatus =   'InformationReceived' |
  'AddressIssue' |
  'ContactCarrier' |
  'Delayed' |
  'DeliveryAttempted' |
  'DeliveryRescheduled' |
  'DeliveryScheduled' |
  'LocationInaccessible' |
  'NoticeLeft' |
  'OutForDelivery' |
  'PackageAccepted' |
  'PackageArrived' |
  'PackageDamaged' |
  'PackageDeparted' |
  'PackageForwarded' |
  'PackageHeld' |
  'PackageProcessed' |
  'PackageProcessing' |
  'PickupAvailable' |
  'RescheduleDelivery' |
  'Delivered' |
  'ReturnToSender' |
  'PackageUnclaimed' |
  'PackageUndeliverable' |
  'PackageDisposed' |
  'PackageLost' |
  'Other'

export type PauseRequestOrderByInput =   'id_ASC' |
  'id_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC' |
  'pausePending_ASC' |
  'pausePending_DESC' |
  'pauseDate_ASC' |
  'pauseDate_DESC' |
  'resumeDate_ASC' |
  'resumeDate_DESC'

export type PhotographyStatus =   'Done' |
  'InProgress' |
  'ReadyForEditing' |
  'ReadyToShoot' |
  'Steam'

export type PhysicalProductInventoryStatusChangeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'old_ASC' |
  'old_DESC' |
  'new_ASC' |
  'new_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PhysicalProductOffloadMethod =   'SoldToUser' |
  'SoldToThirdParty' |
  'ReturnedToVendor' |
  'Recycled' |
  'Unknown'

export type PhysicalProductOrderByInput =   'id_ASC' |
  'id_DESC' |
  'seasonsUID_ASC' |
  'seasonsUID_DESC' |
  'inventoryStatus_ASC' |
  'inventoryStatus_DESC' |
  'productStatus_ASC' |
  'productStatus_DESC' |
  'offloadMethod_ASC' |
  'offloadMethod_DESC' |
  'offloadNotes_ASC' |
  'offloadNotes_DESC' |
  'sequenceNumber_ASC' |
  'sequenceNumber_DESC' |
  'barcoded_ASC' |
  'barcoded_DESC' |
  'dateOrdered_ASC' |
  'dateOrdered_DESC' |
  'dateReceived_ASC' |
  'dateReceived_DESC' |
  'unitCost_ASC' |
  'unitCost_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type PhysicalProductStatus =   'New' |
  'Used' |
  'Dirty' |
  'Damaged' |
  'PermanentlyDamaged' |
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

export type ProductMaterialCategoryOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'lifeExpectancy_ASC' |
  'lifeExpectancy_DESC'

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
  'modelHeight_ASC' |
  'modelHeight_DESC' |
  'retailPrice_ASC' |
  'retailPrice_DESC' |
  'status_ASC' |
  'status_DESC' |
  'season_ASC' |
  'season_DESC' |
  'architecture_ASC' |
  'architecture_DESC' |
  'photographyStatus_ASC' |
  'photographyStatus_DESC' |
  'publishedAt_ASC' |
  'publishedAt_DESC' |
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
  'NotAvailable' |
  'Stored' |
  'Offloaded'

export type ProductStatusChangeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'old_ASC' |
  'old_DESC' |
  'new_ASC' |
  'new_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

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
  'offloaded_ASC' |
  'offloaded_DESC' |
  'stored_ASC' |
  'stored_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ProductVariantWantOrderByInput =   'id_ASC' |
  'id_DESC' |
  'isFulfilled_ASC' |
  'isFulfilled_DESC'

export type PushNotificationReceiptOrderByInput =   'id_ASC' |
  'id_DESC' |
  'route_ASC' |
  'route_DESC' |
  'screen_ASC' |
  'screen_DESC' |
  'uri_ASC' |
  'uri_DESC' |
  'interest_ASC' |
  'interest_DESC' |
  'body_ASC' |
  'body_DESC' |
  'title_ASC' |
  'title_DESC' |
  'recordID_ASC' |
  'recordID_DESC' |
  'recordSlug_ASC' |
  'recordSlug_DESC' |
  'sentAt_ASC' |
  'sentAt_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

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
  'updatedAt_DESC' |
  'respondedAt_ASC' |
  'respondedAt_DESC'

export type ReservationOrderByInput =   'id_ASC' |
  'id_DESC' |
  'reservationNumber_ASC' |
  'reservationNumber_DESC' |
  'phase_ASC' |
  'phase_DESC' |
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

export type ReservationPhase =   'BusinessToCustomer' |
  'CustomerToBusiness'

export type ReservationReceiptItemOrderByInput =   'id_ASC' |
  'id_DESC' |
  'productStatus_ASC' |
  'productStatus_DESC' |
  'notes_ASC' |
  'notes_DESC'

export type ReservationReceiptOrderByInput =   'id_ASC' |
  'id_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type ReservationStatus =   'Queued' |
  'Packed' |
  'Shipped' |
  'Delivered' |
  'Completed' |
  'Cancelled' |
  'Blocked' |
  'Unknown' |
  'Received'

export type SizeOrderByInput =   'id_ASC' |
  'id_DESC' |
  'slug_ASC' |
  'slug_DESC' |
  'productType_ASC' |
  'productType_DESC' |
  'display_ASC' |
  'display_DESC'

export type TagOrderByInput =   'id_ASC' |
  'id_DESC' |
  'name_ASC' |
  'name_DESC' |
  'description_ASC' |
  'description_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

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
  'pushNotificationStatus_ASC' |
  'pushNotificationStatus_DESC'

export type UserRole =   'Admin' |
  'Customer' |
  'Partner'

export type WarehouseLocationConstraintOrderByInput =   'id_ASC' |
  'id_DESC' |
  'limit_ASC' |
  'limit_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type WarehouseLocationOrderByInput =   'id_ASC' |
  'id_DESC' |
  'type_ASC' |
  'type_DESC' |
  'barcode_ASC' |
  'barcode_DESC' |
  'locationCode_ASC' |
  'locationCode_DESC' |
  'itemCode_ASC' |
  'itemCode_DESC' |
  'createdAt_ASC' |
  'createdAt_DESC' |
  'updatedAt_ASC' |
  'updatedAt_DESC'

export type WarehouseLocationType =   'Conveyor' |
  'Rail' |
  'Bin'

export interface BagItemCreateInput {
  id?: ID_Input | null
  customer: CustomerCreateOneWithoutBagItemsInput
  productVariant: ProductVariantCreateOneInput
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

export interface BagItemCreateManyWithoutCustomerInput {
  create?: BagItemCreateWithoutCustomerInput[] | BagItemCreateWithoutCustomerInput | null
  connect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
}

export interface BagItemCreateWithoutCustomerInput {
  id?: ID_Input | null
  productVariant: ProductVariantCreateOneInput
  position?: Int | null
  saved?: Boolean | null
  status: BagItemStatus
}

export interface BagItemScalarWhereInput {
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
  AND?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  OR?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  NOT?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
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
  customer?: CustomerUpdateOneRequiredWithoutBagItemsInput | null
  productVariant?: ProductVariantUpdateOneRequiredInput | null
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
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
  delete?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  connect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  set?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  disconnect?: BagItemWhereUniqueInput[] | BagItemWhereUniqueInput | null
  update?: BagItemUpdateWithWhereUniqueWithoutCustomerInput[] | BagItemUpdateWithWhereUniqueWithoutCustomerInput | null
  upsert?: BagItemUpsertWithWhereUniqueWithoutCustomerInput[] | BagItemUpsertWithWhereUniqueWithoutCustomerInput | null
  deleteMany?: BagItemScalarWhereInput[] | BagItemScalarWhereInput | null
  updateMany?: BagItemUpdateManyWithWhereNestedInput[] | BagItemUpdateManyWithWhereNestedInput | null
}

export interface BagItemUpdateManyWithWhereNestedInput {
  where: BagItemScalarWhereInput
  data: BagItemUpdateManyDataInput
}

export interface BagItemUpdateWithoutCustomerDataInput {
  productVariant?: ProductVariantUpdateOneRequiredInput | null
  position?: Int | null
  saved?: Boolean | null
  status?: BagItemStatus | null
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
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: BottomSizeWhereInput | null
  AND?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
  OR?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
  NOT?: BottomSizeSubscriptionWhereInput[] | BottomSizeSubscriptionWhereInput | null
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
  update?: BottomSizeUpdateDataInput | null
  upsert?: BottomSizeUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: BottomSizeWhereUniqueInput | null
}

export interface BottomSizeUpsertNestedInput {
  update: BottomSizeUpdateDataInput
  create: BottomSizeCreateInput
}

export interface BottomSizeWhereInput {
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
  AND?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
  OR?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
  NOT?: BottomSizeWhereInput[] | BottomSizeWhereInput | null
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

export interface CategoryCreateOneInput {
  create?: CategoryCreateInput | null
  connect?: CategoryWhereUniqueInput | null
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

export interface CategoryUpdateDataInput {
  slug?: String | null
  name?: String | null
  image?: Json | null
  description?: String | null
  visible?: Boolean | null
  products?: ProductUpdateManyWithoutCategoryInput | null
  children?: CategoryUpdateManyWithoutChildrenInput | null
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

export interface CategoryUpdateOneRequiredInput {
  create?: CategoryCreateInput | null
  update?: CategoryUpdateDataInput | null
  upsert?: CategoryUpsertNestedInput | null
  connect?: CategoryWhereUniqueInput | null
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

export interface CategoryUpsertNestedInput {
  update: CategoryUpdateDataInput
  create: CategoryCreateInput
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
  membership?: CustomerMembershipCreateOneWithoutCustomerInput | null
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

export interface CustomerCreateOneWithoutMembershipInput {
  create?: CustomerCreateWithoutMembershipInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateOneWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerCreateWithoutBagItemsInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  status?: CustomerStatus | null
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  plan?: Plan | null
  membership?: CustomerMembershipCreateOneWithoutCustomerInput | null
  reservations?: ReservationCreateManyWithoutCustomerInput | null
}

export interface CustomerCreateWithoutMembershipInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  status?: CustomerStatus | null
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  plan?: Plan | null
  bagItems?: BagItemCreateManyWithoutCustomerInput | null
  reservations?: ReservationCreateManyWithoutCustomerInput | null
}

export interface CustomerCreateWithoutReservationsInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  status?: CustomerStatus | null
  detail?: CustomerDetailCreateOneInput | null
  billingInfo?: BillingInfoCreateOneInput | null
  plan?: Plan | null
  membership?: CustomerMembershipCreateOneWithoutCustomerInput | null
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
  shippingAddress?: LocationCreateOneInput | null
  phoneOS?: String | null
  insureShipment?: Boolean | null
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
  insureShipment?: Boolean | null
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
  insureShipment?: Boolean | null
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
  AND?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  OR?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
  NOT?: CustomerDetailWhereInput[] | CustomerDetailWhereInput | null
}

export interface CustomerDetailWhereUniqueInput {
  id?: ID_Input | null
}

export interface CustomerMembershipCreateInput {
  id?: ID_Input | null
  subscriptionId: String
  customer: CustomerCreateOneWithoutMembershipInput
  pauseRequests?: PauseRequestCreateManyWithoutMembershipInput | null
}

export interface CustomerMembershipCreateOneWithoutCustomerInput {
  create?: CustomerMembershipCreateWithoutCustomerInput | null
  connect?: CustomerMembershipWhereUniqueInput | null
}

export interface CustomerMembershipCreateOneWithoutPauseRequestsInput {
  create?: CustomerMembershipCreateWithoutPauseRequestsInput | null
  connect?: CustomerMembershipWhereUniqueInput | null
}

export interface CustomerMembershipCreateWithoutCustomerInput {
  id?: ID_Input | null
  subscriptionId: String
  pauseRequests?: PauseRequestCreateManyWithoutMembershipInput | null
}

export interface CustomerMembershipCreateWithoutPauseRequestsInput {
  id?: ID_Input | null
  subscriptionId: String
  customer: CustomerCreateOneWithoutMembershipInput
}

export interface CustomerMembershipSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: CustomerMembershipWhereInput | null
  AND?: CustomerMembershipSubscriptionWhereInput[] | CustomerMembershipSubscriptionWhereInput | null
  OR?: CustomerMembershipSubscriptionWhereInput[] | CustomerMembershipSubscriptionWhereInput | null
  NOT?: CustomerMembershipSubscriptionWhereInput[] | CustomerMembershipSubscriptionWhereInput | null
}

export interface CustomerMembershipUpdateInput {
  subscriptionId?: String | null
  customer?: CustomerUpdateOneRequiredWithoutMembershipInput | null
  pauseRequests?: PauseRequestUpdateManyWithoutMembershipInput | null
}

export interface CustomerMembershipUpdateManyMutationInput {
  subscriptionId?: String | null
}

export interface CustomerMembershipUpdateOneRequiredWithoutPauseRequestsInput {
  create?: CustomerMembershipCreateWithoutPauseRequestsInput | null
  update?: CustomerMembershipUpdateWithoutPauseRequestsDataInput | null
  upsert?: CustomerMembershipUpsertWithoutPauseRequestsInput | null
  connect?: CustomerMembershipWhereUniqueInput | null
}

export interface CustomerMembershipUpdateOneWithoutCustomerInput {
  create?: CustomerMembershipCreateWithoutCustomerInput | null
  update?: CustomerMembershipUpdateWithoutCustomerDataInput | null
  upsert?: CustomerMembershipUpsertWithoutCustomerInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: CustomerMembershipWhereUniqueInput | null
}

export interface CustomerMembershipUpdateWithoutCustomerDataInput {
  subscriptionId?: String | null
  pauseRequests?: PauseRequestUpdateManyWithoutMembershipInput | null
}

export interface CustomerMembershipUpdateWithoutPauseRequestsDataInput {
  subscriptionId?: String | null
  customer?: CustomerUpdateOneRequiredWithoutMembershipInput | null
}

export interface CustomerMembershipUpsertWithoutCustomerInput {
  update: CustomerMembershipUpdateWithoutCustomerDataInput
  create: CustomerMembershipCreateWithoutCustomerInput
}

export interface CustomerMembershipUpsertWithoutPauseRequestsInput {
  update: CustomerMembershipUpdateWithoutPauseRequestsDataInput
  create: CustomerMembershipCreateWithoutPauseRequestsInput
}

export interface CustomerMembershipWhereInput {
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
  subscriptionId?: String | null
  subscriptionId_not?: String | null
  subscriptionId_in?: String[] | String | null
  subscriptionId_not_in?: String[] | String | null
  subscriptionId_lt?: String | null
  subscriptionId_lte?: String | null
  subscriptionId_gt?: String | null
  subscriptionId_gte?: String | null
  subscriptionId_contains?: String | null
  subscriptionId_not_contains?: String | null
  subscriptionId_starts_with?: String | null
  subscriptionId_not_starts_with?: String | null
  subscriptionId_ends_with?: String | null
  subscriptionId_not_ends_with?: String | null
  customer?: CustomerWhereInput | null
  pauseRequests_every?: PauseRequestWhereInput | null
  pauseRequests_some?: PauseRequestWhereInput | null
  pauseRequests_none?: PauseRequestWhereInput | null
  AND?: CustomerMembershipWhereInput[] | CustomerMembershipWhereInput | null
  OR?: CustomerMembershipWhereInput[] | CustomerMembershipWhereInput | null
  NOT?: CustomerMembershipWhereInput[] | CustomerMembershipWhereInput | null
}

export interface CustomerMembershipWhereUniqueInput {
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
  membership?: CustomerMembershipUpdateOneWithoutCustomerInput | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  membership?: CustomerMembershipUpdateOneWithoutCustomerInput | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
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

export interface CustomerUpdateOneRequiredWithoutBagItemsInput {
  create?: CustomerCreateWithoutBagItemsInput | null
  update?: CustomerUpdateWithoutBagItemsDataInput | null
  upsert?: CustomerUpsertWithoutBagItemsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerUpdateOneRequiredWithoutMembershipInput {
  create?: CustomerCreateWithoutMembershipInput | null
  update?: CustomerUpdateWithoutMembershipDataInput | null
  upsert?: CustomerUpsertWithoutMembershipInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerUpdateOneRequiredWithoutReservationsInput {
  create?: CustomerCreateWithoutReservationsInput | null
  update?: CustomerUpdateWithoutReservationsDataInput | null
  upsert?: CustomerUpsertWithoutReservationsInput | null
  connect?: CustomerWhereUniqueInput | null
}

export interface CustomerUpdateWithoutBagItemsDataInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  membership?: CustomerMembershipUpdateOneWithoutCustomerInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateWithoutMembershipDataInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  bagItems?: BagItemUpdateManyWithoutCustomerInput | null
  reservations?: ReservationUpdateManyWithoutCustomerInput | null
}

export interface CustomerUpdateWithoutReservationsDataInput {
  user?: UserUpdateOneRequiredInput | null
  status?: CustomerStatus | null
  detail?: CustomerDetailUpdateOneInput | null
  billingInfo?: BillingInfoUpdateOneInput | null
  plan?: Plan | null
  membership?: CustomerMembershipUpdateOneWithoutCustomerInput | null
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

export interface CustomerUpsertWithoutMembershipInput {
  update: CustomerUpdateWithoutMembershipDataInput
  create: CustomerCreateWithoutMembershipInput
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
  membership?: CustomerMembershipWhereInput | null
  bagItems_every?: BagItemWhereInput | null
  bagItems_some?: BagItemWhereInput | null
  bagItems_none?: BagItemWhereInput | null
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

export interface EmailReceiptCreateInput {
  id?: ID_Input | null
  emailId: EmailId
  user: UserCreateOneInput
}

export interface EmailReceiptSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: EmailReceiptWhereInput | null
  AND?: EmailReceiptSubscriptionWhereInput[] | EmailReceiptSubscriptionWhereInput | null
  OR?: EmailReceiptSubscriptionWhereInput[] | EmailReceiptSubscriptionWhereInput | null
  NOT?: EmailReceiptSubscriptionWhereInput[] | EmailReceiptSubscriptionWhereInput | null
}

export interface EmailReceiptUpdateInput {
  emailId?: EmailId | null
  user?: UserUpdateOneRequiredInput | null
}

export interface EmailReceiptUpdateManyMutationInput {
  emailId?: EmailId | null
}

export interface EmailReceiptWhereInput {
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
  emailId?: EmailId | null
  emailId_not?: EmailId | null
  emailId_in?: EmailId[] | EmailId | null
  emailId_not_in?: EmailId[] | EmailId | null
  user?: UserWhereInput | null
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
  AND?: EmailReceiptWhereInput[] | EmailReceiptWhereInput | null
  OR?: EmailReceiptWhereInput[] | EmailReceiptWhereInput | null
  NOT?: EmailReceiptWhereInput[] | EmailReceiptWhereInput | null
}

export interface EmailReceiptWhereUniqueInput {
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
  url: String
  height?: Int | null
  width?: Int | null
  title?: String | null
}

export interface ImageCreateManyInput {
  create?: ImageCreateInput[] | ImageCreateInput | null
  connect?: ImageWhereUniqueInput[] | ImageWhereUniqueInput | null
}

export interface ImageScalarWhereInput {
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
  height?: Int | null
  height_not?: Int | null
  height_in?: Int[] | Int | null
  height_not_in?: Int[] | Int | null
  height_lt?: Int | null
  height_lte?: Int | null
  height_gt?: Int | null
  height_gte?: Int | null
  width?: Int | null
  width_not?: Int | null
  width_in?: Int[] | Int | null
  width_not_in?: Int[] | Int | null
  width_lt?: Int | null
  width_lte?: Int | null
  width_gt?: Int | null
  width_gte?: Int | null
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
  AND?: ImageScalarWhereInput[] | ImageScalarWhereInput | null
  OR?: ImageScalarWhereInput[] | ImageScalarWhereInput | null
  NOT?: ImageScalarWhereInput[] | ImageScalarWhereInput | null
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

export interface ImageUpdateDataInput {
  caption?: String | null
  url?: String | null
  height?: Int | null
  width?: Int | null
  title?: String | null
}

export interface ImageUpdateInput {
  caption?: String | null
  url?: String | null
  height?: Int | null
  width?: Int | null
  title?: String | null
}

export interface ImageUpdateManyDataInput {
  caption?: String | null
  url?: String | null
  height?: Int | null
  width?: Int | null
  title?: String | null
}

export interface ImageUpdateManyInput {
  create?: ImageCreateInput[] | ImageCreateInput | null
  update?: ImageUpdateWithWhereUniqueNestedInput[] | ImageUpdateWithWhereUniqueNestedInput | null
  upsert?: ImageUpsertWithWhereUniqueNestedInput[] | ImageUpsertWithWhereUniqueNestedInput | null
  delete?: ImageWhereUniqueInput[] | ImageWhereUniqueInput | null
  connect?: ImageWhereUniqueInput[] | ImageWhereUniqueInput | null
  set?: ImageWhereUniqueInput[] | ImageWhereUniqueInput | null
  disconnect?: ImageWhereUniqueInput[] | ImageWhereUniqueInput | null
  deleteMany?: ImageScalarWhereInput[] | ImageScalarWhereInput | null
  updateMany?: ImageUpdateManyWithWhereNestedInput[] | ImageUpdateManyWithWhereNestedInput | null
}

export interface ImageUpdateManyMutationInput {
  caption?: String | null
  url?: String | null
  height?: Int | null
  width?: Int | null
  title?: String | null
}

export interface ImageUpdateManyWithWhereNestedInput {
  where: ImageScalarWhereInput
  data: ImageUpdateManyDataInput
}

export interface ImageUpdateWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput
  data: ImageUpdateDataInput
}

export interface ImageUpsertWithWhereUniqueNestedInput {
  where: ImageWhereUniqueInput
  update: ImageUpdateDataInput
  create: ImageCreateInput
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
  height?: Int | null
  height_not?: Int | null
  height_in?: Int[] | Int | null
  height_not_in?: Int[] | Int | null
  height_lt?: Int | null
  height_lte?: Int | null
  height_gt?: Int | null
  height_gte?: Int | null
  width?: Int | null
  width_not?: Int | null
  width_in?: Int[] | Int | null
  width_not_in?: Int[] | Int | null
  width_lt?: Int | null
  width_lte?: Int | null
  width_gt?: Int | null
  width_gte?: Int | null
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
  url?: String | null
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

export interface LocationUpdateOneWithoutPhysicalProductsInput {
  create?: LocationCreateWithoutPhysicalProductsInput | null
  update?: LocationUpdateWithoutPhysicalProductsDataInput | null
  upsert?: LocationUpsertWithoutPhysicalProductsInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
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

export interface PackageCreateInput {
  id?: ID_Input | null
  items?: PhysicalProductCreateManyInput | null
  transactionID: String
  shippingLabel: LabelCreateOneInput
  fromAddress: LocationCreateOneInput
  toAddress: LocationCreateOneInput
  weight?: Float | null
  events?: PackageTransitEventCreateManyInput | null
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

export interface PackageTransitEventCreateInput {
  id?: ID_Input | null
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
}

export interface PackageTransitEventCreateManyInput {
  create?: PackageTransitEventCreateInput[] | PackageTransitEventCreateInput | null
  connect?: PackageTransitEventWhereUniqueInput[] | PackageTransitEventWhereUniqueInput | null
}

export interface PackageTransitEventScalarWhereInput {
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
  status?: PackageTransitEventStatus | null
  status_not?: PackageTransitEventStatus | null
  status_in?: PackageTransitEventStatus[] | PackageTransitEventStatus | null
  status_not_in?: PackageTransitEventStatus[] | PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  subStatus_not?: PackageTransitEventSubStatus | null
  subStatus_in?: PackageTransitEventSubStatus[] | PackageTransitEventSubStatus | null
  subStatus_not_in?: PackageTransitEventSubStatus[] | PackageTransitEventSubStatus | null
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
  AND?: PackageTransitEventScalarWhereInput[] | PackageTransitEventScalarWhereInput | null
  OR?: PackageTransitEventScalarWhereInput[] | PackageTransitEventScalarWhereInput | null
  NOT?: PackageTransitEventScalarWhereInput[] | PackageTransitEventScalarWhereInput | null
}

export interface PackageTransitEventSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PackageTransitEventWhereInput | null
  AND?: PackageTransitEventSubscriptionWhereInput[] | PackageTransitEventSubscriptionWhereInput | null
  OR?: PackageTransitEventSubscriptionWhereInput[] | PackageTransitEventSubscriptionWhereInput | null
  NOT?: PackageTransitEventSubscriptionWhereInput[] | PackageTransitEventSubscriptionWhereInput | null
}

export interface PackageTransitEventUpdateDataInput {
  status?: PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  data?: Json | null
}

export interface PackageTransitEventUpdateInput {
  status?: PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  data?: Json | null
}

export interface PackageTransitEventUpdateManyDataInput {
  status?: PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  data?: Json | null
}

export interface PackageTransitEventUpdateManyInput {
  create?: PackageTransitEventCreateInput[] | PackageTransitEventCreateInput | null
  update?: PackageTransitEventUpdateWithWhereUniqueNestedInput[] | PackageTransitEventUpdateWithWhereUniqueNestedInput | null
  upsert?: PackageTransitEventUpsertWithWhereUniqueNestedInput[] | PackageTransitEventUpsertWithWhereUniqueNestedInput | null
  delete?: PackageTransitEventWhereUniqueInput[] | PackageTransitEventWhereUniqueInput | null
  connect?: PackageTransitEventWhereUniqueInput[] | PackageTransitEventWhereUniqueInput | null
  set?: PackageTransitEventWhereUniqueInput[] | PackageTransitEventWhereUniqueInput | null
  disconnect?: PackageTransitEventWhereUniqueInput[] | PackageTransitEventWhereUniqueInput | null
  deleteMany?: PackageTransitEventScalarWhereInput[] | PackageTransitEventScalarWhereInput | null
  updateMany?: PackageTransitEventUpdateManyWithWhereNestedInput[] | PackageTransitEventUpdateManyWithWhereNestedInput | null
}

export interface PackageTransitEventUpdateManyMutationInput {
  status?: PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  data?: Json | null
}

export interface PackageTransitEventUpdateManyWithWhereNestedInput {
  where: PackageTransitEventScalarWhereInput
  data: PackageTransitEventUpdateManyDataInput
}

export interface PackageTransitEventUpdateWithWhereUniqueNestedInput {
  where: PackageTransitEventWhereUniqueInput
  data: PackageTransitEventUpdateDataInput
}

export interface PackageTransitEventUpsertWithWhereUniqueNestedInput {
  where: PackageTransitEventWhereUniqueInput
  update: PackageTransitEventUpdateDataInput
  create: PackageTransitEventCreateInput
}

export interface PackageTransitEventWhereInput {
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
  status?: PackageTransitEventStatus | null
  status_not?: PackageTransitEventStatus | null
  status_in?: PackageTransitEventStatus[] | PackageTransitEventStatus | null
  status_not_in?: PackageTransitEventStatus[] | PackageTransitEventStatus | null
  subStatus?: PackageTransitEventSubStatus | null
  subStatus_not?: PackageTransitEventSubStatus | null
  subStatus_in?: PackageTransitEventSubStatus[] | PackageTransitEventSubStatus | null
  subStatus_not_in?: PackageTransitEventSubStatus[] | PackageTransitEventSubStatus | null
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
  AND?: PackageTransitEventWhereInput[] | PackageTransitEventWhereInput | null
  OR?: PackageTransitEventWhereInput[] | PackageTransitEventWhereInput | null
  NOT?: PackageTransitEventWhereInput[] | PackageTransitEventWhereInput | null
}

export interface PackageTransitEventWhereUniqueInput {
  id?: ID_Input | null
}

export interface PackageUpdateDataInput {
  items?: PhysicalProductUpdateManyInput | null
  transactionID?: String | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
  weight?: Float | null
  events?: PackageTransitEventUpdateManyInput | null
}

export interface PackageUpdateInput {
  items?: PhysicalProductUpdateManyInput | null
  transactionID?: String | null
  shippingLabel?: LabelUpdateOneRequiredInput | null
  fromAddress?: LocationUpdateOneRequiredInput | null
  toAddress?: LocationUpdateOneRequiredInput | null
  weight?: Float | null
  events?: PackageTransitEventUpdateManyInput | null
}

export interface PackageUpdateManyMutationInput {
  transactionID?: String | null
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
  transactionID?: String | null
  transactionID_not?: String | null
  transactionID_in?: String[] | String | null
  transactionID_not_in?: String[] | String | null
  transactionID_lt?: String | null
  transactionID_lte?: String | null
  transactionID_gt?: String | null
  transactionID_gte?: String | null
  transactionID_contains?: String | null
  transactionID_not_contains?: String | null
  transactionID_starts_with?: String | null
  transactionID_not_starts_with?: String | null
  transactionID_ends_with?: String | null
  transactionID_not_ends_with?: String | null
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
  events_every?: PackageTransitEventWhereInput | null
  events_some?: PackageTransitEventWhereInput | null
  events_none?: PackageTransitEventWhereInput | null
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

export interface PauseRequestCreateInput {
  id?: ID_Input | null
  pausePending: Boolean
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
  membership: CustomerMembershipCreateOneWithoutPauseRequestsInput
}

export interface PauseRequestCreateManyWithoutMembershipInput {
  create?: PauseRequestCreateWithoutMembershipInput[] | PauseRequestCreateWithoutMembershipInput | null
  connect?: PauseRequestWhereUniqueInput[] | PauseRequestWhereUniqueInput | null
}

export interface PauseRequestCreateWithoutMembershipInput {
  id?: ID_Input | null
  pausePending: Boolean
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
}

export interface PauseRequestScalarWhereInput {
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
  pausePending?: Boolean | null
  pausePending_not?: Boolean | null
  pauseDate?: DateTime | null
  pauseDate_not?: DateTime | null
  pauseDate_in?: DateTime[] | DateTime | null
  pauseDate_not_in?: DateTime[] | DateTime | null
  pauseDate_lt?: DateTime | null
  pauseDate_lte?: DateTime | null
  pauseDate_gt?: DateTime | null
  pauseDate_gte?: DateTime | null
  resumeDate?: DateTime | null
  resumeDate_not?: DateTime | null
  resumeDate_in?: DateTime[] | DateTime | null
  resumeDate_not_in?: DateTime[] | DateTime | null
  resumeDate_lt?: DateTime | null
  resumeDate_lte?: DateTime | null
  resumeDate_gt?: DateTime | null
  resumeDate_gte?: DateTime | null
  AND?: PauseRequestScalarWhereInput[] | PauseRequestScalarWhereInput | null
  OR?: PauseRequestScalarWhereInput[] | PauseRequestScalarWhereInput | null
  NOT?: PauseRequestScalarWhereInput[] | PauseRequestScalarWhereInput | null
}

export interface PauseRequestSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PauseRequestWhereInput | null
  AND?: PauseRequestSubscriptionWhereInput[] | PauseRequestSubscriptionWhereInput | null
  OR?: PauseRequestSubscriptionWhereInput[] | PauseRequestSubscriptionWhereInput | null
  NOT?: PauseRequestSubscriptionWhereInput[] | PauseRequestSubscriptionWhereInput | null
}

export interface PauseRequestUpdateInput {
  pausePending?: Boolean | null
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
  membership?: CustomerMembershipUpdateOneRequiredWithoutPauseRequestsInput | null
}

export interface PauseRequestUpdateManyDataInput {
  pausePending?: Boolean | null
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
}

export interface PauseRequestUpdateManyMutationInput {
  pausePending?: Boolean | null
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
}

export interface PauseRequestUpdateManyWithoutMembershipInput {
  create?: PauseRequestCreateWithoutMembershipInput[] | PauseRequestCreateWithoutMembershipInput | null
  delete?: PauseRequestWhereUniqueInput[] | PauseRequestWhereUniqueInput | null
  connect?: PauseRequestWhereUniqueInput[] | PauseRequestWhereUniqueInput | null
  set?: PauseRequestWhereUniqueInput[] | PauseRequestWhereUniqueInput | null
  disconnect?: PauseRequestWhereUniqueInput[] | PauseRequestWhereUniqueInput | null
  update?: PauseRequestUpdateWithWhereUniqueWithoutMembershipInput[] | PauseRequestUpdateWithWhereUniqueWithoutMembershipInput | null
  upsert?: PauseRequestUpsertWithWhereUniqueWithoutMembershipInput[] | PauseRequestUpsertWithWhereUniqueWithoutMembershipInput | null
  deleteMany?: PauseRequestScalarWhereInput[] | PauseRequestScalarWhereInput | null
  updateMany?: PauseRequestUpdateManyWithWhereNestedInput[] | PauseRequestUpdateManyWithWhereNestedInput | null
}

export interface PauseRequestUpdateManyWithWhereNestedInput {
  where: PauseRequestScalarWhereInput
  data: PauseRequestUpdateManyDataInput
}

export interface PauseRequestUpdateWithoutMembershipDataInput {
  pausePending?: Boolean | null
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
}

export interface PauseRequestUpdateWithWhereUniqueWithoutMembershipInput {
  where: PauseRequestWhereUniqueInput
  data: PauseRequestUpdateWithoutMembershipDataInput
}

export interface PauseRequestUpsertWithWhereUniqueWithoutMembershipInput {
  where: PauseRequestWhereUniqueInput
  update: PauseRequestUpdateWithoutMembershipDataInput
  create: PauseRequestCreateWithoutMembershipInput
}

export interface PauseRequestWhereInput {
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
  pausePending?: Boolean | null
  pausePending_not?: Boolean | null
  pauseDate?: DateTime | null
  pauseDate_not?: DateTime | null
  pauseDate_in?: DateTime[] | DateTime | null
  pauseDate_not_in?: DateTime[] | DateTime | null
  pauseDate_lt?: DateTime | null
  pauseDate_lte?: DateTime | null
  pauseDate_gt?: DateTime | null
  pauseDate_gte?: DateTime | null
  resumeDate?: DateTime | null
  resumeDate_not?: DateTime | null
  resumeDate_in?: DateTime[] | DateTime | null
  resumeDate_not_in?: DateTime[] | DateTime | null
  resumeDate_lt?: DateTime | null
  resumeDate_lte?: DateTime | null
  resumeDate_gt?: DateTime | null
  resumeDate_gte?: DateTime | null
  membership?: CustomerMembershipWhereInput | null
  AND?: PauseRequestWhereInput[] | PauseRequestWhereInput | null
  OR?: PauseRequestWhereInput[] | PauseRequestWhereInput | null
  NOT?: PauseRequestWhereInput[] | PauseRequestWhereInput | null
}

export interface PauseRequestWhereUniqueInput {
  id?: ID_Input | null
}

export interface PhysicalProductCreateInput {
  id?: ID_Input | null
  seasonsUID: String
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput | null
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  warehouseLocation?: WarehouseLocationCreateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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

export interface PhysicalProductCreateManyWithoutWarehouseLocationInput {
  create?: PhysicalProductCreateWithoutWarehouseLocationInput[] | PhysicalProductCreateWithoutWarehouseLocationInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateOneInput {
  create?: PhysicalProductCreateInput | null
  connect?: PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateOneWithoutInventoryStatusChangesInput {
  create?: PhysicalProductCreateWithoutInventoryStatusChangesInput | null
  connect?: PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductCreateWithoutInventoryStatusChangesInput {
  id?: ID_Input | null
  seasonsUID: String
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  warehouseLocation?: WarehouseLocationCreateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductCreateWithoutLocationInput {
  id?: ID_Input | null
  seasonsUID: String
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput | null
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  warehouseLocation?: WarehouseLocationCreateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductCreateWithoutProductVariantInput {
  id?: ID_Input | null
  seasonsUID: String
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
  inventoryStatus: InventoryStatus
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput | null
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  warehouseLocation?: WarehouseLocationCreateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductCreateWithoutWarehouseLocationInput {
  id?: ID_Input | null
  seasonsUID: String
  location?: LocationCreateOneWithoutPhysicalProductsInput | null
  productVariant: ProductVariantCreateOneWithoutPhysicalProductsInput
  inventoryStatus: InventoryStatus
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput | null
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductInventoryStatusChangeCreateInput {
  id?: ID_Input | null
  old: InventoryStatus
  new: InventoryStatus
  physicalProduct: PhysicalProductCreateOneWithoutInventoryStatusChangesInput
}

export interface PhysicalProductInventoryStatusChangeCreateManyWithoutPhysicalProductInput {
  create?: PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput[] | PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput | null
  connect?: PhysicalProductInventoryStatusChangeWhereUniqueInput[] | PhysicalProductInventoryStatusChangeWhereUniqueInput | null
}

export interface PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput {
  id?: ID_Input | null
  old: InventoryStatus
  new: InventoryStatus
}

export interface PhysicalProductInventoryStatusChangeScalarWhereInput {
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
  old?: InventoryStatus | null
  old_not?: InventoryStatus | null
  old_in?: InventoryStatus[] | InventoryStatus | null
  old_not_in?: InventoryStatus[] | InventoryStatus | null
  new?: InventoryStatus | null
  new_not?: InventoryStatus | null
  new_in?: InventoryStatus[] | InventoryStatus | null
  new_not_in?: InventoryStatus[] | InventoryStatus | null
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
  AND?: PhysicalProductInventoryStatusChangeScalarWhereInput[] | PhysicalProductInventoryStatusChangeScalarWhereInput | null
  OR?: PhysicalProductInventoryStatusChangeScalarWhereInput[] | PhysicalProductInventoryStatusChangeScalarWhereInput | null
  NOT?: PhysicalProductInventoryStatusChangeScalarWhereInput[] | PhysicalProductInventoryStatusChangeScalarWhereInput | null
}

export interface PhysicalProductInventoryStatusChangeSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PhysicalProductInventoryStatusChangeWhereInput | null
  AND?: PhysicalProductInventoryStatusChangeSubscriptionWhereInput[] | PhysicalProductInventoryStatusChangeSubscriptionWhereInput | null
  OR?: PhysicalProductInventoryStatusChangeSubscriptionWhereInput[] | PhysicalProductInventoryStatusChangeSubscriptionWhereInput | null
  NOT?: PhysicalProductInventoryStatusChangeSubscriptionWhereInput[] | PhysicalProductInventoryStatusChangeSubscriptionWhereInput | null
}

export interface PhysicalProductInventoryStatusChangeUpdateInput {
  old?: InventoryStatus | null
  new?: InventoryStatus | null
  physicalProduct?: PhysicalProductUpdateOneRequiredWithoutInventoryStatusChangesInput | null
}

export interface PhysicalProductInventoryStatusChangeUpdateManyDataInput {
  old?: InventoryStatus | null
  new?: InventoryStatus | null
}

export interface PhysicalProductInventoryStatusChangeUpdateManyMutationInput {
  old?: InventoryStatus | null
  new?: InventoryStatus | null
}

export interface PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput {
  create?: PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput[] | PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput | null
  delete?: PhysicalProductInventoryStatusChangeWhereUniqueInput[] | PhysicalProductInventoryStatusChangeWhereUniqueInput | null
  connect?: PhysicalProductInventoryStatusChangeWhereUniqueInput[] | PhysicalProductInventoryStatusChangeWhereUniqueInput | null
  set?: PhysicalProductInventoryStatusChangeWhereUniqueInput[] | PhysicalProductInventoryStatusChangeWhereUniqueInput | null
  disconnect?: PhysicalProductInventoryStatusChangeWhereUniqueInput[] | PhysicalProductInventoryStatusChangeWhereUniqueInput | null
  update?: PhysicalProductInventoryStatusChangeUpdateWithWhereUniqueWithoutPhysicalProductInput[] | PhysicalProductInventoryStatusChangeUpdateWithWhereUniqueWithoutPhysicalProductInput | null
  upsert?: PhysicalProductInventoryStatusChangeUpsertWithWhereUniqueWithoutPhysicalProductInput[] | PhysicalProductInventoryStatusChangeUpsertWithWhereUniqueWithoutPhysicalProductInput | null
  deleteMany?: PhysicalProductInventoryStatusChangeScalarWhereInput[] | PhysicalProductInventoryStatusChangeScalarWhereInput | null
  updateMany?: PhysicalProductInventoryStatusChangeUpdateManyWithWhereNestedInput[] | PhysicalProductInventoryStatusChangeUpdateManyWithWhereNestedInput | null
}

export interface PhysicalProductInventoryStatusChangeUpdateManyWithWhereNestedInput {
  where: PhysicalProductInventoryStatusChangeScalarWhereInput
  data: PhysicalProductInventoryStatusChangeUpdateManyDataInput
}

export interface PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput {
  old?: InventoryStatus | null
  new?: InventoryStatus | null
}

export interface PhysicalProductInventoryStatusChangeUpdateWithWhereUniqueWithoutPhysicalProductInput {
  where: PhysicalProductInventoryStatusChangeWhereUniqueInput
  data: PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput
}

export interface PhysicalProductInventoryStatusChangeUpsertWithWhereUniqueWithoutPhysicalProductInput {
  where: PhysicalProductInventoryStatusChangeWhereUniqueInput
  update: PhysicalProductInventoryStatusChangeUpdateWithoutPhysicalProductDataInput
  create: PhysicalProductInventoryStatusChangeCreateWithoutPhysicalProductInput
}

export interface PhysicalProductInventoryStatusChangeWhereInput {
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
  old?: InventoryStatus | null
  old_not?: InventoryStatus | null
  old_in?: InventoryStatus[] | InventoryStatus | null
  old_not_in?: InventoryStatus[] | InventoryStatus | null
  new?: InventoryStatus | null
  new_not?: InventoryStatus | null
  new_in?: InventoryStatus[] | InventoryStatus | null
  new_not_in?: InventoryStatus[] | InventoryStatus | null
  physicalProduct?: PhysicalProductWhereInput | null
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
  AND?: PhysicalProductInventoryStatusChangeWhereInput[] | PhysicalProductInventoryStatusChangeWhereInput | null
  OR?: PhysicalProductInventoryStatusChangeWhereInput[] | PhysicalProductInventoryStatusChangeWhereInput | null
  NOT?: PhysicalProductInventoryStatusChangeWhereInput[] | PhysicalProductInventoryStatusChangeWhereInput | null
}

export interface PhysicalProductInventoryStatusChangeWhereUniqueInput {
  id?: ID_Input | null
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
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadMethod_not?: PhysicalProductOffloadMethod | null
  offloadMethod_in?: PhysicalProductOffloadMethod[] | PhysicalProductOffloadMethod | null
  offloadMethod_not_in?: PhysicalProductOffloadMethod[] | PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  offloadNotes_not?: String | null
  offloadNotes_in?: String[] | String | null
  offloadNotes_not_in?: String[] | String | null
  offloadNotes_lt?: String | null
  offloadNotes_lte?: String | null
  offloadNotes_gt?: String | null
  offloadNotes_gte?: String | null
  offloadNotes_contains?: String | null
  offloadNotes_not_contains?: String | null
  offloadNotes_starts_with?: String | null
  offloadNotes_not_starts_with?: String | null
  offloadNotes_ends_with?: String | null
  offloadNotes_not_ends_with?: String | null
  sequenceNumber?: Int | null
  sequenceNumber_not?: Int | null
  sequenceNumber_in?: Int[] | Int | null
  sequenceNumber_not_in?: Int[] | Int | null
  sequenceNumber_lt?: Int | null
  sequenceNumber_lte?: Int | null
  sequenceNumber_gt?: Int | null
  sequenceNumber_gte?: Int | null
  barcoded?: Boolean | null
  barcoded_not?: Boolean | null
  dateOrdered?: DateTime | null
  dateOrdered_not?: DateTime | null
  dateOrdered_in?: DateTime[] | DateTime | null
  dateOrdered_not_in?: DateTime[] | DateTime | null
  dateOrdered_lt?: DateTime | null
  dateOrdered_lte?: DateTime | null
  dateOrdered_gt?: DateTime | null
  dateOrdered_gte?: DateTime | null
  dateReceived?: DateTime | null
  dateReceived_not?: DateTime | null
  dateReceived_in?: DateTime[] | DateTime | null
  dateReceived_not_in?: DateTime[] | DateTime | null
  dateReceived_lt?: DateTime | null
  dateReceived_lte?: DateTime | null
  dateReceived_gt?: DateTime | null
  dateReceived_gte?: DateTime | null
  unitCost?: Float | null
  unitCost_not?: Float | null
  unitCost_in?: Float[] | Float | null
  unitCost_not_in?: Float[] | Float | null
  unitCost_lt?: Float | null
  unitCost_lte?: Float | null
  unitCost_gt?: Float | null
  unitCost_gte?: Float | null
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
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  warehouseLocation?: WarehouseLocationUpdateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductUpdateInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  warehouseLocation?: WarehouseLocationUpdateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductUpdateManyDataInput {
  seasonsUID?: String | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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

export interface PhysicalProductUpdateManyWithoutWarehouseLocationInput {
  create?: PhysicalProductCreateWithoutWarehouseLocationInput[] | PhysicalProductCreateWithoutWarehouseLocationInput | null
  delete?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  connect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  set?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  disconnect?: PhysicalProductWhereUniqueInput[] | PhysicalProductWhereUniqueInput | null
  update?: PhysicalProductUpdateWithWhereUniqueWithoutWarehouseLocationInput[] | PhysicalProductUpdateWithWhereUniqueWithoutWarehouseLocationInput | null
  upsert?: PhysicalProductUpsertWithWhereUniqueWithoutWarehouseLocationInput[] | PhysicalProductUpsertWithWhereUniqueWithoutWarehouseLocationInput | null
  deleteMany?: PhysicalProductScalarWhereInput[] | PhysicalProductScalarWhereInput | null
  updateMany?: PhysicalProductUpdateManyWithWhereNestedInput[] | PhysicalProductUpdateManyWithWhereNestedInput | null
}

export interface PhysicalProductUpdateManyWithWhereNestedInput {
  where: PhysicalProductScalarWhereInput
  data: PhysicalProductUpdateManyDataInput
}

export interface PhysicalProductUpdateOneRequiredInput {
  create?: PhysicalProductCreateInput | null
  update?: PhysicalProductUpdateDataInput | null
  upsert?: PhysicalProductUpsertNestedInput | null
  connect?: PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductUpdateOneRequiredWithoutInventoryStatusChangesInput {
  create?: PhysicalProductCreateWithoutInventoryStatusChangesInput | null
  update?: PhysicalProductUpdateWithoutInventoryStatusChangesDataInput | null
  upsert?: PhysicalProductUpsertWithoutInventoryStatusChangesInput | null
  connect?: PhysicalProductWhereUniqueInput | null
}

export interface PhysicalProductUpdateWithoutInventoryStatusChangesDataInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  warehouseLocation?: WarehouseLocationUpdateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductUpdateWithoutLocationDataInput {
  seasonsUID?: String | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  warehouseLocation?: WarehouseLocationUpdateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductUpdateWithoutProductVariantDataInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  warehouseLocation?: WarehouseLocationUpdateOneWithoutPhysicalProductsInput | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
}

export interface PhysicalProductUpdateWithoutWarehouseLocationDataInput {
  seasonsUID?: String | null
  location?: LocationUpdateOneWithoutPhysicalProductsInput | null
  productVariant?: ProductVariantUpdateOneRequiredWithoutPhysicalProductsInput | null
  inventoryStatus?: InventoryStatus | null
  inventoryStatusChanges?: PhysicalProductInventoryStatusChangeUpdateManyWithoutPhysicalProductInput | null
  productStatus?: PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber?: Int | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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

export interface PhysicalProductUpdateWithWhereUniqueWithoutWarehouseLocationInput {
  where: PhysicalProductWhereUniqueInput
  data: PhysicalProductUpdateWithoutWarehouseLocationDataInput
}

export interface PhysicalProductUpsertNestedInput {
  update: PhysicalProductUpdateDataInput
  create: PhysicalProductCreateInput
}

export interface PhysicalProductUpsertWithoutInventoryStatusChangesInput {
  update: PhysicalProductUpdateWithoutInventoryStatusChangesDataInput
  create: PhysicalProductCreateWithoutInventoryStatusChangesInput
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

export interface PhysicalProductUpsertWithWhereUniqueWithoutWarehouseLocationInput {
  where: PhysicalProductWhereUniqueInput
  update: PhysicalProductUpdateWithoutWarehouseLocationDataInput
  create: PhysicalProductCreateWithoutWarehouseLocationInput
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
  inventoryStatusChanges_every?: PhysicalProductInventoryStatusChangeWhereInput | null
  inventoryStatusChanges_some?: PhysicalProductInventoryStatusChangeWhereInput | null
  inventoryStatusChanges_none?: PhysicalProductInventoryStatusChangeWhereInput | null
  productStatus?: PhysicalProductStatus | null
  productStatus_not?: PhysicalProductStatus | null
  productStatus_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  productStatus_not_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadMethod_not?: PhysicalProductOffloadMethod | null
  offloadMethod_in?: PhysicalProductOffloadMethod[] | PhysicalProductOffloadMethod | null
  offloadMethod_not_in?: PhysicalProductOffloadMethod[] | PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  offloadNotes_not?: String | null
  offloadNotes_in?: String[] | String | null
  offloadNotes_not_in?: String[] | String | null
  offloadNotes_lt?: String | null
  offloadNotes_lte?: String | null
  offloadNotes_gt?: String | null
  offloadNotes_gte?: String | null
  offloadNotes_contains?: String | null
  offloadNotes_not_contains?: String | null
  offloadNotes_starts_with?: String | null
  offloadNotes_not_starts_with?: String | null
  offloadNotes_ends_with?: String | null
  offloadNotes_not_ends_with?: String | null
  sequenceNumber?: Int | null
  sequenceNumber_not?: Int | null
  sequenceNumber_in?: Int[] | Int | null
  sequenceNumber_not_in?: Int[] | Int | null
  sequenceNumber_lt?: Int | null
  sequenceNumber_lte?: Int | null
  sequenceNumber_gt?: Int | null
  sequenceNumber_gte?: Int | null
  warehouseLocation?: WarehouseLocationWhereInput | null
  barcoded?: Boolean | null
  barcoded_not?: Boolean | null
  dateOrdered?: DateTime | null
  dateOrdered_not?: DateTime | null
  dateOrdered_in?: DateTime[] | DateTime | null
  dateOrdered_not_in?: DateTime[] | DateTime | null
  dateOrdered_lt?: DateTime | null
  dateOrdered_lte?: DateTime | null
  dateOrdered_gt?: DateTime | null
  dateOrdered_gte?: DateTime | null
  dateReceived?: DateTime | null
  dateReceived_not?: DateTime | null
  dateReceived_in?: DateTime[] | DateTime | null
  dateReceived_not_in?: DateTime[] | DateTime | null
  dateReceived_lt?: DateTime | null
  dateReceived_lte?: DateTime | null
  dateReceived_gt?: DateTime | null
  dateReceived_gte?: DateTime | null
  unitCost?: Float | null
  unitCost_not?: Float | null
  unitCost_in?: Float[] | Float | null
  unitCost_not_in?: Float[] | Float | null
  unitCost_lt?: Float | null
  unitCost_lte?: Float | null
  unitCost_gt?: Float | null
  unitCost_gte?: Float | null
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

export interface ProductCreateinnerMaterialsInput {
  set?: String[] | String | null
}

export interface ProductCreateInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductCreateManyWithoutMaterialCategoryInput {
  create?: ProductCreateWithoutMaterialCategoryInput[] | ProductCreateWithoutMaterialCategoryInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateManyWithoutModelInput {
  create?: ProductCreateWithoutModelInput[] | ProductCreateWithoutModelInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateManyWithoutTagsInput {
  create?: ProductCreateWithoutTagsInput[] | ProductCreateWithoutTagsInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
}

export interface ProductCreateOneInput {
  create?: ProductCreateInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductCreateOneWithoutStatusChangesInput {
  create?: ProductCreateWithoutStatusChangesInput | null
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
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutCategoryInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutMaterialCategoryInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutModelInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutStatusChangesInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutTagsInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  variants?: ProductVariantCreateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductCreateWithoutVariantsInput {
  id?: ID_Input | null
  slug: String
  name: String
  brand: BrandCreateOneWithoutProductsInput
  category: CategoryCreateOneWithoutProductsInput
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageCreateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelCreateOneWithoutProductsInput | null
  modelSize?: SizeCreateOneInput | null
  color: ColorCreateOneInput
  secondaryColor?: ColorCreateOneInput | null
  tags?: TagCreateManyWithoutProductsInput | null
  functions?: ProductFunctionCreateManyInput | null
  materialCategory?: ProductMaterialCategoryCreateOneWithoutProductsInput | null
  innerMaterials?: ProductCreateinnerMaterialsInput | null
  outerMaterials?: ProductCreateouterMaterialsInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeCreateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductMaterialCategoryCreateInput {
  id?: ID_Input | null
  slug: String
  lifeExpectancy: Float
  category: CategoryCreateOneInput
  products?: ProductCreateManyWithoutMaterialCategoryInput | null
}

export interface ProductMaterialCategoryCreateOneWithoutProductsInput {
  create?: ProductMaterialCategoryCreateWithoutProductsInput | null
  connect?: ProductMaterialCategoryWhereUniqueInput | null
}

export interface ProductMaterialCategoryCreateWithoutProductsInput {
  id?: ID_Input | null
  slug: String
  lifeExpectancy: Float
  category: CategoryCreateOneInput
}

export interface ProductMaterialCategorySubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductMaterialCategoryWhereInput | null
  AND?: ProductMaterialCategorySubscriptionWhereInput[] | ProductMaterialCategorySubscriptionWhereInput | null
  OR?: ProductMaterialCategorySubscriptionWhereInput[] | ProductMaterialCategorySubscriptionWhereInput | null
  NOT?: ProductMaterialCategorySubscriptionWhereInput[] | ProductMaterialCategorySubscriptionWhereInput | null
}

export interface ProductMaterialCategoryUpdateInput {
  slug?: String | null
  lifeExpectancy?: Float | null
  category?: CategoryUpdateOneRequiredInput | null
  products?: ProductUpdateManyWithoutMaterialCategoryInput | null
}

export interface ProductMaterialCategoryUpdateManyMutationInput {
  slug?: String | null
  lifeExpectancy?: Float | null
}

export interface ProductMaterialCategoryUpdateOneWithoutProductsInput {
  create?: ProductMaterialCategoryCreateWithoutProductsInput | null
  update?: ProductMaterialCategoryUpdateWithoutProductsDataInput | null
  upsert?: ProductMaterialCategoryUpsertWithoutProductsInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: ProductMaterialCategoryWhereUniqueInput | null
}

export interface ProductMaterialCategoryUpdateWithoutProductsDataInput {
  slug?: String | null
  lifeExpectancy?: Float | null
  category?: CategoryUpdateOneRequiredInput | null
}

export interface ProductMaterialCategoryUpsertWithoutProductsInput {
  update: ProductMaterialCategoryUpdateWithoutProductsDataInput
  create: ProductMaterialCategoryCreateWithoutProductsInput
}

export interface ProductMaterialCategoryWhereInput {
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
  lifeExpectancy?: Float | null
  lifeExpectancy_not?: Float | null
  lifeExpectancy_in?: Float[] | Float | null
  lifeExpectancy_not_in?: Float[] | Float | null
  lifeExpectancy_lt?: Float | null
  lifeExpectancy_lte?: Float | null
  lifeExpectancy_gt?: Float | null
  lifeExpectancy_gte?: Float | null
  category?: CategoryWhereInput | null
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
  AND?: ProductMaterialCategoryWhereInput[] | ProductMaterialCategoryWhereInput | null
  OR?: ProductMaterialCategoryWhereInput[] | ProductMaterialCategoryWhereInput | null
  NOT?: ProductMaterialCategoryWhereInput[] | ProductMaterialCategoryWhereInput | null
}

export interface ProductMaterialCategoryWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
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
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductModelWhereInput | null
  AND?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
  OR?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
  NOT?: ProductModelSubscriptionWhereInput[] | ProductModelSubscriptionWhereInput | null
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
  update?: ProductModelUpdateWithoutProductsDataInput | null
  upsert?: ProductModelUpsertWithoutProductsInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: ProductModelWhereUniqueInput | null
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
  AND?: ProductModelWhereInput[] | ProductModelWhereInput | null
  OR?: ProductModelWhereInput[] | ProductModelWhereInput | null
  NOT?: ProductModelWhereInput[] | ProductModelWhereInput | null
}

export interface ProductModelWhereUniqueInput {
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
  photographyStatus?: PhotographyStatus | null
  photographyStatus_not?: PhotographyStatus | null
  photographyStatus_in?: PhotographyStatus[] | PhotographyStatus | null
  photographyStatus_not_in?: PhotographyStatus[] | PhotographyStatus | null
  publishedAt?: DateTime | null
  publishedAt_not?: DateTime | null
  publishedAt_in?: DateTime[] | DateTime | null
  publishedAt_not_in?: DateTime[] | DateTime | null
  publishedAt_lt?: DateTime | null
  publishedAt_lte?: DateTime | null
  publishedAt_gt?: DateTime | null
  publishedAt_gte?: DateTime | null
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

export interface ProductStatusChangeCreateInput {
  id?: ID_Input | null
  old: ProductStatus
  new: ProductStatus
  product: ProductCreateOneWithoutStatusChangesInput
}

export interface ProductStatusChangeCreateManyWithoutProductInput {
  create?: ProductStatusChangeCreateWithoutProductInput[] | ProductStatusChangeCreateWithoutProductInput | null
  connect?: ProductStatusChangeWhereUniqueInput[] | ProductStatusChangeWhereUniqueInput | null
}

export interface ProductStatusChangeCreateWithoutProductInput {
  id?: ID_Input | null
  old: ProductStatus
  new: ProductStatus
}

export interface ProductStatusChangeScalarWhereInput {
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
  old?: ProductStatus | null
  old_not?: ProductStatus | null
  old_in?: ProductStatus[] | ProductStatus | null
  old_not_in?: ProductStatus[] | ProductStatus | null
  new?: ProductStatus | null
  new_not?: ProductStatus | null
  new_in?: ProductStatus[] | ProductStatus | null
  new_not_in?: ProductStatus[] | ProductStatus | null
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
  AND?: ProductStatusChangeScalarWhereInput[] | ProductStatusChangeScalarWhereInput | null
  OR?: ProductStatusChangeScalarWhereInput[] | ProductStatusChangeScalarWhereInput | null
  NOT?: ProductStatusChangeScalarWhereInput[] | ProductStatusChangeScalarWhereInput | null
}

export interface ProductStatusChangeSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductStatusChangeWhereInput | null
  AND?: ProductStatusChangeSubscriptionWhereInput[] | ProductStatusChangeSubscriptionWhereInput | null
  OR?: ProductStatusChangeSubscriptionWhereInput[] | ProductStatusChangeSubscriptionWhereInput | null
  NOT?: ProductStatusChangeSubscriptionWhereInput[] | ProductStatusChangeSubscriptionWhereInput | null
}

export interface ProductStatusChangeUpdateInput {
  old?: ProductStatus | null
  new?: ProductStatus | null
  product?: ProductUpdateOneRequiredWithoutStatusChangesInput | null
}

export interface ProductStatusChangeUpdateManyDataInput {
  old?: ProductStatus | null
  new?: ProductStatus | null
}

export interface ProductStatusChangeUpdateManyMutationInput {
  old?: ProductStatus | null
  new?: ProductStatus | null
}

export interface ProductStatusChangeUpdateManyWithoutProductInput {
  create?: ProductStatusChangeCreateWithoutProductInput[] | ProductStatusChangeCreateWithoutProductInput | null
  delete?: ProductStatusChangeWhereUniqueInput[] | ProductStatusChangeWhereUniqueInput | null
  connect?: ProductStatusChangeWhereUniqueInput[] | ProductStatusChangeWhereUniqueInput | null
  set?: ProductStatusChangeWhereUniqueInput[] | ProductStatusChangeWhereUniqueInput | null
  disconnect?: ProductStatusChangeWhereUniqueInput[] | ProductStatusChangeWhereUniqueInput | null
  update?: ProductStatusChangeUpdateWithWhereUniqueWithoutProductInput[] | ProductStatusChangeUpdateWithWhereUniqueWithoutProductInput | null
  upsert?: ProductStatusChangeUpsertWithWhereUniqueWithoutProductInput[] | ProductStatusChangeUpsertWithWhereUniqueWithoutProductInput | null
  deleteMany?: ProductStatusChangeScalarWhereInput[] | ProductStatusChangeScalarWhereInput | null
  updateMany?: ProductStatusChangeUpdateManyWithWhereNestedInput[] | ProductStatusChangeUpdateManyWithWhereNestedInput | null
}

export interface ProductStatusChangeUpdateManyWithWhereNestedInput {
  where: ProductStatusChangeScalarWhereInput
  data: ProductStatusChangeUpdateManyDataInput
}

export interface ProductStatusChangeUpdateWithoutProductDataInput {
  old?: ProductStatus | null
  new?: ProductStatus | null
}

export interface ProductStatusChangeUpdateWithWhereUniqueWithoutProductInput {
  where: ProductStatusChangeWhereUniqueInput
  data: ProductStatusChangeUpdateWithoutProductDataInput
}

export interface ProductStatusChangeUpsertWithWhereUniqueWithoutProductInput {
  where: ProductStatusChangeWhereUniqueInput
  update: ProductStatusChangeUpdateWithoutProductDataInput
  create: ProductStatusChangeCreateWithoutProductInput
}

export interface ProductStatusChangeWhereInput {
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
  old?: ProductStatus | null
  old_not?: ProductStatus | null
  old_in?: ProductStatus[] | ProductStatus | null
  old_not_in?: ProductStatus[] | ProductStatus | null
  new?: ProductStatus | null
  new_not?: ProductStatus | null
  new_in?: ProductStatus[] | ProductStatus | null
  new_not_in?: ProductStatus[] | ProductStatus | null
  product?: ProductWhereInput | null
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
  AND?: ProductStatusChangeWhereInput[] | ProductStatusChangeWhereInput | null
  OR?: ProductStatusChangeWhereInput[] | ProductStatusChangeWhereInput | null
  NOT?: ProductStatusChangeWhereInput[] | ProductStatusChangeWhereInput | null
}

export interface ProductStatusChangeWhereUniqueInput {
  id?: ID_Input | null
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

export interface ProductUpdateDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateinnerMaterialsInput {
  set?: String[] | String | null
}

export interface ProductUpdateInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateManyDataInput {
  slug?: String | null
  name?: String | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductUpdateManyWithoutMaterialCategoryInput {
  create?: ProductCreateWithoutMaterialCategoryInput[] | ProductCreateWithoutMaterialCategoryInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutMaterialCategoryInput[] | ProductUpdateWithWhereUniqueWithoutMaterialCategoryInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutMaterialCategoryInput[] | ProductUpsertWithWhereUniqueWithoutMaterialCategoryInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyWithoutModelInput {
  create?: ProductCreateWithoutModelInput[] | ProductCreateWithoutModelInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutModelInput[] | ProductUpdateWithWhereUniqueWithoutModelInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutModelInput[] | ProductUpsertWithWhereUniqueWithoutModelInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyWithoutTagsInput {
  create?: ProductCreateWithoutTagsInput[] | ProductCreateWithoutTagsInput | null
  delete?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  connect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  set?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  disconnect?: ProductWhereUniqueInput[] | ProductWhereUniqueInput | null
  update?: ProductUpdateWithWhereUniqueWithoutTagsInput[] | ProductUpdateWithWhereUniqueWithoutTagsInput | null
  upsert?: ProductUpsertWithWhereUniqueWithoutTagsInput[] | ProductUpsertWithWhereUniqueWithoutTagsInput | null
  deleteMany?: ProductScalarWhereInput[] | ProductScalarWhereInput | null
  updateMany?: ProductUpdateManyWithWhereNestedInput[] | ProductUpdateManyWithWhereNestedInput | null
}

export interface ProductUpdateManyWithWhereNestedInput {
  where: ProductScalarWhereInput
  data: ProductUpdateManyDataInput
}

export interface ProductUpdateOneRequiredInput {
  create?: ProductCreateInput | null
  update?: ProductUpdateDataInput | null
  upsert?: ProductUpsertNestedInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductUpdateOneRequiredWithoutStatusChangesInput {
  create?: ProductCreateWithoutStatusChangesInput | null
  update?: ProductUpdateWithoutStatusChangesDataInput | null
  upsert?: ProductUpsertWithoutStatusChangesInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductUpdateOneRequiredWithoutVariantsInput {
  create?: ProductCreateWithoutVariantsInput | null
  update?: ProductUpdateWithoutVariantsDataInput | null
  upsert?: ProductUpsertWithoutVariantsInput | null
  connect?: ProductWhereUniqueInput | null
}

export interface ProductUpdateouterMaterialsInput {
  set?: String[] | String | null
}

export interface ProductUpdateWithoutBrandDataInput {
  slug?: String | null
  name?: String | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutCategoryDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutMaterialCategoryDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutModelDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutStatusChangesDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutTagsDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  variants?: ProductVariantUpdateManyWithoutProductInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
}

export interface ProductUpdateWithoutVariantsDataInput {
  slug?: String | null
  name?: String | null
  brand?: BrandUpdateOneRequiredWithoutProductsInput | null
  category?: CategoryUpdateOneRequiredWithoutProductsInput | null
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: ImageUpdateManyInput | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModelUpdateOneWithoutProductsInput | null
  modelSize?: SizeUpdateOneInput | null
  color?: ColorUpdateOneRequiredInput | null
  secondaryColor?: ColorUpdateOneInput | null
  tags?: TagUpdateManyWithoutProductsInput | null
  functions?: ProductFunctionUpdateManyInput | null
  materialCategory?: ProductMaterialCategoryUpdateOneWithoutProductsInput | null
  innerMaterials?: ProductUpdateinnerMaterialsInput | null
  outerMaterials?: ProductUpdateouterMaterialsInput | null
  status?: ProductStatus | null
  statusChanges?: ProductStatusChangeUpdateManyWithoutProductInput | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductUpdateWithWhereUniqueWithoutMaterialCategoryInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutMaterialCategoryDataInput
}

export interface ProductUpdateWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutModelDataInput
}

export interface ProductUpdateWithWhereUniqueWithoutTagsInput {
  where: ProductWhereUniqueInput
  data: ProductUpdateWithoutTagsDataInput
}

export interface ProductUpsertNestedInput {
  update: ProductUpdateDataInput
  create: ProductCreateInput
}

export interface ProductUpsertWithoutStatusChangesInput {
  update: ProductUpdateWithoutStatusChangesDataInput
  create: ProductCreateWithoutStatusChangesInput
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

export interface ProductUpsertWithWhereUniqueWithoutMaterialCategoryInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutMaterialCategoryDataInput
  create: ProductCreateWithoutMaterialCategoryInput
}

export interface ProductUpsertWithWhereUniqueWithoutModelInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutModelDataInput
  create: ProductCreateWithoutModelInput
}

export interface ProductUpsertWithWhereUniqueWithoutTagsInput {
  where: ProductWhereUniqueInput
  update: ProductUpdateWithoutTagsDataInput
  create: ProductCreateWithoutTagsInput
}

export interface ProductVariantCreateInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
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
  offloaded: Int
  stored: Int
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
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
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
  offloaded: Int
  stored: Int
}

export interface ProductVariantCreateWithoutPhysicalProductsInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  weight?: Float | null
  height?: Float | null
  productID: String
  product: ProductCreateOneWithoutVariantsInput
  retailPrice?: Float | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  offloaded: Int
  stored: Int
}

export interface ProductVariantCreateWithoutProductInput {
  id?: ID_Input | null
  sku?: String | null
  color: ColorCreateOneWithoutProductVariantsInput
  internalSize?: SizeCreateOneInput | null
  manufacturerSizes?: SizeCreateManyInput | null
  weight?: Float | null
  height?: Float | null
  productID: String
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductCreateManyWithoutProductVariantInput | null
  total: Int
  reservable: Int
  reserved: Int
  nonReservable: Int
  offloaded: Int
  stored: Int
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
  options?: ProductVariantFeedbackQuestionCreateoptionsInput | null
  question: String
  responses?: ProductVariantFeedbackQuestionCreateresponsesInput | null
  type: QuestionType
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
  options?: ProductVariantFeedbackQuestionCreateoptionsInput | null
  question: String
  responses?: ProductVariantFeedbackQuestionCreateresponsesInput | null
  type: QuestionType
}

export interface ProductVariantFeedbackQuestionScalarWhereInput {
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
  AND?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  OR?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  NOT?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
}

export interface ProductVariantFeedbackQuestionSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantFeedbackQuestionWhereInput | null
  AND?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
  OR?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
  NOT?: ProductVariantFeedbackQuestionSubscriptionWhereInput[] | ProductVariantFeedbackQuestionSubscriptionWhereInput | null
}

export interface ProductVariantFeedbackQuestionUpdateInput {
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  question?: String | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
  type?: QuestionType | null
  variantFeedback?: ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput | null
}

export interface ProductVariantFeedbackQuestionUpdateManyDataInput {
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  question?: String | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
  type?: QuestionType | null
}

export interface ProductVariantFeedbackQuestionUpdateManyMutationInput {
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  question?: String | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
  type?: QuestionType | null
}

export interface ProductVariantFeedbackQuestionUpdateManyWithoutVariantFeedbackInput {
  create?: ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionCreateWithoutVariantFeedbackInput | null
  delete?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  connect?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  set?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  disconnect?: ProductVariantFeedbackQuestionWhereUniqueInput[] | ProductVariantFeedbackQuestionWhereUniqueInput | null
  update?: ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionUpdateWithWhereUniqueWithoutVariantFeedbackInput | null
  upsert?: ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput[] | ProductVariantFeedbackQuestionUpsertWithWhereUniqueWithoutVariantFeedbackInput | null
  deleteMany?: ProductVariantFeedbackQuestionScalarWhereInput[] | ProductVariantFeedbackQuestionScalarWhereInput | null
  updateMany?: ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput[] | ProductVariantFeedbackQuestionUpdateManyWithWhereNestedInput | null
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
  options?: ProductVariantFeedbackQuestionUpdateoptionsInput | null
  question?: String | null
  responses?: ProductVariantFeedbackQuestionUpdateresponsesInput | null
  type?: QuestionType | null
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
  AND?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
  OR?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
  NOT?: ProductVariantFeedbackQuestionWhereInput[] | ProductVariantFeedbackQuestionWhereInput | null
}

export interface ProductVariantFeedbackQuestionWhereUniqueInput {
  id?: ID_Input | null
}

export interface ProductVariantFeedbackScalarWhereInput {
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
  AND?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  OR?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  NOT?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
}

export interface ProductVariantFeedbackSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantFeedbackWhereInput | null
  AND?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
  OR?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
  NOT?: ProductVariantFeedbackSubscriptionWhereInput[] | ProductVariantFeedbackSubscriptionWhereInput | null
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
  delete?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  set?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  disconnect?: ProductVariantFeedbackWhereUniqueInput[] | ProductVariantFeedbackWhereUniqueInput | null
  update?: ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput[] | ProductVariantFeedbackUpdateWithWhereUniqueWithoutReservationFeedbackInput | null
  upsert?: ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput[] | ProductVariantFeedbackUpsertWithWhereUniqueWithoutReservationFeedbackInput | null
  deleteMany?: ProductVariantFeedbackScalarWhereInput[] | ProductVariantFeedbackScalarWhereInput | null
  updateMany?: ProductVariantFeedbackUpdateManyWithWhereNestedInput[] | ProductVariantFeedbackUpdateManyWithWhereNestedInput | null
}

export interface ProductVariantFeedbackUpdateManyWithWhereNestedInput {
  where: ProductVariantFeedbackScalarWhereInput
  data: ProductVariantFeedbackUpdateManyDataInput
}

export interface ProductVariantFeedbackUpdateOneRequiredWithoutQuestionsInput {
  create?: ProductVariantFeedbackCreateWithoutQuestionsInput | null
  update?: ProductVariantFeedbackUpdateWithoutQuestionsDataInput | null
  upsert?: ProductVariantFeedbackUpsertWithoutQuestionsInput | null
  connect?: ProductVariantFeedbackWhereUniqueInput | null
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
  AND?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
  OR?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
  NOT?: ProductVariantFeedbackWhereInput[] | ProductVariantFeedbackWhereInput | null
}

export interface ProductVariantFeedbackWhereUniqueInput {
  id?: ID_Input | null
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
  offloaded?: Int | null
  offloaded_not?: Int | null
  offloaded_in?: Int[] | Int | null
  offloaded_not_in?: Int[] | Int | null
  offloaded_lt?: Int | null
  offloaded_lte?: Int | null
  offloaded_gt?: Int | null
  offloaded_gte?: Int | null
  stored?: Int | null
  stored_not?: Int | null
  stored_in?: Int[] | Int | null
  stored_not_in?: Int[] | Int | null
  stored_lt?: Int | null
  stored_lte?: Int | null
  stored_gt?: Int | null
  stored_gte?: Int | null
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
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
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
  offloaded?: Int | null
  stored?: Int | null
}

export interface ProductVariantUpdateInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
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
  offloaded?: Int | null
  stored?: Int | null
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
  offloaded?: Int | null
  stored?: Int | null
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
  offloaded?: Int | null
  stored?: Int | null
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
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
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
  offloaded?: Int | null
  stored?: Int | null
}

export interface ProductVariantUpdateWithoutPhysicalProductsDataInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  product?: ProductUpdateOneRequiredWithoutVariantsInput | null
  retailPrice?: Float | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  offloaded?: Int | null
  stored?: Int | null
}

export interface ProductVariantUpdateWithoutProductDataInput {
  sku?: String | null
  color?: ColorUpdateOneRequiredWithoutProductVariantsInput | null
  internalSize?: SizeUpdateOneInput | null
  manufacturerSizes?: SizeUpdateManyInput | null
  weight?: Float | null
  height?: Float | null
  productID?: String | null
  retailPrice?: Float | null
  physicalProducts?: PhysicalProductUpdateManyWithoutProductVariantInput | null
  total?: Int | null
  reservable?: Int | null
  reserved?: Int | null
  nonReservable?: Int | null
  offloaded?: Int | null
  stored?: Int | null
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
  productVariant: ProductVariantCreateOneInput
  user: UserCreateOneInput
  isFulfilled: Boolean
}

export interface ProductVariantWantSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ProductVariantWantWhereInput | null
  AND?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
  OR?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
  NOT?: ProductVariantWantSubscriptionWhereInput[] | ProductVariantWantSubscriptionWhereInput | null
}

export interface ProductVariantWantUpdateInput {
  productVariant?: ProductVariantUpdateOneRequiredInput | null
  user?: UserUpdateOneRequiredInput | null
  isFulfilled?: Boolean | null
}

export interface ProductVariantWantUpdateManyMutationInput {
  isFulfilled?: Boolean | null
}

export interface ProductVariantWantWhereInput {
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
  productVariant?: ProductVariantWhereInput | null
  user?: UserWhereInput | null
  isFulfilled?: Boolean | null
  isFulfilled_not?: Boolean | null
  AND?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
  OR?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
  NOT?: ProductVariantWantWhereInput[] | ProductVariantWantWhereInput | null
}

export interface ProductVariantWantWhereUniqueInput {
  id?: ID_Input | null
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
  internalSize?: SizeWhereInput | null
  manufacturerSizes_every?: SizeWhereInput | null
  manufacturerSizes_some?: SizeWhereInput | null
  manufacturerSizes_none?: SizeWhereInput | null
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
  offloaded?: Int | null
  offloaded_not?: Int | null
  offloaded_in?: Int[] | Int | null
  offloaded_not_in?: Int[] | Int | null
  offloaded_lt?: Int | null
  offloaded_lte?: Int | null
  offloaded_gt?: Int | null
  offloaded_gte?: Int | null
  stored?: Int | null
  stored_not?: Int | null
  stored_in?: Int[] | Int | null
  stored_not_in?: Int[] | Int | null
  stored_lt?: Int | null
  stored_lte?: Int | null
  stored_gt?: Int | null
  stored_gte?: Int | null
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
  images_every?: ImageWhereInput | null
  images_some?: ImageWhereInput | null
  images_none?: ImageWhereInput | null
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
  model?: ProductModelWhereInput | null
  modelSize?: SizeWhereInput | null
  color?: ColorWhereInput | null
  secondaryColor?: ColorWhereInput | null
  tags_every?: TagWhereInput | null
  tags_some?: TagWhereInput | null
  tags_none?: TagWhereInput | null
  functions_every?: ProductFunctionWhereInput | null
  functions_some?: ProductFunctionWhereInput | null
  functions_none?: ProductFunctionWhereInput | null
  materialCategory?: ProductMaterialCategoryWhereInput | null
  variants_every?: ProductVariantWhereInput | null
  variants_some?: ProductVariantWhereInput | null
  variants_none?: ProductVariantWhereInput | null
  status?: ProductStatus | null
  status_not?: ProductStatus | null
  status_in?: ProductStatus[] | ProductStatus | null
  status_not_in?: ProductStatus[] | ProductStatus | null
  statusChanges_every?: ProductStatusChangeWhereInput | null
  statusChanges_some?: ProductStatusChangeWhereInput | null
  statusChanges_none?: ProductStatusChangeWhereInput | null
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
  photographyStatus?: PhotographyStatus | null
  photographyStatus_not?: PhotographyStatus | null
  photographyStatus_in?: PhotographyStatus[] | PhotographyStatus | null
  photographyStatus_not_in?: PhotographyStatus[] | PhotographyStatus | null
  publishedAt?: DateTime | null
  publishedAt_not?: DateTime | null
  publishedAt_in?: DateTime[] | DateTime | null
  publishedAt_not_in?: DateTime[] | DateTime | null
  publishedAt_lt?: DateTime | null
  publishedAt_lte?: DateTime | null
  publishedAt_gt?: DateTime | null
  publishedAt_gte?: DateTime | null
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

export interface PushNotificationReceiptCreateInput {
  id?: ID_Input | null
  route?: String | null
  screen?: String | null
  uri?: String | null
  users?: UserCreateManyWithoutPushNotificationsInput | null
  interest?: String | null
  body: String
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt: DateTime
}

export interface PushNotificationReceiptCreateManyWithoutUsersInput {
  create?: PushNotificationReceiptCreateWithoutUsersInput[] | PushNotificationReceiptCreateWithoutUsersInput | null
  connect?: PushNotificationReceiptWhereUniqueInput[] | PushNotificationReceiptWhereUniqueInput | null
}

export interface PushNotificationReceiptCreateWithoutUsersInput {
  id?: ID_Input | null
  route?: String | null
  screen?: String | null
  uri?: String | null
  interest?: String | null
  body: String
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt: DateTime
}

export interface PushNotificationReceiptScalarWhereInput {
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
  route?: String | null
  route_not?: String | null
  route_in?: String[] | String | null
  route_not_in?: String[] | String | null
  route_lt?: String | null
  route_lte?: String | null
  route_gt?: String | null
  route_gte?: String | null
  route_contains?: String | null
  route_not_contains?: String | null
  route_starts_with?: String | null
  route_not_starts_with?: String | null
  route_ends_with?: String | null
  route_not_ends_with?: String | null
  screen?: String | null
  screen_not?: String | null
  screen_in?: String[] | String | null
  screen_not_in?: String[] | String | null
  screen_lt?: String | null
  screen_lte?: String | null
  screen_gt?: String | null
  screen_gte?: String | null
  screen_contains?: String | null
  screen_not_contains?: String | null
  screen_starts_with?: String | null
  screen_not_starts_with?: String | null
  screen_ends_with?: String | null
  screen_not_ends_with?: String | null
  uri?: String | null
  uri_not?: String | null
  uri_in?: String[] | String | null
  uri_not_in?: String[] | String | null
  uri_lt?: String | null
  uri_lte?: String | null
  uri_gt?: String | null
  uri_gte?: String | null
  uri_contains?: String | null
  uri_not_contains?: String | null
  uri_starts_with?: String | null
  uri_not_starts_with?: String | null
  uri_ends_with?: String | null
  uri_not_ends_with?: String | null
  interest?: String | null
  interest_not?: String | null
  interest_in?: String[] | String | null
  interest_not_in?: String[] | String | null
  interest_lt?: String | null
  interest_lte?: String | null
  interest_gt?: String | null
  interest_gte?: String | null
  interest_contains?: String | null
  interest_not_contains?: String | null
  interest_starts_with?: String | null
  interest_not_starts_with?: String | null
  interest_ends_with?: String | null
  interest_not_ends_with?: String | null
  body?: String | null
  body_not?: String | null
  body_in?: String[] | String | null
  body_not_in?: String[] | String | null
  body_lt?: String | null
  body_lte?: String | null
  body_gt?: String | null
  body_gte?: String | null
  body_contains?: String | null
  body_not_contains?: String | null
  body_starts_with?: String | null
  body_not_starts_with?: String | null
  body_ends_with?: String | null
  body_not_ends_with?: String | null
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
  recordID?: String | null
  recordID_not?: String | null
  recordID_in?: String[] | String | null
  recordID_not_in?: String[] | String | null
  recordID_lt?: String | null
  recordID_lte?: String | null
  recordID_gt?: String | null
  recordID_gte?: String | null
  recordID_contains?: String | null
  recordID_not_contains?: String | null
  recordID_starts_with?: String | null
  recordID_not_starts_with?: String | null
  recordID_ends_with?: String | null
  recordID_not_ends_with?: String | null
  recordSlug?: String | null
  recordSlug_not?: String | null
  recordSlug_in?: String[] | String | null
  recordSlug_not_in?: String[] | String | null
  recordSlug_lt?: String | null
  recordSlug_lte?: String | null
  recordSlug_gt?: String | null
  recordSlug_gte?: String | null
  recordSlug_contains?: String | null
  recordSlug_not_contains?: String | null
  recordSlug_starts_with?: String | null
  recordSlug_not_starts_with?: String | null
  recordSlug_ends_with?: String | null
  recordSlug_not_ends_with?: String | null
  sentAt?: DateTime | null
  sentAt_not?: DateTime | null
  sentAt_in?: DateTime[] | DateTime | null
  sentAt_not_in?: DateTime[] | DateTime | null
  sentAt_lt?: DateTime | null
  sentAt_lte?: DateTime | null
  sentAt_gt?: DateTime | null
  sentAt_gte?: DateTime | null
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
  AND?: PushNotificationReceiptScalarWhereInput[] | PushNotificationReceiptScalarWhereInput | null
  OR?: PushNotificationReceiptScalarWhereInput[] | PushNotificationReceiptScalarWhereInput | null
  NOT?: PushNotificationReceiptScalarWhereInput[] | PushNotificationReceiptScalarWhereInput | null
}

export interface PushNotificationReceiptSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: PushNotificationReceiptWhereInput | null
  AND?: PushNotificationReceiptSubscriptionWhereInput[] | PushNotificationReceiptSubscriptionWhereInput | null
  OR?: PushNotificationReceiptSubscriptionWhereInput[] | PushNotificationReceiptSubscriptionWhereInput | null
  NOT?: PushNotificationReceiptSubscriptionWhereInput[] | PushNotificationReceiptSubscriptionWhereInput | null
}

export interface PushNotificationReceiptUpdateInput {
  route?: String | null
  screen?: String | null
  uri?: String | null
  users?: UserUpdateManyWithoutPushNotificationsInput | null
  interest?: String | null
  body?: String | null
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt?: DateTime | null
}

export interface PushNotificationReceiptUpdateManyDataInput {
  route?: String | null
  screen?: String | null
  uri?: String | null
  interest?: String | null
  body?: String | null
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt?: DateTime | null
}

export interface PushNotificationReceiptUpdateManyMutationInput {
  route?: String | null
  screen?: String | null
  uri?: String | null
  interest?: String | null
  body?: String | null
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt?: DateTime | null
}

export interface PushNotificationReceiptUpdateManyWithoutUsersInput {
  create?: PushNotificationReceiptCreateWithoutUsersInput[] | PushNotificationReceiptCreateWithoutUsersInput | null
  delete?: PushNotificationReceiptWhereUniqueInput[] | PushNotificationReceiptWhereUniqueInput | null
  connect?: PushNotificationReceiptWhereUniqueInput[] | PushNotificationReceiptWhereUniqueInput | null
  set?: PushNotificationReceiptWhereUniqueInput[] | PushNotificationReceiptWhereUniqueInput | null
  disconnect?: PushNotificationReceiptWhereUniqueInput[] | PushNotificationReceiptWhereUniqueInput | null
  update?: PushNotificationReceiptUpdateWithWhereUniqueWithoutUsersInput[] | PushNotificationReceiptUpdateWithWhereUniqueWithoutUsersInput | null
  upsert?: PushNotificationReceiptUpsertWithWhereUniqueWithoutUsersInput[] | PushNotificationReceiptUpsertWithWhereUniqueWithoutUsersInput | null
  deleteMany?: PushNotificationReceiptScalarWhereInput[] | PushNotificationReceiptScalarWhereInput | null
  updateMany?: PushNotificationReceiptUpdateManyWithWhereNestedInput[] | PushNotificationReceiptUpdateManyWithWhereNestedInput | null
}

export interface PushNotificationReceiptUpdateManyWithWhereNestedInput {
  where: PushNotificationReceiptScalarWhereInput
  data: PushNotificationReceiptUpdateManyDataInput
}

export interface PushNotificationReceiptUpdateWithoutUsersDataInput {
  route?: String | null
  screen?: String | null
  uri?: String | null
  interest?: String | null
  body?: String | null
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt?: DateTime | null
}

export interface PushNotificationReceiptUpdateWithWhereUniqueWithoutUsersInput {
  where: PushNotificationReceiptWhereUniqueInput
  data: PushNotificationReceiptUpdateWithoutUsersDataInput
}

export interface PushNotificationReceiptUpsertWithWhereUniqueWithoutUsersInput {
  where: PushNotificationReceiptWhereUniqueInput
  update: PushNotificationReceiptUpdateWithoutUsersDataInput
  create: PushNotificationReceiptCreateWithoutUsersInput
}

export interface PushNotificationReceiptWhereInput {
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
  route?: String | null
  route_not?: String | null
  route_in?: String[] | String | null
  route_not_in?: String[] | String | null
  route_lt?: String | null
  route_lte?: String | null
  route_gt?: String | null
  route_gte?: String | null
  route_contains?: String | null
  route_not_contains?: String | null
  route_starts_with?: String | null
  route_not_starts_with?: String | null
  route_ends_with?: String | null
  route_not_ends_with?: String | null
  screen?: String | null
  screen_not?: String | null
  screen_in?: String[] | String | null
  screen_not_in?: String[] | String | null
  screen_lt?: String | null
  screen_lte?: String | null
  screen_gt?: String | null
  screen_gte?: String | null
  screen_contains?: String | null
  screen_not_contains?: String | null
  screen_starts_with?: String | null
  screen_not_starts_with?: String | null
  screen_ends_with?: String | null
  screen_not_ends_with?: String | null
  uri?: String | null
  uri_not?: String | null
  uri_in?: String[] | String | null
  uri_not_in?: String[] | String | null
  uri_lt?: String | null
  uri_lte?: String | null
  uri_gt?: String | null
  uri_gte?: String | null
  uri_contains?: String | null
  uri_not_contains?: String | null
  uri_starts_with?: String | null
  uri_not_starts_with?: String | null
  uri_ends_with?: String | null
  uri_not_ends_with?: String | null
  users_every?: UserWhereInput | null
  users_some?: UserWhereInput | null
  users_none?: UserWhereInput | null
  interest?: String | null
  interest_not?: String | null
  interest_in?: String[] | String | null
  interest_not_in?: String[] | String | null
  interest_lt?: String | null
  interest_lte?: String | null
  interest_gt?: String | null
  interest_gte?: String | null
  interest_contains?: String | null
  interest_not_contains?: String | null
  interest_starts_with?: String | null
  interest_not_starts_with?: String | null
  interest_ends_with?: String | null
  interest_not_ends_with?: String | null
  body?: String | null
  body_not?: String | null
  body_in?: String[] | String | null
  body_not_in?: String[] | String | null
  body_lt?: String | null
  body_lte?: String | null
  body_gt?: String | null
  body_gte?: String | null
  body_contains?: String | null
  body_not_contains?: String | null
  body_starts_with?: String | null
  body_not_starts_with?: String | null
  body_ends_with?: String | null
  body_not_ends_with?: String | null
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
  recordID?: String | null
  recordID_not?: String | null
  recordID_in?: String[] | String | null
  recordID_not_in?: String[] | String | null
  recordID_lt?: String | null
  recordID_lte?: String | null
  recordID_gt?: String | null
  recordID_gte?: String | null
  recordID_contains?: String | null
  recordID_not_contains?: String | null
  recordID_starts_with?: String | null
  recordID_not_starts_with?: String | null
  recordID_ends_with?: String | null
  recordID_not_ends_with?: String | null
  recordSlug?: String | null
  recordSlug_not?: String | null
  recordSlug_in?: String[] | String | null
  recordSlug_not_in?: String[] | String | null
  recordSlug_lt?: String | null
  recordSlug_lte?: String | null
  recordSlug_gt?: String | null
  recordSlug_gte?: String | null
  recordSlug_contains?: String | null
  recordSlug_not_contains?: String | null
  recordSlug_starts_with?: String | null
  recordSlug_not_starts_with?: String | null
  recordSlug_ends_with?: String | null
  recordSlug_not_ends_with?: String | null
  sentAt?: DateTime | null
  sentAt_not?: DateTime | null
  sentAt_in?: DateTime[] | DateTime | null
  sentAt_not_in?: DateTime[] | DateTime | null
  sentAt_lt?: DateTime | null
  sentAt_lte?: DateTime | null
  sentAt_gt?: DateTime | null
  sentAt_gte?: DateTime | null
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
  AND?: PushNotificationReceiptWhereInput[] | PushNotificationReceiptWhereInput | null
  OR?: PushNotificationReceiptWhereInput[] | PushNotificationReceiptWhereInput | null
  NOT?: PushNotificationReceiptWhereInput[] | PushNotificationReceiptWhereInput | null
}

export interface PushNotificationReceiptWhereUniqueInput {
  id?: ID_Input | null
}

export interface RecentlyViewedProductCreateInput {
  id?: ID_Input | null
  product: ProductCreateOneInput
  customer: CustomerCreateOneInput
  viewCount?: Int | null
}

export interface RecentlyViewedProductSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: RecentlyViewedProductWhereInput | null
  AND?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
  OR?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
  NOT?: RecentlyViewedProductSubscriptionWhereInput[] | RecentlyViewedProductSubscriptionWhereInput | null
}

export interface RecentlyViewedProductUpdateInput {
  product?: ProductUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredInput | null
  viewCount?: Int | null
}

export interface RecentlyViewedProductUpdateManyMutationInput {
  viewCount?: Int | null
}

export interface RecentlyViewedProductWhereInput {
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
  product?: ProductWhereInput | null
  customer?: CustomerWhereInput | null
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
  AND?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
  OR?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
  NOT?: RecentlyViewedProductWhereInput[] | RecentlyViewedProductWhereInput | null
}

export interface RecentlyViewedProductWhereUniqueInput {
  id?: ID_Input | null
}

export interface ReservationCreateInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  customer: CustomerCreateOneWithoutReservationsInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceiptCreateOneWithoutReservationInput | null
  lastLocation?: LocationCreateOneInput | null
}

export interface ReservationCreateManyWithoutCustomerInput {
  create?: ReservationCreateWithoutCustomerInput[] | ReservationCreateWithoutCustomerInput | null
  connect?: ReservationWhereUniqueInput[] | ReservationWhereUniqueInput | null
}

export interface ReservationCreateOneInput {
  create?: ReservationCreateInput | null
  connect?: ReservationWhereUniqueInput | null
}

export interface ReservationCreateOneWithoutReceiptInput {
  create?: ReservationCreateWithoutReceiptInput | null
  connect?: ReservationWhereUniqueInput | null
}

export interface ReservationCreateWithoutCustomerInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceiptCreateOneWithoutReservationInput | null
  lastLocation?: LocationCreateOneInput | null
}

export interface ReservationCreateWithoutReceiptInput {
  id?: ID_Input | null
  user: UserCreateOneInput
  customer: CustomerCreateOneWithoutReservationsInput
  sentPackage?: PackageCreateOneInput | null
  returnedPackage?: PackageCreateOneInput | null
  products?: PhysicalProductCreateManyInput | null
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  lastLocation?: LocationCreateOneInput | null
}

export interface ReservationFeedbackCreateInput {
  id?: ID_Input | null
  comment?: String | null
  feedbacks?: ProductVariantFeedbackCreateManyWithoutReservationFeedbackInput | null
  rating?: Rating | null
  user: UserCreateOneInput
  reservation: ReservationCreateOneInput
  respondedAt?: DateTime | null
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
  respondedAt?: DateTime | null
}

export interface ReservationFeedbackSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationFeedbackWhereInput | null
  AND?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
  OR?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
  NOT?: ReservationFeedbackSubscriptionWhereInput[] | ReservationFeedbackSubscriptionWhereInput | null
}

export interface ReservationFeedbackUpdateInput {
  comment?: String | null
  feedbacks?: ProductVariantFeedbackUpdateManyWithoutReservationFeedbackInput | null
  rating?: Rating | null
  user?: UserUpdateOneRequiredInput | null
  reservation?: ReservationUpdateOneRequiredInput | null
  respondedAt?: DateTime | null
}

export interface ReservationFeedbackUpdateManyMutationInput {
  comment?: String | null
  rating?: Rating | null
  respondedAt?: DateTime | null
}

export interface ReservationFeedbackUpdateOneRequiredWithoutFeedbacksInput {
  create?: ReservationFeedbackCreateWithoutFeedbacksInput | null
  update?: ReservationFeedbackUpdateWithoutFeedbacksDataInput | null
  upsert?: ReservationFeedbackUpsertWithoutFeedbacksInput | null
  connect?: ReservationFeedbackWhereUniqueInput | null
}

export interface ReservationFeedbackUpdateWithoutFeedbacksDataInput {
  comment?: String | null
  rating?: Rating | null
  user?: UserUpdateOneRequiredInput | null
  reservation?: ReservationUpdateOneRequiredInput | null
  respondedAt?: DateTime | null
}

export interface ReservationFeedbackUpsertWithoutFeedbacksInput {
  update: ReservationFeedbackUpdateWithoutFeedbacksDataInput
  create: ReservationFeedbackCreateWithoutFeedbacksInput
}

export interface ReservationFeedbackWhereInput {
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
  feedbacks_every?: ProductVariantFeedbackWhereInput | null
  feedbacks_some?: ProductVariantFeedbackWhereInput | null
  feedbacks_none?: ProductVariantFeedbackWhereInput | null
  rating?: Rating | null
  rating_not?: Rating | null
  rating_in?: Rating[] | Rating | null
  rating_not_in?: Rating[] | Rating | null
  user?: UserWhereInput | null
  reservation?: ReservationWhereInput | null
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
  respondedAt?: DateTime | null
  respondedAt_not?: DateTime | null
  respondedAt_in?: DateTime[] | DateTime | null
  respondedAt_not_in?: DateTime[] | DateTime | null
  respondedAt_lt?: DateTime | null
  respondedAt_lte?: DateTime | null
  respondedAt_gt?: DateTime | null
  respondedAt_gte?: DateTime | null
  AND?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
  OR?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
  NOT?: ReservationFeedbackWhereInput[] | ReservationFeedbackWhereInput | null
}

export interface ReservationFeedbackWhereUniqueInput {
  id?: ID_Input | null
}

export interface ReservationReceiptCreateInput {
  id?: ID_Input | null
  reservation: ReservationCreateOneWithoutReceiptInput
  items?: ReservationReceiptItemCreateManyInput | null
}

export interface ReservationReceiptCreateOneWithoutReservationInput {
  create?: ReservationReceiptCreateWithoutReservationInput | null
  connect?: ReservationReceiptWhereUniqueInput | null
}

export interface ReservationReceiptCreateWithoutReservationInput {
  id?: ID_Input | null
  items?: ReservationReceiptItemCreateManyInput | null
}

export interface ReservationReceiptItemCreateInput {
  id?: ID_Input | null
  product: PhysicalProductCreateOneInput
  productStatus: PhysicalProductStatus
  notes?: String | null
}

export interface ReservationReceiptItemCreateManyInput {
  create?: ReservationReceiptItemCreateInput[] | ReservationReceiptItemCreateInput | null
  connect?: ReservationReceiptItemWhereUniqueInput[] | ReservationReceiptItemWhereUniqueInput | null
}

export interface ReservationReceiptItemScalarWhereInput {
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
  productStatus?: PhysicalProductStatus | null
  productStatus_not?: PhysicalProductStatus | null
  productStatus_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  productStatus_not_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  notes?: String | null
  notes_not?: String | null
  notes_in?: String[] | String | null
  notes_not_in?: String[] | String | null
  notes_lt?: String | null
  notes_lte?: String | null
  notes_gt?: String | null
  notes_gte?: String | null
  notes_contains?: String | null
  notes_not_contains?: String | null
  notes_starts_with?: String | null
  notes_not_starts_with?: String | null
  notes_ends_with?: String | null
  notes_not_ends_with?: String | null
  AND?: ReservationReceiptItemScalarWhereInput[] | ReservationReceiptItemScalarWhereInput | null
  OR?: ReservationReceiptItemScalarWhereInput[] | ReservationReceiptItemScalarWhereInput | null
  NOT?: ReservationReceiptItemScalarWhereInput[] | ReservationReceiptItemScalarWhereInput | null
}

export interface ReservationReceiptItemSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationReceiptItemWhereInput | null
  AND?: ReservationReceiptItemSubscriptionWhereInput[] | ReservationReceiptItemSubscriptionWhereInput | null
  OR?: ReservationReceiptItemSubscriptionWhereInput[] | ReservationReceiptItemSubscriptionWhereInput | null
  NOT?: ReservationReceiptItemSubscriptionWhereInput[] | ReservationReceiptItemSubscriptionWhereInput | null
}

export interface ReservationReceiptItemUpdateDataInput {
  product?: PhysicalProductUpdateOneRequiredInput | null
  productStatus?: PhysicalProductStatus | null
  notes?: String | null
}

export interface ReservationReceiptItemUpdateInput {
  product?: PhysicalProductUpdateOneRequiredInput | null
  productStatus?: PhysicalProductStatus | null
  notes?: String | null
}

export interface ReservationReceiptItemUpdateManyDataInput {
  productStatus?: PhysicalProductStatus | null
  notes?: String | null
}

export interface ReservationReceiptItemUpdateManyInput {
  create?: ReservationReceiptItemCreateInput[] | ReservationReceiptItemCreateInput | null
  update?: ReservationReceiptItemUpdateWithWhereUniqueNestedInput[] | ReservationReceiptItemUpdateWithWhereUniqueNestedInput | null
  upsert?: ReservationReceiptItemUpsertWithWhereUniqueNestedInput[] | ReservationReceiptItemUpsertWithWhereUniqueNestedInput | null
  delete?: ReservationReceiptItemWhereUniqueInput[] | ReservationReceiptItemWhereUniqueInput | null
  connect?: ReservationReceiptItemWhereUniqueInput[] | ReservationReceiptItemWhereUniqueInput | null
  set?: ReservationReceiptItemWhereUniqueInput[] | ReservationReceiptItemWhereUniqueInput | null
  disconnect?: ReservationReceiptItemWhereUniqueInput[] | ReservationReceiptItemWhereUniqueInput | null
  deleteMany?: ReservationReceiptItemScalarWhereInput[] | ReservationReceiptItemScalarWhereInput | null
  updateMany?: ReservationReceiptItemUpdateManyWithWhereNestedInput[] | ReservationReceiptItemUpdateManyWithWhereNestedInput | null
}

export interface ReservationReceiptItemUpdateManyMutationInput {
  productStatus?: PhysicalProductStatus | null
  notes?: String | null
}

export interface ReservationReceiptItemUpdateManyWithWhereNestedInput {
  where: ReservationReceiptItemScalarWhereInput
  data: ReservationReceiptItemUpdateManyDataInput
}

export interface ReservationReceiptItemUpdateWithWhereUniqueNestedInput {
  where: ReservationReceiptItemWhereUniqueInput
  data: ReservationReceiptItemUpdateDataInput
}

export interface ReservationReceiptItemUpsertWithWhereUniqueNestedInput {
  where: ReservationReceiptItemWhereUniqueInput
  update: ReservationReceiptItemUpdateDataInput
  create: ReservationReceiptItemCreateInput
}

export interface ReservationReceiptItemWhereInput {
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
  product?: PhysicalProductWhereInput | null
  productStatus?: PhysicalProductStatus | null
  productStatus_not?: PhysicalProductStatus | null
  productStatus_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  productStatus_not_in?: PhysicalProductStatus[] | PhysicalProductStatus | null
  notes?: String | null
  notes_not?: String | null
  notes_in?: String[] | String | null
  notes_not_in?: String[] | String | null
  notes_lt?: String | null
  notes_lte?: String | null
  notes_gt?: String | null
  notes_gte?: String | null
  notes_contains?: String | null
  notes_not_contains?: String | null
  notes_starts_with?: String | null
  notes_not_starts_with?: String | null
  notes_ends_with?: String | null
  notes_not_ends_with?: String | null
  AND?: ReservationReceiptItemWhereInput[] | ReservationReceiptItemWhereInput | null
  OR?: ReservationReceiptItemWhereInput[] | ReservationReceiptItemWhereInput | null
  NOT?: ReservationReceiptItemWhereInput[] | ReservationReceiptItemWhereInput | null
}

export interface ReservationReceiptItemWhereUniqueInput {
  id?: ID_Input | null
}

export interface ReservationReceiptSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: ReservationReceiptWhereInput | null
  AND?: ReservationReceiptSubscriptionWhereInput[] | ReservationReceiptSubscriptionWhereInput | null
  OR?: ReservationReceiptSubscriptionWhereInput[] | ReservationReceiptSubscriptionWhereInput | null
  NOT?: ReservationReceiptSubscriptionWhereInput[] | ReservationReceiptSubscriptionWhereInput | null
}

export interface ReservationReceiptUpdateInput {
  reservation?: ReservationUpdateOneRequiredWithoutReceiptInput | null
  items?: ReservationReceiptItemUpdateManyInput | null
}

export interface ReservationReceiptUpdateOneWithoutReservationInput {
  create?: ReservationReceiptCreateWithoutReservationInput | null
  update?: ReservationReceiptUpdateWithoutReservationDataInput | null
  upsert?: ReservationReceiptUpsertWithoutReservationInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: ReservationReceiptWhereUniqueInput | null
}

export interface ReservationReceiptUpdateWithoutReservationDataInput {
  items?: ReservationReceiptItemUpdateManyInput | null
}

export interface ReservationReceiptUpsertWithoutReservationInput {
  update: ReservationReceiptUpdateWithoutReservationDataInput
  create: ReservationReceiptCreateWithoutReservationInput
}

export interface ReservationReceiptWhereInput {
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
  reservation?: ReservationWhereInput | null
  items_every?: ReservationReceiptItemWhereInput | null
  items_some?: ReservationReceiptItemWhereInput | null
  items_none?: ReservationReceiptItemWhereInput | null
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
  AND?: ReservationReceiptWhereInput[] | ReservationReceiptWhereInput | null
  OR?: ReservationReceiptWhereInput[] | ReservationReceiptWhereInput | null
  NOT?: ReservationReceiptWhereInput[] | ReservationReceiptWhereInput | null
}

export interface ReservationReceiptWhereUniqueInput {
  id?: ID_Input | null
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
  phase?: ReservationPhase | null
  phase_not?: ReservationPhase | null
  phase_in?: ReservationPhase[] | ReservationPhase | null
  phase_not_in?: ReservationPhase[] | ReservationPhase | null
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

export interface ReservationUpdateDataInput {
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceiptUpdateOneWithoutReservationInput | null
  lastLocation?: LocationUpdateOneInput | null
}

export interface ReservationUpdateInput {
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceiptUpdateOneWithoutReservationInput | null
  lastLocation?: LocationUpdateOneInput | null
}

export interface ReservationUpdateManyDataInput {
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
}

export interface ReservationUpdateManyMutationInput {
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
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

export interface ReservationUpdateOneRequiredInput {
  create?: ReservationCreateInput | null
  update?: ReservationUpdateDataInput | null
  upsert?: ReservationUpsertNestedInput | null
  connect?: ReservationWhereUniqueInput | null
}

export interface ReservationUpdateOneRequiredWithoutReceiptInput {
  create?: ReservationCreateWithoutReceiptInput | null
  update?: ReservationUpdateWithoutReceiptDataInput | null
  upsert?: ReservationUpsertWithoutReceiptInput | null
  connect?: ReservationWhereUniqueInput | null
}

export interface ReservationUpdateWithoutCustomerDataInput {
  user?: UserUpdateOneRequiredInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceiptUpdateOneWithoutReservationInput | null
  lastLocation?: LocationUpdateOneInput | null
}

export interface ReservationUpdateWithoutReceiptDataInput {
  user?: UserUpdateOneRequiredInput | null
  customer?: CustomerUpdateOneRequiredWithoutReservationsInput | null
  sentPackage?: PackageUpdateOneInput | null
  returnedPackage?: PackageUpdateOneInput | null
  products?: PhysicalProductUpdateManyInput | null
  reservationNumber?: Int | null
  phase?: ReservationPhase | null
  shipped?: Boolean | null
  status?: ReservationStatus | null
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  lastLocation?: LocationUpdateOneInput | null
}

export interface ReservationUpdateWithWhereUniqueWithoutCustomerInput {
  where: ReservationWhereUniqueInput
  data: ReservationUpdateWithoutCustomerDataInput
}

export interface ReservationUpsertNestedInput {
  update: ReservationUpdateDataInput
  create: ReservationCreateInput
}

export interface ReservationUpsertWithoutReceiptInput {
  update: ReservationUpdateWithoutReceiptDataInput
  create: ReservationCreateWithoutReceiptInput
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
  phase?: ReservationPhase | null
  phase_not?: ReservationPhase | null
  phase_in?: ReservationPhase[] | ReservationPhase | null
  phase_not_in?: ReservationPhase[] | ReservationPhase | null
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
  receipt?: ReservationReceiptWhereInput | null
  lastLocation?: LocationWhereInput | null
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

export interface SizeCreateInput {
  id?: ID_Input | null
  slug: String
  productType?: ProductType | null
  top?: TopSizeCreateOneInput | null
  bottom?: BottomSizeCreateOneInput | null
  display: String
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
  AND?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  OR?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  NOT?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
}

export interface SizeSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: SizeWhereInput | null
  AND?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
  OR?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
  NOT?: SizeSubscriptionWhereInput[] | SizeSubscriptionWhereInput | null
}

export interface SizeUpdateDataInput {
  slug?: String | null
  productType?: ProductType | null
  top?: TopSizeUpdateOneInput | null
  bottom?: BottomSizeUpdateOneInput | null
  display?: String | null
}

export interface SizeUpdateInput {
  slug?: String | null
  productType?: ProductType | null
  top?: TopSizeUpdateOneInput | null
  bottom?: BottomSizeUpdateOneInput | null
  display?: String | null
}

export interface SizeUpdateManyDataInput {
  slug?: String | null
  productType?: ProductType | null
  display?: String | null
}

export interface SizeUpdateManyInput {
  create?: SizeCreateInput[] | SizeCreateInput | null
  update?: SizeUpdateWithWhereUniqueNestedInput[] | SizeUpdateWithWhereUniqueNestedInput | null
  upsert?: SizeUpsertWithWhereUniqueNestedInput[] | SizeUpsertWithWhereUniqueNestedInput | null
  delete?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  connect?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  set?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  disconnect?: SizeWhereUniqueInput[] | SizeWhereUniqueInput | null
  deleteMany?: SizeScalarWhereInput[] | SizeScalarWhereInput | null
  updateMany?: SizeUpdateManyWithWhereNestedInput[] | SizeUpdateManyWithWhereNestedInput | null
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
  update?: SizeUpdateDataInput | null
  upsert?: SizeUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: SizeWhereUniqueInput | null
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
  top?: TopSizeWhereInput | null
  bottom?: BottomSizeWhereInput | null
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
  AND?: SizeWhereInput[] | SizeWhereInput | null
  OR?: SizeWhereInput[] | SizeWhereInput | null
  NOT?: SizeWhereInput[] | SizeWhereInput | null
}

export interface SizeWhereUniqueInput {
  id?: ID_Input | null
  slug?: String | null
}

export interface TagCreateInput {
  id?: ID_Input | null
  name: String
  description?: String | null
  products?: ProductCreateManyWithoutTagsInput | null
}

export interface TagCreateManyWithoutProductsInput {
  create?: TagCreateWithoutProductsInput[] | TagCreateWithoutProductsInput | null
  connect?: TagWhereUniqueInput[] | TagWhereUniqueInput | null
}

export interface TagCreateWithoutProductsInput {
  id?: ID_Input | null
  name: String
  description?: String | null
}

export interface TagScalarWhereInput {
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
  AND?: TagScalarWhereInput[] | TagScalarWhereInput | null
  OR?: TagScalarWhereInput[] | TagScalarWhereInput | null
  NOT?: TagScalarWhereInput[] | TagScalarWhereInput | null
}

export interface TagSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: TagWhereInput | null
  AND?: TagSubscriptionWhereInput[] | TagSubscriptionWhereInput | null
  OR?: TagSubscriptionWhereInput[] | TagSubscriptionWhereInput | null
  NOT?: TagSubscriptionWhereInput[] | TagSubscriptionWhereInput | null
}

export interface TagUpdateInput {
  name?: String | null
  description?: String | null
  products?: ProductUpdateManyWithoutTagsInput | null
}

export interface TagUpdateManyDataInput {
  name?: String | null
  description?: String | null
}

export interface TagUpdateManyMutationInput {
  name?: String | null
  description?: String | null
}

export interface TagUpdateManyWithoutProductsInput {
  create?: TagCreateWithoutProductsInput[] | TagCreateWithoutProductsInput | null
  delete?: TagWhereUniqueInput[] | TagWhereUniqueInput | null
  connect?: TagWhereUniqueInput[] | TagWhereUniqueInput | null
  set?: TagWhereUniqueInput[] | TagWhereUniqueInput | null
  disconnect?: TagWhereUniqueInput[] | TagWhereUniqueInput | null
  update?: TagUpdateWithWhereUniqueWithoutProductsInput[] | TagUpdateWithWhereUniqueWithoutProductsInput | null
  upsert?: TagUpsertWithWhereUniqueWithoutProductsInput[] | TagUpsertWithWhereUniqueWithoutProductsInput | null
  deleteMany?: TagScalarWhereInput[] | TagScalarWhereInput | null
  updateMany?: TagUpdateManyWithWhereNestedInput[] | TagUpdateManyWithWhereNestedInput | null
}

export interface TagUpdateManyWithWhereNestedInput {
  where: TagScalarWhereInput
  data: TagUpdateManyDataInput
}

export interface TagUpdateWithoutProductsDataInput {
  name?: String | null
  description?: String | null
}

export interface TagUpdateWithWhereUniqueWithoutProductsInput {
  where: TagWhereUniqueInput
  data: TagUpdateWithoutProductsDataInput
}

export interface TagUpsertWithWhereUniqueWithoutProductsInput {
  where: TagWhereUniqueInput
  update: TagUpdateWithoutProductsDataInput
  create: TagCreateWithoutProductsInput
}

export interface TagWhereInput {
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
  products_every?: ProductWhereInput | null
  products_some?: ProductWhereInput | null
  products_none?: ProductWhereInput | null
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
  AND?: TagWhereInput[] | TagWhereInput | null
  OR?: TagWhereInput[] | TagWhereInput | null
  NOT?: TagWhereInput[] | TagWhereInput | null
}

export interface TagWhereUniqueInput {
  id?: ID_Input | null
  name?: String | null
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
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: TopSizeWhereInput | null
  AND?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
  OR?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
  NOT?: TopSizeSubscriptionWhereInput[] | TopSizeSubscriptionWhereInput | null
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
  update?: TopSizeUpdateDataInput | null
  upsert?: TopSizeUpsertNestedInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: TopSizeWhereUniqueInput | null
}

export interface TopSizeUpsertNestedInput {
  update: TopSizeUpdateDataInput
  create: TopSizeCreateInput
}

export interface TopSizeWhereInput {
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
  AND?: TopSizeWhereInput[] | TopSizeWhereInput | null
  OR?: TopSizeWhereInput[] | TopSizeWhereInput | null
  NOT?: TopSizeWhereInput[] | TopSizeWhereInput | null
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
  roles?: UserCreaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
  pushNotifications?: PushNotificationReceiptCreateManyWithoutUsersInput | null
}

export interface UserCreateManyWithoutPushNotificationsInput {
  create?: UserCreateWithoutPushNotificationsInput[] | UserCreateWithoutPushNotificationsInput | null
  connect?: UserWhereUniqueInput[] | UserWhereUniqueInput | null
}

export interface UserCreateOneInput {
  create?: UserCreateInput | null
  connect?: UserWhereUniqueInput | null
}

export interface UserCreaterolesInput {
  set?: UserRole[] | UserRole | null
}

export interface UserCreateWithoutPushNotificationsInput {
  id?: ID_Input | null
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role?: UserRole | null
  roles?: UserCreaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
}

export interface UserScalarWhereInput {
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
  pushNotificationStatus?: PushNotificationStatus | null
  pushNotificationStatus_not?: PushNotificationStatus | null
  pushNotificationStatus_in?: PushNotificationStatus[] | PushNotificationStatus | null
  pushNotificationStatus_not_in?: PushNotificationStatus[] | PushNotificationStatus | null
  AND?: UserScalarWhereInput[] | UserScalarWhereInput | null
  OR?: UserScalarWhereInput[] | UserScalarWhereInput | null
  NOT?: UserScalarWhereInput[] | UserScalarWhereInput | null
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
  roles?: UserUpdaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
  pushNotifications?: PushNotificationReceiptUpdateManyWithoutUsersInput | null
}

export interface UserUpdateInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  roles?: UserUpdaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
  pushNotifications?: PushNotificationReceiptUpdateManyWithoutUsersInput | null
}

export interface UserUpdateManyDataInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  roles?: UserUpdaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
}

export interface UserUpdateManyMutationInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  roles?: UserUpdaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
}

export interface UserUpdateManyWithoutPushNotificationsInput {
  create?: UserCreateWithoutPushNotificationsInput[] | UserCreateWithoutPushNotificationsInput | null
  delete?: UserWhereUniqueInput[] | UserWhereUniqueInput | null
  connect?: UserWhereUniqueInput[] | UserWhereUniqueInput | null
  set?: UserWhereUniqueInput[] | UserWhereUniqueInput | null
  disconnect?: UserWhereUniqueInput[] | UserWhereUniqueInput | null
  update?: UserUpdateWithWhereUniqueWithoutPushNotificationsInput[] | UserUpdateWithWhereUniqueWithoutPushNotificationsInput | null
  upsert?: UserUpsertWithWhereUniqueWithoutPushNotificationsInput[] | UserUpsertWithWhereUniqueWithoutPushNotificationsInput | null
  deleteMany?: UserScalarWhereInput[] | UserScalarWhereInput | null
  updateMany?: UserUpdateManyWithWhereNestedInput[] | UserUpdateManyWithWhereNestedInput | null
}

export interface UserUpdateManyWithWhereNestedInput {
  where: UserScalarWhereInput
  data: UserUpdateManyDataInput
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

export interface UserUpdaterolesInput {
  set?: UserRole[] | UserRole | null
}

export interface UserUpdateWithoutPushNotificationsDataInput {
  auth0Id?: String | null
  email?: String | null
  firstName?: String | null
  lastName?: String | null
  role?: UserRole | null
  roles?: UserUpdaterolesInput | null
  pushNotificationStatus?: PushNotificationStatus | null
}

export interface UserUpdateWithWhereUniqueWithoutPushNotificationsInput {
  where: UserWhereUniqueInput
  data: UserUpdateWithoutPushNotificationsDataInput
}

export interface UserUpsertNestedInput {
  update: UserUpdateDataInput
  create: UserCreateInput
}

export interface UserUpsertWithWhereUniqueWithoutPushNotificationsInput {
  where: UserWhereUniqueInput
  update: UserUpdateWithoutPushNotificationsDataInput
  create: UserCreateWithoutPushNotificationsInput
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
  pushNotificationStatus?: PushNotificationStatus | null
  pushNotificationStatus_not?: PushNotificationStatus | null
  pushNotificationStatus_in?: PushNotificationStatus[] | PushNotificationStatus | null
  pushNotificationStatus_not_in?: PushNotificationStatus[] | PushNotificationStatus | null
  pushNotifications_every?: PushNotificationReceiptWhereInput | null
  pushNotifications_some?: PushNotificationReceiptWhereInput | null
  pushNotifications_none?: PushNotificationReceiptWhereInput | null
  AND?: UserWhereInput[] | UserWhereInput | null
  OR?: UserWhereInput[] | UserWhereInput | null
  NOT?: UserWhereInput[] | UserWhereInput | null
}

export interface UserWhereUniqueInput {
  id?: ID_Input | null
  auth0Id?: String | null
  email?: String | null
}

export interface WarehouseLocationConstraintCreateInput {
  id?: ID_Input | null
  category: CategoryCreateOneInput
  limit: Int
  locations?: WarehouseLocationCreateManyWithoutConstraintsInput | null
}

export interface WarehouseLocationConstraintCreateManyWithoutLocationsInput {
  create?: WarehouseLocationConstraintCreateWithoutLocationsInput[] | WarehouseLocationConstraintCreateWithoutLocationsInput | null
  connect?: WarehouseLocationConstraintWhereUniqueInput[] | WarehouseLocationConstraintWhereUniqueInput | null
}

export interface WarehouseLocationConstraintCreateWithoutLocationsInput {
  id?: ID_Input | null
  category: CategoryCreateOneInput
  limit: Int
}

export interface WarehouseLocationConstraintScalarWhereInput {
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
  limit?: Int | null
  limit_not?: Int | null
  limit_in?: Int[] | Int | null
  limit_not_in?: Int[] | Int | null
  limit_lt?: Int | null
  limit_lte?: Int | null
  limit_gt?: Int | null
  limit_gte?: Int | null
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
  AND?: WarehouseLocationConstraintScalarWhereInput[] | WarehouseLocationConstraintScalarWhereInput | null
  OR?: WarehouseLocationConstraintScalarWhereInput[] | WarehouseLocationConstraintScalarWhereInput | null
  NOT?: WarehouseLocationConstraintScalarWhereInput[] | WarehouseLocationConstraintScalarWhereInput | null
}

export interface WarehouseLocationConstraintSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: WarehouseLocationConstraintWhereInput | null
  AND?: WarehouseLocationConstraintSubscriptionWhereInput[] | WarehouseLocationConstraintSubscriptionWhereInput | null
  OR?: WarehouseLocationConstraintSubscriptionWhereInput[] | WarehouseLocationConstraintSubscriptionWhereInput | null
  NOT?: WarehouseLocationConstraintSubscriptionWhereInput[] | WarehouseLocationConstraintSubscriptionWhereInput | null
}

export interface WarehouseLocationConstraintUpdateInput {
  category?: CategoryUpdateOneRequiredInput | null
  limit?: Int | null
  locations?: WarehouseLocationUpdateManyWithoutConstraintsInput | null
}

export interface WarehouseLocationConstraintUpdateManyDataInput {
  limit?: Int | null
}

export interface WarehouseLocationConstraintUpdateManyMutationInput {
  limit?: Int | null
}

export interface WarehouseLocationConstraintUpdateManyWithoutLocationsInput {
  create?: WarehouseLocationConstraintCreateWithoutLocationsInput[] | WarehouseLocationConstraintCreateWithoutLocationsInput | null
  delete?: WarehouseLocationConstraintWhereUniqueInput[] | WarehouseLocationConstraintWhereUniqueInput | null
  connect?: WarehouseLocationConstraintWhereUniqueInput[] | WarehouseLocationConstraintWhereUniqueInput | null
  set?: WarehouseLocationConstraintWhereUniqueInput[] | WarehouseLocationConstraintWhereUniqueInput | null
  disconnect?: WarehouseLocationConstraintWhereUniqueInput[] | WarehouseLocationConstraintWhereUniqueInput | null
  update?: WarehouseLocationConstraintUpdateWithWhereUniqueWithoutLocationsInput[] | WarehouseLocationConstraintUpdateWithWhereUniqueWithoutLocationsInput | null
  upsert?: WarehouseLocationConstraintUpsertWithWhereUniqueWithoutLocationsInput[] | WarehouseLocationConstraintUpsertWithWhereUniqueWithoutLocationsInput | null
  deleteMany?: WarehouseLocationConstraintScalarWhereInput[] | WarehouseLocationConstraintScalarWhereInput | null
  updateMany?: WarehouseLocationConstraintUpdateManyWithWhereNestedInput[] | WarehouseLocationConstraintUpdateManyWithWhereNestedInput | null
}

export interface WarehouseLocationConstraintUpdateManyWithWhereNestedInput {
  where: WarehouseLocationConstraintScalarWhereInput
  data: WarehouseLocationConstraintUpdateManyDataInput
}

export interface WarehouseLocationConstraintUpdateWithoutLocationsDataInput {
  category?: CategoryUpdateOneRequiredInput | null
  limit?: Int | null
}

export interface WarehouseLocationConstraintUpdateWithWhereUniqueWithoutLocationsInput {
  where: WarehouseLocationConstraintWhereUniqueInput
  data: WarehouseLocationConstraintUpdateWithoutLocationsDataInput
}

export interface WarehouseLocationConstraintUpsertWithWhereUniqueWithoutLocationsInput {
  where: WarehouseLocationConstraintWhereUniqueInput
  update: WarehouseLocationConstraintUpdateWithoutLocationsDataInput
  create: WarehouseLocationConstraintCreateWithoutLocationsInput
}

export interface WarehouseLocationConstraintWhereInput {
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
  category?: CategoryWhereInput | null
  limit?: Int | null
  limit_not?: Int | null
  limit_in?: Int[] | Int | null
  limit_not_in?: Int[] | Int | null
  limit_lt?: Int | null
  limit_lte?: Int | null
  limit_gt?: Int | null
  limit_gte?: Int | null
  locations_every?: WarehouseLocationWhereInput | null
  locations_some?: WarehouseLocationWhereInput | null
  locations_none?: WarehouseLocationWhereInput | null
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
  AND?: WarehouseLocationConstraintWhereInput[] | WarehouseLocationConstraintWhereInput | null
  OR?: WarehouseLocationConstraintWhereInput[] | WarehouseLocationConstraintWhereInput | null
  NOT?: WarehouseLocationConstraintWhereInput[] | WarehouseLocationConstraintWhereInput | null
}

export interface WarehouseLocationConstraintWhereUniqueInput {
  id?: ID_Input | null
}

export interface WarehouseLocationCreateInput {
  id?: ID_Input | null
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  physicalProducts?: PhysicalProductCreateManyWithoutWarehouseLocationInput | null
  constraints?: WarehouseLocationConstraintCreateManyWithoutLocationsInput | null
}

export interface WarehouseLocationCreateManyWithoutConstraintsInput {
  create?: WarehouseLocationCreateWithoutConstraintsInput[] | WarehouseLocationCreateWithoutConstraintsInput | null
  connect?: WarehouseLocationWhereUniqueInput[] | WarehouseLocationWhereUniqueInput | null
}

export interface WarehouseLocationCreateOneWithoutPhysicalProductsInput {
  create?: WarehouseLocationCreateWithoutPhysicalProductsInput | null
  connect?: WarehouseLocationWhereUniqueInput | null
}

export interface WarehouseLocationCreateWithoutConstraintsInput {
  id?: ID_Input | null
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  physicalProducts?: PhysicalProductCreateManyWithoutWarehouseLocationInput | null
}

export interface WarehouseLocationCreateWithoutPhysicalProductsInput {
  id?: ID_Input | null
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  constraints?: WarehouseLocationConstraintCreateManyWithoutLocationsInput | null
}

export interface WarehouseLocationScalarWhereInput {
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
  type?: WarehouseLocationType | null
  type_not?: WarehouseLocationType | null
  type_in?: WarehouseLocationType[] | WarehouseLocationType | null
  type_not_in?: WarehouseLocationType[] | WarehouseLocationType | null
  barcode?: String | null
  barcode_not?: String | null
  barcode_in?: String[] | String | null
  barcode_not_in?: String[] | String | null
  barcode_lt?: String | null
  barcode_lte?: String | null
  barcode_gt?: String | null
  barcode_gte?: String | null
  barcode_contains?: String | null
  barcode_not_contains?: String | null
  barcode_starts_with?: String | null
  barcode_not_starts_with?: String | null
  barcode_ends_with?: String | null
  barcode_not_ends_with?: String | null
  locationCode?: String | null
  locationCode_not?: String | null
  locationCode_in?: String[] | String | null
  locationCode_not_in?: String[] | String | null
  locationCode_lt?: String | null
  locationCode_lte?: String | null
  locationCode_gt?: String | null
  locationCode_gte?: String | null
  locationCode_contains?: String | null
  locationCode_not_contains?: String | null
  locationCode_starts_with?: String | null
  locationCode_not_starts_with?: String | null
  locationCode_ends_with?: String | null
  locationCode_not_ends_with?: String | null
  itemCode?: String | null
  itemCode_not?: String | null
  itemCode_in?: String[] | String | null
  itemCode_not_in?: String[] | String | null
  itemCode_lt?: String | null
  itemCode_lte?: String | null
  itemCode_gt?: String | null
  itemCode_gte?: String | null
  itemCode_contains?: String | null
  itemCode_not_contains?: String | null
  itemCode_starts_with?: String | null
  itemCode_not_starts_with?: String | null
  itemCode_ends_with?: String | null
  itemCode_not_ends_with?: String | null
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
  AND?: WarehouseLocationScalarWhereInput[] | WarehouseLocationScalarWhereInput | null
  OR?: WarehouseLocationScalarWhereInput[] | WarehouseLocationScalarWhereInput | null
  NOT?: WarehouseLocationScalarWhereInput[] | WarehouseLocationScalarWhereInput | null
}

export interface WarehouseLocationSubscriptionWhereInput {
  mutation_in?: MutationType[] | MutationType | null
  updatedFields_contains?: String | null
  updatedFields_contains_every?: String[] | String | null
  updatedFields_contains_some?: String[] | String | null
  node?: WarehouseLocationWhereInput | null
  AND?: WarehouseLocationSubscriptionWhereInput[] | WarehouseLocationSubscriptionWhereInput | null
  OR?: WarehouseLocationSubscriptionWhereInput[] | WarehouseLocationSubscriptionWhereInput | null
  NOT?: WarehouseLocationSubscriptionWhereInput[] | WarehouseLocationSubscriptionWhereInput | null
}

export interface WarehouseLocationUpdateInput {
  type?: WarehouseLocationType | null
  barcode?: String | null
  locationCode?: String | null
  itemCode?: String | null
  physicalProducts?: PhysicalProductUpdateManyWithoutWarehouseLocationInput | null
  constraints?: WarehouseLocationConstraintUpdateManyWithoutLocationsInput | null
}

export interface WarehouseLocationUpdateManyDataInput {
  type?: WarehouseLocationType | null
  barcode?: String | null
  locationCode?: String | null
  itemCode?: String | null
}

export interface WarehouseLocationUpdateManyMutationInput {
  type?: WarehouseLocationType | null
  barcode?: String | null
  locationCode?: String | null
  itemCode?: String | null
}

export interface WarehouseLocationUpdateManyWithoutConstraintsInput {
  create?: WarehouseLocationCreateWithoutConstraintsInput[] | WarehouseLocationCreateWithoutConstraintsInput | null
  delete?: WarehouseLocationWhereUniqueInput[] | WarehouseLocationWhereUniqueInput | null
  connect?: WarehouseLocationWhereUniqueInput[] | WarehouseLocationWhereUniqueInput | null
  set?: WarehouseLocationWhereUniqueInput[] | WarehouseLocationWhereUniqueInput | null
  disconnect?: WarehouseLocationWhereUniqueInput[] | WarehouseLocationWhereUniqueInput | null
  update?: WarehouseLocationUpdateWithWhereUniqueWithoutConstraintsInput[] | WarehouseLocationUpdateWithWhereUniqueWithoutConstraintsInput | null
  upsert?: WarehouseLocationUpsertWithWhereUniqueWithoutConstraintsInput[] | WarehouseLocationUpsertWithWhereUniqueWithoutConstraintsInput | null
  deleteMany?: WarehouseLocationScalarWhereInput[] | WarehouseLocationScalarWhereInput | null
  updateMany?: WarehouseLocationUpdateManyWithWhereNestedInput[] | WarehouseLocationUpdateManyWithWhereNestedInput | null
}

export interface WarehouseLocationUpdateManyWithWhereNestedInput {
  where: WarehouseLocationScalarWhereInput
  data: WarehouseLocationUpdateManyDataInput
}

export interface WarehouseLocationUpdateOneWithoutPhysicalProductsInput {
  create?: WarehouseLocationCreateWithoutPhysicalProductsInput | null
  update?: WarehouseLocationUpdateWithoutPhysicalProductsDataInput | null
  upsert?: WarehouseLocationUpsertWithoutPhysicalProductsInput | null
  delete?: Boolean | null
  disconnect?: Boolean | null
  connect?: WarehouseLocationWhereUniqueInput | null
}

export interface WarehouseLocationUpdateWithoutConstraintsDataInput {
  type?: WarehouseLocationType | null
  barcode?: String | null
  locationCode?: String | null
  itemCode?: String | null
  physicalProducts?: PhysicalProductUpdateManyWithoutWarehouseLocationInput | null
}

export interface WarehouseLocationUpdateWithoutPhysicalProductsDataInput {
  type?: WarehouseLocationType | null
  barcode?: String | null
  locationCode?: String | null
  itemCode?: String | null
  constraints?: WarehouseLocationConstraintUpdateManyWithoutLocationsInput | null
}

export interface WarehouseLocationUpdateWithWhereUniqueWithoutConstraintsInput {
  where: WarehouseLocationWhereUniqueInput
  data: WarehouseLocationUpdateWithoutConstraintsDataInput
}

export interface WarehouseLocationUpsertWithoutPhysicalProductsInput {
  update: WarehouseLocationUpdateWithoutPhysicalProductsDataInput
  create: WarehouseLocationCreateWithoutPhysicalProductsInput
}

export interface WarehouseLocationUpsertWithWhereUniqueWithoutConstraintsInput {
  where: WarehouseLocationWhereUniqueInput
  update: WarehouseLocationUpdateWithoutConstraintsDataInput
  create: WarehouseLocationCreateWithoutConstraintsInput
}

export interface WarehouseLocationWhereInput {
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
  type?: WarehouseLocationType | null
  type_not?: WarehouseLocationType | null
  type_in?: WarehouseLocationType[] | WarehouseLocationType | null
  type_not_in?: WarehouseLocationType[] | WarehouseLocationType | null
  barcode?: String | null
  barcode_not?: String | null
  barcode_in?: String[] | String | null
  barcode_not_in?: String[] | String | null
  barcode_lt?: String | null
  barcode_lte?: String | null
  barcode_gt?: String | null
  barcode_gte?: String | null
  barcode_contains?: String | null
  barcode_not_contains?: String | null
  barcode_starts_with?: String | null
  barcode_not_starts_with?: String | null
  barcode_ends_with?: String | null
  barcode_not_ends_with?: String | null
  locationCode?: String | null
  locationCode_not?: String | null
  locationCode_in?: String[] | String | null
  locationCode_not_in?: String[] | String | null
  locationCode_lt?: String | null
  locationCode_lte?: String | null
  locationCode_gt?: String | null
  locationCode_gte?: String | null
  locationCode_contains?: String | null
  locationCode_not_contains?: String | null
  locationCode_starts_with?: String | null
  locationCode_not_starts_with?: String | null
  locationCode_ends_with?: String | null
  locationCode_not_ends_with?: String | null
  itemCode?: String | null
  itemCode_not?: String | null
  itemCode_in?: String[] | String | null
  itemCode_not_in?: String[] | String | null
  itemCode_lt?: String | null
  itemCode_lte?: String | null
  itemCode_gt?: String | null
  itemCode_gte?: String | null
  itemCode_contains?: String | null
  itemCode_not_contains?: String | null
  itemCode_starts_with?: String | null
  itemCode_not_starts_with?: String | null
  itemCode_ends_with?: String | null
  itemCode_not_ends_with?: String | null
  physicalProducts_every?: PhysicalProductWhereInput | null
  physicalProducts_some?: PhysicalProductWhereInput | null
  physicalProducts_none?: PhysicalProductWhereInput | null
  constraints_every?: WarehouseLocationConstraintWhereInput | null
  constraints_some?: WarehouseLocationConstraintWhereInput | null
  constraints_none?: WarehouseLocationConstraintWhereInput | null
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
  AND?: WarehouseLocationWhereInput[] | WarehouseLocationWhereInput | null
  OR?: WarehouseLocationWhereInput[] | WarehouseLocationWhereInput | null
  NOT?: WarehouseLocationWhereInput[] | WarehouseLocationWhereInput | null
}

export interface WarehouseLocationWhereUniqueInput {
  id?: ID_Input | null
  barcode?: String | null
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

export interface AggregateCustomerMembership {
  count: Int
}

export interface AggregateEmailReceipt {
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

export interface AggregatePackage {
  count: Int
}

export interface AggregatePackageTransitEvent {
  count: Int
}

export interface AggregatePauseRequest {
  count: Int
}

export interface AggregatePhysicalProduct {
  count: Int
}

export interface AggregatePhysicalProductInventoryStatusChange {
  count: Int
}

export interface AggregateProduct {
  count: Int
}

export interface AggregateProductFunction {
  count: Int
}

export interface AggregateProductMaterialCategory {
  count: Int
}

export interface AggregateProductModel {
  count: Int
}

export interface AggregateProductRequest {
  count: Int
}

export interface AggregateProductStatusChange {
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

export interface AggregatePushNotificationReceipt {
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

export interface AggregateReservationReceipt {
  count: Int
}

export interface AggregateReservationReceiptItem {
  count: Int
}

export interface AggregateSize {
  count: Int
}

export interface AggregateTag {
  count: Int
}

export interface AggregateTopSize {
  count: Int
}

export interface AggregateUser {
  count: Int
}

export interface AggregateWarehouseLocation {
  count: Int
}

export interface AggregateWarehouseLocationConstraint {
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

export interface BottomSize {
  id: ID_Output
  type?: BottomSizeType | null
  value?: String | null
  waist?: Float | null
  rise?: Float | null
  hem?: Float | null
  inseam?: Float | null
}

export interface BottomSizeConnection {
  pageInfo: PageInfo
  edges: Array<BottomSizeEdge | null>
  aggregate: AggregateBottomSize
}

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
  membership?: CustomerMembership | null
  bagItems?: Array<BagItem> | null
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
  insureShipment: Boolean
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

export interface CustomerEdge {
  node: Customer
  cursor: String
}

export interface CustomerMembership {
  id: ID_Output
  subscriptionId: String
  customer: Customer
  pauseRequests?: Array<PauseRequest> | null
}

export interface CustomerMembershipConnection {
  pageInfo: PageInfo
  edges: Array<CustomerMembershipEdge | null>
  aggregate: AggregateCustomerMembership
}

export interface CustomerMembershipEdge {
  node: CustomerMembership
  cursor: String
}

export interface CustomerMembershipPreviousValues {
  id: ID_Output
  subscriptionId: String
}

export interface CustomerMembershipSubscriptionPayload {
  mutation: MutationType
  node?: CustomerMembership | null
  updatedFields?: Array<String> | null
  previousValues?: CustomerMembershipPreviousValues | null
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

export interface EmailReceipt {
  id: ID_Output
  emailId: EmailId
  user: User
  createdAt: DateTime
  updatedAt: DateTime
}

export interface EmailReceiptConnection {
  pageInfo: PageInfo
  edges: Array<EmailReceiptEdge | null>
  aggregate: AggregateEmailReceipt
}

export interface EmailReceiptEdge {
  node: EmailReceipt
  cursor: String
}

export interface EmailReceiptPreviousValues {
  id: ID_Output
  emailId: EmailId
  createdAt: DateTime
  updatedAt: DateTime
}

export interface EmailReceiptSubscriptionPayload {
  mutation: MutationType
  node?: EmailReceipt | null
  updatedFields?: Array<String> | null
  previousValues?: EmailReceiptPreviousValues | null
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
  url: String
  height?: Int | null
  width?: Int | null
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
  url: String
  height?: Int | null
  width?: Int | null
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

export interface Package {
  id: ID_Output
  items?: Array<PhysicalProduct> | null
  transactionID: String
  shippingLabel: Label
  fromAddress: Location
  toAddress: Location
  weight?: Float | null
  events?: Array<PackageTransitEvent> | null
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
  transactionID: String
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

export interface PackageTransitEvent {
  id: ID_Output
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PackageTransitEventConnection {
  pageInfo: PageInfo
  edges: Array<PackageTransitEventEdge | null>
  aggregate: AggregatePackageTransitEvent
}

export interface PackageTransitEventEdge {
  node: PackageTransitEvent
  cursor: String
}

export interface PackageTransitEventPreviousValues {
  id: ID_Output
  status: PackageTransitEventStatus
  subStatus: PackageTransitEventSubStatus
  data: Json
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PackageTransitEventSubscriptionPayload {
  mutation: MutationType
  node?: PackageTransitEvent | null
  updatedFields?: Array<String> | null
  previousValues?: PackageTransitEventPreviousValues | null
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String | null
  endCursor?: String | null
}

export interface PauseRequest {
  id: ID_Output
  createdAt: DateTime
  updatedAt: DateTime
  pausePending: Boolean
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
  membership: CustomerMembership
}

export interface PauseRequestConnection {
  pageInfo: PageInfo
  edges: Array<PauseRequestEdge | null>
  aggregate: AggregatePauseRequest
}

export interface PauseRequestEdge {
  node: PauseRequest
  cursor: String
}

export interface PauseRequestPreviousValues {
  id: ID_Output
  createdAt: DateTime
  updatedAt: DateTime
  pausePending: Boolean
  pauseDate?: DateTime | null
  resumeDate?: DateTime | null
}

export interface PauseRequestSubscriptionPayload {
  mutation: MutationType
  node?: PauseRequest | null
  updatedFields?: Array<String> | null
  previousValues?: PauseRequestPreviousValues | null
}

export interface PhysicalProduct {
  id: ID_Output
  seasonsUID: String
  location?: Location | null
  productVariant: ProductVariant
  inventoryStatus: InventoryStatus
  inventoryStatusChanges?: Array<PhysicalProductInventoryStatusChange> | null
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  warehouseLocation?: WarehouseLocation | null
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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

export interface PhysicalProductInventoryStatusChange {
  id: ID_Output
  old: InventoryStatus
  new: InventoryStatus
  physicalProduct: PhysicalProduct
  createdAt: DateTime
  updatedAt?: DateTime | null
}

export interface PhysicalProductInventoryStatusChangeConnection {
  pageInfo: PageInfo
  edges: Array<PhysicalProductInventoryStatusChangeEdge | null>
  aggregate: AggregatePhysicalProductInventoryStatusChange
}

export interface PhysicalProductInventoryStatusChangeEdge {
  node: PhysicalProductInventoryStatusChange
  cursor: String
}

export interface PhysicalProductInventoryStatusChangePreviousValues {
  id: ID_Output
  old: InventoryStatus
  new: InventoryStatus
  createdAt: DateTime
  updatedAt?: DateTime | null
}

export interface PhysicalProductInventoryStatusChangeSubscriptionPayload {
  mutation: MutationType
  node?: PhysicalProductInventoryStatusChange | null
  updatedFields?: Array<String> | null
  previousValues?: PhysicalProductInventoryStatusChangePreviousValues | null
}

export interface PhysicalProductPreviousValues {
  id: ID_Output
  seasonsUID: String
  inventoryStatus: InventoryStatus
  productStatus: PhysicalProductStatus
  offloadMethod?: PhysicalProductOffloadMethod | null
  offloadNotes?: String | null
  sequenceNumber: Int
  barcoded?: Boolean | null
  dateOrdered?: DateTime | null
  dateReceived?: DateTime | null
  unitCost?: Float | null
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
  type?: ProductType | null
  description?: String | null
  externalURL?: String | null
  images?: Array<Image> | null
  modelHeight?: Int | null
  retailPrice?: Int | null
  model?: ProductModel | null
  modelSize?: Size | null
  color: Color
  secondaryColor?: Color | null
  tags?: Array<Tag> | null
  functions?: Array<ProductFunction> | null
  materialCategory?: ProductMaterialCategory | null
  innerMaterials: Array<String>
  outerMaterials: Array<String>
  variants?: Array<ProductVariant> | null
  status?: ProductStatus | null
  statusChanges?: Array<ProductStatusChange> | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductMaterialCategory {
  id: ID_Output
  slug: String
  lifeExpectancy: Float
  category: Category
  products?: Array<Product> | null
}

export interface ProductMaterialCategoryConnection {
  pageInfo: PageInfo
  edges: Array<ProductMaterialCategoryEdge | null>
  aggregate: AggregateProductMaterialCategory
}

export interface ProductMaterialCategoryEdge {
  node: ProductMaterialCategory
  cursor: String
}

export interface ProductMaterialCategoryPreviousValues {
  id: ID_Output
  slug: String
  lifeExpectancy: Float
}

export interface ProductMaterialCategorySubscriptionPayload {
  mutation: MutationType
  node?: ProductMaterialCategory | null
  updatedFields?: Array<String> | null
  previousValues?: ProductMaterialCategoryPreviousValues | null
}

export interface ProductModel {
  id: ID_Output
  name: String
  height: Float
  products?: Array<Product> | null
}

export interface ProductModelConnection {
  pageInfo: PageInfo
  edges: Array<ProductModelEdge | null>
  aggregate: AggregateProductModel
}

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
  modelHeight?: Int | null
  retailPrice?: Int | null
  innerMaterials: Array<String>
  outerMaterials: Array<String>
  status?: ProductStatus | null
  season?: String | null
  architecture?: ProductArchitecture | null
  photographyStatus?: PhotographyStatus | null
  publishedAt?: DateTime | null
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

export interface ProductStatusChange {
  id: ID_Output
  old: ProductStatus
  new: ProductStatus
  product: Product
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductStatusChangeConnection {
  pageInfo: PageInfo
  edges: Array<ProductStatusChangeEdge | null>
  aggregate: AggregateProductStatusChange
}

export interface ProductStatusChangeEdge {
  node: ProductStatusChange
  cursor: String
}

export interface ProductStatusChangePreviousValues {
  id: ID_Output
  old: ProductStatus
  new: ProductStatus
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductStatusChangeSubscriptionPayload {
  mutation: MutationType
  node?: ProductStatusChange | null
  updatedFields?: Array<String> | null
  previousValues?: ProductStatusChangePreviousValues | null
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
  offloaded: Int
  stored: Int
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

export interface ProductVariantFeedback {
  id: ID_Output
  isCompleted: Boolean
  questions?: Array<ProductVariantFeedbackQuestion> | null
  reservationFeedback: ReservationFeedback
  variant: ProductVariant
}

export interface ProductVariantFeedbackConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantFeedbackEdge | null>
  aggregate: AggregateProductVariantFeedback
}

export interface ProductVariantFeedbackEdge {
  node: ProductVariantFeedback
  cursor: String
}

export interface ProductVariantFeedbackPreviousValues {
  id: ID_Output
  isCompleted: Boolean
}

export interface ProductVariantFeedbackQuestion {
  id: ID_Output
  options: Array<String>
  question: String
  responses: Array<String>
  type: QuestionType
  variantFeedback: ProductVariantFeedback
}

export interface ProductVariantFeedbackQuestionConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantFeedbackQuestionEdge | null>
  aggregate: AggregateProductVariantFeedbackQuestion
}

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
  offloaded: Int
  stored: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ProductVariantSubscriptionPayload {
  mutation: MutationType
  node?: ProductVariant | null
  updatedFields?: Array<String> | null
  previousValues?: ProductVariantPreviousValues | null
}

export interface ProductVariantWant {
  id: ID_Output
  productVariant: ProductVariant
  user: User
  isFulfilled: Boolean
}

export interface ProductVariantWantConnection {
  pageInfo: PageInfo
  edges: Array<ProductVariantWantEdge | null>
  aggregate: AggregateProductVariantWant
}

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

export interface PushNotificationReceipt {
  id: ID_Output
  route?: String | null
  screen?: String | null
  uri?: String | null
  users?: Array<User> | null
  interest?: String | null
  body: String
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PushNotificationReceiptConnection {
  pageInfo: PageInfo
  edges: Array<PushNotificationReceiptEdge | null>
  aggregate: AggregatePushNotificationReceipt
}

export interface PushNotificationReceiptEdge {
  node: PushNotificationReceipt
  cursor: String
}

export interface PushNotificationReceiptPreviousValues {
  id: ID_Output
  route?: String | null
  screen?: String | null
  uri?: String | null
  interest?: String | null
  body: String
  title?: String | null
  recordID?: String | null
  recordSlug?: String | null
  sentAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

export interface PushNotificationReceiptSubscriptionPayload {
  mutation: MutationType
  node?: PushNotificationReceipt | null
  updatedFields?: Array<String> | null
  previousValues?: PushNotificationReceiptPreviousValues | null
}

export interface RecentlyViewedProduct {
  id: ID_Output
  product: Product
  customer: Customer
  viewCount: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface RecentlyViewedProductConnection {
  pageInfo: PageInfo
  edges: Array<RecentlyViewedProductEdge | null>
  aggregate: AggregateRecentlyViewedProduct
}

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

export interface Reservation {
  id: ID_Output
  user: User
  customer: Customer
  sentPackage?: Package | null
  returnedPackage?: Package | null
  products?: Array<PhysicalProduct> | null
  reservationNumber: Int
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  receipt?: ReservationReceipt | null
  lastLocation?: Location | null
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

export interface ReservationFeedback {
  id: ID_Output
  comment?: String | null
  feedbacks?: Array<ProductVariantFeedback> | null
  rating?: Rating | null
  user: User
  reservation: Reservation
  createdAt: DateTime
  updatedAt: DateTime
  respondedAt?: DateTime | null
}

export interface ReservationFeedbackConnection {
  pageInfo: PageInfo
  edges: Array<ReservationFeedbackEdge | null>
  aggregate: AggregateReservationFeedback
}

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
  respondedAt?: DateTime | null
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
  phase: ReservationPhase
  shipped: Boolean
  status: ReservationStatus
  shippedAt?: DateTime | null
  receivedAt?: DateTime | null
  reminderSentAt?: DateTime | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationReceipt {
  id: ID_Output
  reservation: Reservation
  items?: Array<ReservationReceiptItem> | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationReceiptConnection {
  pageInfo: PageInfo
  edges: Array<ReservationReceiptEdge | null>
  aggregate: AggregateReservationReceipt
}

export interface ReservationReceiptEdge {
  node: ReservationReceipt
  cursor: String
}

export interface ReservationReceiptItem {
  id: ID_Output
  product: PhysicalProduct
  productStatus: PhysicalProductStatus
  notes?: String | null
}

export interface ReservationReceiptItemConnection {
  pageInfo: PageInfo
  edges: Array<ReservationReceiptItemEdge | null>
  aggregate: AggregateReservationReceiptItem
}

export interface ReservationReceiptItemEdge {
  node: ReservationReceiptItem
  cursor: String
}

export interface ReservationReceiptItemPreviousValues {
  id: ID_Output
  productStatus: PhysicalProductStatus
  notes?: String | null
}

export interface ReservationReceiptItemSubscriptionPayload {
  mutation: MutationType
  node?: ReservationReceiptItem | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationReceiptItemPreviousValues | null
}

export interface ReservationReceiptPreviousValues {
  id: ID_Output
  createdAt: DateTime
  updatedAt: DateTime
}

export interface ReservationReceiptSubscriptionPayload {
  mutation: MutationType
  node?: ReservationReceipt | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationReceiptPreviousValues | null
}

export interface ReservationSubscriptionPayload {
  mutation: MutationType
  node?: Reservation | null
  updatedFields?: Array<String> | null
  previousValues?: ReservationPreviousValues | null
}

export interface Size {
  id: ID_Output
  slug: String
  productType?: ProductType | null
  top?: TopSize | null
  bottom?: BottomSize | null
  display: String
}

export interface SizeConnection {
  pageInfo: PageInfo
  edges: Array<SizeEdge | null>
  aggregate: AggregateSize
}

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

export interface Tag {
  id: ID_Output
  name: String
  description?: String | null
  products?: Array<Product> | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface TagConnection {
  pageInfo: PageInfo
  edges: Array<TagEdge | null>
  aggregate: AggregateTag
}

export interface TagEdge {
  node: Tag
  cursor: String
}

export interface TagPreviousValues {
  id: ID_Output
  name: String
  description?: String | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface TagSubscriptionPayload {
  mutation: MutationType
  node?: Tag | null
  updatedFields?: Array<String> | null
  previousValues?: TagPreviousValues | null
}

export interface TopSize {
  id: ID_Output
  letter?: LetterSize | null
  sleeve?: Float | null
  shoulder?: Float | null
  chest?: Float | null
  neck?: Float | null
  length?: Float | null
}

export interface TopSizeConnection {
  pageInfo: PageInfo
  edges: Array<TopSizeEdge | null>
  aggregate: AggregateTopSize
}

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

export interface User {
  id: ID_Output
  auth0Id: String
  email: String
  firstName: String
  lastName: String
  role: UserRole
  roles: Array<UserRole>
  createdAt: DateTime
  updatedAt: DateTime
  pushNotificationStatus: PushNotificationStatus
  pushNotifications?: Array<PushNotificationReceipt> | null
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
  roles: Array<UserRole>
  createdAt: DateTime
  updatedAt: DateTime
  pushNotificationStatus: PushNotificationStatus
}

export interface UserSubscriptionPayload {
  mutation: MutationType
  node?: User | null
  updatedFields?: Array<String> | null
  previousValues?: UserPreviousValues | null
}

export interface WarehouseLocation {
  id: ID_Output
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  physicalProducts?: Array<PhysicalProduct> | null
  constraints?: Array<WarehouseLocationConstraint> | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface WarehouseLocationConnection {
  pageInfo: PageInfo
  edges: Array<WarehouseLocationEdge | null>
  aggregate: AggregateWarehouseLocation
}

export interface WarehouseLocationConstraint {
  id: ID_Output
  category: Category
  limit: Int
  locations?: Array<WarehouseLocation> | null
  createdAt: DateTime
  updatedAt: DateTime
}

export interface WarehouseLocationConstraintConnection {
  pageInfo: PageInfo
  edges: Array<WarehouseLocationConstraintEdge | null>
  aggregate: AggregateWarehouseLocationConstraint
}

export interface WarehouseLocationConstraintEdge {
  node: WarehouseLocationConstraint
  cursor: String
}

export interface WarehouseLocationConstraintPreviousValues {
  id: ID_Output
  limit: Int
  createdAt: DateTime
  updatedAt: DateTime
}

export interface WarehouseLocationConstraintSubscriptionPayload {
  mutation: MutationType
  node?: WarehouseLocationConstraint | null
  updatedFields?: Array<String> | null
  previousValues?: WarehouseLocationConstraintPreviousValues | null
}

export interface WarehouseLocationEdge {
  node: WarehouseLocation
  cursor: String
}

export interface WarehouseLocationPreviousValues {
  id: ID_Output
  type: WarehouseLocationType
  barcode: String
  locationCode: String
  itemCode: String
  createdAt: DateTime
  updatedAt: DateTime
}

export interface WarehouseLocationSubscriptionPayload {
  mutation: MutationType
  node?: WarehouseLocation | null
  updatedFields?: Array<String> | null
  previousValues?: WarehouseLocationPreviousValues | null
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