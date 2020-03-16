"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isAuthenticated_1 = require("./isAuthenticated");
const isOwner_1 = require("./isOwner");
const isOwnerOrHasRole_1 = require("./isOwnerOrHasRole");
const hasRole_1 = require("./hasRole");
exports.directiveResolvers = {
    isAuthenticated: isAuthenticated_1.isAuthenticated,
    isOwner: isOwner_1.isOwner,
    isOwnerOrHasRole: isOwnerOrHasRole_1.isOwnerOrHasRole,
    hasRole: hasRole_1.hasRole,
};
//# sourceMappingURL=index.js.map