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
var SectionTitle;
(function (SectionTitle) {
    SectionTitle["FeaturedCollection"] = "Featured collection";
    SectionTitle["JustAdded"] = "Just added";
    SectionTitle["RecentlyViewed"] = "Recently viewed";
    SectionTitle["Designers"] = "Designers";
})(SectionTitle = exports.SectionTitle || (exports.SectionTitle = {}));
let HomepageService = class HomepageService {
    constructor(db) {
        this.db = db;
    }
    getHomepageSections(customer) {
        return __awaiter(this, void 0, void 0, function* () {
            const productRails = yield this.db.query.homepageProductRails({}, `{
        name
      }`);
            const sections = [
                {
                    type: "CollectionGroups",
                    __typename: "HomepageSection",
                    title: SectionTitle.FeaturedCollection,
                },
                {
                    type: "Products",
                    __typename: "HomepageSection",
                    title: SectionTitle.JustAdded,
                },
                {
                    type: "Brands",
                    __typename: "HomepageSection",
                    title: SectionTitle.Designers,
                },
            ];
            if (customer) {
                sections.push({
                    type: "Products",
                    __typename: "HomepageSection",
                    title: SectionTitle.RecentlyViewed,
                });
            }
            productRails.forEach(rail => {
                sections.push({
                    type: "HomepageProductRails",
                    __typename: "HomepageSection",
                    title: rail.name,
                });
            });
            return sections;
        });
    }
};
HomepageService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [db_service_1.DBService])
], HomepageService);
exports.HomepageService = HomepageService;
//# sourceMappingURL=homepage.service.js.map