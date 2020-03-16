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
const utils_1 = require("../auth/utils");
// FIXME: This is being used because currently info is lacking the __typename, add __typename to info
const ProductFragment = `{
  __typename
  id
  slug
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
exports.HomepageResult = {
    __resolveType(obj, _context, _info) {
        if (obj.brand || obj.colorway) {
            return "Product";
        }
        else if (obj.since) {
            return "Brand";
        }
        else if (obj.subTitle) {
            return "Collection";
        }
        else if (obj.name) {
            return "HomepageProductRail";
        }
        else {
            return null;
        }
    },
};
exports.Homepage = (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
    let customer;
    try {
        customer = yield utils_1.getCustomerFromContext(ctx);
    }
    catch (error) {
        console.log("Customer is not logged in", error);
    }
    const productRails = yield ctx.db.query.homepageProductRails({}, `{
      __typename
      id
      name
      products {
        id
      }
    }`);
    const homepageSections = {
        sections: [
            {
                type: "CollectionGroups",
                __typename: "HomepageSection",
                title: "Featured collection",
                results: (args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
                    const collections = yield ctx.prisma
                        .collectionGroup({ slug: "homepage-1" })
                        .collections();
                    return collections;
                }),
            },
            {
                type: "Products",
                __typename: "HomepageSection",
                title: "Just added",
                results: (args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
                    const newProducts = yield ctx.db.query.products(Object.assign(Object.assign({}, args), { orderBy: "createdAt_DESC", first: 8, where: {
                            status: "Available",
                        } }), ProductFragment);
                    return newProducts;
                }),
            },
            {
                type: "Brands",
                __typename: "HomepageSection",
                title: "Designers",
                results: (args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
                    const brands = yield ctx.db.query.brands(Object.assign(Object.assign({}, args), { where: {
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
                }),
            },
        ],
    };
    if (customer) {
        homepageSections.sections.push({
            type: "Products",
            __typename: "HomepageSection",
            title: "Recently viewed",
            results: (args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
                //
                const viewedProducts = yield ctx.db.query.recentlyViewedProducts({
                    where: { customer: { id: customer.id } },
                    orderBy: "updatedAt_DESC",
                    limit: 10,
                }, `{ 
            updatedAt
            product ${ProductFragment} 
          }`);
                return viewedProducts.map(viewedProduct => viewedProduct.product);
            }),
        });
    }
    productRails.forEach(rail => {
        homepageSections.sections.push({
            type: "HomepageProductRails",
            __typename: "HomepageSection",
            title: rail.name,
            results: () => __awaiter(void 0, void 0, void 0, function* () {
                return yield ctx.db.query.products({
                    where: {
                        id_in: rail.products.map(product => {
                            return product.id;
                        }),
                    },
                }, ProductFragment);
            }),
        });
    });
    return homepageSections;
});
//# sourceMappingURL=Homepage.js.map