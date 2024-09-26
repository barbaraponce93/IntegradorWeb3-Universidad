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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.validar = void 0;
const cursoModel_1 = require("../models/cursoModel");
const profesorModel_1 = require("../models/profesorModel");
const conexion_1 = require("../db/conexion");
const express_validator_1 = require("express-validator");
const validar = () => [
    (0, express_validator_1.check)("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 4 })
        .withMessage("El nombre debe ser tener al menos 4 digitos"),
    (0, express_validator_1.check)("descripcion")
        .notEmpty()
        .withMessage("Una breve descripción es obligatoria")
        .isLength({ min: 5 })
        .withMessage("La descripción debe tener al menos 5 caracteres"),
    (0, express_validator_1.check)("profesorId")
        .optional()
        .isNumeric()
        .withMessage("El ID del profesor debe ser un número"),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            // Comprobamos si el usuario está creando o modificando un curso
            const { method } = req; // Usamos el método HTTP para distinguir
            if (method === 'POST') {
                // Si es un POST, es creación
                return res.render("crearCurso", {
                    pagina: "Crear Curso",
                    errores: errores.array(),
                });
            }
            else if (method === 'PUT') {
                // Si es un PUT o PATCH, es modificación
                const { id } = req.params; // Necesitamos el id del curso
                const { nombre, descripcion, profesorId } = req.body;
                return res.render("modificarCurso", {
                    pagina: "Modificar Curso",
                    errores: errores.array(),
                    curso: { id, nombre, descripcion, profesorId }
                });
            }
        }
        next();
    }
];
exports.validar = validar;
const cursoRepository = conexion_1.AppDataSource.getRepository(cursoModel_1.Curso);
const profesorRepository = conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor);
//----------------------------------------------------------------------------------------------------
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cursos = yield cursoRepository.find({
            relations: ["profesor"] //icluye los datos del profesor
        });
        // Verifica si algún curso no tiene profesor asignado
        cursos.forEach(curso => {
            if (!curso.profesor) {
                console.log(`Curso sin profesor: ${curso.nombre}`);
            }
        });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error al consultar los cursos", error });
    }
});
exports.consultarTodos = consultarTodos;
//----------------------------------------------------------------------------------------------------
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = parseInt(id, 10);
    //console.log(idNumber );
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const curso = yield cursoRepository.findOne({ where: { id: parseInt(req.params.id) },
            relations: ["profesor"] //icluye los datos del profesor
        });
        if (!curso) {
            return null;
        }
        return curso;
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Error al consultar el curso: ${err.message}`);
        }
        return null;
    }
});
exports.consultarUno = consultarUno;
//----------------------------------------------------------------------------------------------------
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        return res.render('crearCurso', {
            pagina: 'Crear Curso',
            errores: errores.array()
        });
    }
    const { nombre, descripcion, profesorId } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const existeCurso = yield cursoRepository.findOne({
                where: { nombre }
            });
            if (existeCurso) {
                return res.status(409).json({ message: "El curso ya existe" });
            }
            let profesor = null;
            if (profesorId && !isNaN(parseInt(profesorId, 10))) {
                profesor = yield profesorRepository.findOneBy({ id: parseInt(profesorId, 10) });
                if (!profesor) {
                    return res.render('crearCurso', {
                        pagina: 'Crear Curso',
                        errores: [{ msg: 'Profesor no encontrado' }],
                        curso: { nombre, descripcion, profesorId } // Retornar los valores del formulario para no perder los datos
                    });
                }
            }
            // Crear el nuevo curso, con o sin profesor
            const nuevoCurso = cursoRepository.create({
                nombre,
                descripcion,
                profesor: profesor || null // Si no hay profesor, se establece como null
            });
            yield transactionalEntityManager.save(nuevoCurso);
        }));
        const cursos = yield conexion_1.AppDataSource.getRepository(cursoModel_1.Curso).find({
            relations: ["profesor"]
        });
        res.render('listarCursos', {
            pagina: 'Lista de Cursos',
            cursos
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
    ;
});
exports.insertar = insertar;
//----------------------------------------------------------------------------------------------------
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        return res.render('modificarCurso', {
            pagina: 'Modificar  Curso',
            errores: errores.array(),
        });
    }
    const { id } = req.params;
    const { nombre, descripcion, profesorId } = req.body;
    console.log(profesorId);
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new Error("ID inválido, debe ser un número");
    }
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const curso = yield cursoRepository.findOne({
                where: { id: parseInt(id, 10) },
                relations: ["profesor"]
            });
            if (!curso) {
                return res.status(404).json({ message: "Curso no encontrado" });
            }
            // Buscar y asignar el nuevo profesor solo si se ha proporcionado un ID válido
            let profesor = curso.profesor;
            if (profesorId && !isNaN(parseInt(profesorId, 10))) {
                profesor = yield profesorRepository.findOneBy({ id: parseInt(profesorId, 10) });
                if (!profesor) {
                    return res.render('modificarCurso', {
                        pagina: 'Modificar Curso',
                        errores: [{ msg: 'Profesor no encontrado' }],
                        curso: { id: curso.id, nombre, descripcion, profesorId } // Retornar los valores actuales
                    });
                }
            }
            else if (profesorId === '') {
                profesor = null; // Si el campo está vacío, eliminar la asignación del profesor
            }
            cursoRepository.merge(curso, {
                nombre,
                descripcion,
                profesor
            });
            yield cursoRepository.save(curso);
            return res.redirect('/cursos/listarCursos');
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.modificar = modificar;
//----------------------------------------------------------------------------------------------------
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log("id recibido:", id); // Asegurar que el ID recibido sea correcto
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        console.error('ID recibido no es un número:', id);
        return res.status(400).json({ mensaje: 'ID inválido, debe ser un número' });
    }
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const profesorAsociado = yield profesorRepository.count({
                where: { cursos: { id: idNumber } }
            });
            if (profesorAsociado) {
                throw new Error('Existen profesores asociados a este curso. No se puede eliminar.');
            }
            const deleteResult = yield transactionalEntityManager.delete(cursoModel_1.Curso, { id: idNumber });
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Curso eliminado' });
            }
            else {
                throw new Error('No se encontró el curso a eliminar.');
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
            res.status(500).json({ mensaje: 'Error al eliminar el curso: ' + err.message });
        }
        else {
            console.error('Error desconocido al eliminar el curso');
            res.status(500).json({ mensaje: 'Error desconocido al eliminar el curso.' });
        }
    }
});
exports.eliminar = eliminar;
