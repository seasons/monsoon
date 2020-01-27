import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product } from "./Product";

@Index("Product_availableSizes_pkey", ["nodeId", "position"], { unique: true })
@Entity("Product_availableSizes", { schema: "monsoon$dev" })
export class ProductAvailableSizes {
  @Column("character varying", { primary: true, name: "nodeId", length: 25 })
  nodeId: string;

  @Column("integer", { primary: true, name: "position" })
  position: number;

  @Column("text", { name: "value" })
  value: string;

  @ManyToOne(
    () => Product,
    product => product.productAvailableSizes
  )
  @JoinColumn([{ name: "nodeId", referencedColumnName: "id" }])
  node: Product;
}
