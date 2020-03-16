"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const common_1 = require("@nestjs/common");
const { ELASTICSEARCH_URL, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, } = process.env;
let SearchService = class SearchService {
    constructor() {
        this.elasticsearch = !!ELASTICSEARCH_URL
            ? new elasticsearch_1.Client({
                node: ELASTICSEARCH_URL,
                auth: {
                    username: (ELASTICSEARCH_USERNAME !== null && ELASTICSEARCH_USERNAME !== void 0 ? ELASTICSEARCH_USERNAME : "elastic"),
                    password: ELASTICSEARCH_PASSWORD,
                },
            })
            : null;
    }
};
SearchService = __decorate([
    common_1.Injectable()
], SearchService);
exports.SearchService = SearchService;
//# sourceMappingURL=search.service.js.map