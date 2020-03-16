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
const product_service_1 = require("../services/product.service");
const nest_decorators_1 = require("../../../nest_decorators");
const bag_service_1 = require("../services/bag.service");
let ProductMutationsResolver = class ProductMutationsResolver {
    constructor(bagService, productService) {
        this.bagService = bagService;
        this.productService = productService;
    }
    addToBag({ item }, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bagService.addToBag(item, customer);
        });
    }
    addViewedProduct({ item }, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productService.addViewedProduct(item, customer);
        });
    }
    saveProduct({ item, save = false }, info, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productService.saveProduct(item, save, info, customer);
        });
    }
    removeFromBag({ item, saved }, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.bagService.removeFromBag(item, saved, customer);
        });
    }
    checkItemsAvailability({ items }, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.productService.checkItemsAvailability(items, customer);
        });
    }
};
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductMutationsResolver.prototype, "addToBag", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductMutationsResolver.prototype, "addViewedProduct", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()),
    __param(1, graphql_1.Info()),
    __param(2, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductMutationsResolver.prototype, "saveProduct", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductMutationsResolver.prototype, "removeFromBag", null);
__decorate([
    graphql_1.Mutation(),
    __param(0, graphql_1.Args()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductMutationsResolver.prototype, "checkItemsAvailability", null);
ProductMutationsResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [bag_service_1.BagService,
        product_service_1.ProductService])
], ProductMutationsResolver);
exports.ProductMutationsResolver = ProductMutationsResolver;
//# sourceMappingURL=product.mutations.resolver.js.map