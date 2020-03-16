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
exports.syncUsers = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    const allUsersProduction = yield utils_1.getAllUsers(config_1.getProductionBase());
    yield _1.deleteAllStagingRecords("Users", cliProgressBar);
    yield _1.createAllStagingRecordsWithoutLinks({
        modelName: "Users",
        allProductionRecords: allUsersProduction,
        sanitizeFunc: fields => utils_2.deleteFieldsFromObject(Object.assign(Object.assign({}, fields), { "Shipping Address": [], Location: [], "Billing Info": [], Reservations: [] }), ["Joined", "Full Name"]),
        cliProgressBar,
    });
    const allUsersStaging = yield utils_1.getAllUsers(config_1.getStagingBase());
    yield addShippingAddressLinks(allUsersProduction, allUsersStaging, cliProgressBar);
});
exports.getNumLinksUsers = () => 1;
const addShippingAddressLinks = (allUsersProduction, allUsersStaging, cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield _1.linkStagingRecords({
        rootRecordName: "Users",
        targetFieldNameOnRootRecord: "Shipping Address",
        allRootProductionRecords: allUsersProduction,
        allRootStagingRecords: allUsersStaging,
        allTargetProductionRecords: yield utils_1.getAllLocations(config_1.getProductionBase()),
        allTargetStagingRecords: yield utils_1.getAllLocations(config_1.getStagingBase()),
        getRootRecordIdentifer: rec => rec.fields.Email,
        getTargetRecordIdentifer: rec => rec.fields.Slug,
        cliProgressBar,
    });
});
//# sourceMappingURL=syncUsers.js.map