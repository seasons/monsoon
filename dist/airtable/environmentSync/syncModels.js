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
const utils_3 = require("./utils");
exports.syncModels = (cliProgressBar) => __awaiter(void 0, void 0, void 0, function* () {
    yield utils_3.deleteAllStagingRecords("Models", cliProgressBar);
    yield utils_3.createAllStagingRecordsWithoutLinks({
        modelName: "Models",
        allProductionRecords: yield utils_1.getAllModels(config_1.getProductionBase()),
        sanitizeFunc: fields => utils_2.Identity(Object.assign(Object.assign({}, fields), { Products: [] })),
        cliProgressBar,
    });
});
exports.getNumLinksModels = () => 0;
//# sourceMappingURL=syncModels.js.map