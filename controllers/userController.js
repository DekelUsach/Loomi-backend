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
  try {
    console.log('Body recibido:', req.body);
    const { username, email, password, ...rest } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'El campo username es obligatorio.' });
    }

    // Crea el usuario en auth.users.
    const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
    if (authError) {
      console.error('signUp error:', authError);
      console.log('authData:', authData, 'authError:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Guarda datos adicionales
    const { data, error } = await supabase
      .from('Users')
      .insert([{ user_id: authData.user.id, username, ...rest }])
      .select();
      console.log('Insert data:', data, 'Insert error:', error);
    if (error) {
      console.error('Insert Users error:', error);
      return res.status(500).json({ error: error.message });
    }

    // Login posterior
    console.log('Intentando login después de signup...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.error('Login after signup error:', loginError);
      return res.status(201).json({
        user: data[0],
        message: 'Usuario creado pero fallo el login automático.'
      });
    }

    res.status(201).json({
      user: data[0],
      session: loginData.session
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
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
    .from('Users')
    .update(updates)
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// POST /users/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Loguea al usuario
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return res.status(400).json({ error: error.message });

  const user = data.user;

  if (!user) {
    return res.status(401).json({ error: 'No se pudo autenticar el usuario.' });
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