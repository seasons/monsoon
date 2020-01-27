import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Location } from "./Location";
import { Label } from "./Label";
import { Reservation } from "./Reservation";
import { PackageToPhysicalProduct } from "./PackageToPhysicalProduct";

@Index("Package_pkey", ["id"], { unique: true })
@Entity("Package", { schema: "monsoon$dev" })
export class Package {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("numeric", {
    name: "weight",
    nullable: true,
    precision: 65,
    scale: 30
  })
  weight: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @ManyToOne(
    () => Location,
    location => location.packages,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "fromAddress", referencedColumnName: "id" }])
  fromAddress: Location;

  @ManyToOne(
    () => Label,
    label => label.packages,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "shippingLabel", referencedColumnName: "id" }])
  shippingLabel: Label;

  @ManyToOne(
    () => Location,
    location => location.packages2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "toAddress", referencedColumnName: "id" }])
  toAddress: Location;

  @OneToMany(
    () => Reservation,
    reservation => reservation.returnedPackage
  )
  reservations: Reservation[];

  @OneToMany(
    () => Reservation,
    reservation => reservation.sentPackage
  )
  reservations2: Reservation[];

  @OneToMany(
    () => PackageToPhysicalProduct,
    packageToPhysicalProduct => packageToPhysicalProduct.a2
  )
  packageToPhysicalProducts: PackageToPhysicalProduct[];
}
