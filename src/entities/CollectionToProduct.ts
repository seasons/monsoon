import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Collection } from "./Collection";
import { Product } from "./Product";

@Index("_CollectionToProduct_AB_unique", ["a", "b"], { unique: true })
@Index("_CollectionToProduct_B", ["b"], {})
@Entity("_CollectionToProduct", { schema: "monsoon$dev" })
export class CollectionToProduct {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Collection,
    collection => collection.collectionToProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Collection;

  @ManyToOne(
    () => Product,
    product => product.collectionToProducts,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: Product;
}
