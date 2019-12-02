import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Customer} from "./Customer";
import {Location} from "./Location";
import {Reservation} from "./Reservation";


@Entity("User" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.User.auth0Id._UNIQUE",["auth0Id",],{unique:true})
@Index("monsoon$dev.User.email._UNIQUE",["email",],{unique:true})
export class User {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"auth0Id"
        })
    auth0Id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"email"
        })
    email:string;
        

    @Column("text",{ 
        nullable:false,
        name:"firstName"
        })
    firstName:string;
        

    @Column("text",{ 
        nullable:false,
        name:"lastName"
        })
    lastName:string;
        

    @Column("text",{ 
        nullable:false,
        name:"role"
        })
    role:string;
        

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
        

   
    @OneToMany(()=>Customer, (Customer: Customer)=>Customer.user,{ onDelete: 'SET NULL' , })
    customers:Customer[];
    

   
    @OneToMany(()=>Location, (Location: Location)=>Location.user,{ onDelete: 'SET NULL' , })
    locations:Location[];
    

   
    @OneToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.user,{ onDelete: 'SET NULL' , })
    reservations:Reservation[];
    
}
