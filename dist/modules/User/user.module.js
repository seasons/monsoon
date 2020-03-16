"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma/prisma.module");
const auth_mutations_1 = require("./mutations/auth.mutations");
const auth_service_1 = require("./services/auth.service");
const me_queries_1 = require("./queries/me.queries");
const me_fields_1 = require("./fields/me.fields");
const customer_service_1 = require("./services/customer.service");
const customer_mutations_1 = require("./mutations/customer.mutations");
const airtable_module_1 = require("../Airtable/airtable.module");
let UserModule = class UserModule {
};
UserModule = __decorate([
    common_1.Module({
        imports: [airtable_module_1.AirtableModule, prisma_module_1.PrismaModule],
        providers: [
            auth_service_1.AuthService,
            customer_service_1.CustomerService,
            me_fields_1.MeFieldsResolver,
            me_queries_1.MeQueriesResolver,
            auth_mutations_1.AuthMutationsResolver,
            customer_mutations_1.CustomerMutationsResolver
        ],
        exports: [auth_service_1.AuthService],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map