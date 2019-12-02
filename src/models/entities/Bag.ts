import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Customer} from "./Customer";
import {ProductVariant} from "./ProductVariant";


@Entity("Bag" ,{schema:"monsoon$dev" } )
export class Bag {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

   
    @ManyToMany(()=>Customer, (Customer: Customer)=>Customer.bags,{  nullable:false, })
    @JoinTable({ name:'_BagToCustomer'})
    customers:Customer[];
    

   
    @ManyToMany(()=>ProductVariant, (ProductVariant: ProductVariant)=>ProductVariant.bags,{  nullable:false, })
    @JoinTable({ name:'_BagToProductVariant'})
    productVariants:ProductVariant[];
    
}
