import express from "express"
const router=express.Router();
import { consultarTodos,consultarUno,insertar,modificar,eliminar,validar} from '../controllers/profesoresController';




router.get('/listarProfesores',consultarTodos);
//insertar
router.get('/crearProfesor', (req, res) => {
    res.render('crearProfesor', {
        pagina: 'Crear Profesor',
    });
});
router.post('/', validar(),insertar);



router.get('/modificarProfesor/:id', async (req, res) => {
    try {
        const profesor = await consultarUno(req, res); 
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado');
        }
        res.render('modificarProfesor', {
            profesor, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
})
router.put('/:id',validar(), modificar); 

//eliminar
router.delete('/:id', eliminar);



    export default router;