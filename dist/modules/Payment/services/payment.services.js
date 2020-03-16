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
const db_service_1 = require("../../../prisma/db.service");
const chargebee_1 = __importDefault(require("chargebee"));
let PaymentService = class PaymentService {
    constructor(db) {
        this.db = db;
    }
    getHostedCheckoutPage(planId, userId, email, firstName, lastName, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            // translate the passed planID into a chargebee-readable version
            let chargebeePlanId;
            if (planId === "AllAccess") {
                chargebeePlanId = "all-access";
            }
            else if (planId === "Essential") {
                chargebeePlanId = "essential";
            }
            else {
                throw new Error(`unrecognized planID: ${planId}`);
            }
            // make the call to chargebee
            chargebee_1.default.configure({
                site: process.env.CHARGEBEE_SITE,
                api_key: process.env.CHARGEE_API_KEY,
            });
            return yield new Promise((resolve, reject) => {
                chargebee_1.default.hosted_page
                    .checkout_new({
                    subscription: {
                        plan_id: chargebeePlanId,
                    },
                    customer: {
                        id: userId,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        phone: phoneNumber,
                    },
                })
                    .request((error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(result.hosted_page);
                    }
                });
            }).catch(error => {
                throw new Error(JSON.stringify(error));
            });
        });
    }
};
PaymentService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.services.js.map