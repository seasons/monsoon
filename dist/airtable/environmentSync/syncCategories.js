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
const _1 = require(".");
const config_1 = require("../config");
exports.syncCategories = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allProductionCategories = yield utils_1.getAllCategories(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Categories", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Categories",
        allProductionRecords: allProductionCategories,
        sanitizeFunc: fields => utils_2.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { Image: [], Parent: [], Products: [] }), ["Products 2"]),
        cliProgressBar,
    });
    const allStagingCategories = yield utils_1.getAllCategories(config_1.getStagingBase());
    yield addParentCategoryLinks(allProductionCategories, allStagingCategories, cliProgressBar);
});
exports.getNumLinksCategories = () => 1;
const addParentCategoryLinks = (allProductionCategories, allStagingCategories, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Categories",
        targetFieldNameOnRootRecord: "Parent",
        allRootProductionRecords: allProductionCategories,
        allRootStagingRecords: allStagingCategories,
        allTargetProductionRecords: allProductionCategories,
        allTargetStagingRecords: allStagingCategories,
        getRootRecordIdentifer: rec => rec.fields.Name,
        getTargetRecordIdentifer: rec => rec.fields.Name,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncCategories.js.map