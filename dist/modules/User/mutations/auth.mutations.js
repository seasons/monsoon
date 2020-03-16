"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@nestjs/graphql");
const auth_service_1 = require("../services/auth.service");
const apollo_server_1 = require("apollo-server");
const prisma_1 = require("../../../prisma");
const nest_decorators_1 = require("../../../nest_decorators");
const createOrUpdateUser_1 = require("../../../airtable/createOrUpdateUser");
let AuthMutationsResolver = class AuthMutationsResolver {
    constructor(authService) {
        this.authService = authService;
    }
    login({ email, password }, requestUser) {
        return __awaiter(this, void 0, void 0, function* () {
            // If they are already logged in, throw an error
            if (requestUser) {
                throw new Error(`user is already logged in`);
            }
            // Get their API access token
            let tokenData;
            try {
                tokenData = yield this.authService.getAuth0UserAccessToken(email, password);
            }
            catch (err) {
                if (err.message.includes("403")) {
                    throw new apollo_server_1.ForbiddenError(err);
                }
                throw new apollo_server_1.UserInputError(err);
            }
            // Get user with this email
            const user = yield prisma_1.prisma.user({ email });
            // If the user is a Customer, make sure that the account has been approved
            if (user && user.role === "Customer") {
                const customer = yield this.authService.getCustomerFromUserID(user.id);
                if (customer &&
                    customer.status !== "Active" &&
                    customer.status !== "Authorized") {
                    throw new Error(`User account has not been approved`);
                }
            }
            else {
                throw new Error("User record not found");
            }
            return {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                user,
            };
        });
    }
    signup({ email, password, firstName, lastName, details }, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            // Register the user on Auth0
            let userAuth0ID;
            try {
                userAuth0ID = yield this.authService.createAuth0User(email, password, {
                    firstName,
                    lastName,
                });
            }
            catch (err) {
                if (err.message.includes("400")) {
                    throw new apollo_server_1.UserInputError(err);
                }
                throw new Error(err);
            }
            // Get their API access token
            let tokenData;
            try {
                tokenData = yield this.authService.getAuth0UserAccessToken(email, password);
            }
            catch (err) {
                if (err.message.includes("403")) {
                    throw new apollo_server_1.ForbiddenError(err);
                }
                throw new apollo_server_1.UserInputError(err);
            }
            // Create a user object in our database
            let user;
            try {
                user = yield this.authService.createPrismaUser(userAuth0ID, email, firstName, lastName);
            }
            catch (err) {
                throw new Error(err);
            }
            // Create a customer object in our database
            try {
                yield this.authService.createPrismaCustomerForExistingUser(user.id, details, "Created");
            }
            catch (err) {
                throw new Error(err);
            }
            // Insert them into airtable
            createOrUpdateUser_1.createOrUpdateAirtableUser(user, Object.assign(Object.assign({}, details), { status: "Created" }));
            // Add them to segment and track their account creation event
            const now = new Date();
            ctx.analytics.identify({
                userId: user.id,
                traits: Object.assign(Object.assign({}, this.authService.extractSegmentReservedTraitsFromCustomerDetail(details)), { firstName: user.firstName, lastName: user.lastName, createdAt: now.toISOString(), id: user.id, role: user.role, email: user.email, auth0Id: user.auth0Id }),
            });
            ctx.analytics.track({
                userId: user.id,
                event: "Created Account",
            });
            return {
                token: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
                user,
            };
        });
    }
    resetPassword({ email }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.authService.resetPassword(email);
        });
    }
};
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthMutationsResolver.prototype, "login", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()),
    __param(1, graphql_1.Context()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthMutationsResolver.prototype, "signup", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthMutationsResolver.prototype, "resetPassword", null);
AuthMutationsResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthMutationsResolver);
exports.AuthMutationsResolver = AuthMutationsResolver;
//# sourceMappingURL=auth.mutations.js.map