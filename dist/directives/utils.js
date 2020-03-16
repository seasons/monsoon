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
const lodash_1 = require("lodash");
const db_service_1 = require("../prisma/db.service");
const db = new db_service_1.DBService();
class AuthError extends Error {
    constructor() {
        super("Not authorized");
    }
}
const isRequestingUserAlsoOwner = (userId, type, typeId) => __awaiter(void 0, void 0, void 0, function* () { return yield db.exists[type]({ id: typeId, user: { id: userId } }); });
exports.isUserOwner = (type, typeId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return type === `User`
        ? userId === typeId
        : yield isRequestingUserAlsoOwner(userId, type, typeId);
});
exports.userHasRole = (user, roles) => {
    return roles.includes(user.role);
};
exports.getEnforcedUser = (ctx) => {
    const user = lodash_1.get(ctx, "req.user");
    if (!user)
        throw new AuthError();
    return user;
};
//# sourceMappingURL=utils.js.map