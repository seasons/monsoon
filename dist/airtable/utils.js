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
var config_1 = require("./config");
var cli_progress_1 = __importDefault(require("cli-progress"));
var getAll = function (name, filterFormula, view, airtableBase) {
    if (view === void 0) { view = "Script"; }
    return __awaiter(void 0, void 0, void 0, function () {
        var data, baseToUse;
        return __generator(this, function (_a) {
            data = [];
            baseToUse = airtableBase || config_1.base;
            data.findByIds = function (ids) {
                if (ids === void 0) { ids = []; }
                return data.find(function (record) { return ids.includes(record.id); });
            };
            data.findMultipleByIds = function (ids) {
                if (ids === void 0) { ids = []; }
                return data.filter(function (record) { return ids.includes(record.id); });
            };
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var options = {
                        view: view,
                    };
                    if (filterFormula && filterFormula.length) {
                        options.filterByFormula = filterFormula;
                    }
                    baseToUse(name)
                        .select(options)
                        .eachPage(function (records, fetchNextPage) {
                        records.forEach(function (record) {
                            record.model = exports.airtableToPrismaObject(record.fields);
                            data.push(record);
                        });
                        return fetchNextPage();
                    }, function done(err) {
                        if (err) {
                            console.error(err);
                            reject(err);
                            return;
                        }
                        resolve(data);
                    });
                })];
        });
    });
};
exports.getAllBrands = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Brands", "", "", airtableBase)];
    });
}); };
exports.getAllBottomSizes = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Bottom Sizes", "", "", airtableBase)];
    });
}); };
exports.getAllTopSizes = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Top Sizes", "", "", airtableBase)];
    });
}); };
exports.getAllModels = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Models", "", "", airtableBase)];
    });
}); };
exports.getAllReservations = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Reservations", "", "", airtableBase)];
    });
}); };
exports.getAllCollections = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Collections", "", "", airtableBase)];
    });
}); };
exports.getAllCollectionGroups = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Collection Groups", "", "", airtableBase)];
    });
}); };
exports.getAllUsers = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Users", "", "", airtableBase)];
    });
}); };
exports.getAllSizes = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Sizes", "", "", airtableBase)];
    });
}); };
exports.getAllCategories = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Categories", "", "", airtableBase)];
    });
}); };
exports.getAllColors = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Colors", "", "", airtableBase)];
    });
}); };
exports.getAllHomepageProductRails = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Homepage Product Rails", "", "", airtableBase)];
    });
}); };
exports.getAllProducts = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Products", "", "", airtableBase)];
    });
}); };
exports.getAllProductVariants = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Product Variants", "", "", airtableBase)];
    });
}); };
exports.getAllPhysicalProducts = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Physical Products", "", "", airtableBase)];
    });
}); };
exports.getAllLocations = function (airtableBase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, getAll("Locations", "", "", airtableBase)];
    });
}); };
exports.getNumRecords = function (modelName) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, getAll(modelName, "", "")];
            case 1: return [2 /*return*/, (_a = (_b.sent())) === null || _a === void 0 ? void 0 : _a.length];
        }
    });
}); };
exports.airtableToPrismaObject = function (record) {
    function camelCase(str) {
        return str
            .replace(/\s(.)/g, function (a) {
            return a.toUpperCase();
        })
            .replace(/\s/g, "")
            .replace(/^(.)/, function (b) {
            return b.toLowerCase();
        });
    }
    var obj = {};
    for (var _i = 0, _a = Object.keys(record); _i < _a.length; _i++) {
        var id = _a[_i];
        var newKey = camelCase(id);
        obj[newKey] = record[id];
    }
    return obj;
};
function createAirtableReservation(userEmail, data, shippingError, returnShippingError) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var itemIDs, items, airtableUserRecord, createData, records_1, rollbackAirtableReservation, err_1;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                itemIDs = data.products.connect.map(function (a) { return a.seasonsUID; });
                                return [4 /*yield*/, exports.getPhysicalProducts(itemIDs)];
                            case 1:
                                items = _a.sent();
                                return [4 /*yield*/, getAirtableUserRecordByUserEmail(userEmail)];
                            case 2:
                                airtableUserRecord = _a.sent();
                                createData = [
                                    {
                                        fields: {
                                            ID: data.reservationNumber,
                                            User: [airtableUserRecord.id],
                                            Items: items.map(function (a) { return a.id; }),
                                            Shipped: false,
                                            Status: "New",
                                            "Shipping Address": airtableUserRecord.fields["Shipping Address"],
                                            "Shipping Label": data.sentPackage.create.shippingLabel.create.image,
                                            "Tracking URL": data.sentPackage.create.shippingLabel.create.trackingURL,
                                            "Return Label": data.returnedPackage.create.shippingLabel.create.image,
                                            "Return Tracking URL": data.returnedPackage.create.shippingLabel.create.trackingURL,
                                            "Shipping Error": shippingError,
                                            "Return Shipping Error": returnShippingError,
                                        },
                                    },
                                ];
                                return [4 /*yield*/, config_1.base("Reservations").create(createData)];
                            case 3:
                                records_1 = _a.sent();
                                rollbackAirtableReservation = function () { return __awaiter(_this, void 0, void 0, function () {
                                    var numDeleted;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, config_1.base("Reservations").destroy([
                                                    records_1[0].getId(),
                                                ])];
                                            case 1:
                                                numDeleted = _a.sent();
                                                return [2 /*return*/, numDeleted];
                                        }
                                    });
                                }); };
                                resolve([records_1[0], rollbackAirtableReservation]);
                                return [3 /*break*/, 5];
                            case 4:
                                err_1 = _a.sent();
                                reject(err_1);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
