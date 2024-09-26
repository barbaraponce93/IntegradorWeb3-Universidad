import { Request, Response, NextFunction } from "express";
import { Inscripcion } from "../models/inscripcionModels";
import { Curso } from "../models/cursoModel";
import { Estudiante } from "../models/estudianteModel";
import { AppDataSource } from "../db/conexion";


const estudianteRepository = AppDataSource.getRepository(Estudiante);
const cursoRepository = AppDataSource.getRepository(Curso);
const inscripcionesRepository = AppDataSource.getRepository(Inscripcion);

export const inscribir = async (req: Request, res: Response) => {
  const { dni, curso_id } = req.body;

  try {
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const estudiante = await estudianteRepository.findOne({
        where: { dni },
      });
      if (!estudiante) {
        return res.render('crearInscripcion', {
          pagina: 'Crear Inscripción',
          errores: [{ msg: 'Curso no encontrado' }],
          curso: { dni, curso_id } // Retorna los valores del formulario para no perder los datos
      });
      }

      const curso = await cursoRepository.findOne({
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
      await transactionalEntityManager.save(nuevaInscripcion);

      const inscripciones = await AppDataSource.getRepository(Inscripcion).find({
        relations: ["curso", "estudiante"]
        
      });

      return res.redirect('/inscripciones/listarInscripciones');
      
    });
  } catch (error) {
    res.status(500).json({ message: "Error al insertar inscripción", error });
  }
};
//------------------------------------------------------------------------------------------------
export const consultarTodos = async (req: Request, res: Response) => {
  try {
    const inscripciones = await inscripcionesRepository.find({
        relations: ["curso", "estudiante"]
    });
    

     res.render('listarInscripciones', {
                pagina:'Lista de Inscripciones',
                inscripciones: inscripciones
            }) 
  } catch (err: unknown) {
    if (err instanceof Error) res.status(500).send(err.message);
  }
};
//------------------------------------------------------------------------------------------------




//-------------------------------------------------------------------------------------------------
export const consultarPorCurso = async (req: Request, res: Response) => {
  const { nombre } = req.params;

  if (typeof nombre !== 'string') {
    return res.status(400).json({ message: 'Nombre del curso inválido' });
  }

  try {
    //console.log("nombre", nombre);
    const curso = await cursoRepository
      .createQueryBuilder("curso")
      .where("LOWER(curso.nombre) = LOWER(:nombre)", { nombre })
      .getOne();

    if (!curso) {
      return res.status(404).json({ message: "El curso no existe" });
    }
    console.log("Resultado de la consulta del curso:", curso);

    // Obtener las inscripciones del curso, o sea un array con las inscripciones obtenidas a partir del join
    const resultado = await inscripcionesRepository//
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
  } catch (err: unknown) {
    if (err instanceof Error) res.status(500).send(err.message);
  }
};
//-------------------------------------------------------------------------------------------------
export const consultarPorDniEstudiante = async (req: Request, res: Response) => {
   const { dni } = req.params;   

  if (typeof dni !== 'string') {
    return res.status(400).json({ message: 'DNI inválido' });
  }
 
  try {
   // console.log("DNI recibido:", dni);
const estudiante = await estudianteRepository.findOne({ where: { dni: dni } });
console.log("Resultado de la consulta:", estudiante);


      if (!estudiante) {
          return res.status(404).json({ message: 'Estudiante no encontrado' });
      }

      const resultado = await inscripcionesRepository.createQueryBuilder('inscripciones')
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
  } catch (err) {
      if (err instanceof Error) res.status(500).send(err.message);
  }
};


//-------------------------------------------------------------------------------------------------
export const cancelarInscripcion = async (req: Request, res: Response) => {
    const { estudiante_id, curso_id } = req.params;

    try {
        await AppDataSource.transaction(async transactionalEntityManager => {
          
            const estudiante = await transactionalEntityManager.findOne(Estudiante, { where: { id: parseInt(estudiante_id, 10) } });
            if (!estudiante) {
                return res.status(400).json({ mens: 'Estudiante no existe' });
            }

       
            const curso = await transactionalEntityManager.findOne(Curso, { where: { id: parseInt(curso_id, 10) } });
            if (!curso) {
                return res.status(400).json({ mens: 'Curso no existe' });
            }

            const inscripcion = await transactionalEntityManager.findOne(Inscripcion, {
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
           
            await transactionalEntityManager.remove(inscripcion);

            res.status(200).json({ mens: 'Inscripción cancelada' });
        });
  } catch (err: unknown) {
    if (err instanceof Error) res.status(500).send(err.message);
  }
};

//-------------------------------------------------------------------------------------------------
export const calificar = async (req: Request, res: Response) => {
  const { curso_id, estudiante_id } = req.params;
  const { nota } = req.body;
  //console.log("curso_id:", curso_id, "estudiante_id:", estudiante_id);

try {
      const inscripcion = await AppDataSource.getRepository(Inscripcion).findOne({
          where: { estudiante: { id: parseInt(estudiante_id, 10) }, curso: { id: parseInt(curso_id, 10) } }
      });

      if (!inscripcion) {
          return res.status(404).json({ mens: 'Inscripción no encontrada' });
      }

      inscripcion.nota = parseFloat(nota);
      await AppDataSource.getRepository(Inscripcion).save(inscripcion);

   
      res.status(200).json({ mens: 'Nota actualizada exitosamente' });
  } catch (err: unknown) {
      if (err instanceof Error) res.status(500).json({ mens: err.message });
  }
};


