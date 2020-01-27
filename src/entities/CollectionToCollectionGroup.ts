import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Collection } from "./Collection";
import { CollectionGroup } from "./CollectionGroup";

@Index("_CollectionToCollectionGroup_AB_unique", ["a", "b"], { unique: true })
@Index("_CollectionToCollectionGroup_B", ["b"], {})
@Entity("_CollectionToCollectionGroup", { schema: "monsoon$dev" })
export class CollectionToCollectionGroup {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Collection,
    collection => collection.collectionToCollectionGroups,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Collection;

  @ManyToOne(
    () => CollectionGroup,
    collectionGroup => collectionGroup.collectionToCollectionGroups,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: CollectionGroup;
}
