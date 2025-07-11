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

  // opcional: guardar datos adicionales en tabla 'users'
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: authData.user.id, email, ...rest }]);
  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ user: data[0] });
};

// POST /users/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan email o password' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.session) {
    return res.status(401).json({ error: error?.message || 'Credenciales inválidas' });
  }

  // Devolvemos al cliente los tokens y datos de usuario
  return res.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: data.user
  });
};

// PUT /users/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // req.user viene de tu middleware authenticate
  if (req.user.id !== id) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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