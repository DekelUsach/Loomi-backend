// controllers/userController.js
import supabase from '../config/supabaseClient.js';

// GET /users
export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// GET /users/:id
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// POST /users
export const createUser = async (req, res) => {
  const { email, password, ...rest } = req.body;
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return res.status(400).json({ error: authError.message });

  // opcional: guardar datos adicionales en tabla 'Users'
  const { data, error } = await supabase
    .from('Users')
    .insert([{ user_id: authData.user.id, ...rest }]);
  if (error) return res.status(500).json({ error: error.message });

  //Loguea al usuario
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) return res.status(400).json({ error: loginError.message });

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({
    user: data[0],
    session: loginData.session
  });
};

// POST /users/login
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ error: 'Faltan email o password' });
//   }

//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password
//   });

//   if (error || !data.session) {
//     return res.status(401).json({ error: error?.message || 'Credenciales inválidas' });
//   }

//   // Devolvemos al cliente los tokens y datos de usuario
//   return res.json({
//     accessToken: data.session.access_token,
//     refreshToken: data.session.refresh_token,
//     user: data.user
//   });
// };

// PUT /users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // req.user viene de tu middleware authenticate
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { data, error } = await supabase
    .from('Users')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};


// Metodo Login

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Verificar si existe el email en tu tabla personalizada (Users)
  const { data: userData, error: userError } = await supabase
    .from('Users')
    .select('*')
    .eq('mail', email) // Asegurate que la columna sea "mail"
    .single();

  if (userError || !userData) {
    return res.status(404).json({ error: 'El email no está registrado.' });
  }

  // Hacer login con Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: 'La contraseña es incorrecta.' });
  }

  res.status(200).json({
    message: 'Login exitoso',
    user: data.user,
    session: data.session
  });
};




// Base de textos

// const textos (texto) => {
  // esta funcion se encuentra en standBy, es necesario que se implementen las funcionalidades de inteligencia artificial
  // let parrafos = []; // con IA 
  // let titulo = 'lo que haga la  IA';

  // insert into userLoadedTexts titulo = titulo;

  // Aca debería empezar a recorrer el array, crear las imagenes e insertar los parrafos
  // De la funcionalidad con IA debería salir la URL de la imagen creada guardada en Storage y el contenido del párrafo y el orden en el que vaya.
  

  // foreach(...){
    // insert into userLoadedParagraph content = contenido, imageURL = URL que devuelva la ia, order = orden que haya devuelto la ia, idText = id del texto del scope de la funcion.
  // }

// }