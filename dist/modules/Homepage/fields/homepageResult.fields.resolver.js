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
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("@nestjs/graphql");
let HomepageResultFieldsResolver = class HomepageResultFieldsResolver {
    __resolveType(obj) {
        if (obj.brand || obj.colorway) {
            return "Product";
        }
        else if (obj.since) {
            return "Brand";
        }
        else if (obj.subTitle) {
            return "Collection";
        }
        else if (obj.name) {
            return "HomepageProductRail";
        }
        return null;
    }
};
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Parent()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HomepageResultFieldsResolver.prototype, "__resolveType", null);
HomepageResultFieldsResolver = __decorate([
    graphql_1.Resolver('HomepageResult')
], HomepageResultFieldsResolver);
exports.HomepageResultFieldsResolver = HomepageResultFieldsResolver;
//# sourceMappingURL=homepageResult.fields.resolver.js.map