import { Column, Entity, Index, OneToMany } from "typeorm";
import { Customer } from "./Customer";

@Index("BillingInfo_pkey", ["id"], { unique: true })
@Entity("BillingInfo", { schema: "monsoon$dev" })
export class BillingInfo {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "brand" })
  brand: string;

  @Column("text", { name: "name", nullable: true })
  name: string | null;

  @Column("text", { name: "last_digits" })
  lastDigits: string;

  @Column("integer", { name: "expiration_month" })
  expirationMonth: number;

  @Column("integer", { name: "expiration_year" })
  expirationYear: number;

  @Column("text", { name: "street1", nullable: true })
  street1: string | null;

  @Column("text", { name: "street2", nullable: true })
  street2: string | null;

  @Column("text", { name: "city", nullable: true })
  city: string | null;

  @Column("text", { name: "state", nullable: true })
  state: string | null;

  @Column("text", { name: "country", nullable: true })
  country: string | null;

  @Column("text", { name: "postal_code", nullable: true })
  postalCode: string | null;

  @OneToMany(
    () => Customer,
    customer => customer.billingInfo
  )
  customers: Customer[];
}
