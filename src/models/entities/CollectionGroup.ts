import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Collection} from "./Collection";


@Entity("CollectionGroup" ,{schema:"monsoon$dev" } )
@Index("monsoon$dev.CollectionGroup.slug._UNIQUE",["slug",],{unique:true})
export class CollectionGroup {

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
        nullable:true,
        name:"title"
        })
    title:string | null;
        

    @Column("integer",{ 
        nullable:true,
        name:"collectionCount"
        })
    collectionCount:number | null;
        

   
    @ManyToMany(()=>Collection, (Collection: Collection)=>Collection.collectionGroups)
    collections:Collection[];
    
}
