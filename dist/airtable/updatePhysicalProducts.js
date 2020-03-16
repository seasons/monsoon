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
const config_1 = require("./config");
const lodash_1 = require("lodash");
function updatePhysicalProducts(airtableIDs, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        if (airtableIDs.length !== fields.length) {
            throw new Error("airtableIDs and fields must be arrays of equal length");
        }
        if (airtableIDs.length < 1 || airtableIDs.length > 10) {
            throw new Error("please include one to ten airtable record IDs");
        }
        const formattedUpdateData = lodash_1.zip(airtableIDs, fields).map(a => {
            return {
                id: a[0],
                fields: a[1],
            };
        });
        const updatedRecords = yield config_1.base("Physical Products").update(formattedUpdateData);
        return updatedRecords;
    });
}
exports.updatePhysicalProducts = updatePhysicalProducts;
//# sourceMappingURL=updatePhysicalProducts.js.map