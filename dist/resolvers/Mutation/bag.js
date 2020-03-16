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
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../../auth/utils");
const lodash_1 = require("lodash");
const apollo_server_1 = require("apollo-server");
const BAG_SIZE = 3;
exports.bag = {
    addToBag(obj, { item }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            // Check if the user still can add more items to bag
            // If not throw error
            // Check if the bag item already exists
            // Upsert it instead
            const bag = yield ctx.prisma.bagItems({
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
            return yield ctx.prisma.createBagItem({
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
    },
    removeFromBag(obj, { item, saved }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const whereData = {
                customer: {
                    id: customer.id,
                },
                productVariant: {
                    id: item,
                },
            };
            if (typeof saved === "boolean") {
                whereData.saved = saved;
            }
            const bagItems = yield ctx.prisma.bagItems({
                where: whereData,
            });
            const bagItem = lodash_1.head(bagItems);
            if (!bagItem) {
                throw new apollo_server_1.ApolloError("Item can not be found", "514");
            }
            return yield ctx.prisma.deleteBagItem({
                id: bagItem.id,
            });
        });
    },
    saveProduct(obj, { item, save = false }, ctx, info) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield utils_1.getCustomerFromContext(ctx);
            const bagItems = yield ctx.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    productVariant: {
                        id: item,
                    },
                    saved: true,
                },
            }, info);
            let bagItem = lodash_1.head(bagItems);
            if (save && !bagItem) {
                bagItem = yield ctx.prisma.createBagItem({
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
                    saved: save,
                    status: "Added",
                });
            }
            else {
                if (bagItem) {
                    yield ctx.prisma.deleteBagItem({
                        id: bagItem.id,
                    });
                }
            }
            if (save) {
                return ctx.db.query.bagItem({
                    where: {
                        id: bagItem.id,
                    },
                }, info);
            }
            return bagItem;
        });
    },
};
//# sourceMappingURL=bag.js.map