import { Column, Entity, Index, OneToMany } from "typeorm";
import { CollectionToCollectionGroup } from "./CollectionToCollectionGroup";
import { CollectionToProduct } from "./CollectionToProduct";

@Index("Collection_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Collection.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Collection", { schema: "monsoon$dev" })
export class Collection {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "images" })
  images: string;

  @Column("text", { name: "title", nullable: true })
  title: string | null;

  @Column("text", { name: "subTitle", nullable: true })
  subTitle: string | null;

  @Column("text", { name: "descriptionTop", nullable: true })
  descriptionTop: string | null;

  @Column("text", { name: "descriptionBottom", nullable: true })
  descriptionBottom: string | null;

  @OneToMany(
    () => CollectionToCollectionGroup,
    collectionToCollectionGroup => collectionToCollectionGroup.a2
  )
  collectionToCollectionGroups: CollectionToCollectionGroup[];

  @OneToMany(
    () => CollectionToProduct,
    collectionToProduct => collectionToProduct.a2
  )
  collectionToProducts: CollectionToProduct[];
}
