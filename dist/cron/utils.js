"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCorrespondingAirtableProductVariant(allAirtableProducts, allAirtableProductVariants, prismaProductVariant) {
    const correspondingAirtableProduct = allAirtableProducts.find(
    //@ts-ignore
    prod => prod.fields.Slug === prismaProductVariant.product.slug);
    const candidateProductVariants = allAirtableProductVariants.filter(prodVar => correspondingAirtableProduct.fields["Product Variants"].includes(prodVar.id));
    const correspondingAirtableProductVariant = candidateProductVariants.find(prodVar => prodVar.fields.Size === prismaProductVariant.size);
    return correspondingAirtableProductVariant;
}
exports.getCorrespondingAirtableProductVariant = getCorrespondingAirtableProductVariant;
function getCorrespondingAirtablePhysicalProduct(allAirtablePhysicalProducts, prismaPhysicalProduct) {
    return allAirtablePhysicalProducts.find(physProd => physProd.fields.SUID.text === prismaPhysicalProduct.seasonsUID);
}
exports.getCorrespondingAirtablePhysicalProduct = getCorrespondingAirtablePhysicalProduct;
//# sourceMappingURL=utils.js.map