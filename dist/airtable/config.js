"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Airtable = __importStar(require("airtable"));
Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_KEY,
});
exports.base = Airtable.base(process.env.AIRTABLE_DATABASE_ID);
exports.getProductionBase = () => {
    if (!process.env._PRODUCTION_AIRTABLE_BASEID) {
        throw new Error("_PRODUCTION_AIRTABLE_BASEID not set");
    }
    return Airtable.base(process.env._PRODUCTION_AIRTABLE_BASEID);
};
exports.getStagingBase = () => {
    if (!process.env._STAGING_AIRTABLE_BASEID) {
        throw new Error("_STAGING_AIRTABLE_BASEID not set");
    }
    return Airtable.base(process.env._STAGING_AIRTABLE_BASEID);
};
//# sourceMappingURL=config.js.map