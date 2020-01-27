import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { PhysicalProduct } from "./PhysicalProduct";
import { Reservation } from "./Reservation";

@Index("_PhysicalProductToReservation_AB_unique", ["a", "b"], { unique: true })
@Index("_PhysicalProductToReservation_B", ["b"], {})
@Entity("_PhysicalProductToReservation", { schema: "monsoon$dev" })
export class PhysicalProductToReservation {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => PhysicalProduct,
    physicalProduct => physicalProduct.physicalProductToReservations,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: PhysicalProduct;

  @ManyToOne(
    () => Reservation,
    reservation => reservation.physicalProductToReservations,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: Reservation;
}
