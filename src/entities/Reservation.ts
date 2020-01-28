import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Customer } from "./Customer";
import { Location } from "./Location";
import { Parcel } from "./Parcel";
import { User } from "./User";
import { PhysicalProductToReservation } from "./PhysicalProductToReservation";

@Index("Reservation_pkey", ["id"], { unique: true })
@Index(
  "monsoon$dev.Reservation.reservationNumber._UNIQUE",
  ["reservationNumber"],
  { unique: true }
)
@Entity("Reservation", { schema: "monsoon$dev" })
export class Reservation {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("boolean", { name: "shipped" })
  shipped: boolean;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @Column("integer", { name: "reservationNumber" })
  reservationNumber: number;

  @Column("text", { name: "status" })
  status: string;

  @Column("timestamp without time zone", { name: "shippedAt", nullable: true })
  shippedAt: Date | null;

  @Column("timestamp without time zone", { name: "receivedAt", nullable: true })
  receivedAt: Date | null;

  @ManyToOne(
    () => Customer,
    customer => customer.reservations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "customer", referencedColumnName: "id" }])
  customer: Customer;

  @ManyToOne(
    () => Location,
    location => location.reservations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "location", referencedColumnName: "id" }])
  location: Location;

  @ManyToOne(
    () => Parcel,
    parcel => parcel.reservations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "returnedParcel", referencedColumnName: "id" }])
  returnedParcel: Parcel;

  @ManyToOne(
    () => Parcel,
    parcel => parcel.reservations2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "sentParcel", referencedColumnName: "id" }])
  sentParcel: Parcel;

  @ManyToOne(
    () => User,
    user => user.reservations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "user", referencedColumnName: "id" }])
  user: User;

  @OneToMany(
    () => PhysicalProductToReservation,
    physicalProductToReservation => physicalProductToReservation.b2
  )
  physicalProductToReservations: PhysicalProductToReservation[];
}
