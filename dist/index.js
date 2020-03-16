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
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express_1 = __importDefault(require("express"));
const jwt_1 = require("./middleware/jwt");
const user_1 = require("./middleware/user");
const prisma_1 = require("./prisma");
const cors_1 = __importDefault(require("cors"));
const webhooks_1 = require("./webhooks");
const body_parser_1 = __importDefault(require("body-parser"));
const platform_express_1 = require("@nestjs/platform-express");
const Sentry = __importStar(require("@sentry/node"));
// Set up the server
const server = express_1.default();
if (process.env.NODE_ENV === "production") {
    // Set up Sentry, which automatically reports on uncaught exceptions
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
    });
    server.use(Sentry.Handlers.requestHandler()); // must be first middleware on app
}
server.use(jwt_1.checkJwt, user_1.createGetUserMiddleware(prisma_1.prisma), cors_1.default({
    origin: [
        "seedling-staging.herokuapp.com",
        /flare\.now\.sh$/,
        /seasons\.nyc$/,
        /localhost/,
    ],
    credentials: true,
}), body_parser_1.default.json(), webhooks_1.app);
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(server));
        yield app.listen(process.env.PORT ? process.env.PORT : 4000, () => console.log(`🚀 Server ready at ${process.env.PORT || 4000}`));
    });
}
bootstrap();
// Note: for more information on using ApolloServer with express, see
// https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express
//# sourceMappingURL=index.js.map