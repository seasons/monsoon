import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Category} from "./Category";
import {Color} from "./Color";
import {Brand} from "./Brand";
import {Product_availableSizes} from "./Product_availableSizes";
import {Product_innerMaterials} from "./Product_innerMaterials";
import {Product_outerMaterials} from "./Product_outerMaterials";
import {Collection} from "./Collection";
import {HomepageProductRail} from "./HomepageProductRail";
import {ProductFunction} from "./ProductFunction";
import {Customer} from "./Customer";
import {ProductVariant} from "./ProductVariant";


@Entity("Product" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Product.slug._UNIQUE",["slug",],{unique:true})
export class Product {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"slug"
        })
    slug:string;
        

    @Column("text",{ 
        nullable:false,
        name:"name"
        })
    name:string;
        

    @Column("text",{ 
        nullable:true,
        name:"description"
        })
    description:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"externalURL"
        })
    externalURL:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"images"
        })
    images:string;
        

    @Column("integer",{ 
        nullable:true,
        name:"modelHeight"
        })
    modelHeight:number | null;
        

    @Column("text",{ 
        nullable:true,
        name:"modelSize"
        })
    modelSize:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"retailPrice"
        })
    retailPrice:number | null;
        

    @Column("text",{ 
        nullable:true,
        name:"tags"
        })
    tags:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"status"
        })
    status:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"createdAt"
        })
    createdAt:Date;
        

    @Column("timestamp without time zone",{ 
        nullable:false,
        name:"updatedAt"
        })
    updatedAt:Date;
        

   
    @ManyToOne(()=>Category, (Category: Category)=>Category.products,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'category'})
    category:Category | null;


   
    @ManyToOne(()=>Color, (Color: Color)=>Color.products,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'color'})
    color:Color | null;


   
    @ManyToOne(()=>Color, (Color: Color)=>Color.products2,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'secondaryColor'})
    secondaryColor:Color | null;


   
    @ManyToOne(()=>Brand, (Brand: Brand)=>Brand.products,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'brand'})
    brand:Brand | null;


   
    @OneToMany(()=>Product_availableSizes, (Product_availableSizes: Product_availableSizes)=>Product_availableSizes.node)
    productAvailableSizess:Product_availableSizes[];
    

   
    @OneToMany(()=>Product_innerMaterials, (Product_innerMaterials: Product_innerMaterials)=>Product_innerMaterials.node)
    productInnerMaterialss:Product_innerMaterials[];
    

   
    @OneToMany(()=>Product_outerMaterials, (Product_outerMaterials: Product_outerMaterials)=>Product_outerMaterials.node)
    productOuterMaterialss:Product_outerMaterials[];
    

   
    @ManyToMany(()=>Collection, (Collection: Collection)=>Collection.products)
    collections:Collection[];
    

   
    @ManyToMany(()=>HomepageProductRail, (HomepageProductRail: HomepageProductRail)=>HomepageProductRail.products)
    homepageProductRails:HomepageProductRail[];
    

   
    @ManyToMany(()=>ProductFunction, (ProductFunction: ProductFunction)=>ProductFunction.products,{  nullable:false, })
    @JoinTable({ name:'_ProductToProductFunction'})
    productFunctions:ProductFunction[];
    

   
    @ManyToMany(()=>Customer, (Customer: Customer)=>Customer.products)
    customers:Customer[];
    

   
    @ManyToMany(()=>ProductVariant, (ProductVariant: ProductVariant)=>ProductVariant.products,{  nullable:false, })
    @JoinTable({ name:'_ProductToProductVariant'})
    productVariants:ProductVariant[];
    
}
