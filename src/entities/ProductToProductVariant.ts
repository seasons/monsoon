import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";

@Index("_ProductToProductVariant_AB_unique", ["a", "b"], { unique: true })
@Index("_ProductToProductVariant_B", ["b"], {})
@Entity("_ProductToProductVariant", { schema: "monsoon$dev" })
export class ProductToProductVariant {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Product,
    product => product.productToProductVariants,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Product;

  @ManyToOne(
    () => ProductVariant,
    productVariant => productVariant.productToProductVariants,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: ProductVariant;
}
