import supabase from '../config/supabaseClient.js';

export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase
    .from('Users')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json(data);
};


//Crea un nuevo usuario en la base de datos
export const createUser = async (req, res) => {
  const { username, mail, gems, energy, password, level } = req.body;

  // 1. Crear usuario en Supabase Auth (esto guarda email y password de manera segura)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: mail,
    password: password,
    email_confirm: true,
    });

  if (authError) {
    return res.status(500).json({ error: authError.message });
  }

  // 2. Guardar datos personalizados en tu tabla Users
  // Usa auth_user_id como referencia al usuario autenticado
  const { data, error } = await supabase
    .from('Users')
    .insert([{
      user_id: authData.user.id, // UUID generado por Supabase Auth
      username,
      gems,
      energy,
      level
    }])
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};  
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const { data, error } = await supabase
    .from('Users')
    .update({ name, email })
    .eq('id', id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: 'User not found' });
  }

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