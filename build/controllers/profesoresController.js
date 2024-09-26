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
exports.eliminar = exports.modificar = exports.insertar = exports.consultarUno = exports.consultarTodos = exports.validar = exports.profesoresRepository = void 0;
const conexion_1 = require("../db/conexion");
const profesorModel_1 = require("../models/profesorModel");
const express_validator_1 = require("express-validator");
const cursoModel_1 = require("../models/cursoModel");
exports.profesoresRepository = conexion_1.AppDataSource.getRepository(profesorModel_1.Profesor);
const validar = () => [
    (0, express_validator_1.check)("dni")
        .notEmpty()
        .withMessage("El dni es obligatorio")
        .isLength({ min: 7 })
        .withMessage("El dni debe ser de 7 digitos"),
    (0, express_validator_1.check)("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres"),
    (0, express_validator_1.check)("apellido")
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("El apellido debe tener al menos 3 caracteres"),
    (0, express_validator_1.check)("email").isEmail().withMessage("El email debe ser válido"),
    (0, express_validator_1.check)("profesion")
        .notEmpty()
        .withMessage("  La profesión es obligatorio")
        .isLength({ min: 4 })
        .withMessage("La profesiòn debe tener al menos 4 caracteres"),
    (0, express_validator_1.check)("telefono")
        .notEmpty()
        .withMessage("El telefono es obligatorio")
        .isLength({ min: 8 })
        .withMessage("El telefono debe tener al menos 8 digitos"),
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            //segun el metodo de la peticion sera la vista que se renderize
            const { method } = req;
            if (method === 'POST') {
                return res.render("crearProfesor", {
                    pagina: "Crear Profesor",
                    errores: errores.array(),
                });
            }
            else if (method === 'PUT') {
                const { id } = req.params;
                const { dni, nombre, apellido, email, profesion, telefono } = req.body;
                return res.render("modificarProfesor", {
                    pagina: "Modificar Profesor",
                    errores: errores.array(),
                    profesor: { id, dni, nombre, apellido, email, profesion, telefono }
                });
            }
        }
        next();
    }
];
exports.validar = validar;
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profesores = yield exports.profesoresRepository.find();
        console.log(profesores);
        // Verifica si la lista de profesores está vacía
        if (!profesores || profesores.length === 0) {
            return res.render('listarProfesores', {
                pagina: 'Lista de Profesores',
                profesores: [], // Pasa una lista vacía para evitar el error
            });
        }
        res.render('listarProfesores', {
            pagina: 'Lista de Profesores',
            profesores // Asegúrate de pasar la variable profesores correctamente
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const profesor = yield exports.profesoresRepository.findOne({
            where: { id: idNumber },
        });
        if (!profesor) {
            return null;
        }
        return profesor;
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: "Error al consultar profesores", err });
        }
        return null;
    }
});
exports.consultarUno = consultarUno;
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        return res.render("crearProfesor", {
            pagina: "Carga de Profesores",
            errores: errores.array(),
        });
    }
    const { dni, nombre, apellido, email, profesion, telefono } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const existeProfesor = yield exports.profesoresRepository.findOne({
                where: [{ dni }, { email }, { telefono }],
            });
            if (existeProfesor) {
                return res.status(400).json({ message: "El profesor ya existe" });
            }
            const nuevoProfesor = exports.profesoresRepository.create({ dni, nombre, apellido, email, profesion, telefono });
            yield exports.profesoresRepository.save(nuevoProfesor);
            const profesores = yield exports.profesoresRepository.find();
            res.render('listarProfesores', {
                pagina: 'Lista de Profesores',
                profesores
            });
        }));
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).json({ message: "Error al consultar profesores", err });
    }
});
exports.insertar = insertar;
const modificar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        //return res.status(400).json({ errores: errores.array() });
        return res.render('modificarProfesor', {
            pagina: 'Carga de Profesores',
            errores: errores.array()
        });
    }
    const { id } = req.params;
    const { dni, nombre, apellido, email, profesion, telefono } = req.body;
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        // return res.status(400).json({ message: "Id inválido, por favor ingrese un valor numérico " });
        throw new Error("ID inválido, debe ser un número");
    }
    try {
        const profesor = yield exports.profesoresRepository.findOneBy({
            id: parseInt(req.params.id),
        });
        if (!profesor) {
            return res.status(404).json({ message: "Profesor no encontrado" });
        }
        exports.profesoresRepository.merge(profesor, { dni, nombre, apellido, email, profesion, telefono });
        yield exports.profesoresRepository.save(profesor);
        // res.json(profesor);
        return res.redirect('/profesores/listarProfesores');
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).json({ message: "Error al consultar profesores", err });
    }
});
exports.modificar = modificar;
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        // return res.status(400).json({ message: "Id inválido, por favor ingrese un valor numérico " });
        throw new Error("ID inválido, debe ser un número");
    }
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const cursosRepository = transactionalEntityManager.getRepository(cursoModel_1.Curso);
            const cursosDictado = yield cursosRepository.count({
                where: { profesor: { id: Number(id) } },
            });
            if (cursosDictado > 0) {
                return res.status(400).json({ message: "No se puede eliminar el profesor porque tiene cursos a su cargo" });
            }
            const deleteResult = yield exports.profesoresRepository.delete(req.params.id);
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: "Profesor eliminado" });
            }
            else {
                throw new Error("Profesor no encontrado");
            }
        }));
    }
    catch (err) {
        if (err instanceof Error)
            res.status(500).json({ message: "Error al consultar profesores", err });
    }
});
exports.eliminar = eliminar;
