import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";
import {ProductVariant} from "./ProductVariant";


@Entity("Color" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Color.colorCode._UNIQUE",["colorCode",],{unique:true})
@Index("monsoon$dev.Color.slug._UNIQUE",["slug",],{unique:true})
export class Color {

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
        nullable:false,
        name:"colorCode"
        })
    colorCode:string;
        

    @Column("text",{ 
        nullable:false,
        name:"hexCode"
        })
    hexCode:string;
        

   
    @OneToMany(()=>Product, (Product: Product)=>Product.color,{ onDelete: 'SET NULL' , })
    products:Product[];
    

   
    @OneToMany(()=>Product, (Product: Product)=>Product.secondaryColor,{ onDelete: 'SET NULL' , })
    products2:Product[];
    

   
    @OneToMany(()=>ProductVariant, (ProductVariant: ProductVariant)=>ProductVariant.color,{ onDelete: 'SET NULL' , })
    productVariants:ProductVariant[];
    
}
