import { NextFunction, Request, Response } from "express";
import { Estudiante } from "../models/estudianteModel";
import { AppDataSource } from "../db/conexion";
import { check, validationResult } from "express-validator";
import { Inscripcion } from '../models/inscripcionModels';
//var estudiantes: Estudiante[]; 

const estudianteRepository = AppDataSource.getRepository(Estudiante);

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

   
    (req: Request, res: Response, next: NextFunction) => {
      const errores = validationResult(req);
      if (!errores.isEmpty()) {

        //segun el metodo de la peticion sera la vista que se renderize
        const { method } = req; // Usamos el método HTTP para distinguir
  
        if (method === 'POST') {
         
          return res.render("crearEstudiantes", {
            pagina: "Crear Estudiante",
            errores: errores.array(),
            
          });
        } else if (method === 'PUT') {
          const { id } = req.params; 
          const{dni, nombre, apellido, email}=req.body;
  
          return res.render("modificarEstudiante", {
            pagina: "Modificar Estudiante",
            errores: errores.array(),
            estudiante: {id,dni, nombre, apellido, email}
          });
        }
      }
  
      next();
    }
  ];
//----------------------------------------------------------------------------------------------------
export const consultarTodos = async (req: Request, res: Response) => {

  try {
    const estudiantes = await estudianteRepository.find();
    res.render('listarEstudiantes',{
      pagina: 'Lista de Estudiantes',
      estudiantes
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).send(err.message);
  }
  }
};
//----------------------------------------------------------------------------------------------------
export const consultarUno = async (req: Request, res: Response): Promise<Estudiante | null> => {
  const { id } = req.params;
  const idNumber = Number(id);

  if (isNaN(idNumber)) {
    throw new Error('ID inválido, debe ser un número');
  }

  try {
    const estudiante = await estudianteRepository.findOne({
      where: { id: idNumber },
    });

    if (!estudiante) {
      return null;  // Devuelve null si no se encuentra el estudiante
    }

    return estudiante;  // Devuelve el estudiante, (esto se usa en el modificar)
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Error al consultar el estudiante: ${err.message}`);
    }
    return null;
  }
};
//----------------------------------------------------------------------------------------------------
export const insertar = async (req: Request, res: Response) => {
  const errores=validationResult(req);
  if(!errores.isEmpty()){
   // return res.status(400).json({ errores: errores.array() });//lo uso para ver las validaciones en postman,luego lo comento
    return res.render('crearEstudiantes', {
      pagina: 'Crear Estudiante',
    errores: errores.array()
  });
}
  const{dni, nombre, apellido, email}=req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const existeEstudiante=await estudianteRepository.findOne({
        where: [ {dni},{email} ]
      });

      if(existeEstudiante){
        throw new Error('El estudiante ya existe');
      };

    const nuevoEstudiante = estudianteRepository.create({dni,nombre,apellido,email});
    await estudianteRepository.save(nuevoEstudiante);

    //console.log('Estudiante insertado correctamente');
   //res.status(200).json(nuevoEstudiante); //lo uso para ver el estudiante insertado en postaman,luego lo comento

    });
    const estudiantes = await AppDataSource.getRepository(Estudiante).find();
    res.render('listarEstudiantes', {
      pagina: 'Lista de Estudiantes',
      estudiantes

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
    const estudiante = await estudianteRepository.findOne({ where: { id: idNumber } });

    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

   
    estudianteRepository.merge(estudiante, { dni, nombre, apellido, email });
    await estudianteRepository.save(estudiante);

    // Redirige despues de la actualización 
    return res.redirect('/estudiantes/listarEstudiantes');
  } catch (err: unknown) {
    // Manejo de errores en el bloque try
    if (err instanceof Error) {
      return res.status(500).send(err.message);
    }
  }
};

//----------------------------------------------------------------------------------------------------
export const eliminar = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("id recibido:", id);
  const idNumber = parseInt(id, 10);
  if (isNaN(idNumber) ) {
   // return res.status(400).json({ message: "Id inválido, por favor ingrese un valor numérico " });
   throw new Error('ID inválido, debe ser un número');
}
  try {
  await AppDataSource.transaction(async transactionalEntityManager => {
    const inscripcionesRepository = transactionalEntityManager.getRepository(Inscripcion);
   
    const cursosinscriptos = await inscripcionesRepository.count({ where: { estudiante: { id: Number(id) } } });

    if (cursosinscriptos > 0) {
        throw new Error('Estudiante cursando materias, no se puede eliminar');
    }
    const deleteResult = await estudianteRepository.delete(id);

    if (deleteResult.affected === 1) {
        return res.json({ mensaje: 'Estudiante eliminado' }); 
    } else {
        throw new Error('Estudiante no encontrado');
    }
});
} catch (err: unknown) {
if (err instanceof Error) {
    res.status(400).json({ mensaje: err.message });
} else {
    res.status(400).json({ mensaje: 'Error' });
}
}
};
