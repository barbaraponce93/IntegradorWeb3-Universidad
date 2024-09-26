import express from "express"
const router=express.Router();
import { AppDataSource } from "../db/conexion";
import {Inscripcion} from "../models/inscripcionModels";
import { inscribir,consultarTodos,consultarPorCurso,consultarPorDniEstudiante,calificar, cancelarInscripcion} 
from '../controllers/inscripcionController';


router.get('/listarInscripciones',consultarTodos);

router.get('/crearInscripcion', (req, res) => {
    res.render('crearInscripcion', {
        pagina: 'Crear Inscripción',
    });
});
router.post('/',inscribir);
router.post('/inscripciones/crear', inscribir);

router.put('/calificar/:curso_id/:estudiante_id', calificar);
   

router.delete('/:curso_id/:estudiante_id',cancelarInscripcion);



router.get( '/xCurso/:nombre',consultarPorCurso);



router.get('/xEstudiantePorDNI/:dni', consultarPorDniEstudiante);

   

    export default router;