"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../airtable/utils");
var prisma_1 = require("../prisma");
var utils_2 = require("./utils");
var server_1 = require("../server");
var utils_3 = require("../utils");
var lodash_1 = require("lodash");
var updateProductVariantCounts_1 = require("../airtable/updateProductVariantCounts");
function checkProductsAlignment() {
    return __awaiter(this, void 0, void 0, function () {
        var allAirtableProductVariants, allAirtablePhysicalProducts, allAirtableProducts, allAirtableReservations, allPrismaProductVariants, allPrismaPhysicalProducts, allPrismaProducts, allPrismaReservations, errors, allPrismaProductSlugs, allAirtableProductSlugs, productsInAirtableButNotPrisma, productsInPrismaButNotAirtable, allPrismaPhysicalProductSUIDs, allAirtablePhysicalProductSUIDs, physicalProductsInAirtableButNotPrisma, physicalProductsInPrismaButNotAirtable, allPrismaProductVariantSKUs, allAirtableProductVariantSKUs, productVariantsInAirtableButNotPrisma, productVariantsInPrismaButNotAirtable, _a, productVariantSKUMismatches, prismaAirtableSKUCheckErrors, _b, prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches, _c, countMisalignments, prismaTotalPhysicalProductMisalignment, airtableTotalPhysicalProductMisalignment, _d, prismaCountToStatusMisalignments, airtableCountToStatusMisalignments, prismaProdVarsWithImpossibleCounts, _e, mismatchingStatuses, physicalProductsOnPrismaButNotAirtable, _f, misalignedSUIDsOnReservations, misalignedStatusOnReservations, reservationsWithMoreThanThreeProducts, reservationsInAirtableButNotPrisma, reservationsInPrismaButNotAirtable;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, utils_1.getAllProductVariants()];
                case 1:
                    allAirtableProductVariants = _g.sent();
                    return [4 /*yield*/, utils_1.getAllPhysicalProducts()];
                case 2:
                    allAirtablePhysicalProducts = _g.sent();
                    return [4 /*yield*/, utils_1.getAllProducts()];
                case 3:
                    allAirtableProducts = _g.sent();
                    return [4 /*yield*/, utils_1.getAllReservations()];
                case 4:
                    allAirtableReservations = _g.sent();
                    return [4 /*yield*/, server_1.db.query.productVariants({}, "{\n          id\n          product {\n              slug\n          }\n          physicalProducts {\n              seasonsUID\n              inventoryStatus\n          }\n          size\n          sku\n          total\n          reservable\n          reserved\n          nonReservable\n          createdAt\n      }")];
                case 5:
                    allPrismaProductVariants = _g.sent();
                    return [4 /*yield*/, prisma_1.prisma.physicalProducts()];
                case 6:
                    allPrismaPhysicalProducts = _g.sent();
                    return [4 /*yield*/, prisma_1.prisma.products()];
                case 7:
                    allPrismaProducts = _g.sent();
                    return [4 /*yield*/, server_1.db.query.reservations({}, "\n    {\n        id\n        reservationNumber\n        products {\n            seasonsUID\n        }\n        status\n    }\n    ")];
                case 8:
                    allPrismaReservations = _g.sent();
                    errors = [];
                    allPrismaProductSlugs = allPrismaProducts.map(function (prod) { return prod.slug; });
                    allAirtableProductSlugs = allAirtableProducts.map(function (prod) { return prod.fields.Slug; });
                    productsInAirtableButNotPrisma = allAirtableProductSlugs.filter(function (slug) { return !allPrismaProductSlugs.includes(slug); });
                    productsInPrismaButNotAirtable = allPrismaProductSlugs.filter(function (slug) { return !allAirtableProductSlugs.includes(slug); });
                    allPrismaPhysicalProductSUIDs = allPrismaPhysicalProducts.map(function (physProd) { return physProd.seasonsUID; });
                    allAirtablePhysicalProductSUIDs = allAirtablePhysicalProducts.map(function (physProd) { return physProd.fields.SUID.text; });
                    physicalProductsInAirtableButNotPrisma = allAirtablePhysicalProductSUIDs.filter(function (suid) { return !allPrismaPhysicalProductSUIDs.includes(suid); });
                    physicalProductsInPrismaButNotAirtable = allPrismaPhysicalProductSUIDs.filter(function (suid) { return !allAirtablePhysicalProductSUIDs.includes(suid); });
                    allPrismaProductVariantSKUs = allPrismaProductVariants.map(function (prodVar) { return prodVar.sku; });
                    allAirtableProductVariantSKUs = allAirtableProductVariants.map(function (prodVar) { return prodVar.fields.SKU; });
                    productVariantsInAirtableButNotPrisma = allAirtableProductVariantSKUs.filter(function (sku) { return !allPrismaProductVariantSKUs.includes(sku); });
                    productVariantsInPrismaButNotAirtable = allPrismaProductVariantSKUs.filter(function (sku) { return !allAirtableProductVariantSKUs.includes(sku); });
                    _a = getPrismaAirtableProductVariantSKUMismatches(allAirtableProducts, allAirtableProductVariants, allPrismaProductVariants, productVariantsInPrismaButNotAirtable), productVariantSKUMismatches = _a.productVariantSKUMismatches, prismaAirtableSKUCheckErrors = _a.errors;
                    errors = __spreadArrays(errors, prismaAirtableSKUCheckErrors);
                    _b = checkSUIDs(allPrismaProductVariants, allAirtableProductVariants, allAirtablePhysicalProducts), prismaSUIDToSKUMismatches = _b.prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches = _b.airtableSUIDToSKUMismatches;
                    _c = checkCounts(allAirtableProductVariants, allPrismaProductVariants, allAirtableProducts), countMisalignments = _c.countMisalignments, prismaTotalPhysicalProductMisalignment = _c.prismaTotalPhysicalProductMisalignment, airtableTotalPhysicalProductMisalignment = _c.airtableTotalPhysicalProductMisalignment;
                    _d = checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses(allPrismaProductVariants, allAirtableProductVariants, allAirtablePhysicalProducts), prismaCountToStatusMisalignments = _d[0], airtableCountToStatusMisalignments = _d[1];
                    return [4 /*yield*/, getProdVarsWithImpossibleCounts(allPrismaProductVariants)
                        /* Are the physical product statuses matching between prisma and airtable? */
                    ];
                case 9:
                    prismaProdVarsWithImpossibleCounts = _g.sent();
                    _e = checkPhysicalProductStatuses(allPrismaPhysicalProducts, allAirtablePhysicalProducts), mismatchingStatuses = _e.mismatchingStatuses, physicalProductsOnPrismaButNotAirtable = _e.physicalProductsOnPrismaButNotAirtable;
                    _f = checkReservations(allPrismaReservations, allAirtableReservations, allAirtablePhysicalProducts), misalignedSUIDsOnReservations = _f.misalignedSUIDsOnReservations, misalignedStatusOnReservations = _f.misalignedStatusOnReservations, reservationsWithMoreThanThreeProducts = _f.reservationsWithMoreThanThreeProducts, reservationsInAirtableButNotPrisma = _f.reservationsInAirtableButNotPrisma, reservationsInPrismaButNotAirtable = _f.reservationsInPrismaButNotAirtable;
                    /* REPORT */
                    console.log("/*********** REPORT ***********/");
                    console.log("--- PRODUCTS ON PRISMA BUT NOR AIRTABLE: " + productsInPrismaButNotAirtable.length);
                    console.log("--- PRODUCTS ON AIRTABLE BUT NOT PRISMA: " + productsInAirtableButNotPrisma.length);
                    console.log("DO PRODUCTS, PHYSICAL PRODUCTS, AND PRODUCT VARIANTS ALIGN IN NUMBER?");
                    console.log("--- PHYSICAL PRODUCTS ON PRISMA BUT NOT AIRTABLE: " + physicalProductsInPrismaButNotAirtable.length);
                    console.log("--- PHYSICAL PRODUCTS ON AIRTABLE BUT NOT PRISMA: " + physicalProductsInAirtableButNotPrisma.length);
                    console.log("--- PRODUCT VARIANTS ON PRISMA BUT NOT AIRTABLE: " + productVariantsInPrismaButNotAirtable.length);
                    console.log("--- PRODUCT VARIANTS ON AIRTABLE BUT NOT PRISMA: " + productVariantsInAirtableButNotPrisma.length);
                    console.log("");
                    console.log("DO PRODUCT VARIANT SKUS MATCH ON PRISMA AND AIRTABLE?");
                    console.log("-- MISMATCHED PRODUCT VARIANT SKUS BETWEEN PRISMA/AIRTABLE: " + productVariantSKUMismatches.length);
                    console.log("");
                    console.log("ARE SUIDS CORRECT ON PRISMA AND AIRTABLE?");
                    console.log("-- MISMATCHED SUID/SKU COMBOS ON PRISMA: " + prismaSUIDToSKUMismatches.length);
                    console.log("-- MISMATCHED SUID/SKU COMBOS ON AIRTABLE: " + airtableSUIDToSKUMismatches.length);
                    console.log("");
                    console.log("ARE THE COUNTS THE SAME ON PRISMA AND AIRTABLE?");
                    console.log("-- MISMATCHED COUNTS: " + countMisalignments.length);
                    console.log(countMisalignments);
                    console.log("-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH INCORRECT NUMBER OF PHYSICAL PRODUCTS ATTACHED: " + prismaTotalPhysicalProductMisalignment.length);
                    console.log("-- AIRTABLE: NUMBER OF PRODUCT VARIANTS WITH INCORRECT NUMBER OF PHYSICAL PRODUCTS ATTACHED: " + airtableTotalPhysicalProductMisalignment.length);
                    console.log("-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH A COUNT PROFILE THAT DOESN'T MATCH THE STATUSES OF THE ATTACHED PHYSICAL PRODUCTS: " + prismaCountToStatusMisalignments.length);
                    console.log("-- AIRTABLE: NUMBER OF PRODUCT VARIANTS WITH A COUNT PROFILE THAT DOESN'T MATCH THE STATUSES OF THE ATTACHED PHYSICAL PRODUCTS: " + airtableCountToStatusMisalignments.length);
                    console.log("-- PRISMA: NUMBER OF PRODUCT VARIANTS WITH TOTAL != RESERVED + RESERVABLE + NONRESERVABLE: " + prismaProdVarsWithImpossibleCounts.length);
                    console.log("");
                    console.log("ARE THE PHYSICAL PRODUCT STATUSES ALIGNED?");
                    console.log("---NUMBER OF PHYSICAL PRODUCTS WITH MISMATCHING INVENTORY STATUSES: " + mismatchingStatuses.length);
                    console.log("ARE THE RESERVATIONS ALIGNED?");
                    console.log("-- RESERVATIONS IN PRISMA BUT NOT AIRTABLE; " + reservationsInPrismaButNotAirtable.length);
                    console.log("-- RESERVATIONS IN AIRTABLE BUT NOT PRISMA: " + reservationsInAirtableButNotPrisma.length);
                    console.log("-- RESERVATIONS WITH MISMATCHING PRODUCTS: " + misalignedSUIDsOnReservations.length);
                    console.log("-- RESERVATIONS WITH MISMATCHING STATUSES: " + misalignedStatusOnReservations.length);
                    console.log("-- RESERVATIONS WITH MORE THAN 3 PRODUCTS: " + reservationsWithMoreThanThreeProducts.length);
                    console.log("ERRORS: " + errors.length);
                    return [2 /*return*/, [
                            productsInPrismaButNotAirtable,
                            productsInAirtableButNotPrisma,
                            physicalProductsInPrismaButNotAirtable,
                            physicalProductsInAirtableButNotPrisma,
                            productVariantsInPrismaButNotAirtable,
                            productVariantsInAirtableButNotPrisma,
                            productVariantSKUMismatches,
                            prismaSUIDToSKUMismatches,
                            airtableSUIDToSKUMismatches,
                            countMisalignments,
                            prismaTotalPhysicalProductMisalignment,
                            airtableTotalPhysicalProductMisalignment,
                            prismaCountToStatusMisalignments,
                            airtableCountToStatusMisalignments,
                            prismaProdVarsWithImpossibleCounts,
                            mismatchingStatuses,
                            reservationsInPrismaButNotAirtable,
                            reservationsInAirtableButNotPrisma,
                            misalignedSUIDsOnReservations,
                            misalignedStatusOnReservations,
                            reservationsWithMoreThanThreeProducts,
                            errors,
                        ]];
            }
        });
    });
}
exports.checkProductsAlignment = checkProductsAlignment;
checkProductsAlignment();
// *****************************************************************************
function getPrismaAirtableProductVariantSKUMismatches(allAirtableProducts, allAirtableProductVariants, allPrismaProductVariants, productVariantsInPrismaButNotAirtable) {
    var productVariantSKUMismatches = [];
    var errors = [];
    for (var _i = 0, allPrismaProductVariants_1 = allPrismaProductVariants; _i < allPrismaProductVariants_1.length; _i++) {
        var prismaProductVariant = allPrismaProductVariants_1[_i];
        try {
            // If its not in airtable, skip it
            if (productVariantsInPrismaButNotAirtable.includes(prismaProductVariant.sku)) {
                continue;
            }
            // Check if the skus match
            var correspondingAirtableProductVariant = utils_2.getCorrespondingAirtableProductVariant(allAirtableProducts, allAirtableProductVariants, prismaProductVariant);
            if (prismaProductVariant.sku !==
                correspondingAirtableProductVariant.fields.SKU) {
                productVariantSKUMismatches.push({
                    prismaID: prismaProductVariant.id,
                    prismaSKU: prismaProductVariant.sku,
                    airtableRecordID: correspondingAirtableProductVariant.id,
                    airtableSKU: correspondingAirtableProductVariant.fields.SKU,
                });
            }
        }
        catch (err) {
            console.log(err);
            errors.push(err);
            continue;
        }
    }
    return { productVariantSKUMismatches: productVariantSKUMismatches, errors: errors };
}
function checkSUIDs(allPrismaProductVariants, allAirtableProductVariants, allAirtablePhysicalProducts) {
    var prismaSUIDToSKUMismatches = [];
    for (var _i = 0, allPrismaProductVariants_2 = allPrismaProductVariants; _i < allPrismaProductVariants_2.length; _i++) {
        var prismaProductVariant = allPrismaProductVariants_2[_i];
        for (var _a = 0, _b = prismaProductVariant.physicalProducts; _a < _b.length; _a++) {
            var physProd = _b[_a];
            if (!physProd.seasonsUID.startsWith(prismaProductVariant.sku)) {
                prismaSUIDToSKUMismatches.push({
                    productVariantSKU: prismaProductVariant.sku,
                    physicalProductSUID: physProd.seasonsUID,
                });
            }
        }
    }
    var airtableSUIDToSKUMismatches = [];
    for (var _c = 0, allAirtableProductVariants_1 = allAirtableProductVariants; _c < allAirtableProductVariants_1.length; _c++) {
        var airtableProductVariant = allAirtableProductVariants_1[_c];
        // If it has no physical products, skip it.
        if (!airtableProductVariant.fields["Physical Products"]) {
            continue;
        }
        var _loop_1 = function (airtablePhysProdRecordID) {
            var airtablePhysProdRecord = allAirtablePhysicalProducts.find(function (rec) { return rec.id == airtablePhysProdRecordID; });
            if (!airtablePhysProdRecord.fields.SUID.text.startsWith(airtableProductVariant.fields.SKU)) {
                airtableSUIDToSKUMismatches.push({
                    productVariantSKU: airtableProductVariant.fields.SKU,
                    physicalProductSUID: airtablePhysProdRecord.fields.SUID.text,
                });
            }
        };
        for (var _d = 0, _e = airtableProductVariant.fields["Physical Products"]; _d < _e.length; _d++) {
            var airtablePhysProdRecordID = _e[_d];
            _loop_1(airtablePhysProdRecordID);
        }
    }
    return { prismaSUIDToSKUMismatches: prismaSUIDToSKUMismatches, airtableSUIDToSKUMismatches: airtableSUIDToSKUMismatches };
}
function checkCounts(allAirtableProductVariants, allPrismaProductVariants, allAirtableProducts) {
    var countMisalignments = [];
    var prismaTotalPhysicalProductMisalignment = [];
    var airtableTotalPhysicalProductMisalignment = [];
    for (var _i = 0, allPrismaProductVariants_3 = allPrismaProductVariants; _i < allPrismaProductVariants_3.length; _i++) {
        var prismaProductVariant = allPrismaProductVariants_3[_i];
        var correspondingAirtableProductVariant = utils_2.getCorrespondingAirtableProductVariant(allAirtableProducts, allAirtableProductVariants, prismaProductVariant);
        // Are the total, reservable, reserved, and nonreservable counts identical?
        if (correspondingAirtableProductVariant === undefined) {
            console.log("could not find product variant in airtable. sku: ", prismaProductVariant.sku);
            continue;
        }
        var totalCorrect = prismaProductVariant.total ===
            correspondingAirtableProductVariant.fields["Total Count"];
        var reservableCorrect = prismaProductVariant.reservable ===
            correspondingAirtableProductVariant.fields["Reservable Count"];
        var reservedCorrect = prismaProductVariant.reserved ===
            correspondingAirtableProductVariant.fields["Reserved Count"];
        var nonReservableCorrect = prismaProductVariant.nonReservable ===
            correspondingAirtableProductVariant.fields["Non-Reservable Count"];
        if (!totalCorrect ||
            !reservableCorrect ||
            !reservedCorrect ||
            !nonReservableCorrect) {
            countMisalignments.push({
                sku: prismaProductVariant.sku,
                prismaCounts: {
                    total: prismaProductVariant.total,
                    reserved: prismaProductVariant.reserved,
                    reservable: prismaProductVariant.reservable,
                    nonReservable: prismaProductVariant.nonReservable,
                },
                airtableCounts: {
                    total: correspondingAirtableProductVariant.fields["Total Count"],
                    reserved: correspondingAirtableProductVariant.fields["Reserved Count"],
                    reservable: correspondingAirtableProductVariant.fields["Reservable Count"],
                    nonReservable: correspondingAirtableProductVariant.fields["Non-Reservable Count"],
                },
            });
        }
        // Does prisma have the number of physical products it should? ibid, Airtable?
        if (prismaProductVariant.physicalProducts.length !==
            prismaProductVariant.total) {
            prismaTotalPhysicalProductMisalignment.push({
                sku: prismaProductVariant.sku,
                totalCount: prismaProductVariant.total,
                attachedPhysicalProducts: prismaProductVariant.physicalProducts.length,
            });
        }
        var noPhysicalProductsAndMisalignment = !correspondingAirtableProductVariant.fields["Physical Products"] &&
            correspondingAirtableProductVariant.fields["Total Count"] !== 0;
        var physicalProductsAndMisalignment = !!correspondingAirtableProductVariant.fields["Physical Products"] &&
            correspondingAirtableProductVariant.fields["Physical Products"].length !==
                correspondingAirtableProductVariant.fields["Total Count"];
        if (noPhysicalProductsAndMisalignment || physicalProductsAndMisalignment) {
            airtableTotalPhysicalProductMisalignment.push({
                sku: correspondingAirtableProductVariant.fields.SKU,
                totalCount: correspondingAirtableProductVariant.fields["Total Count"],
                attachedPhysicalProducts: correspondingAirtableProductVariant.fields["Total Count"].length,
            });
        }
    }
    return {
        countMisalignments: countMisalignments,
        prismaTotalPhysicalProductMisalignment: prismaTotalPhysicalProductMisalignment,
        airtableTotalPhysicalProductMisalignment: airtableTotalPhysicalProductMisalignment,
    };
}
function checkPhysicalProductStatuses(allPrismaPhysicalProducts, allAirtablePhysicalProducts) {
    var mismatchingStatuses = [];
    var physicalProductsOnPrismaButNotAirtable = [];
    for (var _i = 0, allPrismaPhysicalProducts_1 = allPrismaPhysicalProducts; _i < allPrismaPhysicalProducts_1.length; _i++) {
        var prismaPhysicalProduct = allPrismaPhysicalProducts_1[_i];
        var correspondingAirtablePhysicalProduct = utils_2.getCorrespondingAirtablePhysicalProduct(allAirtablePhysicalProducts, prismaPhysicalProduct);
        if (!correspondingAirtablePhysicalProduct) {
            physicalProductsOnPrismaButNotAirtable.push(prismaPhysicalProduct.seasonsUID);
            continue;
        }
        else {
            if (utils_3.airtableToPrismaInventoryStatus(correspondingAirtablePhysicalProduct.fields["Inventory Status"]) !== prismaPhysicalProduct.inventoryStatus) {
                mismatchingStatuses.push({
                    seasonsUID: prismaPhysicalProduct.seasonsUID,
                    airtableInventoryStatus: correspondingAirtablePhysicalProduct.fields["Inventory Status"],
                    prismaInventoryStatus: prismaPhysicalProduct.inventoryStatus,
                });
            }
        }
    }
    return { mismatchingStatuses: mismatchingStatuses, physicalProductsOnPrismaButNotAirtable: physicalProductsOnPrismaButNotAirtable };
}
function checkReservations(allPrismaReservations, allAirtableReservations, allAirtablePhysicalProducts) {
    var misalignedSUIDsOnReservations = [];
    var misalignedStatusOnReservations = [];
    var reservationsWithMoreThanThreeProducts = [];
    var allPrismaReservationNumbers = allPrismaReservations.map(function (resy) { return resy.reservationNumber; });
    var allAirtableReservationNumbers = allAirtableReservations.map(function (resy) { return resy.fields.ID; });
    var reservationsInPrismaButNotAirtable = allPrismaReservationNumbers.filter(function (prismaResyNumber) {
        return !allAirtableReservationNumbers.includes(prismaResyNumber);
    });
    var reservationsInAirtableButNotPrisma = allAirtableReservationNumbers.filter(function (airtableResyNumber) {
        return !allPrismaReservationNumbers.includes(airtableResyNumber);
    });
    var _loop_2 = function (prismaResy) {
        if (reservationsInPrismaButNotAirtable.includes(prismaResy.reservationNumber)) {
            return "continue";
        }
        var correspondingAirtableReservation = allAirtableReservations.find(function (airtableResy) { return airtableResy.fields.ID === prismaResy.reservationNumber; });
        // Check SUID match
        var prismaPhysicalProductSUIDs = prismaResy.products.map(function (prod) { return prod.seasonsUID; });
        var airtablePhysicalProductSUIDs = correspondingAirtableReservation.fields.Items.map(function (airtablePhysicalProductRecordID) {
            return allAirtablePhysicalProducts.find(function (airtablePhysProd) {
                return airtablePhysProd.id === airtablePhysicalProductRecordID;
            });
        }).map(function (airtablePhysProdRecord) { return airtablePhysProdRecord.fields.SUID.text; });
        if (lodash_1.xor(prismaPhysicalProductSUIDs, airtablePhysicalProductSUIDs).length !== 0) {
            misalignedSUIDsOnReservations.push({
                reservationNumber: prismaResy.reservationNumber,
                airtableSUIDs: airtablePhysicalProductSUIDs,
                prismaSUIDs: prismaPhysicalProductSUIDs,
            });
        }
        // Check status match
        if (prismaResy.status !==
            correspondingAirtableReservation.fields.Status.replace(" ", "")) {
            misalignedStatusOnReservations.push({
                reservationNumber: prismaResy.reservationNumber,
                prismaStatus: prismaResy.status,
                airtableStatus: correspondingAirtableReservation.fields.Status,
            });
        }
        // Check item count
        if (prismaPhysicalProductSUIDs.length > 3) {
            reservationsWithMoreThanThreeProducts.push({
                reservationNumber: prismaResy.reservationNumber,
            });
        }
    };
    for (var _i = 0, allPrismaReservations_1 = allPrismaReservations; _i < allPrismaReservations_1.length; _i++) {
        var prismaResy = allPrismaReservations_1[_i];
        _loop_2(prismaResy);
    }
    return {
        misalignedSUIDsOnReservations: misalignedSUIDsOnReservations,
        misalignedStatusOnReservations: misalignedStatusOnReservations,
        reservationsWithMoreThanThreeProducts: reservationsWithMoreThanThreeProducts,
        reservationsInAirtableButNotPrisma: reservationsInAirtableButNotPrisma,
        reservationsInPrismaButNotAirtable: reservationsInPrismaButNotAirtable,
    };
}
var checkMisalignmentsBetweenProdVarCountsAndPhysProdStatuses = function (allPrismaProductVariants, allAirtableProductVariants, allAirtablePhysicalProducts) {
    var prismaMisalignments = allPrismaProductVariants
        .filter(function (a) {
        var physicalProductsWithStatusReserved = a.physicalProducts.filter(function (b) { return b.inventoryStatus === "Reserved"; });
        var physicalProductsWithStatusReservable = a.physicalProducts.filter(function (b) { return b.inventoryStatus === "Reservable"; });
        var physicalProductsWithStatusNonReservable = a.physicalProducts.filter(function (b) { return b.inventoryStatus === "NonReservable"; });
        return (a.reservable !== physicalProductsWithStatusReservable.length ||
            a.reserved !== physicalProductsWithStatusReserved.length ||
            a.nonReservable !== physicalProductsWithStatusNonReservable.length);
    })
        .map(function (c) {
        return utils_3.Identity({
            sku: c.sku,
            createdAt: c.createdAt,
            counts: {
                total: c.total,
                reservable: c.reservable,
                reserved: c.reserved,
                nonReservable: c.nonReservable,
            },
            physicalProducts: c.physicalProducts.map(function (d) {
                return utils_3.Identity({
                    suid: d.seasonsUID,
                    status: d.inventoryStatus,
                });
            }),
        });
    });
    var airtableMisalignments = allAirtableProductVariants
        .filter(function (a) {
        var correspondingAirtablePhysicalProducts = getAttachedAirtablePhysicalProducts(allAirtablePhysicalProducts, a);
        var physicalProductsWithStatusReserved = correspondingAirtablePhysicalProducts.filter(function (c) { return c.fields["Inventory Status"] === "Reserved"; });
        var physicalProductsWithStatusReservable = correspondingAirtablePhysicalProducts.filter(function (c) { return c.fields["Inventory Status"] === "Reservable"; });
        var physicalProductsWithStatusNonReservable = correspondingAirtablePhysicalProducts.filter(function (c) { return c.fields["Inventory Status"] === "Non Reservable"; });
        return (!!a.fields.SKU &&
            (a.fields["Reservable Count"] !==
                physicalProductsWithStatusReservable.length ||
                a.fields["Reserved Count"] !==
                    physicalProductsWithStatusReserved.length ||
                a.fields["Non-Reservable Count"] !==
                    physicalProductsWithStatusNonReservable.length));
    })
        .map(function (d) {
        return utils_3.Identity({
            sku: d.fields.SKU,
            counts: {
                total: d.fields["Total Count"],
                reservable: d.fields["Reservable Count"],
                reserved: d.fields["Reserved Count"],
                nonReservable: d.fields["Non-Reservable Count"],
            },
            physicalProducts: getAttachedAirtablePhysicalProducts(allAirtablePhysicalProducts, d).map(function (e) {
                return utils_3.Identity({
                    SUID: e.fields.SUID.text,
                    status: e.fields["Inventory Status"],
                });
            }),
        });
    });
    return [prismaMisalignments, airtableMisalignments];
};
var getAttachedAirtablePhysicalProducts = function (allAirtablePhysicalProducts, airtableProductVariant) {
    if (!airtableProductVariant.fields.SKU)
        return [];
    return allAirtablePhysicalProducts.filter(function (a) {
        return airtableProductVariant.fields["Physical Products"].includes(a.id);
    });
};
var getProductVariantReservationHistory = function (prisma, prodVarSku) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.reservations({
                    where: { products_some: { seasonsUID_contains: prodVarSku } },
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var setProductVariantCountsByPhysicalProductStatuses = function (prodVar) { return __awaiter(void 0, void 0, void 0, function () {
    var trueReserved, trueReservable, trueNonReservable, trueCounts;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                trueReserved = prodVar.physicalProducts.filter(function (b) { return b.status === "Reserved"; }).length;
                trueReservable = prodVar.physicalProducts.filter(function (b) { return b.status === "Reservable"; }).length;
                trueNonReservable = prodVar.physicalProducts.filter(function (b) { return b.status === "NonReservable"; }).length;
                trueCounts = {
                    reserved: trueReserved,
                    reservable: trueReservable,
                    nonReservable: trueNonReservable,
                };
                return [4 /*yield*/, prisma_1.prisma.updateProductVariant({
                        where: { sku: prodVar.sku },
                        data: trueCounts,
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var getProdVarsWithImpossibleCounts = function (allPrismaProductVariants) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, allPrismaProductVariants
                .filter(function (a) { return a.total !== a.reserved + a.reservable + a.nonReservable; })
                .map(function (a) {
                return utils_3.Identity({
                    sku: a.sku,
                    total: a.total,
                    reserved: a.reserved,
                    reservable: a.reservable,
                    nonReservable: a.nonReservable,
                });
            })];
    });
}); };
var alignAirtableCountsWithPrismaCounts = function (allAirtableProductVariants, allPrismaProductVariants) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        allPrismaProductVariants.forEach(function (a) { return __awaiter(void 0, void 0, void 0, function () {
            var correspondingAirtableProductVariant;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        correspondingAirtableProductVariant = allAirtableProductVariants.find(function (b) { return !!b.fields.SKU && b.fields.SKU === a.sku; });
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, updateProductVariantCounts_1.updateProductVariantCounts(correspondingAirtableProductVariant.id, {
                                "Reservable Count": a.reservable,
                                "Reserved Count": a.reserved,
                                "Non-Reservable Count": a.nonReservable,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
//# sourceMappingURL=airtableToPrismaHealthCheck.js.map