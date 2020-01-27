import { Column, Entity, Index, OneToMany } from "typeorm";
import { ProductRequestImages } from "./ProductRequestImages";

@Index("ProductRequest_pkey", ["id"], { unique: true })
@Index("monsoon$dev.ProductRequest.sku._UNIQUE", ["sku"], { unique: true })
@Entity("ProductRequest", { schema: "monsoon$dev" })
export class ProductRequest {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "sku", nullable: true })
  sku: string | null;

  @Column("text", { name: "brand" })
  brand: string;

  @Column("text", { name: "description" })
  description: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("integer", { name: "price" })
  price: number;

  @Column("text", { name: "priceCurrency" })
  priceCurrency: string;

  @Column("text", { name: "productID" })
  productId: string;

  @Column("text", { name: "url" })
  url: string;

  @OneToMany(
    () => ProductRequestImages,
    productRequestImages => productRequestImages.node
  )
  productRequestImages: ProductRequestImages[];
}
