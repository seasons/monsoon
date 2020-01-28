import { Column, Entity, Index, OneToMany } from "typeorm";
import { Parcel } from "./Parcel";

@Index("Label_pkey", ["id"], { unique: true })
@Entity("Label", { schema: "monsoon$dev" })
export class Label {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "name", nullable: true })
  name: string | null;

  @Column("text", { name: "image", nullable: true })
  image: string | null;

  @Column("text", { name: "trackingNumber", nullable: true })
  trackingNumber: string | null;

  @Column("text", { name: "trackingURL", nullable: true })
  trackingUrl: string | null;

  @OneToMany(
    () => Parcel,
    parcel => parcel.shippingLabel
  )
  parcels: Parcel[];
}
