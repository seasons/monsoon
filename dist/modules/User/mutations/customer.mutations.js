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
const apollo_server_1 = require("apollo-server");
const nest_decorators_1 = require("../../../nest_decorators");
const client_service_1 = require("../../../prisma/client.service");
const customer_service_1 = require("../services/customer.service");
const db_service_1 = require("../../../prisma/db.service");
let CustomerMutationsResolver = class CustomerMutationsResolver {
    constructor(customerService, db, prisma) {
        this.customerService = customerService;
        this.db = db;
        this.prisma = prisma;
    }
    addCustomerDetails({ details, event, status }, info, analytics, customer, user) {
        return __awaiter(this, void 0, void 0, function* () {
            // They should not have included any "id" in the input
            if (details.id != null) {
                throw new apollo_server_1.UserInputError("payload should not include id");
            }
            const returnData = yield this.customerService.addCustomerDetails({ details, status }, customer, user, info);
            // Track the event, if its been passed
            const eventNameMap = { CompletedWaitlistForm: "Completed Waitlist Form" };
            if (!!event) {
                analytics.track({
                    userId: user.id,
                    event: eventNameMap[event],
                });
            }
            return returnData;
        });
    }
};
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()),
    __param(1, graphql_1.Info()),
    __param(2, nest_decorators_1.Analytics()),
    __param(3, nest_decorators_1.Customer()),
    __param(4, nest_decorators_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomerMutationsResolver.prototype, "addCustomerDetails", null);
CustomerMutationsResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [customer_service_1.CustomerService,
        db_service_1.DBService,
        client_service_1.PrismaClientService])
], CustomerMutationsResolver);
exports.CustomerMutationsResolver = CustomerMutationsResolver;
//# sourceMappingURL=customer.mutations.js.map