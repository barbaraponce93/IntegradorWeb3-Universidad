import { Entity,PrimaryGeneratedColumn, Column,CreateDateColumn,UpdateDateColumn,ManyToMany,JoinTable } from "typeorm";
import {Curso} from "./cursoModel";

@Entity ('estudiantes')
export class Estudiante{
    @PrimaryGeneratedColumn()//este decorador es para generar columnas que se autoincrementen 
    id:number;

    @Column()//columna
    dni:string;

    @Column()
    nombre:string;
    
    @Column()
    apellido:string;

    @Column()
    email:string;

    @CreateDateColumn()//crea una columna con la fecha de creacion
    createAt:Date;

    @UpdateDateColumn()//crea una columna con la fecha de actualizacion
    updateAt:Date;

    @ManyToMany(()=> Curso)
    @JoinTable({
        name:'inscripciones',//la profe lo tiene con otro nombre
        joinColumn:{name:'estudiante_id',referencedColumnName:'id'},
        inverseJoinColumn:{name:'curso_id',referencedColumnName:'id'}
    })
    cursos:Curso[];//fetch me devuelve los cursos que esta anotado el estudiante
}

export default Estudiante;