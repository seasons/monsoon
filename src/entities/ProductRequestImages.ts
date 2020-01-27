import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ProductRequest } from "./ProductRequest";

@Index("ProductRequest_images_pkey", ["nodeId", "position"], { unique: true })
@Entity("ProductRequest_images", { schema: "monsoon$dev" })
export class ProductRequestImages {
  @Column("character varying", { primary: true, name: "nodeId", length: 25 })
  nodeId: string;

  @Column("integer", { primary: true, name: "position" })
  position: number;

  @Column("text", { name: "value" })
  value: string;

  @ManyToOne(
    () => ProductRequest,
    productRequest => productRequest.productRequestImages
  )
  @JoinColumn([{ name: "nodeId", referencedColumnName: "id" }])
  node: ProductRequest;
}
