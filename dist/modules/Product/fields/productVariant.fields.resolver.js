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
let ProductVariantFieldsResolver = class ProductVariantFieldsResolver {
    constructor(prisma) {
        this.prisma = prisma;
    }
    isSaved(parent, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!customer)
                return false;
            const bagItems = yield this.prisma.client.bagItems({
                where: {
                    productVariant: {
                        id: parent.id,
                    },
                    customer: {
                        id: customer.id,
                    },
                    saved: true,
                },
            });
            return bagItems.length > 0;
        });
    }
    isWanted(parent, user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user)
                return false;
            const productVariant = yield this.prisma.client.productVariant({
                id: parent.id,
            });
            if (!productVariant) {
                return false;
            }
            const productVariantWants = yield this.prisma.client.productVariantWants({
                where: {
                    user: {
                        id: user.id,
                    },
                    AND: {
                        productVariant: {
                            id: productVariant.id,
                        },
                    },
                },
            });
            const exists = productVariantWants && productVariantWants.length > 0;
            return exists;
        });
    }
};
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Parent()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductVariantFieldsResolver.prototype, "isSaved", null);
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Parent()), __param(1, nest_decorators_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductVariantFieldsResolver.prototype, "isWanted", null);
ProductVariantFieldsResolver = __decorate([
    graphql_1.Resolver("ProductVariant"),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService])
], ProductVariantFieldsResolver);
exports.ProductVariantFieldsResolver = ProductVariantFieldsResolver;
//# sourceMappingURL=productVariant.fields.resolver.js.map