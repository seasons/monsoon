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
const search_service_1 = require("../services/search.service");
let SearchQueriesResolver = class SearchQueriesResolver {
    constructor(searchService) {
        this.searchService = searchService;
    }
    search({ query }) {
        return __awaiter(this, void 0, void 0, function* () {
            const indexes = ["brands", "products"];
            const result = yield this.searchService.elasticsearch.search({
                index: indexes
                    .map(a => { var _a; return `${a}-${_a = process.env.NODE_ENV, (_a !== null && _a !== void 0 ? _a : "staging")}`; })
                    .join(","),
                body: {
                    query: {
                        query_string: {
                            query,
                        },
                    },
                },
            });
            const data = result.body.hits.hits.map(({ _score, _source }) => {
                return {
                    data: _source,
                    score: _score,
                };
            });
            return data;
        });
    }
};
__decorate([
    graphql_1.Query(),
    __param(0, graphql_1.Args()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SearchQueriesResolver.prototype, "search", null);
SearchQueriesResolver = __decorate([
    graphql_1.Resolver(),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchQueriesResolver);
exports.SearchQueriesResolver = SearchQueriesResolver;
//# sourceMappingURL=search.queries.resolver.js.map