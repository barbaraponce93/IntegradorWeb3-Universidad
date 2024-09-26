import { Entity,PrimaryGeneratedColumn, Column,OneToMany,CreateDateColumn,UpdateDateColumn } from "typeorm";
import {Curso} from "./cursoModel";

@Entity ('profesores')
export class Profesor{
    @PrimaryGeneratedColumn()
    id:number;

    @Column()
    dni:string;

    @Column()
    nombre:string;
    
    @Column()
    apellido:string;

    @Column()
    email:string;

    @Column()
    profesion:string;
 
    @Column()
    telefono:string;

    @CreateDateColumn()
    createAt:Date;

    @UpdateDateColumn()
    updateAt:Date;
// un profe puede tener muchos cursos 
    @OneToMany(()=> Curso,(curso)=>curso.profesor)
    cursos:Curso[];//por eso devuelve un array
}

export default Profesor;