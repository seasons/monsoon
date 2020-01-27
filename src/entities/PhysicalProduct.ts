import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Location } from "./Location";
import { PackageToPhysicalProduct } from "./PackageToPhysicalProduct";
import { PhysicalProductToProductVariant } from "./PhysicalProductToProductVariant";
import { PhysicalProductToReservation } from "./PhysicalProductToReservation";

@Index("PhysicalProduct_pkey", ["id"], { unique: true })
@Index("monsoon$dev.PhysicalProduct.seasonsUID._UNIQUE", ["seasonsUid"], {
  unique: true
})
@Entity("PhysicalProduct", { schema: "monsoon$dev" })
export class PhysicalProduct {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "seasonsUID" })
  seasonsUid: string;

  @Column("text", { name: "inventoryStatus" })
  inventoryStatus: string;

  @Column("text", { name: "productStatus" })
  productStatus: string;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @ManyToOne(
    () => Location,
    location => location.physicalProducts,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "location", referencedColumnName: "id" }])
  location: Location;

  @OneToMany(
    () => PackageToPhysicalProduct,
    packageToPhysicalProduct => packageToPhysicalProduct.b2
  )
  packageToPhysicalProducts: PackageToPhysicalProduct[];

  @OneToMany(
    () => PhysicalProductToProductVariant,
    physicalProductToProductVariant => physicalProductToProductVariant.a2
  )
  physicalProductToProductVariants: PhysicalProductToProductVariant[];

  @OneToMany(
    () => PhysicalProductToReservation,
    physicalProductToReservation => physicalProductToReservation.a2
  )
  physicalProductToReservations: PhysicalProductToReservation[];
}
