"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const modules_1 = require("./modules");
const graphql_import_1 = require("graphql-import");
const analytics_node_1 = __importDefault(require("analytics-node"));
const Airtable = __importStar(require("airtable"));
const email_module_1 = require("./modules/Email/email.module");
const airtable_module_1 = require("./modules/Airtable/airtable.module");
const analytics = new analytics_node_1.default(process.env.SEGMENT_MONSOON_WRITE_KEY);
Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.AIRTABLE_KEY,
});
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            graphql_1.GraphQLModule.forRootAsync({
                useFactory: () => __awaiter(void 0, void 0, void 0, function* () {
                    const typeDefs = yield graphql_import_1.importSchema("src/schema.graphql");
                    return {
                        typeDefs,
                        path: "/",
                        installSubscriptionHandlers: true,
                        resolverValidationOptions: {
                            requireResolversForResolveType: false,
                        },
                        directiveResolvers: modules_1.directiveResolvers,
                        context: ({ req }) => ({
                            analytics,
                            req,
                        }),
                    };
                }),
            }),
            modules_1.UserModule,
            modules_1.HomepageModule,
            modules_1.ProductModule,
            modules_1.CollectionModule,
            modules_1.FAQModule,
            modules_1.PaymentModule,
            email_module_1.EmailModule,
            airtable_module_1.AirtableModule,
            modules_1.SearchModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map