"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const db_service_1 = require("./db.service");
const client_service_1 = require("./client.service");
let PrismaModule = class PrismaModule {
};
PrismaModule = __decorate([
    common_1.Module({
        providers: [db_service_1.DBService, client_service_1.PrismaClientService],
        exports: [db_service_1.DBService, client_service_1.PrismaClientService],
    })
], PrismaModule);
exports.PrismaModule = PrismaModule;
//# sourceMappingURL=prisma.module.js.map