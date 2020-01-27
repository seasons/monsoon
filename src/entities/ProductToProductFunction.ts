import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";
import { ProductFunction } from "./ProductFunction";

@Index("_ProductToProductFunction_AB_unique", ["a", "b"], { unique: true })
@Index("_ProductToProductFunction_B", ["b"], {})
@Entity("_ProductToProductFunction", { schema: "monsoon$dev" })
export class ProductToProductFunction {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Product,
    product => product.productToProductFunctions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Product;

  @ManyToOne(
    () => ProductFunction,
    productFunction => productFunction.productToProductFunctions,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: ProductFunction;
}
