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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = __importDefault(require("@sendgrid/mail"));
const utils_1 = require("../airtable/utils");
const prisma_1 = require("../prisma");
const utils_2 = require("../utils");
const sendTransactionalEmail_1 = require("../sendTransactionalEmail");
const Sentry = __importStar(require("@sentry/node"));
const emails_1 = require("../emails");
const shouldReportErrorsToSentry = process.env.NODE_ENV === "production";
if (shouldReportErrorsToSentry) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
}
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
// When a user's status is set to "Authorized" on Airtable, execute the necessary
// actions to enable that user to register for the service
function checkAndAuthorizeUsers(event, context, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            // Retrieve emails and statuses of every user on the airtable DB
            let updatedUsers = [];
            let usersInAirtableButNotPrisma = [];
            const allAirtableUsers = yield utils_1.getAllUsers();
            for (const airtableUser of allAirtableUsers) {
                if (airtableUser.fields.Status === "Authorized") {
                    const prismaUser = yield prisma_1.prisma.user({
                        email: airtableUser.model.email,
                    });
                    if (!!prismaUser) {
                        // Add user context on Sentry
                        if (shouldReportErrorsToSentry) {
                            Sentry.configureScope(scope => {
                                scope.setUser({ id: prismaUser.id, email: prismaUser.email });
                            });
                        }
                        const prismaCustomer = yield utils_2.getCustomerFromUserID(prisma_1.prisma, prismaUser.id);
                        const prismaCustomerStatus = yield prisma_1.prisma
                            .customer({ id: prismaCustomer.id })
                            .status();
                        if (prismaCustomerStatus !== "Authorized") {
                            updatedUsers = [...updatedUsers, prismaUser.email];
                            utils_2.setCustomerPrismaStatus(prisma_1.prisma, prismaUser, "Authorized");
                            exports.sendAuthorizedToSubscribeEmail(prismaUser);
                        }
                    }
                    else {
                        usersInAirtableButNotPrisma = [
                            ...usersInAirtableButNotPrisma,
                            airtableUser.model.email,
                        ];
                    }
                }
            }
            response = {
                updated: updatedUsers,
                usersInAirtableButNotPrisma,
            };
        }
        catch (err) {
            if (shouldReportErrorsToSentry) {
                Sentry.captureException(err);
            }
        }
        return response;
    });
}
exports.checkAndAuthorizeUsers = checkAndAuthorizeUsers;
exports.sendAuthorizedToSubscribeEmail = (user) => {
    sendTransactionalEmail_1.sendTransactionalEmail({
        to: user.email,
        data: emails_1.emails.completeAccountData(user.firstName, `${process.env.SEEDLING_URL}/complete?idHash=${utils_2.getUserIDHash(user.id)}`),
    });
};
//# sourceMappingURL=checkAndAuthorizeUsers.js.map