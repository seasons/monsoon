"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
var ProductSize;
(function (ProductSize) {
    ProductSize["XS"] = "XS";
    ProductSize["S"] = "S";
    ProductSize["M"] = "M";
    ProductSize["L"] = "L";
    ProductSize["XL"] = "XL";
    ProductSize["XXL"] = "XXL";
})(ProductSize = exports.ProductSize || (exports.ProductSize = {}));
exports.seasonsIDFromProductVariant = function (product, productVariant) { };
exports.sizeToSizeCode = function (size) {
    switch (size) {
        case ProductSize.XS:
            return "XS";
        case ProductSize.S:
            return "SS";
        case ProductSize.M:
            return "MM";
        case ProductSize.L:
            return "LL";
        case ProductSize.XL:
            return "XL";
        case ProductSize.XXL:
            return "XXL";
    }
    return "";
};
function getUserIDHash(userID) {
    return crypto_1.default
        .createHash("sha256")
        .update("" + userID + process.env.HASH_SECRET)
        .digest("hex");
}
exports.getUserIDHash = getUserIDHash;
function getUserFromUserIDHash(prisma, userIDHash) {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.users()];
                case 1:
                    allUsers = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var targetUser;
                            for (var _i = 0, allUsers_1 = allUsers; _i < allUsers_1.length; _i++) {
                                var user = allUsers_1[_i];
                                var thisUsersIDHash = getUserIDHash(user.id);
                                if (thisUsersIDHash === userIDHash) {
                                    targetUser = user;
                                }
                            }
                            if (targetUser === undefined) {
                                resolve(null);
                            }
                            else {
                                resolve(targetUser);
                            }
                        })];
            }
        });
    });
}
exports.getUserFromUserIDHash = getUserFromUserIDHash;
function getCustomerFromUserID(prisma, userID) {
    return __awaiter(this, void 0, void 0, function () {
        var customer, customerArray, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prisma.customers({
                            where: { user: { id: userID } },
                        })];
                case 1:
                    customerArray = _a.sent();
                    customer = customerArray[0];
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    throw new Error(err_1);
                case 3: return [2 /*return*/, customer];
            }
        });
    });
}
exports.getCustomerFromUserID = getCustomerFromUserID;
function getCustomerFromEmail(prisma, email) {
    return __awaiter(this, void 0, void 0, function () {
        var customer, customerArray, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prisma.customers({
                            where: { user: { email: email } },
                        })];
                case 1:
                    customerArray = _a.sent();
                    customer = customerArray[0];
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _a.sent();
                    throw new Error(err_2);
                case 3: return [2 /*return*/, customer];
            }
        });
    });
}
exports.getCustomerFromEmail = getCustomerFromEmail;
// given the corresponding user object, set the customer status on a customer
function setCustomerPrismaStatus(prisma, user, status) {
    return __awaiter(this, void 0, void 0, function () {
        var customer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCustomerFromUserID(prisma, user.id)];
                case 1:
                    customer = _a.sent();
                    return [4 /*yield*/, prisma.updateCustomer({
                            //@ts-ignore
                            data: { status: status },
                            where: { id: customer.id },
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.setCustomerPrismaStatus = setCustomerPrismaStatus;
function getPrismaLocationFromSlug(prisma, slug) {
    return __awaiter(this, void 0, void 0, function () {
        var prismaLocation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.location({
                        slug: slug,
                    })];
                case 1:
                    prismaLocation = _a.sent();
                    if (!prismaLocation) {
                        throw Error("no location with slug " + slug + " found in DB");
                    }
                    return [2 /*return*/, prismaLocation];
            }
        });
    });
}
exports.getPrismaLocationFromSlug = getPrismaLocationFromSlug;
function calcShipmentWeightFromProductVariantIDs(prisma, itemIDs) {
    return __awaiter(this, void 0, void 0, function () {
        var shippingBagWeight, productVariants;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    shippingBagWeight = 1;
                    return [4 /*yield*/, prisma.productVariants({
                            where: { id_in: itemIDs },
                        })];
                case 1:
                    productVariants = _a.sent();
                    return [2 /*return*/, productVariants.reduce(function addProductWeight(acc, curProdVar) {
                            return acc + curProdVar.weight;
                        }, shippingBagWeight)];
            }
        });
    });
}
exports.calcShipmentWeightFromProductVariantIDs = calcShipmentWeightFromProductVariantIDs;
function calcTotalRetailPriceFromProductVariantIDs(prisma, itemIDs) {
    return __awaiter(this, void 0, void 0, function () {
        var products;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.products({
                        where: {
                            variants_some: {
                                id_in: itemIDs,
                            },
                        },
                    })];
                case 1:
                    products = _a.sent();
                    return [2 /*return*/, products.reduce(function (acc, prod) { return acc + prod.retailPrice; }, 0)];
            }
        });
    });
}
exports.calcTotalRetailPriceFromProductVariantIDs = calcTotalRetailPriceFromProductVariantIDs;
function airtableToPrismaInventoryStatus(airtableStatus) {
    var prismaStatus;
    if (airtableStatus === "Reservable") {
        prismaStatus = "Reservable";
    }
    if (airtableStatus === "Non Reservable") {
        prismaStatus = "NonReservable";
    }
    if (airtableStatus === "Reserved") {
        prismaStatus = "Reserved";
    }
    return prismaStatus;
}
exports.airtableToPrismaInventoryStatus = airtableToPrismaInventoryStatus;
exports.deleteFieldsFromObject = function (obj, fieldsToDelete) {
    var objCopy = __assign({}, obj);
    fieldsToDelete.forEach(function (a) { return delete objCopy[a]; });
    return objCopy;
};
exports.Identity = function (a) { return a; };
exports.allVariablesDefined = function (arr) {
    return arr.reduce(function (acc, curval) {
        return acc && curval !== undefined;
    }, true);
};
exports.readJSONObjectFromFile = function (filepath) {
    var rawData = fs_1.default.readFileSync(filepath);
    return JSON.parse(rawData);
};
//# sourceMappingURL=utils.js.map