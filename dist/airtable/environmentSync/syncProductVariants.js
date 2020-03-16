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
const utils_1 = require("../utils");
const utils_2 = require("../../utils");
const config_1 = require("../config");
const _1 = require(".");
exports.syncProductVariants = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allProductVariantsProduction = yield utils_1.getAllProductVariants(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Product Variants", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Product Variants",
        allProductionRecords: allProductVariantsProduction,
        sanitizeFunc: fields => utils_2.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { Product: [], "Physical Products": [], Orders: [] }), ["Variant Number", "Created At", "Images", "Brand", "Color"]),
        cliProgressBar,
    });
    const allProductVariantsStaging = yield utils_1.getAllProductVariants(config_1.getStagingBase());
    yield addProductLinks(allProductVariantsProduction, allProductVariantsStaging, cliProgressBar);
});
exports.getNumLinksProductVariants = () => 1;
const addProductLinks = (allProductionProductVariants, allStagingProductVariants, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Product Variants",
        targetFieldNameOnRootRecord: "Product",
        allRootProductionRecords: allProductionProductVariants,
        allRootStagingRecords: allStagingProductVariants,
        allTargetProductionRecords: yield utils_1.getAllProducts(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllProducts(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.SKU,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncProductVariants.js.map