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
const estudianteModel_1 = require("../models/estudianteModel");
const conexion_1 = require("../db/conexion");
const express_validator_1 = require("express-validator");
const inscripcionModels_1 = require("../models/inscripcionModels");
//var estudiantes: Estudiante[]; 
const estudianteRepository = conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante);
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
    (req, res, next) => {
        const errores = (0, express_validator_1.validationResult)(req);
        if (!errores.isEmpty()) {
            //segun el metodo de la peticion sera la vista que se renderize
            const { method } = req; // Usamos el método HTTP para distinguir
            if (method === 'POST') {
                return res.render("crearEstudiantes", {
                    pagina: "Crear Estudiante",
                    errores: errores.array(),
                });
            }
            else if (method === 'PUT') {
                const { id } = req.params;
                const { dni, nombre, apellido, email } = req.body;
                return res.render("modificarEstudiante", {
                    pagina: "Modificar Estudiante",
                    errores: errores.array(),
                    estudiante: { id, dni, nombre, apellido, email }
                });
            }
        }
        next();
    }
];
exports.validar = validar;
//----------------------------------------------------------------------------------------------------
const consultarTodos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const estudiantes = yield estudianteRepository.find();
        res.render('listarEstudiantes', {
            pagina: 'Lista de Estudiantes',
            estudiantes
        });
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(err.message);
        }
    }
});
exports.consultarTodos = consultarTodos;
//----------------------------------------------------------------------------------------------------
const consultarUno = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const idNumber = Number(id);
    if (isNaN(idNumber)) {
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        const estudiante = yield estudianteRepository.findOne({
            where: { id: idNumber },
        });
        if (!estudiante) {
            return null; // Devuelve null si no se encuentra el estudiante
        }
        return estudiante; // Devuelve el estudiante, (esto se usa en el modificar)
    }
    catch (err) {
        if (err instanceof Error) {
            throw new Error(`Error al consultar el estudiante: ${err.message}`);
        }
        return null;
    }
});
exports.consultarUno = consultarUno;
//----------------------------------------------------------------------------------------------------
const insertar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errores = (0, express_validator_1.validationResult)(req);
    if (!errores.isEmpty()) {
        // return res.status(400).json({ errores: errores.array() });//lo uso para ver las validaciones en postman,luego lo comento
        return res.render('crearEstudiantes', {
            pagina: 'Crear Estudiante',
            errores: errores.array()
        });
    }
    const { dni, nombre, apellido, email } = req.body;
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const existeEstudiante = yield estudianteRepository.findOne({
                where: [{ dni }, { email }]
            });
            if (existeEstudiante) {
                throw new Error('El estudiante ya existe');
            }
            ;
            const nuevoEstudiante = estudianteRepository.create({ dni, nombre, apellido, email });
            yield estudianteRepository.save(nuevoEstudiante);
            //console.log('Estudiante insertado correctamente');
            //res.status(200).json(nuevoEstudiante); //lo uso para ver el estudiante insertado en postaman,luego lo comento
        }));
        const estudiantes = yield conexion_1.AppDataSource.getRepository(estudianteModel_1.Estudiante).find();
        res.render('listarEstudiantes', {
            pagina: 'Lista de Estudiantes',
            estudiantes
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
        return res.render('modificarEstudiante', {
            pagina: 'Modificar Estudiante',
            errores: errores.array(),
        });
    }
    const { id } = req.params;
    const { dni, nombre, apellido, email } = req.body;
    //console.log('Datos recibidos:', { dni, nombre, apellido, email }); 
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        return res.status(400).json({ message: 'ID inválido, debe ser un número' });
    }
    try {
        const estudiante = yield estudianteRepository.findOne({ where: { id: idNumber } });
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        estudianteRepository.merge(estudiante, { dni, nombre, apellido, email });
        yield estudianteRepository.save(estudiante);
        // Redirige despues de la actualización 
        return res.redirect('/estudiantes/listarEstudiantes');
    }
    catch (err) {
        // Manejo de errores en el bloque try
        if (err instanceof Error) {
            return res.status(500).send(err.message);
        }
    }
});
exports.modificar = modificar;
//----------------------------------------------------------------------------------------------------
const eliminar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log("id recibido:", id);
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        // return res.status(400).json({ message: "Id inválido, por favor ingrese un valor numérico " });
        throw new Error('ID inválido, debe ser un número');
    }
    try {
        yield conexion_1.AppDataSource.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            const inscripcionesRepository = transactionalEntityManager.getRepository(inscripcionModels_1.Inscripcion);
            const cursosinscriptos = yield inscripcionesRepository.count({ where: { estudiante: { id: Number(id) } } });
            if (cursosinscriptos > 0) {
                throw new Error('Estudiante cursando materias, no se puede eliminar');
            }
            const deleteResult = yield estudianteRepository.delete(id);
            if (deleteResult.affected === 1) {
                return res.json({ mensaje: 'Estudiante eliminado' });
            }
            else {
                throw new Error('Estudiante no encontrado');
            }
        }));
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ mensaje: err.message });
        }
        else {
            res.status(400).json({ mensaje: 'Error' });
        }
    }
});
exports.eliminar = eliminar;
