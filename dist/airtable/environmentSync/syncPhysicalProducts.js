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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../utils");
const utils_2 = require("../utils");
const config_1 = require("../config");
const _1 = require(".");
exports.syncPhysicalProducts = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allPhysicalProductsProduction = yield utils_2.getAllPhysicalProducts(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Physical Products", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Physical Products",
        allProductionRecords: allPhysicalProductsProduction,
        sanitizeFunc: fields => utils_1.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { Product: [], Location: [], "Product Variant": [], Reservations: [] }), [
            "Created At",
            "Updated At",
            "Sequence Number",
            "Item Weight",
            "Barcode Image URL",
            "Images",
            "Barcode",
            "Category",
        ]),
        cliProgressBar,
    });
    const allPhysicalProductsStaging = yield utils_2.getAllPhysicalProducts(config_1.getStagingBase());
    yield addProductLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar);
    yield addProductVariantLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar);
    yield addLocationLinks(allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar);
});
exports.getNumLinksPhysicalProducts = () => 3;
const addProductLinks = (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Physical Products",
        targetFieldNameOnRootRecord: "Product",
        allRootProductionRecords: allPhysicalProductsProduction,
        allRootStagingRecords: allPhysicalProductsStaging,
        allTargetProductionRecords: yield utils_2.getAllProducts(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_2.getAllProducts(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.SUID.text,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
const addProductVariantLinks = (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Physical Products",
        targetFieldNameOnRootRecord: "Product Variant",
        allRootProductionRecords: allPhysicalProductsProduction,
        allRootStagingRecords: allPhysicalProductsStaging,
        allTargetProductionRecords: yield utils_2.getAllProductVariants(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_2.getAllProductVariants(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.SUID.text,
        getTargetRecordIdentifer: rec => rec.fields.SKU,
        cliProgressBar,
    });
});
const addLocationLinks = (allPhysicalProductsProduction, allPhysicalProductsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Physical Products",
        targetFieldNameOnRootRecord: "Location",
        allRootProductionRecords: allPhysicalProductsProduction,
        allRootStagingRecords: allPhysicalProductsStaging,
        allTargetProductionRecords: yield utils_2.getAllLocations(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_2.getAllLocations(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.SUID.text,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncPhysicalProducts.js.map