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
exports.syncReservations = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allReservationsProduction = yield utils_1.getAllReservations(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Reservations", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Reservations",
        allProductionRecords: allReservationsProduction,
        sanitizeFunc: fields => utils_2.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { User: [], "Current Location": [], "Shipping Address": [], Items: [] }), [
            "Return Date",
            "Created At",
            "Updated At",
            "Reservation Count",
            "Country",
            "Order Weight Unit",
            "User Location",
            "User Email",
            "Images",
            "Recipient Name",
            "Email",
            "Phone",
            "Street Line 1",
            "Street Line 2",
            "City",
            "State/Province",
            "Zip/Postal Code",
            "Order Weight",
        ]),
        cliProgressBar,
    });
    const allReservationsStaging = yield utils_1.getAllReservations(config_1.getStagingBase());
    yield addCurrentLocationLinks(allReservationsProduction, allReservationsStaging, cliProgressBar);
    yield addShippingAddressLinks(allReservationsProduction, allReservationsStaging, cliProgressBar);
    yield addItemsLinks(allReservationsProduction, allReservationsStaging, cliProgressBar);
});
exports.getNumLinksReservations = () => 3;
const addCurrentLocationLinks = (allReservationsProduction, allReservationsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Reservations",
        targetFieldNameOnRootRecord: "Current Location",
        allRootProductionRecords: allReservationsProduction,
        allRootStagingRecords: allReservationsStaging,
        allTargetProductionRecords: yield utils_1.getAllLocations(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllLocations(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.ID,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
const addShippingAddressLinks = (allReservationsProduction, allReservationsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Reservations",
        targetFieldNameOnRootRecord: "Shipping Address",
        allRootProductionRecords: allReservationsProduction,
        allRootStagingRecords: allReservationsStaging,
        allTargetProductionRecords: yield utils_1.getAllLocations(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllLocations(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.ID,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
const addItemsLinks = (allReservationsProduction, allReservationsStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Reservations",
        targetFieldNameOnRootRecord: "Items",
        allRootProductionRecords: allReservationsProduction,
        allRootStagingRecords: allReservationsStaging,
        allTargetProductionRecords: yield utils_1.getAllPhysicalProducts(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllPhysicalProducts(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.ID,
        getTargetRecordIdentifer: rec => rec.fields.SUID.text,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncReservations.js.map