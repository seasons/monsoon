import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { BagItem } from "./BagItem";
import { Color } from "./Color";
import { PhysicalProductToProductVariant } from "./PhysicalProductToProductVariant";
import { ProductToProductVariant } from "./ProductToProductVariant";

@Index("ProductVariant_pkey", ["id"], { unique: true })
@Index("monsoon$dev.ProductVariant.sku._UNIQUE", ["sku"], { unique: true })
@Entity("ProductVariant", { schema: "monsoon$dev" })
export class ProductVariant {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "sku", nullable: true })
  sku: string | null;

  @Column("text", { name: "size" })
  size: string;

  @Column("numeric", {
    name: "weight",
    nullable: true,
    precision: 65,
    scale: 30
  })
  weight: string | null;

  @Column("numeric", {
    name: "height",
    nullable: true,
    precision: 65,
    scale: 30
  })
  height: string | null;

  @Column("numeric", {
    name: "retailPrice",
    nullable: true,
    precision: 65,
    scale: 30
  })
  retailPrice: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @Column("text", { name: "productID" })
  productId: string;

  @Column("integer", { name: "total" })
  total: number;

  @Column("integer", { name: "reservable" })
  reservable: number;

  @Column("integer", { name: "reserved" })
  reserved: number;

  @Column("integer", { name: "nonReservable" })
  nonReservable: number;

  @OneToMany(
    () => BagItem,
    bagItem => bagItem.productVariant
  )
  bagItems: BagItem[];

  @ManyToOne(
    () => Color,
    color => color.productVariants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "color", referencedColumnName: "id" }])
  color: Color;

  @OneToMany(
    () => PhysicalProductToProductVariant,
    physicalProductToProductVariant => physicalProductToProductVariant.b2
  )
  physicalProductToProductVariants: PhysicalProductToProductVariant[];

  @OneToMany(
    () => ProductToProductVariant,
    productToProductVariant => productToProductVariant.b2
  )
  productToProductVariants: ProductToProductVariant[];
}
