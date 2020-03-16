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
const config_1 = require("../config");
exports.linkStagingRecord = ({ rootProductionRecord, rootRecordName, targetFieldNameOnRootRecord, allRootStagingRecords, allTargetProductionRecords, allTargetStagingRecords, getRootRecordIdentifer, getTargetRecordIdentifer, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the staging record that corresponds to the production record
    const correspondingRootStagingRecord = allRootStagingRecords.find(rsr => getRootRecordIdentifer(rootProductionRecord) ===
        getRootRecordIdentifer(rsr));
    // Find the linked record(s) id(s) on staging
    const targetProductionRecords = allTargetProductionRecords.filter(r => rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`].includes(r.id));
    const targetStagingRecords = allTargetStagingRecords.filter(r => targetProductionRecords.reduce((acc, curVal) => acc || getTargetRecordIdentifer(curVal) === getTargetRecordIdentifer(r), false));
    //   Do the update
    yield config_1.getStagingBase()(`${rootRecordName}`).update([
        {
            id: correspondingRootStagingRecord.id,
            fields: {
                [targetFieldNameOnRootRecord]: targetStagingRecords.map(r => r.id),
            },
        },
    ]);
});
//# sourceMappingURL=linkStagingRecord.js.map