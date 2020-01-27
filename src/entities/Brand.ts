import { Column, Entity, Index, OneToMany } from "typeorm";
import { Product } from "./Product";

@Index("monsoon$dev.Brand.brandCode._UNIQUE", ["brandCode"], { unique: true })
@Index("Brand_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Brand.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Brand", { schema: "monsoon$dev" })
export class Brand {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "brandCode" })
  brandCode: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("boolean", { name: "isPrimaryBrand" })
  isPrimaryBrand: boolean;

  @Column("text", { name: "logo", nullable: true })
  logo: string | null;

  @Column("text", { name: "name" })
  name: string;

  @Column("timestamp without time zone", { name: "since", nullable: true })
  since: Date | null;

  @Column("text", { name: "tier" })
  tier: string;

  @Column("text", { name: "websiteUrl", nullable: true })
  websiteUrl: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @Column("text", { name: "basedIn", nullable: true })
  basedIn: string | null;

  @OneToMany(
    () => Product,
    product => product.brand
  )
  products: Product[];
}
