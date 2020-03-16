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
const getAll = (name, filterFormula, view = "Script", airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    const data = [];
    const baseToUse = airtableBase || config_1.base;
    data.findByIds = (ids = []) => {
        return data.find(record => ids.includes(record.id));
    };
    data.findMultipleByIds = (ids = []) => {
        return data.filter(record => ids.includes(record.id));
    };
    return new Promise((resolve, reject) => {
        const options = {
            view,
        };
        if (filterFormula && filterFormula.length) {
            options.filterByFormula = filterFormula;
        }
        baseToUse(name)
            .select(options)
            .eachPage((records, fetchNextPage) => {
            records.forEach(record => {
                record.model = exports.airtableToPrismaObject(record.fields);
                data.push(record);
            });
            return fetchNextPage();
        }, function done(err) {
            if (err) {
                console.error(err);
                reject(err);
                return;
            }
            resolve(data);
        });
    });
});
exports.getAllBrands = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Brands", "", "", airtableBase);
});
exports.getAllModels = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Models", "", "", airtableBase);
});
exports.getAllReservations = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Reservations", "", "", airtableBase);
});
exports.getAllCollections = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Collections", "", "", airtableBase);
});
exports.getAllCollectionGroups = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Collection Groups", "", "", airtableBase);
});
exports.getAllUsers = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Users", "", "", airtableBase);
});
exports.getAllCategories = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Categories", "", "", airtableBase);
});
exports.getAllColors = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Colors", "", "", airtableBase);
});
exports.getAllHomepageProductRails = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Homepage Product Rails", "", "", airtableBase);
});
exports.getAllProducts = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Products", "", "", airtableBase);
});
exports.getAllProductVariants = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Product Variants", "", "", airtableBase);
});
exports.getAllPhysicalProducts = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Physical Products", "", "", airtableBase);
});
exports.getAllLocations = (airtableBase) => __awaiter(void 0, void 0, void 0, function* () {
    return getAll("Locations", "", "", airtableBase);
});
exports.airtableToPrismaObject = record => {
    function camelCase(str) {
        return str
            .replace(/\s(.)/g, function (a) {
            return a.toUpperCase();
        })
            .replace(/\s/g, "")
            .replace(/^(.)/, function (b) {
            return b.toLowerCase();
        });
    }
    const obj = {};
    for (const id of Object.keys(record)) {
        const newKey = camelCase(id);
        obj[newKey] = record[id];
    }
    return obj;
};
function createAirtableReservation(userEmail, data, shippingError, returnShippingError) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const itemIDs = data.products.connect.map(a => a.seasonsUID);
                const items = yield exports.getPhysicalProducts(itemIDs);
                const airtableUserRecord = yield getAirtableUserRecordByUserEmail(userEmail);
                const createData = [
                    {
                        fields: {
                            ID: data.reservationNumber,
                            User: [airtableUserRecord.id],
                            Items: items.map(a => a.id),
                            Shipped: false,
                            Status: "New",
                            "Shipping Address": airtableUserRecord.fields["Shipping Address"],
                            "Shipping Label": data.sentPackage.create.shippingLabel.create.image,
                            "Tracking URL": data.sentPackage.create.shippingLabel.create.trackingURL,
                            "Return Label": data.returnedPackage.create.shippingLabel.create.image,
                            "Return Tracking URL": data.returnedPackage.create.shippingLabel.create.trackingURL,
                            "Shipping Error": shippingError,
                            "Return Shipping Error": returnShippingError,
                        },
                    },
                ];
                const records = yield config_1.base("Reservations").create(createData);
                const rollbackAirtableReservation = () => __awaiter(this, void 0, void 0, function* () {
                    const numDeleted = yield config_1.base("Reservations").destroy([
                        records[0].getId(),
                    ]);
                    return numDeleted;
                });
                resolve([records[0], rollbackAirtableReservation]);
            }
            catch (err) {
                reject(err);
            }
        }));
    });
}
exports.createAirtableReservation = createAirtableReservation;
exports.createLocation = (user, data) => __awaiter(void 0, void 0, void 0, function* () {
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
    return config_1.base("Locations").create(createData);
});
function createBillingInfo(data) {
    return __awaiter(this, void 0, void 0, function* () {
        return config_1.base("BillingInfos").create({
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
exports.createBillingInfo = createBillingInfo;
exports.getProductVariant = (SKU) => {
    return getAll("Product Variants", `{SKU}=${SKU}`);
};
exports.getPhysicalProducts = (SUIDs) => {
    const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`;
    return getAll("Physical Products", formula);
};
exports.updateProductVariant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        config_1.base("Reservations").create([{}], (err, records) => {
            if (records.length > 0) {
                const user = records[0];
                resolve(user);
            }
            else {
                reject(err);
            }
        });
    });
});
function getAirtableUserRecordByUserEmail(email) {
    return new Promise((resolve, reject) => {
        config_1.base("Users")
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
exports.getAirtableUserRecordByUserEmail = getAirtableUserRecordByUserEmail;
exports.getAirtableLocationRecordBySlug = (slug) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        config_1.base("Locations")
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
//# sourceMappingURL=utils.js.map