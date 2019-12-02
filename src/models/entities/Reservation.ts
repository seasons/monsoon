import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Label} from "./Label";
import {User} from "./User";
import {Location} from "./Location";
import {Customer} from "./Customer";
import {PhysicalProduct} from "./PhysicalProduct";


@Entity("Reservation" ,{schema:"monsoon$dev" } )
export class Reservation {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("integer",{ 
        nullable:false,
        name:"reservationNumber"
        })
    reservationNumber:number;
        

    @Column("boolean",{ 
        nullable:false,
        name:"shipped"
        })
    shipped:boolean;
        

    @Column("text",{ 
        nullable:false,
        name:"status"
        })
    status:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"shippedAt"
        })
    shippedAt:Date | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"receivedAt"
        })
    receivedAt:Date | null;
        

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
        

   
    @ManyToOne(()=>Label, (Label: Label)=>Label.reservations,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'returnLabel'})
    returnLabel:Label | null;


   
    @ManyToOne(()=>Label, (Label: Label)=>Label.reservations2,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'shippingLabel'})
    shippingLabel:Label | null;


   
    @ManyToOne(()=>User, (User: User)=>User.reservations,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'user'})
    user:User | null;


   
    @ManyToOne(()=>Location, (Location: Location)=>Location.reservations,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'location'})
    location:Location | null;


   
    @ManyToOne(()=>Customer, (Customer: Customer)=>Customer.reservations,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'customer'})
    customer:Customer | null;


   
    @ManyToMany(()=>PhysicalProduct, (PhysicalProduct: PhysicalProduct)=>PhysicalProduct.reservations)
    physicalProducts:PhysicalProduct[];
    
}
