import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {User} from "./User";
import {CustomerDetail} from "./CustomerDetail";
import {PhysicalProduct} from "./PhysicalProduct";
import {Reservation} from "./Reservation";


@Entity("Location" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Location.slug._UNIQUE",["slug",],{unique:true})
export class Location {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:false,
        name:"slug"
        })
    slug:string;
        

    @Column("text",{ 
        nullable:false,
        name:"name"
        })
    name:string;
        

    @Column("text",{ 
        nullable:true,
        name:"company"
        })
    company:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"description"
        })
    description:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"address1"
        })
    address1:string;
        

    @Column("text",{ 
        nullable:true,
        name:"address2"
        })
    address2:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"city"
        })
    city:string;
        

    @Column("text",{ 
        nullable:false,
        name:"state"
        })
    state:string;
        

    @Column("text",{ 
        nullable:false,
        name:"zipCode"
        })
    zipCode:string;
        

    @Column("text",{ 
        nullable:true,
        name:"locationType"
        })
    locationType:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:65,
        scale:30,
        name:"lat"
        })
    lat:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:65,
        scale:30,
        name:"lng"
        })
    lng:string | null;
        

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
        

   
    @ManyToOne(()=>User, (User: User)=>User.locations,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'user'})
    user:User | null;


   
    @OneToMany(()=>CustomerDetail, (CustomerDetail: CustomerDetail)=>CustomerDetail.shippingAddress,{ onDelete: 'SET NULL' , })
    customerDetails:CustomerDetail[];
    

   
    @OneToMany(()=>PhysicalProduct, (PhysicalProduct: PhysicalProduct)=>PhysicalProduct.location,{ onDelete: 'SET NULL' , })
    physicalProducts:PhysicalProduct[];
    

   
    @OneToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.location,{ onDelete: 'SET NULL' , })
    reservations:Reservation[];
    
}
