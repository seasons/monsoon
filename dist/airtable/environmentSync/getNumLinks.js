"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var syncLocations_1 = require("./syncLocations");
var syncModels_1 = require("./syncModels");
var syncColors_1 = require("./syncColors");
var syncBrands_1 = require("./syncBrands");
var _1 = require(".");
exports.getNumLinks = function (modelName) {
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