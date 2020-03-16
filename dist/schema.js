"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const resolvers_1 = __importDefault(require("./resolvers"));
const graphql_tools_1 = require("graphql-tools");
const graphql_import_1 = require("graphql-import");
const directives_1 = require("./auth/directives");
const typeDefs = graphql_import_1.importSchema("./src/schema.graphql");
exports.schema = graphql_tools_1.makeExecutableSchema({
    typeDefs,
    resolvers: resolvers_1.default,
    directiveResolvers: directives_1.directiveResolvers,
});
//# sourceMappingURL=schema.js.map