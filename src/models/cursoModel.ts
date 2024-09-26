import { Entity,PrimaryGeneratedColumn, Column,ManyToOne,JoinColumn,JoinTable,
    CreateDateColumn,UpdateDateColumn,ManyToMany} from "typeorm";
import {Profesor} from "./profesorModel";
import {Estudiante} from "./estudianteModel";

@Entity ('cursos')
export class Curso{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    nombre:string;
    
    @Column()
    descripcion:string;

    @CreateDateColumn()
    createAt:Date;

    @UpdateDateColumn()
    updateAt:Date;


    

    @ManyToOne(()=> Profesor, profesor => profesor.cursos) 
    @JoinColumn({name:'Profesor_id'})//se une a la columna Profesor_id
    profesor:Profesor|null;//devuelve un profe

    @ManyToMany(()=>Estudiante)// un curso puede tener muchos estudiantes.
    @JoinTable({//A partir del curso, puedo saber cuáles son los estudiantes que están en ese curso.
        name:'inscripciones',
        joinColumn:{ name:'curso_id',referencedColumnName:'id'},
        inverseJoinColumn: { name: 'estudiante_id',referencedColumnName:'id'}
        })
    estudiantes:Estudiante[];
}

export default Curso;