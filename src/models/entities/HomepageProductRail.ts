import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";


@Entity("HomepageProductRail" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.HomepageProductRail.slug._UNIQUE",["slug",],{unique:true})
export class HomepageProductRail {

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
        

   
    @ManyToMany(()=>Product, (Product: Product)=>Product.homepageProductRails,{  nullable:false, })
    @JoinTable({ name:'_HomepageProductRailToProduct'})
    products:Product[];
    
}
