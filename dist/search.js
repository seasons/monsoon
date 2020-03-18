"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var elasticsearch_1 = require("@elastic/elasticsearch");
var _a = process.env, ELASTICSEARCH_URL = _a.ELASTICSEARCH_URL, ELASTICSEARCH_USERNAME = _a.ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD = _a.ELASTICSEARCH_PASSWORD;
exports.elasticsearch = !!ELASTICSEARCH_URL
    ? new elasticsearch_1.Client({
        node: ELASTICSEARCH_URL,
        auth: {
            username: (ELASTICSEARCH_USERNAME !== null && ELASTICSEARCH_USERNAME !== void 0 ? ELASTICSEARCH_USERNAME : "elastic"),
            password: ELASTICSEARCH_PASSWORD,
        },
    })
    : null;
//# sourceMappingURL=search.js.map