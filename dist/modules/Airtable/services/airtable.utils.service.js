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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const airtable_base_service_1 = require("./airtable.base.service");
let AirtableUtilsService = class AirtableUtilsService {
    constructor(airtableBase) {
        this.airtableBase = airtableBase;
        this.keyMap = {
            phoneNumber: "Phone Number",
            birthday: "Birthday",
            height: "Height",
            weight: "Weight",
            bodyType: "Body Type",
            averageTopSize: "Average Top Size",
            averageWaistSize: "Average Waist Size",
            averagePantLength: "Average Pant Length",
            preferredPronouns: "Preferred Pronouns",
            profession: "Profession",
            partyFrequency: "Party Frequency",
            travelFrequency: "Travel Frequency",
            shoppingFrequency: "Shopping Frequency",
            averageSpend: "Average Spend",
            style: "Style",
            commuteStyle: "Commute Style",
            shippingAddress: "Shipping Address",
            phoneOS: "Platform OS",
            status: "Status",
            plan: "Plan",
        };
    }
    createLocation(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const createData = [
                {
                    fields: {
                        Name: data.name,
                        Company: data.company,
                        "Address 1": data.address1,
                        "Address 2": data.address2,
                        City: data.city,
                        State: data.state,
                        "Zip Code": data.zipCode,
                        Slug: data.slug,
                        "Location Type": data.locationType,
                    },
                },
            ];
            return this.airtableBase.base("Locations").create(createData);
        });
    }
    createBillingInfo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.airtableBase.base("BillingInfos").create({
                Brand: data.brand,
                Name: data.name,
                LastDigits: data.last_digits,
                "Expiration Month": data.expiration_month,
                "Expiration Year": data.expiration_year,
                "Street 1": data.street1,
                "Street 2": data.street2,
                City: data.city,
                State: data.state,
                Country: data.country,
                "Postal Code": data.postal_code,
            });
        });
    }
    getAirtableUserRecordByUserEmail(email) {
        return new Promise((resolve, reject) => {
            this.airtableBase
                .base("Users")
                .select({
                view: "Grid view",
                filterByFormula: `{Email}='${email}'`,
            })
                .firstPage((err, records) => {
                if (records.length > 0) {
                    const user = records[0];
                    resolve(user);
                }
                else {
                    reject(err);
                }
            });
        });
    }
    getAirtableLocationRecordBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.airtableBase
                    .base("Locations")
                    .select({ view: "Grid view", filterByFormula: `{Slug}='${slug}'` })
                    .firstPage((err, records) => {
                    if (err)
                        return reject(err);
                    if (records.length > 0)
                        return resolve(records[0]);
                    return reject(`No record found with slug ${slug}`);
                });
            });
        });
    }
};
AirtableUtilsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [airtable_base_service_1.AirtableBaseService])
], AirtableUtilsService);
exports.AirtableUtilsService = AirtableUtilsService;
//# sourceMappingURL=airtable.utils.service.js.map