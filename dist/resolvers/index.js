"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Query_1 = require("./Query");
var auth_1 = require("./Mutation/auth");
var customer_1 = require("./Mutation/customer");
var Me_1 = require("./Me");
var Homepage_1 = require("./Homepage");
var Product_1 = require("./Product");
var ProductRequest_1 = require("./ProductRequest");
var Reservation_1 = require("./Reservation");
var PhysicalProduct_1 = require("./PhysicalProduct");
var ProductVariant_1 = require("./ProductVariant");
var ProductVariantWant_1 = require("./ProductVariantWant");
var user_1 = require("./Mutation/user");
var bag_1 = require("./Mutation/bag");
var address_1 = require("./Mutation/address");
var Search_1 = require("./Search");
var recentlyViewedProduct_1 = require("./Mutation/recentlyViewedProduct");
exports.default = {
    Query: Query_1.Query,
    HomepageResult: Homepage_1.HomepageResult,
    Mutation: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, auth_1.auth), Product_1.ProductMutations), ProductRequest_1.ProductRequestMutations), ProductVariantWant_1.ProductVariantWantMutations), customer_1.customer), bag_1.bag), address_1.address), recentlyViewedProduct_1.recentlyViewedProduct), user_1.UpdateUserPushNotifications),
    Me: Me_1.Me,
    Reservation: Reservation_1.Reservation,
    PhysicalProduct: PhysicalProduct_1.PhysicalProduct,
    Product: Product_1.Product,
    ProductVariant: ProductVariant_1.ProductVariant,
    SearchResultType: Search_1.SearchResultType,
};
//# sourceMappingURL=index.js.map