exports.createAirtableReservation = createAirtableReservation;
exports.createLocation = function (user, data) { return __awaiter(void 0, void 0, void 0, function () {
    var createData;
    return __generator(this, function (_a) {
        createData = [
            {
                fields: {
                    Name: data.name,
                    Company: data.company,
                    "Address 1": data.address1,
                    "Address 2": data.address2,
                    City: data.city,
                    State: data.state,
                    "Zip Code": data.zipCode,
                    Slug: data.slug,
                    "Location Type": data.locationType,
                },
            },
        ];
        return [2 /*return*/, config_1.base("Locations").create(createData)];
    });
}); };
exports.createTopSize = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, config_1.base("Top Sizes").create([
                {
                    fields: {
                        Name: data.name,
                        LetterSize: data.letter,
                        Sleeve: data.sleeve,
                        Shoulder: data.shoulder,
                        Chest: data.chest,
                        Length: data.length,
                    },
                },
            ])];
    });
}); };
exports.createBottomSize = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, config_1.base("Bottom Sizes").create([
                {
                    fields: {
                        Name: data.name,
                        Hem: data.hem,
                        Inseam: data.inseam,
                        Rise: data.rise,
                        Waist: data.waist,
                    },
                },
            ])];
    });
}); };
function createBillingInfo(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, config_1.base("BillingInfos").create({
                    Brand: data.brand,
                    Name: data.name,
                    LastDigits: data.last_digits,
                    "Expiration Month": data.expiration_month,
                    "Expiration Year": data.expiration_year,
                    "Street 1": data.street1,
                    "Street 2": data.street2,
                    City: data.city,
                    State: data.state,
                    Country: data.country,
                    "Postal Code": data.postal_code,
                })];
        });
    });
}
exports.createBillingInfo = createBillingInfo;
exports.getProductVariant = function (SKU) {
    return getAll("Product Variants", "{SKU}=" + SKU);
};
exports.getPhysicalProducts = function (SUIDs) {
    var formula = "OR(" + SUIDs.map(function (a) { return "{SUID}='" + a + "'"; }).join(",") + ")";
    return getAll("Physical Products", formula);
};
exports.updateProductVariant = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                config_1.base("Reservations").create([{}], function (err, records) {
                    if (records.length > 0) {
                        var user = records[0];
                        resolve(user);
                    }
                    else {
                        reject(err);
                    }
                });
            })];
    });
}); };
function getAirtableUserRecordByUserEmail(email) {
    return new Promise(function (resolve, reject) {
        config_1.base("Users")
            .select({
            view: "Grid view",
            filterByFormula: "{Email}='" + email + "'",
        })
            .firstPage(function (err, records) {
            if (records.length > 0) {
                var user = records[0];
                resolve(user);
            }
            else {
                reject(err);
            }
        });
    });
}
exports.getAirtableUserRecordByUserEmail = getAirtableUserRecordByUserEmail;
exports.getAirtableLocationRecordBySlug = function (slug) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                config_1.base("Locations")
                    .select({ view: "Grid view", filterByFormula: "{Slug}='" + slug + "'" })
                    .firstPage(function (err, records) {
                    if (err)
                        return reject(err);
                    if (records.length > 0)
                        return resolve(records[0]);
                    return reject("No record found with slug " + slug);
                });
            })];
    });
}); };
exports.makeAirtableSyncCliProgressBar = function () {
    return new cli_progress_1.default.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: "{modelName} {bar} {percentage}%  ETA: {eta}s  {value}/{total} records",
    }, cli_progress_1.default.Presets.shades_grey);
};
//# sourceMappingURL=utils.js.map