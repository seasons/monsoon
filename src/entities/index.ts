import { Product } from "./Product"
import { ProductVariant } from "./ProductVariant"
import { Brand } from "./Brand"
import { Category } from "./Category"
import { Color } from "./Color"
import { ProductAvailableSizes } from "./ProductAvailableSizes"
import { ProductInnerMaterials } from "./ProductInnerMaterials"
import { ProductOuterMaterials } from "./ProductOuterMaterials"
import { CollectionToProduct } from "./CollectionToProduct"
import { HomepageProductRailToProduct } from "./HomepageProductRailToProduct"
import { ProductToProductFunction } from "./ProductToProductFunction"
import { ProductToProductVariant } from "./ProductToProductVariant"

export const entities = [
  Brand,
  Category,
  Color,
  Product,
  ProductVariant,
  ProductAvailableSizes,
  ProductInnerMaterials,
  ProductOuterMaterials,
  CollectionToProduct,
  HomepageProductRailToProduct,
  ProductToProductFunction,
  ProductToProductVariant,
]
