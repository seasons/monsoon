import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";
import {_CategoryToChildren} from "./_CategoryToChildren";


@Entity("Category" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Category.name._UNIQUE",["name",],{unique:true})
@Index("monsoon$dev.Category.slug._UNIQUE",["slug",],{unique:true})
export class Category {

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
        name:"image"
        })
    image:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"description"
        })
    description:string | null;
        

    @Column("boolean",{ 
        nullable:false,
        name:"visible"
        })
    visible:boolean;
        

   
    @OneToMany(()=>Product, (Product: Product)=>Product.category,{ onDelete: 'SET NULL' , })
    products:Product[];
    

   
    @OneToMany(()=>_CategoryToChildren, (_CategoryToChildren: _CategoryToChildren)=>_CategoryToChildren.a,{ onDelete: 'CASCADE' , })
    categoryToChildrens:_CategoryToChildren[];
    

   
    @OneToMany(()=>_CategoryToChildren, (_CategoryToChildren: _CategoryToChildren)=>_CategoryToChildren.b,{ onDelete: 'CASCADE' , })
    categoryToChildrens2:_CategoryToChildren[];
    
}
