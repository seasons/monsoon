import { Column, Entity, Index, OneToMany } from "typeorm";
import { Customer } from "./Customer";
import { Location } from "./Location";
import { ProductRequest } from "./ProductRequest";
import { Reservation } from "./Reservation";

@Index("monsoon$dev.User.auth0Id._UNIQUE", ["auth0Id"], { unique: true })
@Index("monsoon$dev.User.email._UNIQUE", ["email"], { unique: true })
@Index("User_pkey", ["id"], { unique: true })
@Entity("User", { schema: "monsoon$dev" })
export class User {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "auth0Id" })
  auth0Id: string;

  @Column("text", { name: "email" })
  email: string;

  @Column("text", { name: "firstName" })
  firstName: string;

  @Column("text", { name: "lastName" })
  lastName: string;

  @Column("text", { name: "role" })
  role: string;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @OneToMany(
    () => Customer,
    customer => customer.user
  )
  customers: Customer[];

  @OneToMany(
    () => Location,
    location => location.user
  )
  locations: Location[];

  @OneToMany(
    () => ProductRequest,
    productRequest => productRequest.user
  )
  productRequests: ProductRequest[];

  @OneToMany(
    () => Reservation,
    reservation => reservation.user
  )
  reservations: Reservation[];
}
