"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function hasRole(next, source, { roles }, ctx) {
    // Todo: test when addCustomerDetails mutation is complete
    const user = utils_1.getEnforcedUser(ctx);
    if (!roles.includes(user.role)) {
        throw new Error(`Unauthorized, incorrect role`);
    }
    return next();
}
exports.hasRole = hasRole;
//# sourceMappingURL=hasRole.js.map