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
const activeShippo = shippo_1.default(process.env.SHIPPO_API_KEY);
function createShippingLabel(inputs) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const transaction = yield activeShippo.transaction
                .create(inputs)
                .catch(reject);
            if (transaction.object_state === "VALID" &&
                transaction.status === "ERROR") {
                reject(transaction.messages.reduce((acc, curVal) => {
                    return `${acc}. Source: ${curVal.source}. Code: ${curVal.code}. Error Message: ${curVal.text}`;
                }, ""));
            }
            else if (!transaction.label_url) {
                reject(JSON.stringify(transaction));
            }
            resolve(transaction);
        }));
    });
}
exports.createShippingLabel = createShippingLabel;
//# sourceMappingURL=createShippingLabel.js.map