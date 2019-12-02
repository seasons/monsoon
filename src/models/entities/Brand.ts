import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Product} from "./Product";


@Entity("Brand" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.Brand.brandCode._UNIQUE",["brandCode",],{unique:true})
@Index("monsoon$dev.Brand.slug._UNIQUE",["slug",],{unique:true})
export class Brand {

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
        name:"brandCode"
        })
    brandCode:string;
        

    @Column("text",{ 
        nullable:true,
        name:"description"
        })
    description:string | null;
        

    @Column("boolean",{ 
        nullable:false,
        name:"isPrimaryBrand"
        })
    isPrimaryBrand:boolean;
        

    @Column("text",{ 
        nullable:true,
        name:"logo"
        })
    logo:string | null;
        

    @Column("text",{ 
        nullable:false,
        name:"name"
        })
    name:string;
        

    @Column("timestamp without time zone",{ 
        nullable:true,
        name:"since"
        })
    since:Date | null;
        

    @Column("text",{ 
        nullable:false,
        name:"tier"
        })
    tier:string;
        

    @Column("text",{ 
        nullable:true,
        name:"websiteUrl"
        })
    websiteUrl:string | null;
        

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
        

    @Column("text",{ 
        nullable:true,
        name:"basedIn"
        })
    basedIn:string | null;
        

   
    @OneToMany(()=>Product, (Product: Product)=>Product.brand,{ onDelete: 'SET NULL' , })
    products:Product[];
    
}
