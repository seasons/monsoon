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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
var utils_1 = require("./utils");
var keyMap = {
    phoneNumber: "Phone Number",
    birthday: "Birthday",
    height: "Height",
    weight: "Weight",
    bodyType: "Body Type",
    averageTopSize: "Average Top Size",
    averageWaistSize: "Average Waist Size",
    averagePantLength: "Average Pant Length",
    preferredPronouns: "Preferred Pronouns",
    profession: "Profession",
    partyFrequency: "Party Frequency",
    travelFrequency: "Travel Frequency",
    shoppingFrequency: "Shopping Frequency",
    averageSpend: "Average Spend",
    style: "Style",
    commuteStyle: "Commute Style",
    shippingAddress: "Shipping Address",
    phoneOS: "Platform OS",
    status: "Status",
    plan: "Plan",
};
exports.createOrUpdateAirtableUser = function (user, fields) { return __awaiter(void 0, void 0, void 0, function () {
    var email, firstName, lastName, data, key, location_1, airtableBillingInfoRecord;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = user.email, firstName = user.firstName, lastName = user.lastName;
                data = {
                    Email: email,
                    "First Name": firstName,
                    "Last Name": lastName,
                };
                for (key in fields) {
                    if (keyMap[key]) {
                        data[keyMap[key]] = fields[key];
                    }
                }
                if (!!!fields.shippingAddress) return [3 /*break*/, 2];
                return [4 /*yield*/, utils_1.createLocation(user, fields.shippingAddress.create)];
            case 1:
                location_1 = _a.sent();
                data["Shipping Address"] = location_1.map(function (l) { return l.id; });
                _a.label = 2;
            case 2:
                if (!!!fields.billingInfo) return [3 /*break*/, 4];
                return [4 /*yield*/, utils_1.createBillingInfo(fields.billingInfo)];
            case 3:
                airtableBillingInfoRecord = _a.sent();
                data["Billing Info"] = [airtableBillingInfoRecord.getId()];
                _a.label = 4;
            case 4:
                // Create or update the record
                config_1.base("Users")
                    .select({
                    view: "Grid view",
                    filterByFormula: "{Email}='" + email + "'",
                })
                    .firstPage(function (err, records) {
                    if (err) {
                        throw err;
                    }
                    if (records.length > 0) {
                        var user_1 = records[0];
                        config_1.base("Users").update(user_1.id, data, function (err, record) {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    else {
                        config_1.base("Users").create([
                            {
                                fields: data,
                            },
                        ]);
                    }
                });
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=createOrUpdateUser.js.map