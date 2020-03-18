"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./config");
function updatePhysicalProduct(airtableID, fields) {
    config_1.base("Physical Products").update(airtableID, fields);
}
exports.updatePhysicalProduct = updatePhysicalProduct;
//# sourceMappingURL=updatePhysicalProduct.js.map