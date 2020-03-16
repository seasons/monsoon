"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
const common_1 = require("@nestjs/common");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const client_service_1 = require("../../../prisma/client.service");
const utils_service_1 = require("../../Utils/utils.service");
const email_data_service_1 = require("./email.data.service");
let EmailService = class EmailService {
    constructor(prisma, utils, data) {
        this.prisma = prisma;
        this.utils = utils;
        this.data = data;
        this.getReservationConfirmationDataForProduct = (product) => __awaiter(this, void 0, void 0, function* () {
            return this.utils.Identity({
                url: product.images[0].url,
                brand: yield this.prisma.client
                    .product({ id: product.id })
                    .brand()
                    .name(),
                name: product.name,
                price: product.retailPrice,
            });
        });
    }
    sendReservationConfirmationEmail(user, products, reservation) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const reservedItems = [
                yield this.getReservationConfirmationDataForProduct(products[0]),
            ];
            if (!!((_a = products) === null || _a === void 0 ? void 0 : _a[1])) {
                reservedItems.push(yield this.getReservationConfirmationDataForProduct(products[1]));
            }
            if (!!((_b = products) === null || _b === void 0 ? void 0 : _b[2])) {
                reservedItems.push(yield this.getReservationConfirmationDataForProduct(products[2]));
            }
            this.sendTransactionalEmail({
                to: user.email,
                data: this.data.reservationConfirmation(reservation.reservationNumber, reservedItems, this.utils.formatReservationReturnDate(new Date(reservation.createdAt))),
            });
        });
    }
    sendTransactionalEmail({ to, data, }) {
        return __awaiter(this, void 0, void 0, function* () {
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
};
EmailService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [client_service_1.PrismaClientService,
        utils_service_1.UtilsService,
        email_data_service_1.EmailDataProvider])
], EmailService);
exports.EmailService = EmailService;
//# sourceMappingURL=email.service.js.map