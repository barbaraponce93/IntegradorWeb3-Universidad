import express from "express"
const router=express.Router();

import { consultarTodos,consultarUno,insertar,modificar,eliminar, validar} from '../controllers/estudiantesController';



router.get('/listarEstudiantes', consultarTodos);

//insertar
router.get('/crearEstudiantes', (req, res) => {
    res.render('crearEstudiantes', {
        pagina: 'Crear Estudiante',
    });
});
router.post('/', validar(),insertar);


router.get('/modificarEstudiante/:id', async (req, res) => {
    try {
        const estudiante = await consultarUno(req, res); 
        if (!estudiante) {
            return res.status(404).send('Estudiante no encontrado');
        }
        res.render('modificarEstudiante', {
            estudiante, 
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
router.put('/:id',validar(), modificar); 



//eliminar
router.delete('/:id', eliminar);



export default router;