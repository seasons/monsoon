import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { CustomerDetail } from "./CustomerDetail";
import { User } from "./User";
import { Package } from "./Package";
import { PhysicalProduct } from "./PhysicalProduct";
import { Reservation } from "./Reservation";

@Index("Location_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Location.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Location", { schema: "monsoon$dev" })
export class Location {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "company", nullable: true })
  company: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "address1" })
  address1: string;

  @Column("text", { name: "address2", nullable: true })
  address2: string | null;

  @Column("text", { name: "city" })
  city: string;

  @Column("text", { name: "state" })
  state: string;

  @Column("text", { name: "zipCode" })
  zipCode: string;

  @Column("text", { name: "locationType", nullable: true })
  locationType: string | null;

  @Column("numeric", { name: "lat", nullable: true, precision: 65, scale: 30 })
  lat: string | null;

  @Column("numeric", { name: "lng", nullable: true, precision: 65, scale: 30 })
  lng: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @OneToMany(
    () => CustomerDetail,
    customerDetail => customerDetail.shippingAddress
  )
  customerDetails: CustomerDetail[];

  @ManyToOne(
    () => User,
    user => user.locations,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "user", referencedColumnName: "id" }])
  user: User;

  @OneToMany(
    () => Package,
    package => package.fromAddress
  )
  packages: Package[];

  @OneToMany(
    () => Package,
    package => package.toAddress
  )
  packages2: Package[];

  @OneToMany(
    () => PhysicalProduct,
    physicalProduct => physicalProduct.location
  )
  physicalProducts: PhysicalProduct[];

  @OneToMany(
    () => Reservation,
    reservation => reservation.location
  )
  reservations: Reservation[];
}
