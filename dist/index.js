"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("./server");
var apollo_server_express_1 = require("apollo-server-express");
var express_1 = __importDefault(require("express"));
var jwt_1 = require("./middleware/jwt");
var user_1 = require("./middleware/user");
var prisma_1 = require("./prisma");
var cors_1 = __importDefault(require("cors"));
var webhooks_1 = require("./webhooks");
var body_parser_1 = __importDefault(require("body-parser"));
var Sentry = __importStar(require("@sentry/node"));
// Set up the server
var server = new apollo_server_express_1.ApolloServer(server_1.serverOptions);
var app = express_1.default();
if (process.env.NODE_ENV === "production") {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
    app.use(Sentry.Handlers.requestHandler()); // must be first middleware on app
}
app.use(jwt_1.checkJwt, user_1.createGetUserMiddleware(prisma_1.prisma), cors_1.default({
    origin: [
        "seedling-staging.herokuapp.com",
        /flare\.now\.sh$/,
        /seasons\.nyc$/,
        /localhost/,
    ],
    credentials: true,
}), body_parser_1.default.json(), webhooks_1.app);
server.applyMiddleware({ app: app, path: "/" });
app.listen({ port: process.env.PORT || 4000 }, function () {
    return console.log("\uD83D\uDE80 Server ready at " + (process.env.PORT || 4000));
});
// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
//# sourceMappingURL=index.js.map