import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Location} from "./Location";
import {ProductVariant} from "./ProductVariant";
import {Reservation} from "./Reservation";


@Entity("PhysicalProduct" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.PhysicalProduct.seasonsUID._UNIQUE",["seasonsUID",],{unique:true})
export class PhysicalProduct {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"seasonsUID"
        })
    seasonsUID:string;
        

    @Column("text",{ 
        nullable:false,
        name:"inventoryStatus"
        })
    inventoryStatus:string;
        

    @Column("text",{ 
        nullable:false,
        name:"productStatus"
        })
    productStatus:string;
        

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
        

   
    @ManyToOne(()=>Location, (Location: Location)=>Location.physicalProducts,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'location'})
    location:Location | null;


   
    @ManyToMany(()=>ProductVariant, (ProductVariant: ProductVariant)=>ProductVariant.physicalProducts,{  nullable:false, })
    @JoinTable({ name:'_PhysicalProductToProductVariant'})
    productVariants:ProductVariant[];
    

   
    @ManyToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.physicalProducts,{  nullable:false, })
    @JoinTable({ name:'_PhysicalProductToReservation'})
    reservations:Reservation[];
    
}
