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

  const { data, error } = await supabase
    .from('Users')
    .insert([{  username, mail, gems, energy, password, level }])
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