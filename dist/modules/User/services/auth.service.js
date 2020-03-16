"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const request_1 = __importDefault(require("request"));
const prisma_1 = require("../../../prisma");
const lodash_1 = require("lodash");
const PW_STRENGTH_RULES_URL = "https://manage.auth0.com/dashboard/us/seasons/connections/database/con_btTULQOf6kAxxbCz/security";
let AuthService = class AuthService {
    createAuth0User(email, password, details) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName } = details;
            return new Promise(function CreateUserAndReturnId(resolve, reject) {
                request_1.default({
                    method: "Post",
                    url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
                    headers: { "content-type": "application/json" },
                    body: {
                        given_name: firstName,
                        family_name: lastName,
                        email,
                        password,
                        client_id: `${process.env.AUTH0_CLIENTID}`,
                        connection: `${process.env.AUTH0_DB_CONNECTION}`,
                    },
                    json: true,
                }, function handleResponse(error, response, body) {
                    // Handle a generic error
                    if (error) {
                        return reject(new Error(`Error creating Auth0 user: ${error}`));
                    }
                    // Give a precise error message if a user tried to sign up with an
                    // email that's already in the db
                    if (response.statusCode == 400 && body.code === "invalid_signup") {
                        return reject(new Error("400 -- email already in db"));
                    }
                    // Give a precise error message if a user tried to sign up with
                    // a insufficiently strong password
                    if (response.statusCode == 400 &&
                        body.name === "PasswordStrengthError") {
                        return reject(new Error(`400 -- insufficiently strong password. see pw rules at ${PW_STRENGTH_RULES_URL}`));
                    }
                    // If any other error occured, expose a generic error message
                    if (response.statusCode != 200) {
                        return reject(new Error(`Error creating new Auth0 user. Auth0 returned ` +
                            `${response.statusCode} with body: ${JSON.stringify(body)}`));
                    }
                    return resolve(body._id);
                });
            });
        });
    }
    getAuth0UserAccessToken(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function RetrieveAccessToken(resolve, reject) {
                request_1.default({
                    method: "Post",
                    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
                    headers: { "content-type": "application/json" },
                    body: {
                        grant_type: "password",
                        username: email,
                        password,
                        scope: "offline_access",
                        audience: `${process.env.AUTH0_AUDIENCE}`,
                        client_id: `${process.env.AUTH0_CLIENTID}`,
                        client_secret: `${process.env.AUTH0_CLIENT_SECRET}`,
                    },
                    json: true,
                }, function handleResponse(error, response, body) {
                    if (error) {
                        return reject(new Error(`Error retrieving access token: ${error}`));
                    }
                    if (response.statusCode !== 200) {
                        return reject(new Error(`Error retrieving access token from Auth0. Auth0 returned ` +
                            `${response.statusCode} with body: ${JSON.stringify(body)}`));
                    }
                    return resolve(body);
                });
            });
        });
    }
    getCustomerFromUserID(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            return lodash_1.head(yield prisma_1.prisma.customers({
                where: { user: { id: userID } },
            }));
        });
    }
    resetPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                request_1.default({
                    method: "Post",
                    url: `https://${process.env.AUTH0_DOMAIN}/dbconnections/change_password`,
                    headers: { "content-type": "application/json" },
                    body: {
                        client_id: `${process.env.AUTH0_CLIENTID}`,
                        connection: `${process.env.AUTH0_DB_CONNECTION}`,
                        email,
                    },
                    json: true,
                }, (error, response, body) => __awaiter(this, void 0, void 0, function* () {
                    if (error) {
                        reject(error);
                    }
                    resolve({ message: body });
                }));
            });
        });
    }
    createPrismaUser(auth0Id, email, firstName, lastName) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.createUser({
                auth0Id,
                email,
                firstName,
                lastName,
            });
            return user;
        });
    }
    createPrismaCustomerForExistingUser(userID, details = {}, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield prisma_1.prisma.createCustomer({
                user: {
                    connect: { id: userID },
                },
                detail: { create: details },
                status: status || "Waitlisted",
            });
            // TODO: update airtable with customer data
            return customer;
        });
    }
    extractSegmentReservedTraitsFromCustomerDetail(detail) {
        const traits = {};
        if (!!detail.phoneNumber) {
            traits["phone"] = detail.phoneNumber;
        }
        return traits;
    }
};
AuthService = __decorate([
    common_1.Injectable()
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map