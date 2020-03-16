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
const lodash_1 = require("lodash");
const airtable_utils_service_1 = require("./airtable.utils.service");
const airtable_base_service_1 = require("./airtable.base.service");
let AirtableService = class AirtableService {
    constructor(airtableBase, utils) {
        this.airtableBase = airtableBase;
        this.utils = utils;
        this.getAll = (name, filterFormula, view = "Script", airtableBase) => __awaiter(this, void 0, void 0, function* () {
            const data = [];
            const baseToUse = airtableBase || this.airtableBase.base;
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
                        record.model = this.airtableToPrismaObject(record.fields);
                        data.push(record);
                    });
                    return fetchNextPage();
                }, function done(err) {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    return resolve(data);
                });
            });
        });
    }
    getAllProductVariants(airtableBase) {
        return this.getAll("Product Variants", "", "", airtableBase);
    }
    markPhysicalProductsReservedOnAirtable(physicalProducts) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the record ids of all relevant airtable physical products
            const airtablePhysicalProductRecords = yield this.getPhysicalProducts(physicalProducts.map(prod => prod.seasonsUID));
            const airtablePhysicalProductRecordIds = airtablePhysicalProductRecords.map(a => a.id);
            // Update their statuses on airtable
            const airtablePhysicalProductRecordsData = lodash_1.fill(new Array(airtablePhysicalProductRecordIds.length), {
                "Inventory Status": "Reserved",
            });
            yield this.updatePhysicalProducts(airtablePhysicalProductRecordIds, airtablePhysicalProductRecordsData);
            // Create and return a rollback function
            const airtablePhysicalProductRecordsRollbackData = lodash_1.fill(new Array(airtablePhysicalProductRecordIds.length), {
                "Inventory Status": "Reservable",
            });
            const rollbackMarkPhysicalProductReservedOnAirtable = () => __awaiter(this, void 0, void 0, function* () {
                yield this.updatePhysicalProducts(airtablePhysicalProductRecordIds, airtablePhysicalProductRecordsRollbackData);
            });
            return rollbackMarkPhysicalProductReservedOnAirtable;
        });
    }
    createAirtableReservation(userEmail, data, shippingError, returnShippingError) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const itemIDs = data.products.connect.map(a => a.seasonsUID);
                    const items = yield this.getPhysicalProducts(itemIDs);
                    const airtableUserRecord = yield this.utils.getAirtableUserRecordByUserEmail(userEmail);
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
                    const records = yield this.airtableBase
                        .base("Reservations")
                        .create(createData);
                    const rollbackAirtableReservation = () => __awaiter(this, void 0, void 0, function* () {
                        const numDeleted = yield this.airtableBase
                            .base("Reservations")
                            .destroy([records[0].getId()]);
                        return numDeleted;
                    });
                    return resolve([records[0], rollbackAirtableReservation]);
                }
                catch (err) {
                    return reject(err);
                }
            }));
        });
    }
    createOrUpdateAirtableUser(user, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create the airtable data
            const { email, firstName, lastName } = user;
            const data = {
                Email: email,
                "First Name": firstName,
                "Last Name": lastName,
            };
            for (const key in fields) {
                if (this.utils.keyMap[key]) {
                    data[this.utils.keyMap[key]] = fields[key];
                }
            }
            // WARNING: shipping address and billingInfo code are still "create" only.
            if (!!fields.shippingAddress) {
                const location = yield this.utils.createLocation(fields.shippingAddress.create);
                data["Shipping Address"] = location.map(l => l.id);
            }
            if (!!fields.billingInfo) {
                const airtableBillingInfoRecord = yield this.utils.createBillingInfo(fields.billingInfo);
                data["Billing Info"] = [airtableBillingInfoRecord.getId()];
            }
            // Create or update the record
            this.airtableBase
                .base("Users")
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
                    this.airtableBase
                        .base("Users")
                        .update(user.id, data, function (err, record) {
                        if (err) {
                            throw err;
                        }
                    });
                }
                else {
                    this.airtableBase.base("Users").create([
                        {
                            fields: data,
                        },
                    ]);
                }
            });
        });
    }
    updatePhysicalProducts(airtableIDs, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            if (airtableIDs.length !== fields.length) {
                throw new Error("airtableIDs and fields must be arrays of equal length");
            }
            if (airtableIDs.length < 1 || airtableIDs.length > 10) {
                throw new Error("please include one to ten airtable record IDs");
            }
            const formattedUpdateData = lodash_1.zip(airtableIDs, fields).map(a => {
                return {
                    id: a[0],
                    fields: a[1],
                };
            });
            const updatedRecords = yield this.airtableBase
                .base("Physical Products")
                .update(formattedUpdateData);
            return updatedRecords;
        });
    }
    airtableToPrismaObject(record) {
        function camelCase(str) {
            return str
                .replace(/\s(.)/g, a => a.toUpperCase())
                .replace(/\s/g, "")
                .replace(/^(.)/, b => b.toLowerCase());
        }
        const obj = {};
        for (const id of Object.keys(record)) {
            const newKey = camelCase(id);
            obj[newKey] = record[id];
        }
        return obj;
    }
    getPhysicalProducts(SUIDs) {
        const formula = `OR(${SUIDs.map(a => `{SUID}='${a}'`).join(",")})`;
        return this.getAll("Physical Products", formula);
    }
};
AirtableService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [airtable_base_service_1.AirtableBaseService,
        airtable_utils_service_1.AirtableUtilsService])
], AirtableService);
exports.AirtableService = AirtableService;
//# sourceMappingURL=airtable.service.js.map