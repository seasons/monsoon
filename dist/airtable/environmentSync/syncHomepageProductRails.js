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
exports.syncHomepageProductRails = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allProductionRecs = yield utils_2.getAllHomepageProductRails(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Homepage Product Rails", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Homepage Product Rails",
        allProductionRecords: allProductionRecs,
        sanitizeFunc: fields => utils_1.Identity(Object.assign(Object.assign({}, fields), { Products: [] })),
        cliProgressBar,
    });
    yield addProductsLinks(allProductionRecs, yield utils_2.getAllHomepageProductRails(config_1.getStagingBase()), cliProgressBar);
});
exports.getNumLinksHomepageProductRails = () => 1;
const addProductsLinks = (allProductionRecords, allStagingRecords, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Homepage Product Rails",
        targetFieldNameOnRootRecord: "Products",
        allRootProductionRecords: allProductionRecords,
        allRootStagingRecords: allStagingRecords,
        allTargetProductionRecords: yield utils_2.getAllProducts(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_2.getAllProducts(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Slug,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncHomepageProductRails.js.map