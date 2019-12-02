import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";
import {CollectionGroup} from "./CollectionGroup";


@Entity("Collection" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Collection.slug._UNIQUE",["slug",],{unique:true})
export class Collection {

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
        name:"images"
        })
    images:string;
        

    @Column("text",{ 
        nullable:true,
        name:"title"
        })
    title:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"subTitle"
        })
    subTitle:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"descriptionTop"
        })
    descriptionTop:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"descriptionBottom"
        })
    descriptionBottom:string | null;
        

   
    @ManyToMany(()=>Product, (Product: Product)=>Product.collections,{  nullable:false, })
    @JoinTable({ name:'_CollectionToProduct'})
    products:Product[];
    

   
    @ManyToMany(()=>CollectionGroup, (CollectionGroup: CollectionGroup)=>CollectionGroup.collections,{  nullable:false, })
    @JoinTable({ name:'_CollectionToCollectionGroup'})
    collectionGroups:CollectionGroup[];
    
}
