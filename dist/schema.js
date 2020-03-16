"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var resolvers_1 = __importDefault(require("./resolvers"));
var graphql_tools_1 = require("graphql-tools");
var graphql_import_1 = require("graphql-import");
var directives_1 = require("./auth/directives");
var typeDefs = graphql_import_1.importSchema("./src/schema.graphql");
exports.schema = graphql_tools_1.makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers_1.default,
    directiveResolvers: directives_1.directiveResolvers,
});
//# sourceMappingURL=schema.js.map