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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
const graphql_1 = require("@nestjs/graphql");
const lodash_1 = require("lodash");
const prisma_1 = require("../../../prisma");
const nest_decorators_1 = require("../../../nest_decorators");
const db_service_1 = require("../../../prisma/db.service");
let MeFieldsResolver = class MeFieldsResolver {
    constructor(db) {
        this.db = db;
    }
    user(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return user;
        });
    }
    customer(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return customer;
        });
    }
    activeReservation(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservations = yield prisma_1.prisma
                .customer({ id: customer.id })
                .reservations({ orderBy: "createdAt_DESC" });
            const latestReservation = lodash_1.head(reservations);
            if (latestReservation &&
                !["Completed", "Cancelled"].includes(latestReservation.status)) {
                return latestReservation;
            }
            return null;
        });
    }
    bag(info, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    saved: false,
                },
            }, info);
        });
    }
    savedItems(ctx, info, customer) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    saved: true,
                },
            }, info);
        });
    }
};
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, nest_decorators_1.User()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeFieldsResolver.prototype, "user", null);
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeFieldsResolver.prototype, "customer", null);
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MeFieldsResolver.prototype, "activeReservation", null);
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Info()), __param(1, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MeFieldsResolver.prototype, "bag", null);
__decorate([
    graphql_1.ResolveProperty(),
    __param(0, graphql_1.Context()), __param(1, graphql_1.Info()), __param(2, nest_decorators_1.Customer()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MeFieldsResolver.prototype, "savedItems", null);
MeFieldsResolver = __decorate([
    graphql_1.Resolver("Me"),
    __metadata("design:paramtypes", [db_service_1.DBService])
], MeFieldsResolver);
exports.MeFieldsResolver = MeFieldsResolver;
//# sourceMappingURL=me.fields.js.map