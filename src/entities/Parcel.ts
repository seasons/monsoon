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
import { ParcelToPhysicalProduct } from "./ParcelToPhysicalProduct";

@Index("Package_pkey", ["id"], { unique: true })
@Entity("Parcel", { schema: "monsoon$dev" })
export class Parcel {
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
    location => location.parcels,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "fromAddress", referencedColumnName: "id" }])
  fromAddress: Location;

  @ManyToOne(
    () => Label,
    label => label.parcels,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "shippingLabel", referencedColumnName: "id" }])
  shippingLabel: Label;

  @ManyToOne(
    () => Location,
    location => location.parcels2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "toAddress", referencedColumnName: "id" }])
  toAddress: Location;

  @OneToMany(
    () => Reservation,
    reservation => reservation.returnedParcel
  )
  reservations: Reservation[];

  @OneToMany(
    () => Reservation,
    reservation => reservation.sentParcel
  )
  reservations2: Reservation[];

  @OneToMany(
    () => ParcelToPhysicalProduct,
    parcelToPhysicalProduct => parcelToPhysicalProduct.a2
  )
  parcelToPhysicalProducts: ParcelToPhysicalProduct[];
}
