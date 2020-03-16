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
exports.syncProducts = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allProductsProduction = yield utils_1.getAllProducts(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Products", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Products",
        allProductionRecords: allProductsProduction,
        sanitizeFunc: fields => utils_2.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { Brand: [], Model: [], "Product Variants": [], "Physical Products": [], Category: [], Images: _1.sanitizeAttachments(fields.Images), "Homepage product rail": [], Collections: [] }), ["Created Date", "Parent", "Model Height"]),
        cliProgressBar,
    });
    const allProductsStaging = yield utils_1.getAllProducts(config_1.getStagingBase());
    yield addBrandLinks(allProductsProduction, allProductsStaging, cliProgressBar);
    yield addModelLinks(allProductsProduction, allProductsStaging, cliProgressBar);
    yield addCategoryLinks(allProductsProduction, allProductsStaging, cliProgressBar);
    yield addCollectionLinks(allProductsProduction, allProductsStaging, cliProgressBar);
});
exports.getNumLinksProducts = () => 4;
const addBrandLinks = (allProductionProducts, allStagingProducts, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Products",
        targetFieldNameOnRootRecord: "Brand",
        allRootProductionRecords: allProductionProducts,
        allRootStagingRecords: allStagingProducts,
        allTargetProductionRecords: yield utils_1.getAllBrands(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllBrands(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Slug,
        getTargetRecordIdentifer: rec => rec.fields.Name,
        cliProgressBar,
    });
});
const addModelLinks = (allProductionProducts, allStagingProducts, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Products",
        targetFieldNameOnRootRecord: "Model",
        allRootProductionRecords: allProductionProducts,
        allRootStagingRecords: allStagingProducts,
        allTargetProductionRecords: yield utils_1.getAllModels(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllModels(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Slug,
        getTargetRecordIdentifer: rec => rec.fields.Name,
        cliProgressBar,
    });
});
const addCategoryLinks = (allProductionProducts, allStagingProducts, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Products",
        targetFieldNameOnRootRecord: "Category",
        allRootProductionRecords: allProductionProducts,
        allRootStagingRecords: allStagingProducts,
        allTargetProductionRecords: yield utils_1.getAllCategories(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllCategories(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Slug,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
const addCollectionLinks = (allProductionProducts, allStagingProducts, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Products",
        targetFieldNameOnRootRecord: "Collections",
        allRootProductionRecords: allProductionProducts,
        allRootStagingRecords: allStagingProducts,
        allTargetProductionRecords: yield utils_1.getAllCollections(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllCollections(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Slug,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncProducts.js.map