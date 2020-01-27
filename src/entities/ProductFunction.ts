import { Column, Entity, Index, OneToMany } from "typeorm";
import { ProductToProductFunction } from "./ProductToProductFunction";

@Index("ProductFunction_pkey", ["id"], { unique: true })
@Index("monsoon$dev.ProductFunction.name._UNIQUE", ["name"], { unique: true })
@Entity("ProductFunction", { schema: "monsoon$dev" })
export class ProductFunction {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "name", nullable: true })
  name: string | null;

  @OneToMany(
    () => ProductToProductFunction,
    productToProductFunction => productToProductFunction.b2
  )
  productToProductFunctions: ProductToProductFunction[];
}
