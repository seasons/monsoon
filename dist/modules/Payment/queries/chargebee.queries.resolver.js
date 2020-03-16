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
const client_service_1 = require("../../../prisma/client.service");
const nest_decorators_1 = require("../../../nest_decorators");
const payment_services_1 = require("../services/payment.services");
let ChargebeeQueriesResolver = class ChargebeeQueriesResolver {
    constructor(paymentService, prisma) {
        this.paymentService = paymentService;
        this.prisma = prisma;
    }
    chargebeeCheckout({ planID }, ctx, user, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, firstName, lastName } = user;
            const { phoneNumber } = yield this.prisma.client
                .customer({ id: customer.id })
                .detail();
            const hostedPage = yield this.paymentService.getHostedCheckoutPage(planID, user.id, email, firstName, lastName, phoneNumber);
            // Track the selection
            ctx.analytics.track({
                userId: user.id,
                event: "Opened Checkout",
                properties: {
                    plan: planID,
                },
            });
            return hostedPage;
        });
    }
};
__decorate([
    graphql_1.Query(),
    __param(0, graphql_1.Args()), __param(1, graphql_1.Context()), __param(2, nest_decorators_1.User()), __param(3, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChargebeeQueriesResolver.prototype, "chargebeeCheckout", null);
ChargebeeQueriesResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [payment_services_1.PaymentService,
        client_service_1.PrismaClientService])
], ChargebeeQueriesResolver);
exports.ChargebeeQueriesResolver = ChargebeeQueriesResolver;
//# sourceMappingURL=chargebee.queries.resolver.js.map