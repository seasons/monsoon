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
const _1 = require(".");
exports.linkStagingRecords = ({ rootRecordName, targetFieldNameOnRootRecord, allRootProductionRecords, allRootStagingRecords, allTargetProductionRecords, allTargetStagingRecords, getRootRecordIdentifer, getTargetRecordIdentifer, cliProgressBar, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    for (const rootProductionRecord of allRootProductionRecords) {
        (_a = cliProgressBar) === null || _a === void 0 ? void 0 : _a.increment();
        if (!rootProductionRecord.fields[`${targetFieldNameOnRootRecord}`]) {
            continue;
        }
        yield _1.linkStagingRecord({
            rootProductionRecord,
            rootRecordName,
            targetFieldNameOnRootRecord,
            allRootStagingRecords,
            allTargetProductionRecords,
            allTargetStagingRecords,
            getRootRecordIdentifer,
            getTargetRecordIdentifer,
        });
    }
});
//# sourceMappingURL=linkStagingRecords.js.map