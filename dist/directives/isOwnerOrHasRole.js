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
const utils_1 = require("./utils");
function isOwnerOrHasRole(next, source, { roles, type }, ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = utils_1.getEnforcedUser(ctx);
        if (utils_1.userHasRole(user, roles)) {
            return next();
        }
        const { id: typeId } = ctx.request.body.variables;
        const isOwner = yield utils_1.isUserOwner(type, typeId, user.id);
        if (isOwner) {
            return next();
        }
        throw new Error(`Unauthorized, not owner or incorrect role`);
    });
}
exports.isOwnerOrHasRole = isOwnerOrHasRole;
//# sourceMappingURL=isOwnerOrHasRole.js.map