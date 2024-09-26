import express from "express"
const router=express.Router();
import { consultarTodos,consultarUno,insertar,modificar,eliminar, validar} from '../controllers/cursosController';
 
router.get('/listarCursos',consultarTodos);

//insertar
router.get('/crearCurso', (req, res) => {
    res.render('crearCurso', {
        pagina: 'Crear Curso',
    });
});
router.post('/',validar(),insertar);

router.get('/modificarCurso/:id', async (req, res) => {
    try {
        const curso = await consultarUno(req, res); 
        if (!curso) {
            return res.status(404).send('Curso no encontrado');
        }
        res.render('modificarCurso', {
            curso, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});

router.put('/:id',validar(), modificar); 

router.delete('/:id', eliminar);

 






export default router;