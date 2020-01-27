import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Index("Product_outerMaterials_pkey", ["nodeId", "position"], { unique: true })
@Entity("Product_outerMaterials", { schema: "monsoon$dev" })
export class ProductOuterMaterials {
  @Column("character varying", { primary: true, name: "nodeId", length: 25 })
  nodeId: string;

  @Column("integer", { primary: true, name: "position" })
  position: number;

  @Column("text", { name: "value" })
  value: string;

  @ManyToOne(
    () => Product,
    product => product.productOuterMaterials
  )
  @JoinColumn([{ name: "nodeId", referencedColumnName: "id" }])
  node: Product;
}
