import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {Category} from "./Category";


@Entity("_CategoryToChildren" ,{schema:"monsoon$dev" } )
@Index("_CategoryToChildren_AB_unique",["a","b",],{unique:true})
@Index("_CategoryToChildren_B",["b",])
export class _CategoryToChildren {

   
    @ManyToOne(()=>Category, (Category: Category)=>Category.categoryToChildrens,{  nullable:false,onDelete: 'CASCADE', })
    @JoinColumn({ name:'A'})
    a:Category | null;


   
    @ManyToOne(()=>Category, (Category: Category)=>Category.categoryToChildrens2,{  nullable:false,onDelete: 'CASCADE', })
    @JoinColumn({ name:'B'})
    b:Category | null;

}
