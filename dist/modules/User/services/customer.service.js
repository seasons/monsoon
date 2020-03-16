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
const common_1 = require("@nestjs/common");
const client_service_1 = require("../../../prisma/client.service");
const auth_service_1 = require("./auth.service");
const db_service_1 = require("../../../prisma/db.service");
const airtable_service_1 = require("../../Airtable/services/airtable.service");
let CustomerService = class CustomerService {
    constructor(airtableService, authService, db, prisma) {
        this.airtableService = airtableService;
        this.authService = authService;
        this.db = db;
        this.prisma = prisma;
    }
    setCustomerPrismaStatus(user, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield this.authService.getCustomerFromUserID(user.id);
            yield this.prisma.client.updateCustomer({
                // @ts-ignore
                data: { status: status },
                where: { id: customer.id },
            });
        });
    }
    addCustomerDetails({ details, status }, customer, user, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentCustomerDetail = yield this.prisma.client
                .customer({ id: customer.id })
                .detail();
            yield this.prisma.client.updateCustomer({
                data: {
                    detail: {
                        upsert: {
                            update: details,
                            create: details
                        }
                    }
                },
                where: { id: customer.id },
            });
            // If a status was passed, update the customer status in prisma
            if (!!status) {
                yield this.setCustomerPrismaStatus(user, status);
            }
            // Sync with airtable
            yield this.airtableService.createOrUpdateAirtableUser(user, Object.assign(Object.assign(Object.assign({}, currentCustomerDetail), details), { status }));
            // Return the updated customer object
            const returnData = yield this.db.query.customer({ where: { id: customer.id } }, info);
            return returnData;
        });
    }
};
CustomerService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [airtable_service_1.AirtableService,
        auth_service_1.AuthService,
        db_service_1.DBService,
        client_service_1.PrismaClientService])
], CustomerService);
exports.CustomerService = CustomerService;
//# sourceMappingURL=customer.service.js.map