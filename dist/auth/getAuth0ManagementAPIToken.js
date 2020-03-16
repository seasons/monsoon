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
exports.getAuth0ManagementAPIToken = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        request_1.default({
            method: "POST",
            url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            form: {
                grant_type: "client_credentials",
                client_id: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_ID,
                client_secret: process.env.AUTH0_MACHINE_TO_MACHINE_CLIENT_SECRET,
                audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            },
        }, (error, response, body) => {
            if (error)
                return reject(error);
            if (response.statusCode !== 200) {
                return reject(response.body);
            }
            return resolve(JSON.parse(body).access_token);
        });
    });
});
//# sourceMappingURL=getAuth0ManagementAPIToken.js.map