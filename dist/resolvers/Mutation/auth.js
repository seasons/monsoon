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
var utils_1 = require("../../auth/utils");
var createAuth0User_1 = require("../../auth/createAuth0User");
var getAuth0UserAccessToken_1 = require("../../auth/getAuth0UserAccessToken");
var utils_2 = require("../../utils");
var apollo_server_1 = require("apollo-server");
var createOrUpdateUser_1 = require("../../airtable/createOrUpdateUser");
var request_1 = __importDefault(require("request"));
var push_notifications_server_1 = __importDefault(require("@pusher/push-notifications-server"));
var _a = process.env, PUSHER_INSTANCE_ID = _a.PUSHER_INSTANCE_ID, PUSHER_SECRET_KEY = _a.PUSHER_SECRET_KEY;
exports.beamsClient = PUSHER_INSTANCE_ID && PUSHER_SECRET_KEY
    ? new push_notifications_server_1.default({
        instanceId: PUSHER_INSTANCE_ID,
        secretKey: PUSHER_SECRET_KEY,
    })
    : null;
exports.auth = {
    // The signup mutation signs up users with a "Customer" role.
    signup: function (obj, _a, ctx, info) {
        var email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName, details = _a.details;
        return __awaiter(this, void 0, void 0, function () {
            var userAuth0ID, err_1, tokenData, err_2, user, err_3, customer, err_4, now;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, createAuth0User_1.createAuth0User(email, password, {
                                firstName: firstName,
                                lastName: lastName,
                            })];
                    case 1:
                        userAuth0ID = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        if (err_1.message.includes("400")) {
                            throw new apollo_server_1.UserInputError(err_1);
                        }
                        throw new Error(err_1);
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, getAuth0UserAccessToken_1.getAuth0UserAccessToken(email, password)];
                    case 4:
                        tokenData = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _b.sent();
                        if (err_2.message.includes("403")) {
                            throw new apollo_server_1.ForbiddenError(err_2);
                        }
                        throw new apollo_server_1.UserInputError(err_2);
                    case 6:
                        _b.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, utils_1.createPrismaUser(ctx, {
                                auth0Id: userAuth0ID,
                                email: email,
                                firstName: firstName,
                                lastName: lastName,
                            })];
                    case 7:
                        user = _b.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        err_3 = _b.sent();
                        throw new Error(err_3);
                    case 9:
                        _b.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, utils_1.createPrismaCustomerForExistingUser(ctx, {
                                userID: user.id,
                                details: details,
                                status: "Created",
                            })];
                    case 10:
                        customer = _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_4 = _b.sent();
                        throw new Error(err_4);
                    case 12:
                        // Insert them into airtable
                        createOrUpdateUser_1.createOrUpdateAirtableUser(user, __assign(__assign({}, details), { status: "Created" }));
                        now = new Date();
                        ctx.analytics.identify({
                            userId: user.id,
                            traits: __assign(__assign({}, extractSegmentReservedTraitsFromCustomerDetail(details)), { firstName: user.firstName, lastName: user.lastName, createdAt: now.toISOString(), id: user.id, role: user.role, email: user.email, auth0Id: user.auth0Id }),
                        });
                        ctx.analytics.track({
                            userId: user.id,
                            event: "Created Account",
                        });
                        return [2 /*return*/, {
                                token: tokenData.access_token,
                                refreshToken: tokenData.refresh_token,
                                expiresIn: tokenData.expires_in,
                                user: user,
                            }];
                }
            });
        });
    },
    login: function (obj, _a, ctx, info) {
        var email = _a.email, password = _a.password;
        var _b;
        return __awaiter(this, void 0, void 0, function () {
            var tokenData, err_5, user, customer, beamsToken;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // If they are already logged in, throw an error
                        if (utils_1.isLoggedIn(ctx)) {
                            throw new Error("user is already logged in");
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, getAuth0UserAccessToken_1.getAuth0UserAccessToken(email, password)];
                    case 2:
                        tokenData = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _c.sent();
                        if (err_5.message.includes("403")) {
                            throw new apollo_server_1.ForbiddenError(err_5);
                        }
                        throw new apollo_server_1.UserInputError(err_5);
                    case 4: return [4 /*yield*/, ctx.prisma.user({ email: email })
                        // If the user is a Customer, make sure that the account has been approved
                    ];
                    case 5:
                        user = _c.sent();
                        if (!user) return [3 /*break*/, 8];
                        if (!(user.role === "Customer")) return [3 /*break*/, 7];
                        return [4 /*yield*/, utils_2.getCustomerFromUserID(ctx.prisma, user.id)];
                    case 6:
                        customer = _c.sent();
                        if (customer &&
                            customer.status !== "Active" &&
                            customer.status !== "Authorized") {
                            throw new Error("User account has not been approved");
                        }
                        _c.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8: throw new Error("User record not found");
                    case 9:
                        beamsToken = (_b = exports.beamsClient) === null || _b === void 0 ? void 0 : _b.generateToken(email);
                        return [2 /*return*/, {
                                token: tokenData.access_token,
                                refreshToken: tokenData.refresh_token,
                                expiresIn: tokenData.expires_in,
                                beamsToken: beamsToken.token,
                                user: user,
                            }];
                }
            });
        });
    },
    resetPassword: function (obj, _a, ctx, info) {
        var email = _a.email;
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_b) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        request_1.default({
                            method: "Post",
                            url: "https://" + process.env.AUTH0_DOMAIN + "/dbconnections/change_password",
                            headers: { "content-type": "application/json" },
                            body: {
                                client_id: "" + process.env.AUTH0_CLIENTID,
                                connection: "" + process.env.AUTH0_DB_CONNECTION,
                                email: email,
                            },
                            json: true,
                        }, function (error, response, body) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (error) {
                                    reject(error);
                                }
                                resolve({ message: body });
                                return [2 /*return*/];
                            });
                        }); });
                    })];
            });
        });
    },
};
function extractSegmentReservedTraitsFromCustomerDetail(detail) {
    var traits = {};
    if (!!detail.phoneNumber) {
        traits["phone"] = detail.phoneNumber;
    }
    return traits;
}
//# sourceMappingURL=auth.js.map