import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany
} from "typeorm";
import { Brand } from "./Brand";
import { Category } from "./Category";
import { Color } from "./Color";
import { ProductAvailableSizes } from "./ProductAvailableSizes";
import { ProductInnerMaterials } from "./ProductInnerMaterials";
import { ProductOuterMaterials } from "./ProductOuterMaterials";
import { CollectionToProduct } from "./CollectionToProduct";
import { HomepageProductRailToProduct } from "./HomepageProductRailToProduct";
import { ProductToProductFunction } from "./ProductToProductFunction";
import { ProductToProductVariant } from "./ProductToProductVariant";

@Index("Product_pkey", ["id"], { unique: true })
@Index("monsoon$dev.Product.slug._UNIQUE", ["slug"], { unique: true })
@Entity("Product", { schema: "monsoon$dev" })
export class Product {
  @Column("character varying", { primary: true, name: "id", length: 25 })
  id: string;

  @Column("text", { name: "slug" })
  slug: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "externalURL", nullable: true })
  externalUrl: string | null;

  @Column("text", { name: "images" })
  images: string;

  @Column("integer", { name: "modelHeight", nullable: true })
  modelHeight: number | null;

  @Column("text", { name: "modelSize", nullable: true })
  modelSize: string | null;

  @Column("integer", { name: "retailPrice", nullable: true })
  retailPrice: number | null;

  @Column("text", { name: "tags", nullable: true })
  tags: string | null;

  @Column("text", { name: "status", nullable: true })
  status: string | null;

  @Column("timestamp without time zone", { name: "createdAt" })
  createdAt: Date;

  @Column("timestamp without time zone", { name: "updatedAt" })
  updatedAt: Date;

  @ManyToOne(
    () => Brand,
    brand => brand.products,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "brand", referencedColumnName: "id" }])
  brand: Brand;

  @ManyToOne(
    () => Category,
    category => category.products,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "category", referencedColumnName: "id" }])
  category: Category;

  @ManyToOne(
    () => Color,
    color => color.products,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "color", referencedColumnName: "id" }])
  color: Color;

  @ManyToOne(
    () => Color,
    color => color.products2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "secondaryColor", referencedColumnName: "id" }])
  secondaryColor: Color;

  @OneToMany(
    () => ProductAvailableSizes,
    productAvailableSizes => productAvailableSizes.node
  )
  productAvailableSizes: ProductAvailableSizes[];

  @OneToMany(
    () => ProductInnerMaterials,
    productInnerMaterials => productInnerMaterials.node
  )
  productInnerMaterials: ProductInnerMaterials[];

  @OneToMany(
    () => ProductOuterMaterials,
    productOuterMaterials => productOuterMaterials.node
  )
  productOuterMaterials: ProductOuterMaterials[];

  @OneToMany(
    () => CollectionToProduct,
    collectionToProduct => collectionToProduct.b2
  )
  collectionToProducts: CollectionToProduct[];

  @OneToMany(
    () => HomepageProductRailToProduct,
    homepageProductRailToProduct => homepageProductRailToProduct.b2
  )
  homepageProductRailToProducts: HomepageProductRailToProduct[];

  @OneToMany(
    () => ProductToProductFunction,
    productToProductFunction => productToProductFunction.a2
  )
  productToProductFunctions: ProductToProductFunction[];

  @OneToMany(
    () => ProductToProductVariant,
    productToProductVariant => productToProductVariant.a2
  )
  productToProductVariants: ProductToProductVariant[];
}
