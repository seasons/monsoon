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
const db_service_1 = require("../../../prisma/db.service");
const lodash_1 = require("lodash");
const product_utils_service_1 = require("./product.utils.service");
const client_service_1 = require("../../../prisma/client.service");
const productVariant_service_1 = require("./productVariant.service");
let ProductService = class ProductService {
    constructor(db, prisma, productUtils, productVariantService) {
        this.db = db;
        this.prisma = prisma;
        this.productUtils = productUtils;
        this.productVariantService = productVariantService;
    }
    getProducts(args, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryOptions = yield this.productUtils.queryOptionsForProducts(args);
            return yield this.db.query.products(Object.assign(Object.assign({}, args), queryOptions), info);
        });
    }
    getProductsConnection(args, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryOptions = yield this.productUtils.queryOptionsForProducts(args);
            return yield this.db.query.productsConnection(Object.assign(Object.assign({}, args), queryOptions), info);
        });
    }
    addViewedProduct(item, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewedProducts = yield this.prisma.client.recentlyViewedProducts({
                where: {
                    customer: { id: customer.id },
                    product: { id: item },
                },
            });
            const viewedProduct = lodash_1.head(viewedProducts);
            if (viewedProduct) {
                return yield this.prisma.client.updateRecentlyViewedProduct({
                    where: {
                        id: viewedProduct.id,
                    },
                    data: {
                        viewCount: viewedProduct.viewCount++,
                    },
                });
            }
            else {
                return yield this.prisma.client.createRecentlyViewedProduct({
                    customer: {
                        connect: {
                            id: customer.id,
                        },
                    },
                    product: {
                        connect: {
                            id: item,
                        },
                    },
                    viewCount: 1,
                });
            }
        });
    }
    isSaved(product, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const productVariants = yield this.prisma.client.productVariants({
                where: {
                    product: {
                        id: product.id,
                    },
                },
            });
            const bagItem = yield this.prisma.client.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    productVariant: {
                        id_in: productVariants.map(a => a.id),
                    },
                    saved: true,
                },
            });
            return bagItem.length > 0;
        });
    }
    saveProduct(item, save, customer, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const bagItems = yield this.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    productVariant: {
                        id: item,
                    },
                    saved: true,
                },
            }, info);
            let bagItem = lodash_1.head(bagItems);
            if (save && !bagItem) {
                bagItem = yield this.prisma.client.createBagItem({
                    customer: {
                        connect: {
                            id: customer.id,
                        },
                    },
                    productVariant: {
                        connect: {
                            id: item,
                        },
                    },
                    position: 0,
                    saved: save,
                    status: "Added",
                });
            }
            else {
                if (bagItem) {
                    yield this.prisma.client.deleteBagItem({
                        id: bagItem.id,
                    });
                }
            }
            if (save) {
                return this.db.query.bagItem({
                    where: {
                        id: bagItem.id,
                    },
                }, info);
            }
            return bagItem;
        });
    }
    checkItemsAvailability(items, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservedBagItems = yield this.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    productVariant: {
                        id_in: items,
                    },
                    status_not: "Added",
                },
            }, `{
        productVariant {
          id
        }
      }`);
            const reservedIds = reservedBagItems.map(a => a.productVariant.id);
            const newItems = items.filter(a => !reservedIds.includes(a));
            yield this.productVariantService.updateProductVariantCounts(newItems, {
                dryRun: true,
            });
            return true;
        });
    }
};
ProductService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService,
        client_service_1.PrismaClientService,
        product_utils_service_1.ProductUtilsService,
        productVariant_service_1.ProductVariantService])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map