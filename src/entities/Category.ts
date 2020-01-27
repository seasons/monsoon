import { Column, Entity, Index, OneToMany } from "typeorm";
import { Product } from "./Product";
import { CategoryToChildren } from "./CategoryToChildren";

@Index("Category_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Category.name._UNIQUE", ["name"], { unique: true })
@Index("monsoon$dev.Category.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Category", { schema: "monsoon$dev" })
export class Category {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "image", nullable: true })
  image: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("boolean", { name: "visible" })
  visible: boolean;

  @OneToMany(
    () => Product,
    product => product.category
  )
  products: Product[];

  @OneToMany(
    () => CategoryToChildren,
    categoryToChildren => categoryToChildren.a2
  )
  categoryToChildren: CategoryToChildren[];

  @OneToMany(
    () => CategoryToChildren,
    categoryToChildren => categoryToChildren.b2
  )
  categoryToChildren2: CategoryToChildren[];
}
