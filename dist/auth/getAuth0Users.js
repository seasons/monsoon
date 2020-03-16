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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
const getAuth0ManagementAPIToken_1 = require("./getAuth0ManagementAPIToken");
exports.getAuth0Users = () => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield getAuth0ManagementAPIToken_1.getAuth0ManagementAPIToken();
    return new Promise((resolve, reject) => {
        request_1.default({
            method: "Get",
            url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
            headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            json: true,
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            if (response.statusCode !== 200) {
                return reject("Invalid status code <" +
                    response.statusCode +
                    ">" +
                    "Response: " +
                    JSON.stringify(response.body));
            }
            return resolve(body);
        });
    });
});
//# sourceMappingURL=getAuth0Users.js.map