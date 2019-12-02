import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {ProductVariant} from "./ProductVariant";
import {Customer} from "./Customer";


@Entity("WantedProduct" ,{schema:"monsoon$dev" } )
export class WantedProduct {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

   
    @ManyToOne(()=>ProductVariant, (ProductVariant: ProductVariant)=>ProductVariant.wantedProducts,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'productVariant'})
    productVariant:ProductVariant | null;


   
    @ManyToMany(()=>Customer, (Customer: Customer)=>Customer.wantedProducts)
    customers:Customer[];
    
}
