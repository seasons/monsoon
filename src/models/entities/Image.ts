import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";


@Entity("Image" ,{schema:"monsoon$dev" } )
export class Image {

    @Column("character varying",{ 
        nullable:false,
        primary:true,
        length:25,
        name:"id"
        })
    id:string;
        

    @Column("text",{ 
        nullable:true,
        name:"caption"
        })
    caption:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"originalHeight"
        })
    originalHeight:number | null;
        

    @Column("text",{ 
        nullable:false,
        name:"originalUrl"
        })
    originalUrl:string;
        

    @Column("integer",{ 
        nullable:true,
        name:"originalWidth"
        })
    originalWidth:number | null;
        

    @Column("text",{ 
        nullable:false,
        name:"resizedUrl"
        })
    resizedUrl:string;
        

    @Column("text",{ 
        nullable:true,
        name:"title"
        })
    title:string | null;
        

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
        
}
