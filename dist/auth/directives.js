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
const isRequestingUserAlsoOwner = ({ ctx, userId, type, typeId }) => ctx.db.exists[type]({ id: typeId, user: { id: userId } });
const isRequestingUser = ({ ctx, userId }) => ctx.db.exists.User({ id: userId });
exports.directiveResolvers = {
    isAuthenticated: (next, source, args, ctx) => {
        utils_1.getUserIfExists(ctx);
        return next();
    },
    hasRole: (next, source, { roles }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract the auth0Id from the user object on the request
        const { role } = utils_1.getUserIfExists(ctx);
        if (roles.includes(role)) {
            return next();
        }
        throw new Error(`Unauthorized, incorrect role`);
    }),
    isOwner: (next, source, { type }, ctx) => __awaiter(void 0, void 0, void 0, function* () {
        const { id: typeId } = source && source.id
            ? source
            : ctx.request.body.variables
                ? ctx.request.body.variables
                : { id: null };
        const { id: userId } = utils_1.getUserIfExists(ctx);
        const isOwner = type === `User`
            ? userId === typeId
            : yield isRequestingUserAlsoOwner({ ctx, userId, type, typeId });
        if (isOwner) {
            return next();
        }
        throw new Error(`Unauthorized, must be owner`);
    }),
    isOwnerOrHasRole: (next, source, { roles, type }, ctx, ...p) => __awaiter(void 0, void 0, void 0, function* () {
        const { id: userId, role } = utils_1.getUserIfExists(ctx);
        if (roles.includes(role)) {
            return next();
        }
        const { id: typeId } = ctx.request.body.variables;
        const isOwner = yield isRequestingUserAlsoOwner({
            ctx,
            userId,
            type,
            typeId,
        });
        if (isOwner) {
            return next();
        }
        throw new Error(`Unauthorized, not owner or incorrect role`);
    }),
};
//# sourceMappingURL=directives.js.map