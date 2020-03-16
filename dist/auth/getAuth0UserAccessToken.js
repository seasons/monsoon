"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var request_1 = __importDefault(require("request"));
exports.getAuth0UserAccessToken = function (email, password) {
    return new Promise(function RetrieveAccessToken(resolve, reject) {
        request_1.default({
            method: "Post",
            url: "https://" + process.env.AUTH0_DOMAIN + "/oauth/token",
            headers: { "content-type": "application/json" },
            body: {
                grant_type: "password",
                username: email,
                password: password,
                scope: "offline_access",
                audience: "" + process.env.AUTH0_AUDIENCE,
                client_id: "" + process.env.AUTH0_CLIENTID,
                client_secret: "" + process.env.AUTH0_CLIENT_SECRET,
            },
            json: true,
        }, function handleResponse(error, response, body) {
            if (error) {
                return reject(new Error("Error retrieving access token: " + error));
            }
            if (response.statusCode != 200) {
                return reject(new Error("Error retrieving access token from Auth0. Auth0 returned " +
                    (response.statusCode + " with body: " + JSON.stringify(body))));
            }
            return resolve(body);
        });
    });
};
//# sourceMappingURL=getAuth0UserAccessToken.js.map