"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
const prisma_1 = require("./prisma");
const prisma_binding_1 = require("prisma-binding");
const analytics_node_1 = __importDefault(require("analytics-node"));
const sentryIntegration_1 = require("./apollo/sentryIntegration");
const analytics = new analytics_node_1.default(process.env.SEGMENT_MONSOON_WRITE_KEY);
const defaultQuery = `{
  products {
    id
    name
    description
    retailPrice
  }
}
`;
exports.db = new prisma_binding_1.Prisma({
    typeDefs: "./src/prisma/prisma.graphql",
    endpoint: process.env.PRISMA_ENDPOINT || "http://localhost:4466",
    secret: process.env.PRISMA_SECRET,
});
exports.serverOptions = {
    schema: schema_1.schema,
    context: ({ req, res }) => ({
        req,
        res,
        prisma: prisma_1.prisma,
        db: exports.db,
        /* track events on segment */
        analytics,
    }),
    introspection: true,
    formatError: error => {
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