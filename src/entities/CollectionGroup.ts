import { Column, Entity, Index, OneToMany } from "typeorm";
import { CollectionToCollectionGroup } from "./CollectionToCollectionGroup";

@Index("CollectionGroup_pkey", ["id"], { unique: true })
@Index("monsoon$dev.CollectionGroup.slug._UNIQUE", ["slug"], { unique: true })
@Entity("CollectionGroup", { schema: "monsoon$dev" })
export class CollectionGroup {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "title", nullable: true })
  title: string | null;

  @Column("integer", { name: "collectionCount", nullable: true })
  collectionCount: number | null;

  @OneToMany(
    () => CollectionToCollectionGroup,
    collectionToCollectionGroup => collectionToCollectionGroup.b2
  )
  collectionToCollectionGroups: CollectionToCollectionGroup[];
}
