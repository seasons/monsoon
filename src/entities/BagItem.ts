import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Customer } from "./Customer";
import { ProductVariant } from "./ProductVariant";

@Index("BagItem_pkey", ["id"], { unique: true })
@Entity("BagItem", { schema: "monsoon$dev" })
export class BagItem {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("integer", { name: "position", nullable: true })
  position: number | null;

  @Column("boolean", { name: "saved", nullable: true })
  saved: boolean | null;

  @Column("text", { name: "status" })
  status: string;

  @ManyToOne(
    () => Customer,
    customer => customer.bagItems,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "customer", referencedColumnName: "id" }])
  customer: Customer;

  @ManyToOne(
    () => ProductVariant,
    productVariant => productVariant.bagItems,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "productVariant", referencedColumnName: "id" }])
  productVariant: ProductVariant;
}
