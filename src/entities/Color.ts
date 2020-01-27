import { Column, Entity, Index, OneToMany } from "typeorm";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";

@Index("monsoon$dev.Color.colorCode._UNIQUE", ["colorCode"], { unique: true })
@Index("Color_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Color.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Color", { schema: "monsoon$dev" })
export class Color {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "colorCode" })
  colorCode: string;

  @Column("text", { name: "hexCode" })
  hexCode: string;

  @OneToMany(
    () => Product,
    product => product.color
  )
  products: Product[];

  @OneToMany(
    () => Product,
    product => product.secondaryColor
  )
  products2: Product[];

  @OneToMany(
    () => ProductVariant,
    productVariant => productVariant.color
  )
  productVariants: ProductVariant[];
}
