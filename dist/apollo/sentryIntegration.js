"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Sentry = __importStar(require("@sentry/node"));
Sentry.init({
    dsn: process.env.SENTRY_DSN,
});
exports.apolloServerSentryPlugin = {
    // For plugin definition see the docs: https://www.apollographql.com/docs/apollo-server/integrations/plugins/
    // This code was adapted from: https://gist.github.com/nodkz/d14b236d67251d2df5674cb446843732
    requestDidStart: function () {
        return {
            didEncounterErrors: function (rc) {
                Sentry.withScope(function (scope) {
                    scope.addEventProcessor(function (event) {
                        return Sentry.Handlers.parseRequest(event, rc.context.req);
                    });
                    rc.errors.forEach(function (error) {
                        if (error.path || error.name !== "GraphQLError") {
                            scope.setExtras({
                                path: error.path,
                            });
                            Sentry.captureException(error);
                        }
                        else {
                            scope.setExtras({});
                            Sentry.captureMessage("GraphQLWrongQuery: " + error.message);
                        }
                    });
                });
            },
        };
    },
};
//# sourceMappingURL=sentryIntegration.js.map