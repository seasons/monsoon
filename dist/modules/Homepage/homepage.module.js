"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const homepage_fields_resolver_1 = require("./fields/homepage.fields.resolver");
const homepage_queries_resolver_1 = require("./queries/homepage.queries.resolver");
const homepageSection_fields_resolver_1 = require("./fields/homepageSection.fields.resolver");
const homepageResult_fields_resolver_1 = require("./fields/homepageResult.fields.resolver");
const homepageProductRail_queries_resolver_1 = require("./queries/homepageProductRail.queries.resolver");
const prisma_module_1 = require("../../prisma/prisma.module");
const homepage_service_1 = require("./services/homepage.service");
const homepageSection_service_1 = require("./services/homepageSection.service");
let HomepageModule = class HomepageModule {
};
HomepageModule = __decorate([
    common_1.Module({
        imports: [prisma_module_1.PrismaModule],
        providers: [
            homepage_fields_resolver_1.HomepageFieldsResolver,
            homepage_queries_resolver_1.HomepageQueriesResolver,
            homepageSection_fields_resolver_1.HomepageSectionFieldsResolver,
            homepageResult_fields_resolver_1.HomepageResultFieldsResolver,
            homepageProductRail_queries_resolver_1.HomepageProductRailQueriesResolver,
            homepage_service_1.HomepageService,
            homepageSection_service_1.HomepageSectionService
        ],
    })
], HomepageModule);
exports.HomepageModule = HomepageModule;
//# sourceMappingURL=homepage.module.js.map