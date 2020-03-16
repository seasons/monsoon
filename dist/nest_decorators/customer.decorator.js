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
const common_1 = require("@nestjs/common");
const client_service_1 = require("../prisma/client.service");
const prisma = new client_service_1.PrismaClientService();
exports.Customer = common_1.createParamDecorator((data, [root, args, ctx, info]) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = ctx.req.user ? ctx.req.user : { id: "" };
    const customerArray = yield prisma.client.customers({
        where: { user: { id: userId } },
    });
    return customerArray.length > 0 ? customerArray[0] : null;
}));
//# sourceMappingURL=customer.decorator.js.map