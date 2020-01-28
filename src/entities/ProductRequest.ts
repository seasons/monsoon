import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { User } from "./User";
import { ProductRequestImages } from "./ProductRequestImages";

@Index("ProductRequest_pkey", ["id"], { unique: true })
@Entity("ProductRequest", { schema: "monsoon$dev" })
export class ProductRequest {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "brand", nullable: true })
  brand: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "name", nullable: true })
  name: string | null;

  @Column("integer", { name: "price", nullable: true })
  price: number | null;

  @Column("text", { name: "priceCurrency", nullable: true })
  priceCurrency: string | null;

  @Column("text", { name: "productID", nullable: true })
  productId: string | null;

  @Column("text", { name: "reason" })
  reason: string;

  @Column("text", { name: "sku", nullable: true })
  sku: string | null;

  @Column("text", { name: "url" })
  url: string;

  @ManyToOne(
    () => User,
    user => user.productRequests,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "user", referencedColumnName: "id" }])
  user: User;

  @OneToMany(
    () => ProductRequestImages,
    productRequestImages => productRequestImages.node
  )
  productRequestImages: ProductRequestImages[];
}
