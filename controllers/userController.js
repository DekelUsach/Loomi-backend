import supabase from '../config/supabaseClient.js';
// En este archivo se definen las funciones que manejan las peticiones relacionadas con los usuarios. En realidad,
// los archivos se pueden dividir en que rol va a manjear cada uno de ellos. Por ejemplo, si se quiere manejar
// los textos, se puede crear un archivo llamado textosController.js y dentro de ese archivo
// se pueden definir las funciones que manejan las peticiones relacionadas con los textos. Esto nomas da mas organizacion.
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

  if (!data) {
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