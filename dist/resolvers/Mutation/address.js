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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const shippo_1 = __importDefault(require("shippo"));
const createShippoShipment_1 = require("../Product/createShippoShipment");
const shippo = shippo_1.default(process.env.SHIPPO_API_KEY);
exports.shippoValidateAddress = (address) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const result = yield shippo.address.create(Object.assign(Object.assign({}, address), { country: "US", validate: true }));
    const validationResults = result.validation_results;
    const isValid = result.validation_results.is_valid;
    const message = (_b = (_a = validationResults) === null || _a === void 0 ? void 0 : _a.messages) === null || _b === void 0 ? void 0 : _b[0];
    return {
        isValid,
        code: (_c = message) === null || _c === void 0 ? void 0 : _c.code,
        text: (_d = message) === null || _d === void 0 ? void 0 : _d.text,
    };
});
exports.address = {
    validateAddress(obj, { input }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, location } = input;
            const shippoAddress = createShippoShipment_1.locationDataToShippoAddress(location);
            return yield exports.shippoValidateAddress(Object.assign(Object.assign({}, shippoAddress), { email, name: location.name }));
        });
    },
};
//# sourceMappingURL=address.js.map