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
const reservation_service_1 = require("../services/reservation.service");
let ProductVariantMutationsResolver = class ProductVariantMutationsResolver {
    constructor(prisma, reservationService) {
        this.prisma = prisma;
        this.reservationService = reservationService;
    }
    addProductVariantWant({ variantID }, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user)
                throw new Error("Missing user from context");
            const productVariant = yield this.prisma.client.productVariant({
                id: variantID,
            });
            if (!productVariant) {
                throw new Error("Unable to find product variant with matching ID");
            }
            const productVariantWant = yield this.prisma.client.createProductVariantWant({
                isFulfilled: false,
                productVariant: {
                    connect: {
                        id: productVariant.id,
                    },
                },
                user: {
                    connect: {
                        id: user.id,
                    },
                },
            });
            return productVariantWant;
        });
    }
    reserveItems({ items }, user, customer, info, analytics) {
        return __awaiter(this, void 0, void 0, function* () {
            const returnData = yield this.reservationService.reserveItems(items, user, customer, info);
            console.log(`'returnData in reserveItems resolver: ${returnData}`);
            // Track the selection
            analytics.track({
                userId: user.id,
                event: "Reserved Items",
                properties: {
                    items,
                },
            });
            return returnData;
        });
    }
};
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductVariantMutationsResolver.prototype, "addProductVariantWant", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()),
    __param(1, nest_decorators_1.User()),
    __param(2, nest_decorators_1.Customer()),
    __param(3, graphql_1.Info()),
    __param(4, nest_decorators_1.Analytics()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductVariantMutationsResolver.prototype, "reserveItems", null);
ProductVariantMutationsResolver = __decorate([
    graphql_1.Resolver("ProductVariant"),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService,
        reservation_service_1.ReservationService])
], ProductVariantMutationsResolver);
exports.ProductVariantMutationsResolver = ProductVariantMutationsResolver;
//# sourceMappingURL=productVariant.mutations.resolver.js.map