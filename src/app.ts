import express, { Request,Response,NextFunction } from "express";
import cors from 'cors';// middleware que permite o restringe las solicitudes entre diferentes dominios
import morgan from "morgan";
import path from 'path';

import estudiantesRoutes from "./routes/estudiantesRoutes";
 import profesoresRoutes from "./routes/profesoresRoutes";
const app=express();

import methodOverride from 'method-override';


import cursosRoutes from "./routes/cursosRoutes";
 import inscripcionesRoutes from "./routes/inscripcionesRoutes";



//habilitamos pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));
//carpeta pblica
app.use(express.static('public'));

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));
app.use(cors());

app.get('/',(req:Request,res:Response)=>{
    return res.render('layout', {
        pagina: 'App Universidad',
    });
})

 app.use('/estudiantes',estudiantesRoutes);// ruta para manejar solicitudes /estudiantes
 app.use('/profesores', profesoresRoutes );
 app.use('/cursos',cursosRoutes);
 app.use('/inscripciones',inscripcionesRoutes);


export default app;