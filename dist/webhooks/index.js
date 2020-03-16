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
const express_1 = __importDefault(require("express"));
const config_1 = require("../airtable/config");
const prisma_1 = require("../prisma");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const CHARGEBEE_CUSTOMER_CHANGED = "customer_changed";
const app = express_1.default();
exports.app = app;
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
app.post("/airtable_events", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    for (let row of data) {
        const { tableId, recordId, updates } = row;
        const record = yield config_1.base(tableId).find(recordId);
        if (!record) {
            return res.sendStatus(400);
        }
        // Check if record is Physical Product
        if (!!record.fields.SUID) {
            const { text: SUID } = record.fields.SUID;
            const physicalProduct = yield prisma_1.prisma.physicalProduct({
                seasonsUID: SUID,
            });
            const productVariant = yield prisma_1.prisma
                .physicalProduct({
                seasonsUID: SUID,
            })
                .productVariant();
            const currentInventoryStatus = physicalProduct.inventoryStatus;
            const updatedInventoryStatus = updates.find(a => a.field);
            if (currentInventoryStatus === "NonReservable" &&
                updatedInventoryStatus === "Reservable") {
                yield incrementReservableCount(productVariant, physicalProduct);
            }
            else if (currentInventoryStatus === "Reservable" &&
                updatedInventoryStatus === "Reserved") {
            }
        }
    }
    res.sendStatus(200);
}));
app.post('/chargebee_events', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const data = req.body;
    const { event_type: eventType } = data;
    switch (eventType) {
        case CHARGEBEE_CUSTOMER_CHANGED:
            const { content } = data;
            const { id: userID } = content.customer;
            const { card_type: brand, expiry_month, expiry_year, first_name, last_name, last4 } = content.card;
            const user = yield prisma_1.prisma.user({ id: userID });
            const customers = yield prisma_1.prisma.customers({
                where: { user: { id: user.id } },
            });
            if ((_a = customers) === null || _a === void 0 ? void 0 : _a.length) {
                const customer = customers[0];
                const billingInfoId = yield prisma_1.prisma.customer({ id: customer.id })
                    .billingInfo()
                    .id();
                if (billingInfoId) {
                    yield prisma_1.prisma.updateBillingInfo({
                        data: {
                            brand,
                            expiration_month: expiry_month,
                            expiration_year: expiry_year,
                            last_digits: last4,
                            name: `${first_name} ${last_name}`,
                        },
                        where: { id: billingInfoId }
                    });
                }
            }
            break;
        default:
            break;
    }
    res.sendStatus(200);
}));
const incrementReservableCount = (productVariant, physicalProduct) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.updateProductVariant({
        where: {
            sku: productVariant.sku,
        },
        data: {
            nonReservable: productVariant.nonReservable <= 0
                ? 0
                : productVariant.nonReservable - 1,
            reservable: productVariant.reservable + 1,
        },
    });
    console.log(physicalProduct, productVariant);
});
//# sourceMappingURL=index.js.map