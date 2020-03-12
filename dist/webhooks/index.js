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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var config_1 = require("../airtable/config");
var prisma_1 = require("../prisma");
var mail_1 = __importDefault(require("@sendgrid/mail"));
var CHARGEBEE_CUSTOMER_CHANGED = "customer_changed";
var app = express_1.default();
exports.app = app;
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
app.post("/airtable_events", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, _i, data_1, row, tableId, recordId, updates, record, SUID, physicalProduct, productVariant, currentInventoryStatus, updatedInventoryStatus;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                data = req.body;
                _i = 0, data_1 = data;
                _a.label = 1;
            case 1:
                if (!(_i < data_1.length)) return [3 /*break*/, 8];
                row = data_1[_i];
                tableId = row.tableId, recordId = row.recordId, updates = row.updates;
                return [4 /*yield*/, config_1.base(tableId).find(recordId)];
            case 2:
                record = _a.sent();
                if (!record) {
                    return [2 /*return*/, res.sendStatus(400)];
                }
                if (!!!record.fields.SUID) return [3 /*break*/, 7];
                SUID = record.fields.SUID.text;
                return [4 /*yield*/, prisma_1.prisma.physicalProduct({
                        seasonsUID: SUID,
                    })];
            case 3:
                physicalProduct = _a.sent();
                return [4 /*yield*/, prisma_1.prisma
                        .physicalProduct({
                        seasonsUID: SUID,
                    })
                        .productVariant()];
            case 4:
                productVariant = _a.sent();
                currentInventoryStatus = physicalProduct.inventoryStatus;
                updatedInventoryStatus = updates.find(function (a) { return a.field; });
                if (!(currentInventoryStatus === "NonReservable" &&
                    updatedInventoryStatus === "Reservable")) return [3 /*break*/, 6];
                return [4 /*yield*/, incrementReservableCount(productVariant, physicalProduct)];
            case 5:
                _a.sent();
                return [3 /*break*/, 7];
            case 6:
                if (currentInventoryStatus === "Reservable" &&
                    updatedInventoryStatus === "Reserved") {
                }
                _a.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 1];
            case 8:
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
app.post('/chargebee_events', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, eventType, _a, content, userID, _b, brand, expiry_month, expiry_year, first_name, last_name, last4, user, customers, customer, billingInfoId;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                data = req.body;
                eventType = data.event_type;
                _a = eventType;
                switch (_a) {
                    case CHARGEBEE_CUSTOMER_CHANGED: return [3 /*break*/, 1];
                }
                return [3 /*break*/, 7];
            case 1:
                content = data.content;
                userID = content.customer.id;
                _b = content.card, brand = _b.card_type, expiry_month = _b.expiry_month, expiry_year = _b.expiry_year, first_name = _b.first_name, last_name = _b.last_name, last4 = _b.last4;
                return [4 /*yield*/, prisma_1.prisma.user({ id: userID })];
            case 2:
                user = _d.sent();
                return [4 /*yield*/, prisma_1.prisma.customers({
                        where: { user: { id: user.id } },
                    })];
            case 3:
                customers = _d.sent();
                if (!((_c = customers) === null || _c === void 0 ? void 0 : _c.length)) return [3 /*break*/, 6];
                customer = customers[0];
                return [4 /*yield*/, prisma_1.prisma.customer({ id: customer.id })
                        .billingInfo()
                        .id()];
            case 4:
                billingInfoId = _d.sent();
                if (!billingInfoId) return [3 /*break*/, 6];
                return [4 /*yield*/, prisma_1.prisma.updateBillingInfo({
                        data: {
                            brand: brand,
                            expiration_month: expiry_month,
                            expiration_year: expiry_year,
                            last_digits: last4,
                            name: first_name + " " + last_name,
                        },
                        where: { id: billingInfoId }
                    })];
            case 5:
                _d.sent();
                _d.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7: return [3 /*break*/, 8];
            case 8:
                res.sendStatus(200);
                return [2 /*return*/];
        }
    });
}); });
var incrementReservableCount = function (productVariant, physicalProduct) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.prisma.updateProductVariant({
                    where: {
                        sku: productVariant.sku,
                    },
                    data: {
                        nonReservable: productVariant.nonReservable <= 0
                            ? 0
                            : productVariant.nonReservable - 1,
                        reservable: productVariant.reservable + 1,
                    },
                })];
            case 1:
                _a.sent();
                console.log(physicalProduct, productVariant);
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=index.js.map