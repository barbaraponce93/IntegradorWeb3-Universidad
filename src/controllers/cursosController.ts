import { Request, Response, NextFunction} from "express";
import { Curso } from "../models/cursoModel";
import { Profesor } from "../models/profesorModel";
import { AppDataSource } from "../db/conexion";
import { check, validationResult } from "express-validator";




export const validar = () => [

  check("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 4 })
    .withMessage("El nombre debe ser tener al menos 4 digitos"),

    check("descripcion")
      .notEmpty()
      .withMessage("Una breve descripción es obligatoria")
      .isLength({ min: 5})
      .withMessage("La descripción debe tener al menos 5 caracteres"),
      
      check("profesorId")
      .optional()
      .isNumeric()
      .withMessage("El ID del profesor debe ser un número"),


    (req: Request, res: Response, next: NextFunction) => {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {

        // Comprobamos si el usuario está creando o modificando un curso
        const { method } = req; // Usamos el método HTTP para distinguir
  
        if (method === 'POST') {
          // Si es un POST, es creación
          return res.render("crearCurso", {
            pagina: "Crear Curso",
            errores: errores.array(),
          });
        } else if (method === 'PUT') {
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


const cursoRepository = AppDataSource.getRepository(Curso);
const profesorRepository = AppDataSource.getRepository(Profesor);



//----------------------------------------------------------------------------------------------------

export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const cursos = await cursoRepository.find({
        relations: ["profesor"]//icluye los datos del profesor
        
    });
     // Verifica si algún curso no tiene profesor asignado
     cursos.forEach(curso => {
      if (!curso.profesor) {
        console.log(`Curso sin profesor: ${curso.nombre}`);
      }
    });
    res.render('listarCursos',{
      pagina: 'Lista de Cursos',
      cursos
    })
   
  
  } catch (error: unknown) {
    res.status(500).json({ message: "Error al consultar los cursos", error });
  }
};

//----------------------------------------------------------------------------------------------------
export const consultarUno = async (req: Request, res: Response):Promise<Curso | null> =>  {
  const {id}=req.params;
  const idNumber = parseInt(id, 10);
  //console.log(idNumber );

  if (isNaN(idNumber)) {
  throw new Error('ID inválido, debe ser un número');
}
  try {
    const curso = await cursoRepository.findOne({where: {id: parseInt(req.params.id)},
     relations: ["profesor"] //icluye los datos del profesor
    });
    if (!curso) {
      return null;
    }
   return curso;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error al consultar el curso: ${err.message}`);
    }
    return null;
  }
};

//----------------------------------------------------------------------------------------------------
export const insertar = async (req: Request, res: Response) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
 return res.render('crearCurso', {
      pagina: 'Crear Curso',
    errores: errores.array()
  });
  }
  const { nombre, descripcion, profesorId } = req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => { 
      const existeCurso = await cursoRepository.findOne({
        where: { nombre }
      });
      
      if (existeCurso) {
        return res.status(409).json({ message: "El curso ya existe" });
      }


      let profesor = null;
      if (profesorId && !isNaN(parseInt(profesorId, 10))) {
          profesor = await profesorRepository.findOneBy({ id: parseInt(profesorId, 10) });
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
      
       await transactionalEntityManager.save(nuevoCurso);
    });
    const cursos = await AppDataSource.getRepository(Curso).find({
      relations: ["profesor"]
    });
    res.render('listarCursos', {
      pagina: 'Lista de Cursos',
      cursos

    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
  }
};
}

//----------------------------------------------------------------------------------------------------

export const modificar = async (req: Request, res: Response) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
   return res.render('modificarCurso', {
      pagina: 'Modificar  Curso',
    errores: errores.array(),

  
  });
  }
  const { id } = req.params;
const { nombre, descripcion, profesorId } = req.body;
console.log(profesorId) ;
const idNumber = parseInt(id, 10);

if (isNaN(idNumber)) {
  throw new Error("ID inválido, debe ser un número");
}

try {
  await AppDataSource.transaction(async (transactionalEntityManager) => {
    const curso = await cursoRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["profesor"]
    });

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    // Buscar y asignar el nuevo profesor solo si se ha proporcionado un ID válido
  let profesor = curso.profesor;
if (profesorId && !isNaN(parseInt(profesorId, 10))) {
    profesor = await profesorRepository.findOneBy({ id: parseInt(profesorId, 10) });
    if (!profesor) {
        return res.render('modificarCurso', {
            pagina: 'Modificar Curso',
            errores: [{ msg: 'Profesor no encontrado' }],
            curso: { id: curso.id, nombre, descripcion, profesorId } // Retornar los valores actuales
        });
    }
} else if (profesorId === '') {
  profesor = null; // Si el campo está vacío, eliminar la asignación del profesor
}

    cursoRepository.merge(curso, {
      nombre,
      descripcion,
      profesor
    });

    await cursoRepository.save(curso);
    return res.redirect('/cursos/listarCursos');
  });
} catch (err: unknown) {
  if (err instanceof Error) {
    res.status(500).send(err.message);
  }
}
};
//----------------------------------------------------------------------------------------------------
export const eliminar = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("id recibido:", id); // Asegurar que el ID recibido sea correcto

  const idNumber = parseInt(id, 10);

  if (isNaN(idNumber)) {
    console.error('ID recibido no es un número:', id);
    return res.status(400).json({ mensaje: 'ID inválido, debe ser un número' });
  }

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const profesorAsociado = await profesorRepository.count({
        where: { cursos: { id: idNumber } }
      });

      if (profesorAsociado) {
        throw new Error('Existen profesores asociados a este curso. No se puede eliminar.');
      }

      const deleteResult = await transactionalEntityManager.delete(Curso, { id: idNumber });

      if (deleteResult.affected === 1) {
        return res.json({ mensaje: 'Curso eliminado' });
      } else {
        throw new Error('No se encontró el curso a eliminar.');
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
      res.status(500).json({ mensaje: 'Error al eliminar el curso: ' + err.message });
    } else {
      console.error('Error desconocido al eliminar el curso');
      res.status(500).json({ mensaje: 'Error desconocido al eliminar el curso.' });
    }
  }
}
