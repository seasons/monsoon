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

@Index("CustomerDetail_pkey", ["id"], { unique: true })
@Entity("CustomerDetail", { schema: "monsoon$dev" })
export class CustomerDetail {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "phoneNumber", nullable: true })
  phoneNumber: string | null;

  @Column("timestamp without time zone", { name: "birthday", nullable: true })
  birthday: Date | null;

  @Column("integer", { name: "height", nullable: true })
  height: number | null;

  @Column("text", { name: "weight", nullable: true })
  weight: string | null;

  @Column("text", { name: "bodyType", nullable: true })
  bodyType: string | null;

  @Column("text", { name: "averageTopSize", nullable: true })
  averageTopSize: string | null;

  @Column("text", { name: "averageWaistSize", nullable: true })
  averageWaistSize: string | null;

  @Column("text", { name: "averagePantLength", nullable: true })
  averagePantLength: string | null;

  @Column("text", { name: "preferredPronouns", nullable: true })
  preferredPronouns: string | null;

  @Column("text", { name: "profession", nullable: true })
  profession: string | null;

  @Column("text", { name: "partyFrequency", nullable: true })
  partyFrequency: string | null;

  @Column("text", { name: "travelFrequency", nullable: true })
  travelFrequency: string | null;

  @Column("text", { name: "shoppingFrequency", nullable: true })
  shoppingFrequency: string | null;

  @Column("text", { name: "averageSpend", nullable: true })
  averageSpend: string | null;

  @Column("text", { name: "style", nullable: true })
  style: string | null;

  @Column("text", { name: "commuteStyle", nullable: true })
  commuteStyle: string | null;

  @Column("text", { name: "phoneOS", nullable: true })
  phoneOs: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @OneToMany(
    () => Customer,
    customer => customer.detail
  )
  customers: Customer[];

  @ManyToOne(
    () => Location,
    location => location.customerDetails,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "shippingAddress", referencedColumnName: "id" }])
  shippingAddress: Location;
}
