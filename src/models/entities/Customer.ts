import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {CustomerDetail} from "./CustomerDetail";
import {BillingInfo} from "./BillingInfo";
import {User} from "./User";
import {Reservation} from "./Reservation";
import {WantedProduct} from "./WantedProduct";
import {Bag} from "./Bag";
import {Product} from "./Product";


@Entity("Customer" ,{schema:"monsoon$dev" } )
export class Customer {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:true,
        name:"status"
        })
    status:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"plan"
        })
    plan:string | null;
        

   
    @ManyToOne(()=>CustomerDetail, (CustomerDetail: CustomerDetail)=>CustomerDetail.customers,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'detail'})
    detail:CustomerDetail | null;


   
    @ManyToOne(()=>BillingInfo, (BillingInfo: BillingInfo)=>BillingInfo.customers,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'billingInfo'})
    billingInfo:BillingInfo | null;


   
    @ManyToOne(()=>User, (User: User)=>User.customers,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'user'})
    user:User | null;


   
    @OneToMany(()=>Reservation, (Reservation: Reservation)=>Reservation.customer,{ onDelete: 'SET NULL' , })
    reservations:Reservation[];
    

   
    @ManyToMany(()=>WantedProduct, (WantedProduct: WantedProduct)=>WantedProduct.customers,{  nullable:false, })
    @JoinTable({ name:'_CustomerToWantedProduct'})
    wantedProducts:WantedProduct[];
    

   
    @ManyToMany(()=>Bag, (Bag: Bag)=>Bag.customers)
    bags:Bag[];
    

   
    @ManyToMany(()=>Product, (Product: Product)=>Product.customers,{  nullable:false, })
    @JoinTable({ name:'_CustomerToProduct'})
    products:Product[];
    
}
