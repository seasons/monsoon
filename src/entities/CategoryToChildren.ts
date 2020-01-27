import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Category } from "./Category";

@Index("_CategoryToChildren_AB_unique", ["a", "b"], { unique: true })
@Index("_CategoryToChildren_B", ["b"], {})
@Entity("_CategoryToChildren", { schema: "monsoon$dev" })
export class CategoryToChildren {
  @Column("character varying", { name: "A", length: 25 })
  a: string;

  @Column("character varying", { name: "B", length: 25 })
  b: string;

  @ManyToOne(
    () => Category,
    category => category.categoryToChildren,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "A", referencedColumnName: "id" }])
  a2: Category;

  @ManyToOne(
    () => Category,
    category => category.categoryToChildren2,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "B", referencedColumnName: "id" }])
  b2: Category;
}
