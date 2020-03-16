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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mail_1 = __importDefault(require("@sendgrid/mail"));
var utils_1 = require("../airtable/utils");
var prisma_1 = require("../prisma");
var utils_2 = require("../utils");
var sendTransactionalEmail_1 = require("../sendTransactionalEmail");
var Sentry = __importStar(require("@sentry/node"));
var emails_1 = require("../emails");
var shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
// When a user's status is set to "Authorized" on Airtable, execute the necessary
// actions to enable that user to register for the service
function checkAndAuthorizeUsers(event, context, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var response, updatedUsers, usersInAirtableButNotPrisma, allAirtableUsers, _loop_1, _i, allAirtableUsers_1, airtableUser, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    updatedUsers = [];
                    usersInAirtableButNotPrisma = [];
                    return [4 /*yield*/, utils_1.getAllUsers()];
                case 1:
                    allAirtableUsers = _a.sent();
                    _loop_1 = function (airtableUser) {
                        var prismaUser_1, prismaCustomer, prismaCustomerStatus;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(airtableUser.fields.Status === "Authorized")) return [3 /*break*/, 5];
                                    return [4 /*yield*/, prisma_1.prisma.user({
                                            email: airtableUser.model.email,
                                        })];
                                case 1:
                                    prismaUser_1 = _a.sent();
                                    if (!!!prismaUser_1) return [3 /*break*/, 4];
                                    // Add user context on Sentry
                                    if (shouldReportErrorsToSentry) {
                                        Sentry.configureScope(function (scope) {
                                            scope.setUser({ id: prismaUser_1.id, email: prismaUser_1.email });
                                        });
                                    }
                                    return [4 /*yield*/, utils_2.getCustomerFromUserID(prisma_1.prisma, prismaUser_1.id)];
                                case 2:
                                    prismaCustomer = _a.sent();
                                    return [4 /*yield*/, prisma_1.prisma
                                            .customer({ id: prismaCustomer.id })
                                            .status()];
                                case 3:
                                    prismaCustomerStatus = _a.sent();
                                    if (prismaCustomerStatus !== "Authorized") {
                                        updatedUsers = __spreadArrays(updatedUsers, [prismaUser_1.email]);
                                        utils_2.setCustomerPrismaStatus(prisma_1.prisma, prismaUser_1, "Authorized");
                                        exports.sendAuthorizedToSubscribeEmail(prismaUser_1);
                                    }
                                    return [3 /*break*/, 5];
                                case 4:
                                    usersInAirtableButNotPrisma = __spreadArrays(usersInAirtableButNotPrisma, [
                                        airtableUser.model.email,
                                    ]);
                                    _a.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, allAirtableUsers_1 = allAirtableUsers;
                    _a.label = 2;
                case 2:
                    if (!(_i < allAirtableUsers_1.length)) return [3 /*break*/, 5];
                    airtableUser = allAirtableUsers_1[_i];
                    return [5 /*yield**/, _loop_1(airtableUser)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    response = {
                        updated: updatedUsers,
                        usersInAirtableButNotPrisma: usersInAirtableButNotPrisma,
                    };
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    if (shouldReportErrorsToSentry) {
                        Sentry.captureException(err_1);
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, response];
            }
        });
    });
}
exports.checkAndAuthorizeUsers = checkAndAuthorizeUsers;
exports.sendAuthorizedToSubscribeEmail = function (user) {
    sendTransactionalEmail_1.sendTransactionalEmail({
        to: user.email,
        data: emails_1.emails.completeAccountData(user.firstName, process.env.SEEDLING_URL + "/complete?idHash=" + utils_2.getUserIDHash(user.id)),
    });
};
//# sourceMappingURL=checkAndAuthorizeUsers.js.map