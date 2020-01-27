import { Column, Entity, Index } from "typeorm";

@Index("Image_pkey", ["id"], { unique: true })
@Entity("Image", { schema: "monsoon$dev" })
export class Image {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "caption", nullable: true })
  caption: string | null;

  @Column("integer", { name: "originalHeight", nullable: true })
  originalHeight: number | null;

  @Column("text", { name: "originalUrl" })
  originalUrl: string;

  @Column("integer", { name: "originalWidth", nullable: true })
  originalWidth: number | null;

  @Column("text", { name: "resizedUrl" })
  resizedUrl: string;

  @Column("text", { name: "title", nullable: true })
  title: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;
}
