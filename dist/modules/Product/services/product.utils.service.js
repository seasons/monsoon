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
const db_service_1 = require("../../../prisma/db.service");
const client_service_1 = require("../../../prisma/client.service");
let ProductUtilsService = class ProductUtilsService {
    constructor(db, prisma) {
        this.db = db;
        this.prisma = prisma;
    }
    queryOptionsForProducts(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = args.category || "all";
            const orderBy = args.orderBy || "createdAt_DESC";
            const sizes = args.sizes || [];
            // Add filtering by sizes in query
            const where = args.where || {};
            if (sizes && sizes.length > 0) {
                where.variants_some = { size_in: sizes };
            }
            // If client wants to sort by name, we will assume that they
            // want to sort by brand name as well
            if (orderBy.includes("name_")) {
                return yield this.productsAlphabetically(category, orderBy, sizes);
            }
            const filters = yield this.filtersForCategory(args);
            return Object.assign({ orderBy,
                where }, filters);
        });
    }
    filtersForCategory(args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (args.category && args.category !== "all") {
                const category = yield this.prisma.client.category({
                    slug: args.category,
                });
                const children = yield this.prisma.client
                    .category({ slug: args.category })
                    .children();
                return children.length > 0
                    ? {
                        where: Object.assign(Object.assign({}, args.where), { OR: children.map(({ slug }) => ({ category: { slug } })) }),
                    }
                    : {
                        where: Object.assign(Object.assign({}, args.where), { category: { slug: category.slug } }),
                    };
            }
            return {};
        });
    }
    getReservedBagItems(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const reservedBagItems = yield this.db.query.bagItems({
                where: {
                    customer: {
                        id: customer.id,
                    },
                    status: "Reserved",
                },
            }, `{
          id
          status
          position
          saved
          productVariant {
            id
          }
      }`);
            return reservedBagItems;
        });
    }
    productsAlphabetically(category, orderBy, sizes) {
        return __awaiter(this, void 0, void 0, function* () {
            const brands = yield this.db.query.brands({ orderBy }, `
      {
        name
        products(
          orderBy: name_ASC,
          where: {
            ${category !== "all" ? `category: { slug: "${category}" },` : ""}
            status: Available,
            variants_some: { size_in: [${sizes}] }
          }
        ) {
          id
          name
          description
          images
          modelSize
          modelHeight
          externalURL
          tags
          retailPrice
          status
          createdAt
          updatedAt
          brand {
            id
            name
          }
          variants {
            id
            size
            total
            reservable
            nonReservable
            reserved
          }
        }
      }
      `);
            const products = brands.map(b => b.products).flat();
            return products;
        });
    }
};
ProductUtilsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService,
        client_service_1.PrismaClientService])
], ProductUtilsService);
exports.ProductUtilsService = ProductUtilsService;
//# sourceMappingURL=product.utils.service.js.map