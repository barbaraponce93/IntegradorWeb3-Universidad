"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calificar = exports.cancelarInscripcion = exports.consultarPorDniEstudiante = exports.consultarPorCurso = exports.consultarTodos = exports.inscribir = void 0;
const inscripcionModels_1 = require("../models/inscripcionModels");
const cursoModel_1 = require("../models/cursoModel");
const estudianteModel_1 = require("../models/estudianteModel");
const conexion_1 = require("../db/conexion");
const estudianteRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
const inscripcionesRepository = conexion_1.AppDataSource.getRepository(inscripcionModels_1.Inscripcion);
const inscribir = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni, curso_id } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const estudiante = yield estudianteRepository.findOne({
                where: { dni },
            });
            if (!estudiante) {
                return res.render('crearInscripcion', {
                    pagina: 'Crear Inscripción',
                    errores: [{ msg: 'Curso no encontrado' }],
                    curso: { dni, curso_id } // Retorna los valores del formulario para no perder los datos
                });
            }
            const curso = yield cursoRepository.findOne({
                where: { id: curso_id },
            });
            if (!curso) {
                return res.render('crearInscripcion', {
                    pagina: 'Crear Inscripción',
                    errores: [{ msg: 'Curso no encontrado' }],
                    curso: { dni, curso_id }
                });
            }
            // Crear nueva inscripción
            const nuevaInscripcion = inscripcionesRepository.create({
                estudiante,
                curso,
                fecha: new Date(),
            });
            yield transactionalEntityManager.save(nuevaInscripcion);
            const inscripciones = yield conexion_1.AppDataSource.getRepository(inscripcionModels_1.Inscripcion).find({
                relations: ["curso", "estudiante"]
            });
            res.render('listarInscripciones', {
                pagina: 'Lista de Inscripciones',
                inscripciones
            });
        }));
    }
    catch (error) {
        res.status(500).json({ message: "Error al insertar inscripción", error });
    }
});
exports.inscribir = inscribir;
//------------------------------------------------------------------------------------------------
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inscripciones = yield inscripcionesRepository.find({
            relations: ["curso", "estudiante"]
        });
        res.render('listarInscripciones', {
            pagina: 'Lista de Inscripciones',
            inscripciones: inscripciones
        });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).send(err.message);
    }
});
exports.consultarTodos = consultarTodos;
//------------------------------------------------------------------------------------------------
//-------------------------------------------------------------------------------------------------
const consultarPorCurso = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.params;
    if (typeof nombre !== 'string') {
        return res.status(400).json({ message: 'Nombre del curso inválido' });
    }
    try {
        //console.log("NOMBRE recibido:", nombre);
        const curso = yield cursoRepository
            .createQueryBuilder("curso")
            .where("LOWER(curso.nombre) = LOWER(:nombre)", { nombre })
            .getOne();
        if (!curso) {
            return res.status(404).json({ message: "El curso no existe" });
        }
        console.log("Resultado de la consulta del curso:", curso);
        // Obtener las inscripciones del curso, o sea un array con las inscripciones obtenidas a partir del join
        const resultado = yield inscripcionesRepository //
            .createQueryBuilder("inscripciones")
            .innerJoinAndSelect("inscripciones.curso", "curso")
            .innerJoinAndSelect("inscripciones.estudiante", "estudiante")
            .where("curso.id = :id", { id: curso.id })
            .select([
            "estudiante.nombre AS estudiante_nombre",
            "estudiante.apellido AS estudiante_apellido",
            "curso.nombre AS curso",
            "inscripciones.fecha AS fecha_inscripcion",
            "inscripciones.nota AS nota",
        ])
            .getRawMany();
        if (resultado.length === 0) {
            return res
                .status(404)
                .json({ message: "No se encontraron inscripciones para este curso" });
        }
        console.log("Resultados de la consulta incripciones:", resultado);
        // Estructuro los datos que voy a mostrar en la tabla
        res.status(200).json({
            curso: resultado[0].curso,
            inscripciones: resultado.map((r) => ({
                estudiante_nombre: r.estudiante_nombre,
                estudiante_apellido: r.estudiante_apellido,
                fecha_inscripcion: r.fecha_inscripcion,
                nota: r.nota !== null ? r.nota : 'No calificado',
            })),
        });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).send(err.message);
    }
});
exports.consultarPorCurso = consultarPorCurso;
//-------------------------------------------------------------------------------------------------
const consultarPorDniEstudiante = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { dni } = req.params;
    if (typeof dni !== 'string') {
        return res.status(400).json({ message: 'DNI inválido' });
    }
    try {
        // console.log("DNI recibido:", dni);
        const estudiante = yield estudianteRepository.findOne({ where: { dni: dni } });
        console.log("Resultado de la consulta:", estudiante);
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        const resultado = yield inscripcionesRepository.createQueryBuilder('inscripciones')
            .innerJoinAndSelect('inscripciones.curso', 'curso')
            .innerJoinAndSelect('inscripciones.estudiante', 'estudiante')
            .where('estudiante.id = :id', { id: estudiante.id })
            .select([
            "curso.nombre AS curso_nombre",
            "inscripciones.fecha AS fecha_inscripcion",
            "inscripciones.nota AS nota",
        ])
            .getRawMany();
        if (resultado.length === 0) {
            return res.status(404).json({ message: 'No se encontraron inscripciones para este estudiante' });
        }
        res.status(200).json({
            estudiante: {
                nombre: resultado[0].estudiante_nombre,
                apellido: resultado[0].estudiante_apellido
            },
            inscripciones: resultado.map(r => ({
                curso_nombre: r.curso_nombre,
                fecha_inscripcion: r.fecha_inscripcion,
                nota: r.nota !== null ? r.nota : 'No calificado',
            }))
        });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).send(err.message);
    }
});
exports.consultarPorDniEstudiante = consultarPorDniEstudiante;
//-------------------------------------------------------------------------------------------------
const cancelarInscripcion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { estudiante_id, curso_id } = req.params;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const estudiante = yield transactionalEntityManager.findOne(estudianteModel_1.Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
            if (!estudiante) {
                return res.status(400).json({ mens: 'Estudiante no existe' });
            }
            const curso = yield transactionalEntityManager.findOne(cursoModel_1.Curso, { where: { id: parseInt(curso_id, 10) } });
            if (!curso) {
                return res.status(400).json({ mens: 'Curso no existe' });
            }
            const inscripcion = yield transactionalEntityManager.findOne(inscripcionModels_1.Inscripcion, {
                where: {
                    estudiante: { id: parseInt(estudiante_id, 10) },
                    curso: { id: parseInt(curso_id, 10) }
                }
            });
            if (!inscripcion) {
                return res.status(400).json({ mens: 'La inscripción no existe' });
            }
            if (inscripcion.nota > 0) {
                return res.status(400).json({ mens: 'No se puede cancelar la inscripción porque el estudiante ya ha sido calificado' });
            }
            yield transactionalEntityManager.remove(inscripcion);
            res.status(200).json({ mens: 'Inscripción cancelada' });
        }));
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).send(err.message);
    }
});
exports.cancelarInscripcion = cancelarInscripcion;
//-------------------------------------------------------------------------------------------------
const calificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { curso_id, estudiante_id } = req.params;
    const { nota } = req.body;
    //console.log("curso_id:", curso_id, "estudiante_id:", estudiante_id);
    try {
        const inscripcion = yield conexion_1.AppDataSource.getRepository(inscripcionModels_1.Inscripcion).findOne({
            where: { estudiante: { id: parseInt(estudiante_id, 10) }, curso: { id: parseInt(curso_id, 10) } }
        });
        if (!inscripcion) {
            return res.status(404).json({ mens: 'Inscripción no encontrada' });
        }
        inscripcion.nota = parseFloat(nota);
        yield conexion_1.AppDataSource.getRepository(inscripcionModels_1.Inscripcion).save(inscripcion);
        res.status(200).json({ mens: 'Nota actualizada exitosamente' });
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).json({ mens: err.message });
    }
});
exports.calificar = calificar;
