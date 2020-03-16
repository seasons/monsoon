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
const utils_1 = require("./utils");
const config_1 = require("../config");
const lodash_1 = require("lodash");
exports.checkAllTableAlignment = () => __awaiter(void 0, void 0, void 0, function* () {
    yield checkTableAlignment("Colors");
    yield checkTableAlignment("Brands");
    yield checkTableAlignment("Models");
    yield checkTableAlignment("Categories");
    yield checkTableAlignment("Locations");
    yield checkTableAlignment("Products");
    yield checkTableAlignment("Homepage Product Rails");
    yield checkTableAlignment("Product Variants");
    yield checkTableAlignment("Physical Products");
    yield checkTableAlignment("Users");
    yield checkTableAlignment("Reservations");
});
const checkTableAlignment = (modelName) => __awaiter(void 0, void 0, void 0, function* () {
    const allRecordsProduction = yield utils_1.airtableModelNameToGetAllFunc(modelName)(config_1.getProductionBase());
    const allRecordsStaging = yield utils_1.airtableModelNameToGetAllFunc(modelName)(config_1.getStagingBase());
    // Check column names
    const productionColumnNames = allRecordsProduction.reduce((acc, curVal) => {
        return lodash_1.union(acc, Object.keys(curVal.fields));
    }, []);
    const stagingColumnNames = allRecordsStaging.reduce((acc, curVal) => {
        return lodash_1.union(acc, Object.keys(curVal.fields));
    }, []);
    const diff = lodash_1.difference(productionColumnNames, stagingColumnNames);
    if (diff.length !== 0) {
        console.log(`You may need to add the following columns to the ${modelName} table on the target base:`);
        diff.forEach(a => console.log(`--${a}`));
    }
});
//# sourceMappingURL=checkTableAlignment.js.map