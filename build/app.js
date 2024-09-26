"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors")); // middleware que permite o restringe las solicitudes entre diferentes dominios
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const estudiantesRoutes_1 = __importDefault(require("./routes/estudiantesRoutes"));
const profesoresRoutes_1 = __importDefault(require("./routes/profesoresRoutes"));
const app = (0, express_1.default)();
const method_override_1 = __importDefault(require("method-override"));
const cursosRoutes_1 = __importDefault(require("./routes/cursosRoutes"));
const inscripcionesRoutes_1 = __importDefault(require("./routes/inscripcionesRoutes"));
//habilitamos pug
app.set('view engine', 'pug');
app.set('views', path_1.default.join(__dirname, '/views'));
//carpeta pblica
app.use(express_1.default.static('public'));
app.use((0, method_override_1.default)('_method'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    return res.render('layout', {
        pagina: 'App Universidad',
    });
});
app.use('/estudiantes', estudiantesRoutes_1.default); // ruta para manejar solicitudes /estudiantes
app.use('/profesores', profesoresRoutes_1.default);
app.use('/cursos', cursosRoutes_1.default);
app.use('/inscripciones', inscripcionesRoutes_1.default);
exports.default = app;
