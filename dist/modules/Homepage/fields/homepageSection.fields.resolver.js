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
const homepageSection_service_1 = require("../services/homepageSection.service");
let HomepageSectionFieldsResolver = class HomepageSectionFieldsResolver {
    constructor(homepageSectionService) {
        this.homepageSectionService = homepageSectionService;
    }
    results(section, args) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.homepageSectionService.getResultsForSection(section.title, args);
        });
    }
};
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Parent()), __param(1, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HomepageSectionFieldsResolver.prototype, "results", null);
HomepageSectionFieldsResolver = __decorate([
    graphql_1.Resolver("HomepageSection"),
    __metadata("design:paramtypes", [homepageSection_service_1.HomepageSectionService])
], HomepageSectionFieldsResolver);
exports.HomepageSectionFieldsResolver = HomepageSectionFieldsResolver;
//# sourceMappingURL=homepageSection.fields.resolver.js.map