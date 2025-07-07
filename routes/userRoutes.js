import { Router } from 'express';
import { getAllUsers, getUserById, createUser } from '../controllers/userController.js';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById); // Esta ruta es un ejemplo de como se puede acceder a un usuario por su id
router.post('/', createUser); //Esta ruta es un ejemplo de como se puede crear un nuevo usuario




// aca se pueden agregar más rutas relacionadas con los usuarios

//Procedo a explicar como funciona esta carpeta que es medio confusa
/*
Las rutas que se definen en este archivo son "mini rutas" que se encargan de manejar las peticiones relacionadas con los usuarios.
Por ejemplo, la ruta '/api/users' se encarga de manejar las peticiones GET a la lista de usuarios, y la ruta '/api/users/hola' se encarga de manejar las peticiones GET a la ruta '/hola'. En este caso '/hola' 
es solo un ejemplo practico. 

Cada vez que se accede desde el index.js a la ruta '/api/users', se ejecuta la función getAllUsers que está en el archivo userController.js. Lo que pasa aca es que a la ruta /api/users se le suma ese
'/' perteneciente a la ruta que se define en el get que en este caso se hace desde postman, por lo que la ruta completa es /api/users/.
En el caso de la ruta '/api/users/hola', se ejecuta la función que se define en la ruta '/hola', que en este caso es una función anónima que simplemente devuelve un mensaje de saludo. Entonces, 
a la ruta '/api/users' se le suma el '/hola' que es la ruta que se define en el get que en este caso se hace desde postman, por lo que la ruta completa es /api/users/hola.

Ahora, si nos fijamos bien en el index, hay una linea de codigo que dice app.use('/api/users', userRoutes);. Esto lo que hace es decirle a la aplicación que
 todas las rutas que se definan en el archivo userRoutes.js van a estar disponibles bajo la ruta '/api/users'. Por lo tanto, si se accede a la ruta '/api/users', 
 se ejecuta la función getAllUsers que se encuentra en el archivo userController.js, y si se accede a la ruta '/api/users/hola', se ejecuta la función anónima que devuelve un mensaje de saludo.

chicos, espero que lo entiendan cuando lo vean, a mi me costó un poco entenderlo.
*/ 

export default router;
