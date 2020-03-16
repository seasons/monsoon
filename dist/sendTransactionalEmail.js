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
const mail_1 = __importDefault(require("@sendgrid/mail"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path = process.cwd();
const buffer = fs_1.default.readFileSync(path + "/" + "master-email.html");
const emailTemplate = buffer.toString();
const RenderedEmailTemplate = handlebars_1.default.compile(emailTemplate);
const nodemailerTransport = nodemailer_1.default.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "7b3330ee47f7b2",
        pass: "e81e7c28792bfa",
    },
});
function sendTransactionalEmail({ to, data, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const rendered = RenderedEmailTemplate(data);
        const msg = {
            from: { email: "membership@seasons.nyc", name: "Seasons NYC" },
            to,
            subject: data.email.subject,
            html: rendered,
        };
        if (process.env.NODE_ENV === "production") {
            mail_1.default.send(msg);
        }
        else {
            yield nodemailerTransport.sendMail(Object.assign({ from: "membership@seasons.nyc" }, msg));
        }
    });
}
exports.sendTransactionalEmail = sendTransactionalEmail;
//# sourceMappingURL=sendTransactionalEmail.js.map