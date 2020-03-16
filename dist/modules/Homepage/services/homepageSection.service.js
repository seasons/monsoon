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
const homepage_service_1 = require("./homepage.service");
const client_service_1 = require("../../../prisma/client.service");
// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `{
  __typename
  id
  images
  name
  brand {
    id
    name
  }
  variants {
    id
    size
    reservable
  }
  color {
    name
  }
  retailPrice
}`;
let HomepageSectionService = class HomepageSectionService {
    constructor(db, prisma) {
        this.db = db;
        this.prisma = prisma;
    }
    getResultsForSection(sectionTitle, args, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (sectionTitle) {
                case homepage_service_1.SectionTitle.FeaturedCollection:
                    const collections = yield this.prisma.client
                        .collectionGroup({ slug: "homepage-1" })
                        .collections();
                    return collections;
                case homepage_service_1.SectionTitle.JustAdded:
                    const newProducts = yield this.db.query.products(Object.assign(Object.assign({}, args), { orderBy: "createdAt_DESC", first: 8, where: {
                            status: "Available",
                        } }), ProductFragment);
                    return newProducts;
                case homepage_service_1.SectionTitle.RecentlyViewed:
                    const viewedProducts = yield this.db.query.recentlyViewedProducts({
                        where: { customer: { id: customerId } },
                        orderBy: "updatedAt_DESC",
                        first: 10,
                    }, `{
            updatedAt
            product ${ProductFragment}
          }`);
                    return viewedProducts.map(viewedProduct => viewedProduct.product);
                case homepage_service_1.SectionTitle.Designers:
                    const brands = yield this.db.query.brands(Object.assign(Object.assign({}, args), { where: {
                            slug_in: [
                                "acne-studios",
                                "stone-island",
                                "stussy",
                                "comme-des-garcons",
                                "aime-leon-dore",
                                "noah",
                                "cavempt",
                                "brain-dead",
                                "john-elliot",
                                "amiri",
                                "prada",
                                "craig-green",
                                "dries-van-noten",
                                "cactus-plant-flea-market",
                                "ambush",
                                "all-saints",
                                "heron-preston",
                                "saturdays-nyc",
                                "y-3",
                                "our-legacy",
                            ],
                        } }), `{
            __typename
            id
            name
            since
          }`);
                    return brands;
                default:
                    const rails = yield this.db.query.homepageProductRails({
                        where: {
                            name: sectionTitle,
                        },
                    }, `{
            products ${ProductFragment}
          }`);
                    return Array.prototype.concat.apply([], rails.map(rail => rail.products));
            }
        });
    }
};
HomepageSectionService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService,
        client_service_1.PrismaClientService])
], HomepageSectionService);
exports.HomepageSectionService = HomepageSectionService;
//# sourceMappingURL=homepageSection.service.js.map