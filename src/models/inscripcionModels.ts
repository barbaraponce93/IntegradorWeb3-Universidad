import { Entity,ManyToOne,JoinColumn, Column,PrimaryColumn } from "typeorm";
import{Estudiante} from './estudianteModel';
import {Curso} from "./cursoModel";

@Entity ('inscripciones')
export class Inscripcion{
    @PrimaryColumn()
    estudiante_id:number;

    @PrimaryColumn()
     curso_id:number;

    @Column({type:'float',default:()=>0})// default le agrega cero cuando inscribo al estudiante
    nota:number;

    @Column({type:'date',default:()=>'CURRENT_DATE'})// default le agrega la fecha actual
     fecha:Date;
    

    @ManyToOne(()=> Estudiante,(estudiante)=>estudiante.cursos)//
    @JoinColumn({name:'estudiante_id'})
    public estudiante:Estudiante;


    
    @ManyToOne(()=> Curso,(curso)=>curso.estudiantes)
    @JoinColumn({name:'curso_id'})
    public curso:Curso;

}

export default  Inscripcion;