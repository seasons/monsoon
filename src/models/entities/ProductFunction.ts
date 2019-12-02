import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";


@Entity("ProductFunction" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.ProductFunction.name._UNIQUE",["name",],{unique:true})
export class ProductFunction {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:true,
        name:"name"
        })
    name:string | null;
        

   
    @ManyToMany(()=>Product, (Product: Product)=>Product.productFunctions)
    products:Product[];
    
}
