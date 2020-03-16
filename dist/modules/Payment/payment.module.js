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
const chargebee_queries_resolver_1 = require("./queries/chargebee.queries.resolver");
const user_module_1 = require("../User/user.module");
const payment_services_1 = require("./services/payment.services");
let PaymentModule = class PaymentModule {
};
PaymentModule = __decorate([
    common_1.Module({
        imports: [
            user_module_1.UserModule,
            prisma_module_1.PrismaModule,
        ],
        providers: [
            chargebee_queries_resolver_1.ChargebeeQueriesResolver,
            payment_services_1.PaymentService,
        ],
    })
], PaymentModule);
exports.PaymentModule = PaymentModule;
//# sourceMappingURL=payment.module.js.map