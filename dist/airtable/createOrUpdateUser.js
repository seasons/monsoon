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
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const utils_1 = require("./utils");
const keyMap = {
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
exports.createOrUpdateAirtableUser = (user, fields) => __awaiter(void 0, void 0, void 0, function* () {
    // Create the airtable data
    const { email, firstName, lastName } = user;
    const data = {
        Email: email,
        "First Name": firstName,
        "Last Name": lastName,
    };
    for (let key in fields) {
        if (keyMap[key]) {
            data[keyMap[key]] = fields[key];
        }
    }
    // WARNING: shipping address and billingInfo code are still "create" only.
    if (!!fields.shippingAddress) {
        const location = yield utils_1.createLocation(user, fields.shippingAddress.create);
        data["Shipping Address"] = location.map(l => l.id);
    }
    if (!!fields.billingInfo) {
        const airtableBillingInfoRecord = yield utils_1.createBillingInfo(fields.billingInfo);
        data["Billing Info"] = [airtableBillingInfoRecord.getId()];
    }
    // Create or update the record
    config_1.base("Users")
        .select({
        view: "Grid view",
        filterByFormula: `{Email}='${email}'`,
    })
        .firstPage((err, records) => {
        if (err) {
            throw err;
        }
        if (records.length > 0) {
            const user = records[0];
            config_1.base("Users").update(user.id, data, function (err, record) {
                if (err) {
                    throw err;
                }
            });
        }
        else {
            config_1.base("Users").create([
                {
                    fields: data,
                },
            ]);
        }
    });
});
//# sourceMappingURL=createOrUpdateUser.js.map