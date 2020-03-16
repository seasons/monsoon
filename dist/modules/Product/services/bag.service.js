"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const client_service_1 = require("../../../prisma/client.service");
const apollo_server_1 = require("apollo-server");
const lodash_1 = require("lodash");
const BAG_SIZE = 3;
let BagService = class BagService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    addToBag(item, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const bag = yield this.prisma.client.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    saved: false,
                },
            });
            if (bag.length >= BAG_SIZE) {
                throw new apollo_server_1.ApolloError("Bag is full", "514");
            }
            return yield this.prisma.client.createBagItem({
                customer: {
                    connect: {
                        id: customer.id,
                    },
                },
                productVariant: {
                    connect: {
                        id: item,
                    },
                },
                position: 0,
                saved: false,
                status: "Added",
            });
        });
    }
    removeFromBag(item, saved, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const bagItems = yield this.prisma.client.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    productVariant: {
                        id: item,
                    },
                    saved,
                },
            });
            const bagItem = lodash_1.head(bagItems);
            if (!bagItem) {
                throw new apollo_server_1.ApolloError("Item can not be found", "514");
            }
            return yield this.prisma.client.deleteBagItem({
                id: bagItem.id,
            });
        });
    }
};
BagService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService])
], BagService);
exports.BagService = BagService;
//# sourceMappingURL=bag.service.js.map