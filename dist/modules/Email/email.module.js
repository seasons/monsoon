"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const email_service_1 = require("./services/email.service");
const prisma_module_1 = require("../../prisma/prisma.module");
const utils_module_1 = require("../Utils/utils.module");
const email_data_service_1 = require("./services/email.data.service");
let EmailModule = class EmailModule {
};
EmailModule = __decorate([
    common_1.Module({
        imports: [prisma_module_1.PrismaModule, utils_module_1.UtilsModule],
        providers: [email_service_1.EmailService, email_data_service_1.EmailDataProvider],
        exports: [email_service_1.EmailService],
    })
], EmailModule);
exports.EmailModule = EmailModule;
//# sourceMappingURL=email.module.js.map