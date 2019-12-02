import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Color} from "./Color";
import {WantedProduct} from "./WantedProduct";
import {PhysicalProduct} from "./PhysicalProduct";
import {Product} from "./Product";
import {Bag} from "./Bag";


@Entity("ProductVariant" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.ProductVariant.sku._UNIQUE",["sku",],{unique:true})
export class ProductVariant {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:true,
        name:"sku"
        })
    sku:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"size"
        })
    size:string;
        

    @Column("numeric",{ 
        nullable:true,
        precision:65,
        scale:30,
        name:"weight"
        })
    weight:string | null;
        

    @Column("numeric",{ 
        nullable:true,
        precision:65,
        scale:30,
        name:"height"
        })
    height:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"productID"
        })
    productID:string;
        

    @Column("numeric",{ 
        nullable:true,
        precision:65,
        scale:30,
        name:"retailPrice"
        })
    retailPrice:string | null;
        

    @Column("integer",{ 
        nullable:false,
        name:"total"
        })
    total:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"reservable"
        })
    reservable:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"reserved"
        })
    reserved:number;
        

    @Column("integer",{ 
        nullable:false,
        name:"nonReservable"
        })
    nonReservable:number;
        

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
        

   
    @ManyToOne(()=>Color, (Color: Color)=>Color.productVariants,{ onDelete: 'SET NULL', })
    @JoinColumn({ name:'color'})
    color:Color | null;


   
    @OneToMany(()=>WantedProduct, (WantedProduct: WantedProduct)=>WantedProduct.productVariant,{ onDelete: 'SET NULL' , })
    wantedProducts:WantedProduct[];
    

   
    @ManyToMany(()=>PhysicalProduct, (PhysicalProduct: PhysicalProduct)=>PhysicalProduct.productVariants)
    physicalProducts:PhysicalProduct[];
    

   
    @ManyToMany(()=>Product, (Product: Product)=>Product.productVariants)
    products:Product[];
    

   
    @ManyToMany(()=>Bag, (Bag: Bag)=>Bag.productVariants)
    bags:Bag[];
    
}
