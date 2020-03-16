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
const product_service_1 = require("./services/product.service");
const product_fields_resolver_1 = require("./fields/product.fields.resolver");
const product_queries_resolver_1 = require("./queries/product.queries.resolver");
const product_mutations_resolver_1 = require("./mutations/product.mutations.resolver");
const productVariant_fields_resolver_1 = require("./fields/productVariant.fields.resolver");
const productVariant_queries_resolver_1 = require("./queries/productVariant.queries.resolver");
const productVariant_mutations_resolver_1 = require("./mutations/productVariant.mutations.resolver");
const product_utils_service_1 = require("./services/product.utils.service");
const user_module_1 = require("../User/user.module");
const physicalProduct_utils_service_1 = require("./services/physicalProduct.utils.service");
const productVariant_service_1 = require("./services/productVariant.service");
const airtable_module_1 = require("../Airtable/airtable.module");
const reservation_utils_service_1 = require("./services/reservation.utils.service");
const reservation_service_1 = require("./services/reservation.service");
const email_module_1 = require("../Email/email.module");
const shipping_module_1 = require("../Shipping/shipping.module");
const bag_service_1 = require("./services/bag.service");
let ProductModule = class ProductModule {
};
ProductModule = __decorate([
    common_1.Module({
        imports: [
            prisma_module_1.PrismaModule,
            user_module_1.UserModule,
            airtable_module_1.AirtableModule,
            email_module_1.EmailModule,
            shipping_module_1.ShippingModule,
        ],
        providers: [
            bag_service_1.BagService,
            product_service_1.ProductService,
            product_utils_service_1.ProductUtilsService,
            physicalProduct_utils_service_1.PhysicalProductService,
            productVariant_service_1.ProductVariantService,
            reservation_service_1.ReservationService,
            reservation_utils_service_1.ReservationUtilsService,
            product_fields_resolver_1.ProductFieldsResolver,
            product_mutations_resolver_1.ProductMutationsResolver,
            product_queries_resolver_1.ProductQueriesResolver,
            productVariant_fields_resolver_1.ProductVariantFieldsResolver,
            productVariant_queries_resolver_1.ProductVariantQueriesResolver,
            productVariant_mutations_resolver_1.ProductVariantMutationsResolver,
        ],
    })
], ProductModule);
exports.ProductModule = ProductModule;
//# sourceMappingURL=product.module.js.map