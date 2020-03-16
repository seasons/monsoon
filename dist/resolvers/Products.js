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
exports.Products = {
    products: (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        const queryOptions = yield queryOptionsForProducts(args, ctx);
        return yield ctx.db.query.products(Object.assign(Object.assign({}, args), queryOptions), info);
    }),
    productsConnection: (parent, args, ctx, info) => __awaiter(void 0, void 0, void 0, function* () {
        const queryOptions = yield queryOptionsForProducts(args, ctx);
        return yield ctx.db.query.productsConnection(Object.assign(Object.assign({}, args), queryOptions), info);
    }),
};
const queryOptionsForProducts = (args, ctx) => __awaiter(void 0, void 0, void 0, function* () {
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
        return yield productsAlphabetically(ctx, category, orderBy, sizes);
    }
    const filters = yield filtersForCategory(ctx, args);
    return Object.assign({ orderBy,
        where }, filters);
});
const filtersForCategory = (ctx, args) => __awaiter(void 0, void 0, void 0, function* () {
    if (args.category && args.category !== "all") {
        const category = yield ctx.prisma.category({ slug: args.category });
        const children = yield ctx.prisma
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
const productsAlphabetically = (ctx, category, orderBy, sizes) => __awaiter(void 0, void 0, void 0, function* () {
    const brands = yield ctx.db.query.brands({ orderBy }, `
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
//# sourceMappingURL=Products.js.map