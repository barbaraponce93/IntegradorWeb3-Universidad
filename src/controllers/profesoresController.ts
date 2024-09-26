import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../db/conexion";
import { Profesor } from "../models/profesorModel";
import { check, validationResult } from "express-validator";
import { Curso } from "../models/cursoModel";

export const profesoresRepository = AppDataSource.getRepository(Profesor);


export const validar = () => [
  check("dni")
    .notEmpty()
    .withMessage("El dni es obligatorio")
    .isLength({ min: 7 })
    .withMessage("El dni debe ser de 7 digitos"),

  check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),

  check("apellido")
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("El apellido debe tener al menos 3 caracteres"),

  check("email").isEmail().withMessage("El email debe ser válido"),

  check("profesion")
    .notEmpty()
    .withMessage("  La profesión es obligatorio")
    .isLength({ min: 4 })
    .withMessage("La profesiòn debe tener al menos 4 caracteres"),

  check("telefono")
    .notEmpty()
    .withMessage("El telefono es obligatorio")
    .isLength({ min: 8 })
    .withMessage("El telefono debe tener al menos 8 digitos"),


  (req: Request, res: Response, next: NextFunction) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {

      //segun el metodo de la peticion sera la vista que se renderize
      const { method } = req; 

      if (method === 'POST') {
       
        return res.render("crearProfesor", {
          pagina: "Crear Profesor",
          errores: errores.array(),
        });
      } else if (method === 'PUT') {
        const { id } = req.params; 
        const { dni, nombre, apellido, email, profesion, telefono } = req.body;

        return res.render("modificarProfesor", {
          pagina: "Modificar Profesor",
          errores: errores.array(),
          profesor: {id,dni,nombre, apellido, email, profesion, telefono}
        });
      }
    }

    next();
  }
];

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const profesores = await profesoresRepository.find();
    console.log(profesores); 
      // Verifica si la lista de profesores está vacía
      if (!profesores || profesores.length === 0) {
        return res.render('listarProfesores', {
          pagina: 'Lista de Profesores',
          profesores: [],  // Pasa una lista vacía para evitar el error
        });
      }
      res.render('listarProfesores', {
        pagina: 'Lista de Profesores',  
        profesores  // Asegúrate de pasar la variable profesores correctamente
      });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
    }
  }
};

export const consultarUno = async (req: Request, res: Response) : Promise<Profesor | null> => {
  const { id } = req.params;
  const idNumber = Number(id);
  if (isNaN(idNumber)) {
    throw new Error('ID inválido, debe ser un número');
  }
  try {
    const profesor = await profesoresRepository.findOne({
      where: { id: idNumber },
    });
    if (!profesor) {
      return null;

    }
   return profesor;
  } catch (err: unknown) {
    if (err instanceof Error){
      res.status(500).json({ message: "Error al consultar profesores", err });
  }
  return null;
  }
};

export const insertar = async (req: Request, res: Response) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.render("crearProfesor", {
      pagina: "Carga de Profesores",
      errores: errores.array(),
    });
  }
  const { dni, nombre, apellido, email, profesion, telefono } = req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const existeProfesor = await profesoresRepository.findOne({
        where: [{ dni }, { email }, { telefono }],
      });
      if (existeProfesor) {
        return res.status(400).json({ message: "El profesor ya existe" });
      }

      const nuevoProfesor = profesoresRepository.create({dni,nombre, apellido,email,profesion,telefono});
      await profesoresRepository.save(nuevoProfesor);
       const profesores=await profesoresRepository.find();
       res.render('listarProfesores',{
         pagina: 'Lista de Profesores',
         profesores
       })
    });
  } catch (err: unknown) {
    if (err instanceof Error)
      res.status(500).json({ message: "Error al consultar profesores", err });
  }
};

export const modificar = async (req: Request, res: Response) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    //return res.status(400).json({ errores: errores.array() });
     return res.render('modificarProfesor',{
        pagina: 'Carga de Profesores',
        errores:errores.array()

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
    const profesor = await profesoresRepository.findOneBy({
      id: parseInt(req.params.id),
    });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor no encontrado" });
    }

    profesoresRepository.merge(profesor, {dni,nombre,apellido,email,profesion,telefono});
    await profesoresRepository.save(profesor);
   // res.json(profesor);
    return res.redirect('/profesores/listarProfesores');
  } catch (err: unknown) {
    if (err instanceof Error)
      res.status(500).json({ message: "Error al consultar profesores", err });
  }
};
export const eliminar = async (req: Request, res: Response) => {
  const { id } = req.params;
  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber)) {
    // return res.status(400).json({ message: "Id inválido, por favor ingrese un valor numérico " });
    throw new Error("ID inválido, debe ser un número");
  }
  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const cursosRepository = transactionalEntityManager.getRepository(Curso);
      const cursosDictado = await cursosRepository.count({
        where: { profesor: { id: Number(id) } },
      });

      if (cursosDictado > 0) {
        return res.status(400).json({message:"No se puede eliminar el profesor porque tiene cursos a su cargo"});
      }
      const deleteResult = await profesoresRepository.delete(req.params.id);
      if (deleteResult.affected === 1) {
        return res.json({ mensaje: "Profesor eliminado" });
      } else {
        throw new Error("Profesor no encontrado");
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error)
      res.status(500).json({ message: "Error al consultar profesores", err });
  }
};
