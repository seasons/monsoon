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
const search_1 = require("../search");
exports.Search = {
    search(parent, args, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const { query, options } = args;
            const indexes = ["brands", "products"];
            const result = yield search_1.elasticsearch.search({
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
    },
};
exports.SearchResultType = {
    __resolveType(obj, context, info) {
        if (obj.brand) {
            return "Product";
        }
        return "Brand";
    },
};
//# sourceMappingURL=Search.js.map