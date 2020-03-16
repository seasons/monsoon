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
const utils_1 = require("../../airtable/utils");
const lodash_1 = require("lodash");
const updatePhysicalProducts_1 = require("../../airtable/updatePhysicalProducts");
function markPhysicalProductsReservedOnAirtable(physicalProducts) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get the record ids of all relevant airtable physical products
        const airtablePhysicalProductRecords = yield utils_1.getPhysicalProducts(physicalProducts.map(prod => prod.seasonsUID));
        let airtablePhysicalProductRecordIds = airtablePhysicalProductRecords.map(a => a.id);
        // Update their statuses on airtable
        const airtablePhysicalProductRecordsData = lodash_1.fill(new Array(airtablePhysicalProductRecordIds.length), {
            "Inventory Status": "Reserved",
        });
        yield updatePhysicalProducts_1.updatePhysicalProducts(airtablePhysicalProductRecordIds, airtablePhysicalProductRecordsData);
        // Create and return a rollback function
        const airtablePhysicalProductRecordsRollbackData = lodash_1.fill(new Array(airtablePhysicalProductRecordIds.length), {
            "Inventory Status": "Reservable",
        });
        const rollbackMarkPhysicalProductReservedOnAirtable = () => __awaiter(this, void 0, void 0, function* () {
            yield updatePhysicalProducts_1.updatePhysicalProducts(airtablePhysicalProductRecordIds, airtablePhysicalProductRecordsRollbackData);
        });
        return rollbackMarkPhysicalProductReservedOnAirtable;
    });
}
exports.markPhysicalProductsReservedOnAirtable = markPhysicalProductsReservedOnAirtable;
//# sourceMappingURL=markPhysicalProductsReservedOnAirtable.js.map