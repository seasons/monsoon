"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncLocations_1 = require("./syncLocations");
const syncModels_1 = require("./syncModels");
const syncColors_1 = require("./syncColors");
const syncBrands_1 = require("./syncBrands");
const _1 = require(".");
exports.getNumLinks = (modelName) => {
    switch (modelName) {
        case "Colors":
            return syncColors_1.getNumLinksColors();
        case "Models":
            return syncModels_1.getNumLinksModels();
        case "Locations":
            return syncLocations_1.getNumLinksLocations();
        case "Brands":
            return syncBrands_1.getNumLinksBrands();
        case "Products":
            return _1.getNumLinksProducts();
        case "Categories":
            return _1.getNumLinksCategories();
        case "Homepage Product Rails":
            return _1.getNumLinksHomepageProductRails();
        case "Product Variants":
            return _1.getNumLinksProductVariants();
        case "Physical Products":
            return _1.getNumLinksPhysicalProducts();
        case "Users":
            return _1.getNumLinksUsers();
        case "Reservations":
            return _1.getNumLinksReservations();
    }
    throw new Error("invalid modelName");
};
//# sourceMappingURL=getNumLinks.js.map