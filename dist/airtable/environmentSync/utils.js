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
const getNumLinks_1 = require("./getNumLinks");
exports.airtableModelNameToGetAllFunc = (modelname) => {
    const func = {
        Colors: utils_1.getAllColors,
        Brands: utils_1.getAllBrands,
        Models: utils_1.getAllModels,
        Categories: utils_1.getAllCategories,
        Locations: utils_1.getAllLocations,
        Products: utils_1.getAllProducts,
        "Homepage Product Rails": utils_1.getAllHomepageProductRails,
        "Product Variants": utils_1.getAllProductVariants,
        "Physical Products": utils_1.getAllPhysicalProducts,
        Users: utils_1.getAllUsers,
        Reservations: utils_1.getAllReservations,
    }[modelname];
    if (!func) {
        throw new Error(`Unrecognized model name: ${modelname}`);
    }
    return func;
};
exports.getNumProdAndStagingRecords = (modelName) => __awaiter(void 0, void 0, void 0, function* () {
    const prodRecords = yield exports.airtableModelNameToGetAllFunc(modelName)(config_1.getProductionBase());
    const stagingRecords = yield exports.airtableModelNameToGetAllFunc(modelName)(config_1.getStagingBase());
    return [prodRecords.length, stagingRecords.length];
});
exports.getNumReadWritesToSyncModel = (modelName) => __awaiter(void 0, void 0, void 0, function* () {
    const [numProdRecs, numStagingRecs] = yield exports.getNumProdAndStagingRecords(modelName);
    return (1 + getNumLinks_1.getNumLinks(modelName)) * numProdRecs + numStagingRecs;
});
exports.deleteAllStagingRecords = (modelName, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const allRecords = yield exports.airtableModelNameToGetAllFunc(modelName)(config_1.getStagingBase());
    for (const rec of allRecords) {
        (_a = cliProgressBar) === null || _a === void 0 ? void 0 : _a.increment();
        yield config_1.getStagingBase()(`${modelName}`).destroy([rec.id]);
    }
});
exports.createAllStagingRecordsWithoutLinks = ({ modelName, allProductionRecords, sanitizeFunc, cliProgressBar, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    for (const rec of allProductionRecords) {
        (_b = cliProgressBar) === null || _b === void 0 ? void 0 : _b.increment();
        // console.log(sanitizeFunc(rec.fields))
        yield config_1.getStagingBase()(`${modelName}`).create([
            { fields: sanitizeFunc(rec.fields) },
        ]);
    }
});
exports.sanitizeAttachments = attachments => { var _a; return (_a = attachments) === null || _a === void 0 ? void 0 : _a.map(a => utils_2.Identity({ url: a.url })); };
//# sourceMappingURL=utils.js.map