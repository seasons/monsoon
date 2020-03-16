"use strict";
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
function markPhysicalProductsReservedOnPrisma(prisma, physicalProducts) {
    return __awaiter(this, void 0, void 0, function* () {
        const physicalProductIDs = physicalProducts.map(a => a.id);
        yield prisma.updateManyPhysicalProducts({
            where: { id_in: physicalProductIDs },
            data: { inventoryStatus: "Reserved" },
        });
        const rollbackMarkPhysicalProductReservedOnPrisma = () => __awaiter(this, void 0, void 0, function* () {
            yield prisma.updateManyPhysicalProducts({
                where: { id_in: physicalProductIDs },
                data: { inventoryStatus: "Reservable" },
            });
        });
        return rollbackMarkPhysicalProductReservedOnPrisma;
    });
}
exports.markPhysicalProductsReservedOnPrisma = markPhysicalProductsReservedOnPrisma;
//# sourceMappingURL=markPhysicalProductsReservedOnPrisma.js.map