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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_utils_service_1 = require("../services/product.utils.service");
const physicalProduct_utils_service_1 = require("../services/physicalProduct.utils.service");
const productVariant_service_1 = require("../services/productVariant.service");
const reservation_utils_service_1 = require("../services/reservation.utils.service");
const client_service_1 = require("../../../prisma/client.service");
const db_service_1 = require("../../../prisma/db.service");
const reservation_service_1 = require("../services/reservation.service");
const airtable_service_1 = require("../../Airtable/services/airtable.service");
const airtable_utils_service_1 = require("../../Airtable/services/airtable.utils.service");
const shipping_service_1 = require("../../Shipping/services/shipping.service");
const email_service_1 = require("../../Email/services/email.service");
const utils_service_1 = require("../../Utils/utils.service");
const email_data_service_1 = require("../../Email/services/email.data.service");
const airtable_base_service_1 = require("../../Airtable/services/airtable.base.service");
const Airtable = __importStar(require("airtable"));
describe("Reservation Service", () => {
    let reservationService;
    let prismaService;
    let airtableService;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        Airtable.configure({
            endpointUrl: "https://api.airtable.com",
            apiKey: process.env.AIRTABLE_KEY,
        });
        const dbService = new db_service_1.DBService();
        prismaService = new client_service_1.PrismaClientService();
        const physProdService = new physicalProduct_utils_service_1.PhysicalProductService(dbService, prismaService);
        const airtableBaseService = new airtable_base_service_1.AirtableBaseService();
        airtableService = new airtable_service_1.AirtableService(airtableBaseService, new airtable_utils_service_1.AirtableUtilsService(airtableBaseService));
        const utilsService = new utils_service_1.UtilsService(prismaService);
        reservationService = new reservation_service_1.ReservationService(dbService, prismaService, new product_utils_service_1.ProductUtilsService(dbService, prismaService), new productVariant_service_1.ProductVariantService(prismaService, physProdService, airtableService), physProdService, airtableService, new shipping_service_1.ShippingService(prismaService, utilsService), new email_service_1.EmailService(prismaService, utilsService, new email_data_service_1.EmailDataProvider()), new reservation_utils_service_1.ReservationUtilsService());
    }));
    describe("reserveItems", () => {
        it("should create a reservation", () => __awaiter(void 0, void 0, void 0, function* () {
            const reservableProductVariants = yield prismaService.client.productVariants({
                where: { reservable_gt: 0 },
            });
            let newCustomer = yield prismaService.client.createCustomer({
                user: {
                    create: {
                        email: `membership+${Date.now()}@seasons.nyc`,
                        firstName: "Sam",
                        lastName: "Johnson",
                        role: "Customer",
                        auth0Id: `auth|${Date.now()}`,
                    },
                },
                status: "Active",
                detail: {
                    create: {
                        shippingAddress: {
                            create: {
                                slug: `sam-johnson-sq${Date.now()}`,
                                name: "Sam Johnson",
                                company: "",
                                address1: "138 Mulberry St",
                                city: "New York",
                                state: "New York",
                                zipCode: "10013",
                                locationType: "Customer",
                            },
                        },
                    },
                },
            });
            newCustomer = yield prismaService.client.customer({ id: newCustomer.id });
            const newUser = yield prismaService.client.user({
                id: yield prismaService.client
                    .customer({ id: newCustomer.id })
                    .user()
                    .id(),
            });
            airtableService.createOrUpdateAirtableUser(newUser, {});
            const productVariantsToReserve = reservableProductVariants
                .slice(0, 3)
                .map(a => a.id);
            const returnData = yield reservationService.reserveItems(productVariantsToReserve, newUser, newCustomer, `{
            id
            sentPackage {
                shippingLabel {
                    image
                    trackingNumber
                    trackingURL
                }
            }
            returnedPackage {
                shippingLabel {
                    image
                    trackingNumber
                    trackingURL
                }
            }
            products {
                productVariant {
                    id
                }
            }
        }`);
            // Id check -- i.e, it went through
            expect(returnData.id).toMatch(/^ck\w{23}/); // string starting with "ck" and of length 25
            // sentPackage shipping label data looks good
            expect(returnData.sentPackage.shippingLabel.trackingNumber).toBeDefined();
            expect(returnData.sentPackage.shippingLabel.image).toBeDefined();
            expect(returnData.sentPackage.shippingLabel.trackingURL).toBeDefined();
            // returnedPackage shipping label data looks good
            expect(returnData.returnedPackage.shippingLabel.trackingNumber).toBeDefined();
            expect(returnData.returnedPackage.shippingLabel.image).toBeDefined();
            expect(returnData.returnedPackage.shippingLabel.trackingURL).toBeDefined();
            // products is what we expect
            expect(returnData.products).toHaveLength(3);
            expect(returnData.products.map(a => a.productVariant.id).sort()).toEqual(productVariantsToReserve.sort());
        }), 30000);
    });
});
//# sourceMappingURL=reservation.spec.js.map