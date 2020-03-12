"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sentry = require("@sentry/node");
Sentry.init({
    dsn: process.env.SENTRY_DSN,
});
function createGetUserMiddleware(prisma) {
    return function (req, res, next) {
        // Get auth0 user from request
        var auth0User = req.user;
        if (!auth0User) {
            return next();
        }
        // Get user from prisma
        var sub = auth0User.sub;
        var auth0Id = sub.split("|")[1];
        prisma
            .user({ auth0Id: auth0Id })
            .then(function putUserOnRequestAndAddUserToSentryContext(prismaUser) {
            req.user = __assign(__assign({}, req.user), prismaUser);
            try {
                // Add user context on Sentry
                if (prismaUser) {
                    Sentry.configureScope(function (scope) {
                        scope.setUser({ id: prismaUser.id, email: prismaUser.email });
                    });
                }
            }
            catch (e) {
                console.error(e);
            }
            return next();
        });
    };
}
exports.createGetUserMiddleware = createGetUserMiddleware;
//# sourceMappingURL=user.js.map