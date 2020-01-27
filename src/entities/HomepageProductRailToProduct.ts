import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { HomepageProductRail } from "./HomepageProductRail";
import { Product } from "./Product";

@Index("_HomepageProductRailToProduct_AB_unique", ["a", "b"], { unique: true })
@Index("_HomepageProductRailToProduct_B", ["b"], {})
@Entity("_HomepageProductRailToProduct", { schema: "monsoon$dev" })
export class HomepageProductRailToProduct {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => HomepageProductRail,
    homepageProductRail => homepageProductRail.homepageProductRailToProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: HomepageProductRail;

  @ManyToOne(
    () => Product,
    product => product.homepageProductRailToProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: Product;
}
