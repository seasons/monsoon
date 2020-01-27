import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Package } from "./Package";
import { PhysicalProduct } from "./PhysicalProduct";

@Index("_PackageToPhysicalProduct_AB_unique", ["a", "b"], { unique: true })
@Index("_PackageToPhysicalProduct_B", ["b"], {})
@Entity("_PackageToPhysicalProduct", { schema: "monsoon$dev" })
export class PackageToPhysicalProduct {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Package,
    package => package.packageToPhysicalProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Package;

  @ManyToOne(
    () => PhysicalProduct,
    physicalProduct => physicalProduct.packageToPhysicalProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: PhysicalProduct;
}
