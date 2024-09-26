"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const inscripcionController_1 = require("../controllers/inscripcionController");
router.get('/listarInscripciones', inscripcionController_1.consultarTodos);
router.get('/crearInscripcion', (req, res) => {
    res.render('crearInscripcion', {
        pagina: 'Crear Inscripción',
    });
});
router.post('/', inscripcionController_1.inscribir);
router.post('/inscripciones/crear', inscripcionController_1.inscribir);
router.put('/calificar/:curso_id/:estudiante_id', inscripcionController_1.calificar);
router.delete('/:curso_id/:estudiante_id', inscripcionController_1.cancelarInscripcion);
router.get('/xCurso/:nombre', inscripcionController_1.consultarPorCurso);
router.get('/xEstudiantePorDNI/:dni', inscripcionController_1.consultarPorDniEstudiante);
exports.default = router;
