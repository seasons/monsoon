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
import { Package } from "./Package";
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

  @Column("integer", { name: "reservationNumber" })
  reservationNumber: number;

  @Column("boolean", { name: "shipped" })
  shipped: boolean;

  @Column("text", { name: "status" })
  status: string;

  @Column("timestamp without time zone", { name: "shippedAt", nullable: true })
  shippedAt: Date | null;

  @Column("timestamp without time zone", { name: "receivedAt", nullable: true })
  receivedAt: Date | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

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
    () => Package,
    package => package.reservations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "returnedPackage", referencedColumnName: "id" }])
  returnedPackage: Package;

  @ManyToOne(
    () => Package,
    package => package.reservations2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "sentPackage", referencedColumnName: "id" }])
  sentPackage: Package;

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
