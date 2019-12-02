import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Customer} from "./Customer";


@Entity("BillingInfo" ,{schema:"monsoon$dev" } )
export class BillingInfo {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"brand"
        })
    brand:string;
        

    @Column("text",{ 
        nullable:true,
        name:"name"
        })
    name:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"last_digits"
        })
    last_digits:string;
        

    @Column("integer",{ 
        nullable:false,
        name:"expiration_month"
        })
    expiration_month:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"expiration_year"
        })
    expiration_year:number;
        

    @Column("text",{ 
        nullable:true,
        name:"street1"
        })
    street1:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"street2"
        })
    street2:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"city"
        })
    city:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"state"
        })
    state:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"country"
        })
    country:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"postal_code"
        })
    postal_code:string | null;
        

   
    @OneToMany(()=>Customer, (Customer: Customer)=>Customer.billingInfo,{ onDelete: 'SET NULL' , })
    customers:Customer[];
    
}
