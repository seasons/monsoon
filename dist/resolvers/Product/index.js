"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isSaved_1 = require("./queries/isSaved");
var checkItemsAvailability_1 = require("./mutations/checkItemsAvailability");
var reserveItems_1 = require("./mutations/reserveItems");
exports.Product = {
    isSaved: isSaved_1.isSaved,
};
exports.ProductMutations = {
    checkItemsAvailability: checkItemsAvailability_1.checkItemsAvailability,
    reserveItems: reserveItems_1.reserveItems,
};
//# sourceMappingURL=index.js.map