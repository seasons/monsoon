"use strict";
// Code generated by Prisma (prisma@1.34.10). DO NOT EDIT.
// Please don't change this file manually but run `prisma generate` to update it.
// For more information, please read the docs: https://www.prisma.io/docs/prisma-client/
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_client_lib_1 = require("prisma-client-lib");
var prisma_schema_1 = require("./prisma-schema");
/**
 * Model Metadata
 */
exports.models = [
    {
        name: "BrandTier",
        embedded: false
    },
    {
        name: "Material",
        embedded: false
    },
    {
        name: "Department",
        embedded: false
    },
    {
        name: "LocationType",
        embedded: false
    },
    {
        name: "CustomerStatus",
        embedded: false
    },
    {
        name: "UserRole",
        embedded: false
    },
    {
        name: "InventoryStatus",
        embedded: false
    },
    {
        name: "PhysicalProductStatus",
        embedded: false
    },
    {
        name: "ProductStatus",
        embedded: false
    },
    {
        name: "ReservationStatus",
        embedded: false
    },
    {
        name: "BagItemStatus",
        embedded: false
    },
    {
        name: "Plan",
        embedded: false
    },
    {
        name: "ProductType",
        embedded: false
    },
    {
        name: "BottomSizeType",
        embedded: false
    },
    {
        name: "Brand",
        embedded: false
    },
    {
        name: "Category",
        embedded: false
    },
    {
        name: "Color",
        embedded: false
    },
    {
        name: "Collection",
        embedded: false
    },
    {
        name: "CollectionGroup",
        embedded: false
    },
    {
        name: "HomepageProductRail",
        embedded: false
    },
    {
        name: "Image",
        embedded: false
    },
    {
        name: "Location",
        embedded: false
    },
    {
        name: "Product",
        embedded: false
    },
    {
        name: "ProductFunction",
        embedded: false
    },
    {
        name: "ProductVariant",
        embedded: false
    },
    {
        name: "PhysicalProduct",
        embedded: false
    },
    {
        name: "User",
        embedded: false
    },
    {
        name: "PushNotificationStatus",
        embedded: false
    },
    {
        name: "CustomerDetail",
        embedded: false
    },
    {
        name: "BagItem",
        embedded: false
    },
    {
        name: "Customer",
        embedded: false
    },
    {
        name: "RecentlyViewedProduct",
        embedded: false
    },
    {
        name: "Order",
        embedded: false
    },
    {
        name: "Reservation",
        embedded: false
    },
    {
        name: "Package",
        embedded: false
    },
    {
        name: "Label",
        embedded: false
    },
    {
        name: "BillingInfo",
        embedded: false
    },
    {
        name: "ProductRequest",
        embedded: false
    },
    {
        name: "ProductVariantWant",
        embedded: false
    },
    {
        name: "LetterSize",
        embedded: false
    },
    {
        name: "TopSize",
        embedded: false
    },
    {
        name: "BottomSize",
        embedded: false
    },
    {
        name: "Size",
        embedded: false
    }
];
/**
 * Type Defs
 */
exports.Prisma = prisma_client_lib_1.makePrismaClientClass({
    typeDefs: prisma_schema_1.typeDefs,
    models: exports.models,
    endpoint: "" + process.env["PRISMA_ENDPOINT"],
    secret: "" + process.env["PRISMA_SECRET"]
});
exports.prisma = new exports.Prisma();
//# sourceMappingURL=index.js.map