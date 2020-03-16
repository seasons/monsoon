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
const client_service_1 = require("../../prisma/client.service");
let UtilsService = class UtilsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getPrismaLocationFromSlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const prismaLocation = yield this.prisma.client.location({
                slug,
            });
            if (!prismaLocation) {
                throw Error(`no location with slug ${slug} found in DB`);
            }
            return prismaLocation;
        });
    }
    formatReservationReturnDate(reservationCreatedAtDate) {
        const returnDate = new Date(reservationCreatedAtDate);
        returnDate.setDate(reservationCreatedAtDate.getDate() + 30);
        return returnDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }
    Identity(a) {
        return a;
    }
};
UtilsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService])
], UtilsService);
exports.UtilsService = UtilsService;
//# sourceMappingURL=utils.service.js.map