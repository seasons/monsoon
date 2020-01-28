import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Parcel } from "./Parcel";
import { PhysicalProduct } from "./PhysicalProduct";

@Index("_PackageToPhysicalProduct_AB_unique", ["a", "b"], { unique: true })
@Index("_PackageToPhysicalProduct_B", ["b"], {})
@Entity("_ParcelToPhysicalProduct", { schema: "monsoon$dev" })
export class ParcelToPhysicalProduct {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Parcel,
    parcel => parcel.parcelToPhysicalProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Parcel;

  @ManyToOne(
    () => PhysicalProduct,
    physicalProduct => physicalProduct.parcelToPhysicalProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: PhysicalProduct;
}
