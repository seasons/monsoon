"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_1 = require("../resolvers/Mutation/auth");
exports.sendPushNotifications = function () {
    auth_1.beamsClient
        .publishToUsers(["kieran@seasons.nyc"], {
        apns: {
            aps: {
                alert: {
                    title: "We've received your items!",
                    subtitle: "You can reserve two more items",
                },
                badge: 1,
            },
            data: {
                route: "Product",
                params: {
                    id: "ck76fflg5x8490768fw9ihwad",
                },
            },
        },
        fcm: {
            notification: {
                title: "We've received your items!",
                body: JSON.stringify({
                    route: "Product",
                    params: {
                        id: "ck76fflg5x8490768fw9ihwad",
                    },
                }),
            },
        },
    })
        .then(function (publishResponse) {
        console.log("Just published:", publishResponse.publishId);
    })
        .catch(function (error) {
        console.error("Error:", error);
    });
};
exports.sendPushNotifications();
//# sourceMappingURL=sendPushNotifications.js.map