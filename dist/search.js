"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const { ELASTICSEARCH_URL, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, } = process.env;
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