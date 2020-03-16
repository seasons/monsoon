"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const shipping_service_1 = require("./services/shipping.service");
const utils_module_1 = require("../Utils/utils.module");
const prisma_module_1 = require("../../prisma/prisma.module");
let ShippingModule = class ShippingModule {
};
ShippingModule = __decorate([
    common_1.Module({
        imports: [utils_module_1.UtilsModule, prisma_module_1.PrismaModule],
        providers: [shipping_service_1.ShippingService],
        exports: [shipping_service_1.ShippingService],
    })
], ShippingModule);
exports.ShippingModule = ShippingModule;
//# sourceMappingURL=shipping.module.js.map