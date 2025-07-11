import supabase from '../config/supabaseClient.js';

export const getProfile = async (req, res) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader) {
      return res.status(401).json({ error: 'Falta token de autorización' });
    }
  
    const token = authHeader.split(' ')[1];
  
    // 1. Verificar token con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
  
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  
    const userId = authData.user.id;
  
    // 2. Buscar datos personalizados en tu tabla Users
    const { data: userData, error: userError } = await supabase
      .from('Users')
      .select('*')
      .eq('user_id', userId)
      .single();
  
    if (userError || !userData) {
      return res.status(404).json({ error: 'No se encontraron datos del usuario' });
    }
  
    // 3. Enviar respuesta combinada si querés
    res.status(200).json({
      auth: authData.user,   // datos básicos: id, email
      profile: userData      // tus datos personalizados
    });
  };
  