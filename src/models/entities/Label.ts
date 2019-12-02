import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Reservation} from "./Reservation";


@Entity("Label" ,{schema:"monsoon$dev" } )
export class Label {

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
        

    @Column("text",{ 
        nullable:true,
        name:"image"
        })
    image:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"trackingNumber"
        })
    trackingNumber:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"trackingURL"
        })
    trackingURL:string | null;
        

   
    @OneToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.returnLabel,{ onDelete: 'SET NULL' , })
    reservations:Reservation[];
    

   
    @OneToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.shippingLabel,{ onDelete: 'SET NULL' , })
    reservations2:Reservation[];
    
}
