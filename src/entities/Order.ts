import { Column, Entity, Index } from "typeorm";

@Index("Order_pkey", ["id"], { unique: true })
@Entity("Order", { schema: "monsoon$dev" })
export class Order {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;
}
