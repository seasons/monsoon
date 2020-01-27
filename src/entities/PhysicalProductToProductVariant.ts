import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PhysicalProduct } from "./PhysicalProduct";
import { ProductVariant } from "./ProductVariant";

@Index("_PhysicalProductToProductVariant_AB_unique", ["a", "b"], {
  unique: true
})
@Index("_PhysicalProductToProductVariant_B", ["b"], {})
@Entity("_PhysicalProductToProductVariant", { schema: "monsoon$dev" })
export class PhysicalProductToProductVariant {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => PhysicalProduct,
    physicalProduct => physicalProduct.physicalProductToProductVariants,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: PhysicalProduct;

  @ManyToOne(
    () => ProductVariant,
    productVariant => productVariant.physicalProductToProductVariants,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: ProductVariant;
}
