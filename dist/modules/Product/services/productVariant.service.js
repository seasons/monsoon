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
const physicalProduct_utils_service_1 = require("./physicalProduct.utils.service");
const apollo_server_1 = require("apollo-server");
const airtable_service_1 = require("../../Airtable/services/airtable.service");
let ProductVariantService = class ProductVariantService {
    constructor(prisma, physicalProductService, airtableService) {
        this.prisma = prisma;
        this.physicalProductService = physicalProductService;
        this.airtableService = airtableService;
    }
    updateProductVariantCounts(
    /* array of product variant ids */
    items, { dryRun } = { dryRun: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            const prismaProductVariants = yield this.prisma.client.productVariants({
                where: { id_in: items },
            });
            const physicalProducts = yield this.physicalProductService.getPhysicalProductsWithReservationSpecificData(items);
            // Are there any unavailable variants? If so, throw an error
            const unavailableVariants = prismaProductVariants.filter(v => v.reservable <= 0);
            if (unavailableVariants.length > 0) {
                // Remove items in the bag that are not available anymore
                yield this.prisma.client.deleteManyBagItems({
                    productVariant: {
                        id_in: unavailableVariants.map(a => a.id),
                    },
                    saved: false,
                    status: "Added",
                });
                throw new apollo_server_1.ApolloError("The following item is not reservable", "511", unavailableVariants);
            }
            // Double check that the product variants have a sufficient number of available
            // physical products
            const availablePhysicalProducts = this.physicalProductService.extractUniqueReservablePhysicalProducts(physicalProducts);
            if (availablePhysicalProducts.length < items.length) {
                // TODO: list out unavailable items
                throw new apollo_server_1.ApolloError("One or more product variants does not have an available physical product", "515");
            }
            // Get the corresponding product variant records from airtable
            const allAirtableProductVariants = yield this.airtableService.getAllProductVariants();
            const allAirtableProductVariantSlugs = prismaProductVariants.map(a => a.sku);
            const airtableProductVariants = allAirtableProductVariants.filter(a => allAirtableProductVariantSlugs.includes(a.model.sKU));
            const productsBeingReserved = [];
            const rollbackFuncs = [];
            try {
                for (const prismaProductVariant of prismaProductVariants) {
                    const iProduct = yield this.prisma.client
                        .productVariant({ id: prismaProductVariant.id })
                        .product();
                    productsBeingReserved.push(iProduct);
                    // Update product variant counts in prisma and airtable
                    if (!dryRun) {
                        const data = {
                            reservable: prismaProductVariant.reservable - 1,
                            reserved: prismaProductVariant.reserved + 1,
                        };
                        const rollbackData = {
                            reservable: prismaProductVariant.reservable,
                            reserved: prismaProductVariant.reserved,
                        };
                        yield this.prisma.client.updateProductVariant({
                            where: {
                                id: prismaProductVariant.id,
                            },
                            data,
                        });
                        const rollbackPrismaProductVariantUpdate = () => __awaiter(this, void 0, void 0, function* () {
                            yield this.prisma.client.updateProductVariant({
                                where: {
                                    id: prismaProductVariant.id,
                                },
                                data: rollbackData,
                            });
                        });
                        rollbackFuncs.push(rollbackPrismaProductVariantUpdate);
                        // Airtable record of product variant
                        const airtableProductVariant = airtableProductVariants.find(a => a.model.sKU === prismaProductVariant.sku);
                        if (airtableProductVariant) {
                            yield airtableProductVariant.patchUpdate({
                                "Reservable Count": data.reservable,
                                "Reserved Count": data.reserved,
                            });
                            const rollbackAirtableProductVariantUpdate = () => __awaiter(this, void 0, void 0, function* () {
                                yield airtableProductVariant.patchUpdate({
                                    "Reservable Count": rollbackData.reservable,
                                    "Reserved Count": rollbackData.reserved,
                                });
                            });
                            rollbackFuncs.push(rollbackAirtableProductVariantUpdate);
                        }
                    }
                }
            }
            catch (err) {
                for (const rollbackFunc of rollbackFuncs) {
                    yield rollbackFunc();
                }
                throw err;
            }
            const rollbackProductVariantCounts = () => __awaiter(this, void 0, void 0, function* () {
                for (const rollbackFunc of rollbackFuncs) {
                    yield rollbackFunc();
                }
            });
            return [
                productsBeingReserved,
                availablePhysicalProducts,
                rollbackProductVariantCounts,
            ];
        });
    }
};
ProductVariantService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService,
        physicalProduct_utils_service_1.PhysicalProductService,
        airtable_service_1.AirtableService])
], ProductVariantService);
exports.ProductVariantService = ProductVariantService;
//# sourceMappingURL=productVariant.service.js.map