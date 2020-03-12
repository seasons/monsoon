"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCorrespondingAirtableProductVariant(allAirtableProducts, allAirtableProductVariants, prismaProductVariant) {
    var correspondingAirtableProduct = allAirtableProducts.find(
    //@ts-ignore
    function (prod) { return prod.fields.Slug === prismaProductVariant.product.slug; });
    var candidateProductVariants = allAirtableProductVariants.filter(function (prodVar) {
        return correspondingAirtableProduct.fields["Product Variants"].includes(prodVar.id);
    });
    var correspondingAirtableProductVariant = candidateProductVariants.find(function (prodVar) { return prodVar.fields.Size === prismaProductVariant.size; });
    return correspondingAirtableProductVariant;
}
exports.getCorrespondingAirtableProductVariant = getCorrespondingAirtableProductVariant;
function getCorrespondingAirtablePhysicalProduct(allAirtablePhysicalProducts, prismaPhysicalProduct) {
    return allAirtablePhysicalProducts.find(function (physProd) { return physProd.fields.SUID.text === prismaPhysicalProduct.seasonsUID; });
}
exports.getCorrespondingAirtablePhysicalProduct = getCorrespondingAirtablePhysicalProduct;
//# sourceMappingURL=utils.js.map