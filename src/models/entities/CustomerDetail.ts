import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Location} from "./Location";
import {Customer} from "./Customer";


@Entity("CustomerDetail" ,{schema:"monsoon$dev" } )
export class CustomerDetail {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:true,
        name:"phoneNumber"
        })
    phoneNumber:string | null;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"birthday"
        })
    birthday:Date | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"height"
        })
    height:number | null;
        

    @Column("text",{ 
        nullable:true,
        name:"weight"
        })
    weight:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"bodyType"
        })
    bodyType:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"averageTopSize"
        })
    averageTopSize:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"averageWaistSize"
        })
    averageWaistSize:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"averagePantLength"
        })
    averagePantLength:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"preferredPronouns"
        })
    preferredPronouns:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"profession"
        })
    profession:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"partyFrequency"
        })
    partyFrequency:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"travelFrequency"
        })
    travelFrequency:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"shoppingFrequency"
        })
    shoppingFrequency:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"averageSpend"
        })
    averageSpend:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"style"
        })
    style:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"commuteStyle"
        })
    commuteStyle:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"phoneOS"
        })
    phoneOS:string | null;
        

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
        

   
    @ManyToOne(()=>Location, (Location: Location)=>Location.customerDetails,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'shippingAddress'})
    shippingAddress:Location | null;


   
    @OneToMany(()=>Customer, (Customer: Customer)=>Customer.detail,{ onDelete: 'SET NULL' , })
    customers:Customer[];
    
}
