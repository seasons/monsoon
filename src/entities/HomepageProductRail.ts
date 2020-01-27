import { Column, Entity, Index, OneToMany } from "typeorm";
import { HomepageProductRailToProduct } from "./HomepageProductRailToProduct";

@Index("HomepageProductRail_pkey", ["id"], { unique: true })
@Index("monsoon$dev.HomepageProductRail.slug._UNIQUE", ["slug"], {
  unique: true
})
@Entity("HomepageProductRail", { schema: "monsoon$dev" })
export class HomepageProductRail {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "name" })
  name: string;

  @OneToMany(
    () => HomepageProductRailToProduct,
    homepageProductRailToProduct => homepageProductRailToProduct.a2
  )
  homepageProductRailToProducts: HomepageProductRailToProduct[];
}
