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
const client_service_1 = require("../../../prisma/client.service");
let PhysicalProductService = class PhysicalProductService {
    constructor(db, prisma) {
        this.db = db;
        this.prisma = prisma;
    }
    getPhysicalProductsWithReservationSpecificData(items) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query.physicalProducts({
                where: {
                    productVariant: {
                        id_in: items,
                    },
                },
            }, `{
            id
            seasonsUID
            inventoryStatus
            productVariant {
                id
            }
        }`);
        });
    }
    extractUniqueReservablePhysicalProducts(physicalProducts) {
        return lodash_1.uniqBy(physicalProducts.filter(a => a.inventoryStatus === "Reservable"), b => b.productVariant.id);
    }
    markPhysicalProductsReservedOnPrisma(physicalProducts) {
        return __awaiter(this, void 0, void 0, function* () {
            const physicalProductIDs = physicalProducts.map(a => a.id);
            yield this.prisma.client.updateManyPhysicalProducts({
                where: { id_in: physicalProductIDs },
                data: { inventoryStatus: "Reserved" },
            });
            const rollbackMarkPhysicalProductReservedOnPrisma = () => __awaiter(this, void 0, void 0, function* () {
                yield this.prisma.client.updateManyPhysicalProducts({
                    where: { id_in: physicalProductIDs },
                    data: { inventoryStatus: "Reservable" },
                });
            });
            return rollbackMarkPhysicalProductReservedOnPrisma;
        });
    }
};
PhysicalProductService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService,
        client_service_1.PrismaClientService])
], PhysicalProductService);
exports.PhysicalProductService = PhysicalProductService;
//# sourceMappingURL=physicalProduct.utils.service.js.map