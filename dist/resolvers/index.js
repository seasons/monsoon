"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("./Query");
const auth_1 = require("./Mutation/auth");
const customer_1 = require("./Mutation/customer");
const Me_1 = require("./Me");
const Homepage_1 = require("./Homepage");
const Product_1 = require("./Product");
const ProductRequest_1 = require("./ProductRequest");
const Reservation_1 = require("./Reservation");
const PhysicalProduct_1 = require("./PhysicalProduct");
const ProductVariant_1 = require("./ProductVariant");
const ProductVariantWant_1 = require("./ProductVariantWant");
const user_1 = require("./Mutation/user");
const bag_1 = require("./Mutation/bag");
const address_1 = require("./Mutation/address");
const Search_1 = require("./Search");
const recentlyViewedProduct_1 = require("./Mutation/recentlyViewedProduct");
exports.default = {
    Query: Query_1.Query,
    HomepageResult: Homepage_1.HomepageResult,
    Mutation: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, auth_1.auth), Product_1.ProductMutations), ProductRequest_1.ProductRequestMutations), ProductVariantWant_1.ProductVariantWantMutations), customer_1.customer), bag_1.bag), address_1.address), recentlyViewedProduct_1.recentlyViewedProduct), user_1.UpdateUserPushNotifications),
    Me: Me_1.Me,
    Reservation: Reservation_1.Reservation,
    PhysicalProduct: PhysicalProduct_1.PhysicalProduct,
    Product: Product_1.Product,
    ProductVariant: ProductVariant_1.ProductVariant,
    SearchResultType: Search_1.SearchResultType,
};
//# sourceMappingURL=index.js.map