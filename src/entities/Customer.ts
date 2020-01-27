import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { BagItem } from "./BagItem";
import { BillingInfo } from "./BillingInfo";
import { CustomerDetail } from "./CustomerDetail";
import { User } from "./User";
import { Reservation } from "./Reservation";

@Index("Customer_pkey", ["id"], { unique: true })
@Entity("Customer", { schema: "monsoon$dev" })
export class Customer {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "status", nullable: true })
  status: string | null;

  @Column("text", { name: "plan", nullable: true })
  plan: string | null;

  @OneToMany(
    () => BagItem,
    bagItem => bagItem.customer
  )
  bagItems: BagItem[];

  @ManyToOne(
    () => BillingInfo,
    billingInfo => billingInfo.customers,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "billingInfo", referencedColumnName: "id" }])
  billingInfo: BillingInfo;

  @ManyToOne(
    () => CustomerDetail,
    customerDetail => customerDetail.customers,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "detail", referencedColumnName: "id" }])
  detail: CustomerDetail;

  @ManyToOne(
    () => User,
    user => user.customers,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "user", referencedColumnName: "id" }])
  user: User;

  @OneToMany(
    () => Reservation,
    reservation => reservation.customer
  )
  reservations: Reservation[];
}
