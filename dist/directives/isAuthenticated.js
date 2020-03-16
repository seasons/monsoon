"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function isAuthenticated(next, source, args, ctx) {
    utils_1.getEnforcedUser(ctx);
    return next();
}
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=isAuthenticated.js.map