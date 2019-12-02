import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";


@Entity("Product_innerMaterials" ,{schema:"monsoon$dev" } )
export class Product_innerMaterials {

   
    @ManyToOne(()=>Product, (Product: Product)=>Product.productInnerMaterialss,{ primary:true, nullable:false, })
    @JoinColumn({ name:'nodeId'})
    node:Product | null;


    @Column("integer",{ 
        nullable:false,
        primary:true,
        name:"position"
        })
    position:number;
        

    @Column("text",{ 
        nullable:false,
        name:"value"
        })
    value:string;
        
}
