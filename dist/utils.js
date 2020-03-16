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
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
var ProductSize;
(function (ProductSize) {
    ProductSize["XS"] = "XS";
    ProductSize["S"] = "S";
    ProductSize["M"] = "M";
    ProductSize["L"] = "L";
    ProductSize["XL"] = "XL";
    ProductSize["XXL"] = "XXL";
})(ProductSize = exports.ProductSize || (exports.ProductSize = {}));
exports.seasonsIDFromProductVariant = (product, productVariant) => { };
exports.sizeToSizeCode = (size) => {
    switch (size) {
        case ProductSize.XS:
            return "XS";
        case ProductSize.S:
            return "SS";
        case ProductSize.M:
            return "MM";
        case ProductSize.L:
            return "LL";
        case ProductSize.XL:
            return "XL";
        case ProductSize.XXL:
            return "XXL";
    }
    return "";
};
function getUserIDHash(userID) {
    return crypto_1.default
        .createHash("sha256")
        .update(`${userID}${process.env.HASH_SECRET}`)
        .digest("hex");
}
exports.getUserIDHash = getUserIDHash;
function getUserFromUserIDHash(prisma, userIDHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const allUsers = yield prisma.users();
        return new Promise((resolve, reject) => {
            let targetUser;
            for (let user of allUsers) {
                let thisUsersIDHash = getUserIDHash(user.id);
                if (thisUsersIDHash === userIDHash) {
                    targetUser = user;
                }
            }
            if (targetUser === undefined) {
                resolve(null);
            }
            else {
                resolve(targetUser);
            }
        });
    });
}
exports.getUserFromUserIDHash = getUserFromUserIDHash;
function getCustomerFromUserID(prisma, userID) {
    return __awaiter(this, void 0, void 0, function* () {
        let customer;
        try {
            const customerArray = yield prisma.customers({
                where: { user: { id: userID } },
            });
            customer = customerArray[0];
        }
        catch (err) {
            throw new Error(err);
        }
        return customer;
    });
}
exports.getCustomerFromUserID = getCustomerFromUserID;
function getCustomerFromEmail(prisma, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let customer;
        try {
            const customerArray = yield prisma.customers({
                where: { user: { email } },
            });
            customer = customerArray[0];
        }
        catch (err) {
            throw new Error(err);
        }
        return customer;
    });
}
exports.getCustomerFromEmail = getCustomerFromEmail;
// given the corresponding user object, set the customer status on a customer
function setCustomerPrismaStatus(prisma, user, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const customer = yield getCustomerFromUserID(prisma, user.id);
        yield prisma.updateCustomer({
            //@ts-ignore
            data: { status: status },
            where: { id: customer.id },
        });
    });
}
exports.setCustomerPrismaStatus = setCustomerPrismaStatus;
function getPrismaLocationFromSlug(prisma, slug) {
    return __awaiter(this, void 0, void 0, function* () {
        const prismaLocation = yield prisma.location({
            slug,
        });
        if (!prismaLocation) {
            throw Error(`no location with slug ${slug} found in DB`);
        }
        return prismaLocation;
    });
}
exports.getPrismaLocationFromSlug = getPrismaLocationFromSlug;
function calcShipmentWeightFromProductVariantIDs(prisma, itemIDs) {
    return __awaiter(this, void 0, void 0, function* () {
        const shippingBagWeight = 1;
        const productVariants = yield prisma.productVariants({
            where: { id_in: itemIDs },
        });
        return productVariants.reduce(function addProductWeight(acc, curProdVar) {
            return acc + curProdVar.weight;
        }, shippingBagWeight);
    });
}
exports.calcShipmentWeightFromProductVariantIDs = calcShipmentWeightFromProductVariantIDs;
function calcTotalRetailPriceFromProductVariantIDs(prisma, itemIDs) {
    return __awaiter(this, void 0, void 0, function* () {
        const products = yield prisma.products({
            where: {
                variants_some: {
                    id_in: itemIDs,
                },
            },
        });
        return products.reduce((acc, prod) => acc + prod.retailPrice, 0);
    });
}
exports.calcTotalRetailPriceFromProductVariantIDs = calcTotalRetailPriceFromProductVariantIDs;
function airtableToPrismaInventoryStatus(airtableStatus) {
    let prismaStatus;
    if (airtableStatus === "Reservable") {
        prismaStatus = "Reservable";
    }
    if (airtableStatus === "Non Reservable") {
        prismaStatus = "NonReservable";
    }
    if (airtableStatus === "Reserved") {
        prismaStatus = "Reserved";
    }
    return prismaStatus;
}
exports.airtableToPrismaInventoryStatus = airtableToPrismaInventoryStatus;
exports.deleteFieldsFromObject = (obj, fieldsToDelete) => {
    const objCopy = Object.assign({}, obj);
    fieldsToDelete.forEach(a => delete objCopy[a]);
    return objCopy;
};
exports.Identity = a => a;
exports.allVariablesDefined = (arr) => {
    return arr.reduce((acc, curval) => {
        return acc && curval !== undefined;
    }, true);
};
exports.readJSONObjectFromFile = (filepath) => {
    const rawData = fs_1.default.readFileSync(filepath);
    return JSON.parse(rawData);
};
//# sourceMappingURL=utils.js.map