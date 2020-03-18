"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var schema_1 = require("./schema");
var prisma_1 = require("./prisma");
var prisma_binding_1 = require("prisma-binding");
var analytics_node_1 = __importDefault(require("analytics-node"));
var sentryIntegration_1 = require("./apollo/sentryIntegration");
var analytics = new analytics_node_1.default(process.env.SEGMENT_MONSOON_WRITE_KEY);
var defaultQuery = "{\n  products {\n    id\n    name\n    description\n    retailPrice\n  }\n}\n";
exports.db = new prisma_binding_1.Prisma({
    typeDefs: "./src/prisma/prisma.graphql",
    endpoint: process.env.PRISMA_ENDPOINT || "http://localhost:4466",
    secret: process.env.PRISMA_SECRET,
});
exports.serverOptions = {
    schema: schema_1.schema,
    context: function (_a) {
        var req = _a.req, res = _a.res;
        return ({
            req: req,
            res: res,
            prisma: prisma_1.prisma,
            db: exports.db,
            /* track events on segment */
            analytics: analytics,
        });
    },
    introspection: true,
    formatError: function (error) {
        console.log(error);
        return error;
    },
    playground: {
        settings: {
            "editor.theme": "dark",
        },
        tabs: [
            {
                endpoint: "/",
                query: defaultQuery,
            },
        ],
    },
    plugins: [sentryIntegration_1.apolloServerSentryPlugin],
};
//# sourceMappingURL=server.js.map