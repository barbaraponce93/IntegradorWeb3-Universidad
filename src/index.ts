import app from './app';
import { initializeDatabase  } from './db/conexion';
import * as dotenv from 'dotenv';
dotenv.config();

const port=parseInt(process.env.PORT || '6505',10);
const host=process.env.HOST || '0.0.0.0';


async function main(){
    try{
        await initializeDatabase();
        console.log('Base de datos conectada');

        app.listen(port , host , ()=>{
            console.log(`Servidor activo en el puerto ${6505}`);

        });
    }catch (err:unknown){
        if(err instanceof Error){
            console.log('Error al conectar con la base de datos', err.message);
        }
    }
}

main();