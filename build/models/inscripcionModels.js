"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inscripcion = void 0;
const typeorm_1 = require("typeorm");
const estudianteModel_1 = require("./estudianteModel");
const cursoModel_1 = require("./cursoModel");
let Inscripcion = class Inscripcion {
};
exports.Inscripcion = Inscripcion;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Inscripcion.prototype, "estudiante_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Inscripcion.prototype, "curso_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: () => 0 }) // default le agrega cero cuando inscribo al estudiante
    ,
    __metadata("design:type", Number)
], Inscripcion.prototype, "nota", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', default: () => 'CURRENT_DATE' }) // default le agrega la fecha actual
    ,
    __metadata("design:type", Date)
], Inscripcion.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => estudianteModel_1.Estudiante, (estudiante) => estudiante.cursos) //
    ,
    (0, typeorm_1.JoinColumn)({ name: 'estudiante_id' }),
    __metadata("design:type", estudianteModel_1.Estudiante)
], Inscripcion.prototype, "estudiante", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cursoModel_1.Curso, (curso) => curso.estudiantes),
    (0, typeorm_1.JoinColumn)({ name: 'curso_id' }),
    __metadata("design:type", cursoModel_1.Curso)
], Inscripcion.prototype, "curso", void 0);
exports.Inscripcion = Inscripcion = __decorate([
    (0, typeorm_1.Entity)('inscripciones')
], Inscripcion);
exports.default = Inscripcion;
