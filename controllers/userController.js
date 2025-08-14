// controllers/userController.js
import supabase from '../config/supabaseClient.js';
import crypto from 'node:crypto';
import multer from 'multer'
const upload = multer()

// GET /users
export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from('Users').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

// GET /users/:id
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('Users').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// POST /users
export const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
    const { data: userData, error: insertError } = await supabase
      .from('Users')
      .insert([{ user_id: authData.user.id, username, gems: 100, energy: 100, level: 1 }])
      .select();
      
    if (insertError) {
      console.error('Insert Users error:', insertError);
      return res.status(500).json({ error: insertError.message });
    }

    // Login posterior
    console.log('Intentando login después de signup...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.error('Login after signup error:', loginError);
      return res.status(201).json({
        user: userData?.[0] || null,
        message: 'Usuario creado pero falló el login automático.'
      });
    }

    res.status(201).json({
      user: userData[0],
      session: loginData?.session || null
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
};

// POST /avatar
export const postAvatar = async (req, res) => {
  try {
    const user_id = req.body.user_id
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const fileExt = file.originalname.split('.').pop()
    const filePath = `${user_id}/avatar.${fileExt}`

    const { error: uploadError } = await supabase
      .storage
      .from('avatar')
      .upload(filePath, file.buffer, { upsert: true })

    if (uploadError) {
      return res.status(500).json({ error: uploadError.message })
    }

    const { error: updateError } = await supabase
      .from('Users')
      .update({ avatar_url: filePath })
      .eq('user_id', user_id)

    if (updateError) {
      return res.status(500).json({ error: updateError.message })
    }

    return res.status(200).json({ message: 'Avatar uploaded', path: filePath })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/* Login/Register */
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
  // removed verbose session logging

  res.status(200).json({
    message: 'Login exitoso',
    user: data.user,
    session: data.session
  });
};

// POST /users/google  { idToken, username? }
export const loginWithGoogle = async (req, res) => {
  try {
    const { idToken, username } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'Falta idToken de Google' });

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken
      // nonce opcional si lo generas y validas del lado del cliente
    });
    if (error) return res.status(400).json({ error: error.message });

    const session = data?.session || null;
    const user = data?.user || null;
    if (!user || !session) return res.status(400).json({ error: 'No se pudo iniciar sesión con Google' });

    // Asegurar fila en Users
    const authUuid = user.id;
    const { data: found, error: findErr } = await supabase
      .from('Users')
      .select('id, username')
      .eq('user_id', authUuid)
      .maybeSingle();
    if (findErr) {
      return res.status(500).json({ error: findErr.message });
    }

    if (!found) {
      const fallbackName = (
        username || user.user_metadata?.name || user.email?.split('@')?.[0] || `user_${authUuid.slice(0, 8)}`
      );
      const { error: insErr } = await supabase
        .from('Users')
        .insert([{ user_id: authUuid, username: fallbackName, gems: 100, energy: 100, level: 1 }]);
      if (insErr) return res.status(500).json({ error: insErr.message });
    }

    return res.status(200).json({
      message: 'Login Google exitoso',
      user,
      session
    });
  } catch (err) {
    console.error('loginWithGoogle error:', err);
    return res.status(500).json({ error: 'Error inesperado en login con Google' });
  }
};

// GET /users/google-client-id
export const getGoogleClientConfig = async (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  return res.status(200).json({ clientId });
};

// POST /users/google/callback  (Google Identity Services redirect posts here)
export const loginWithGoogleCallback = async (req, res) => {
  try {
    // Soportar tanto GIS (credential) como OIDC form_post (id_token)
    const idToken = req.body?.credential || req.body?.id_token || '';
    const state = req.body?.state || '';
    const gcsrf = req.body?.g_csrf_token || '';
    if (!idToken) return res.status(400).send('Missing credential');

    // Optional: validate g_csrf_token existence
    if (!gcsrf) {
      // proceed but you could enforce CSRF
    }

    // Debug mínimo para diagnosticar causas comunes (mismatch de client_id, etc.)
    let decoded = null;
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        decoded = payload;
        console.log('Google ID Token claims:', {
          iss: payload?.iss,
          aud: payload?.aud,
          email: payload?.email,
          sub: payload?.sub?.slice?.(0, 6) + '...'
        });
      }
    } catch (_) {}

    const expectedAud = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (decoded?.aud && expectedAud && decoded.aud !== expectedAud) {
      console.error('Google Client ID mismatch:', { tokenAud: decoded.aud, expectedAud });
    }

    // In Supabase, si tienes "Skip nonce checks" activado, no envíes nonce en absoluto.
    // Llamar una sola vez sin nonce evita el error "Passed nonce and nonce in id_token should either both exist or not".
    let authData = null;
    let authError = null;
    try {
      const r = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
      authData = r.data;
      authError = r.error;
    } catch (e) {
      authError = e;
    }

    if (authError) {
      console.error('signInWithIdToken error:', authError);
      const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const errMsg = encodeURIComponent(authError?.message || 'auth_failed');
      return res.redirect(302, `${FRONTEND_URL}/loginRegister?google=0&error=${errMsg}`);
    }

    const session = authData?.session || null;
    const user = authData?.user || null;
    if (!user || !session) return res.status(400).send('Session missing');

    // Ensure Users row
    const authUuid = user.id;
    let isNewUser = false;
    const { data: found, error: findErr } = await supabase
      .from('Users')
      .select('id, username')
      .eq('user_id', authUuid)
      .maybeSingle();
    if (findErr) {
      return res.status(500).send('DB error');
    }
    if (!found) {
      const fallbackName = (
        user.user_metadata?.name || user.email?.split('@')?.[0] || `user_${authUuid.slice(0, 8)}`
      );
      const { error: insErr } = await supabase
        .from('Users')
        .insert([{ user_id: authUuid, username: fallbackName, gems: 100, energy: 100, level: 1 }]);
      if (insErr) {
        return res.status(500).send('Insert error');
      }
      isNewUser = true;
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${FRONTEND_URL}/loginRegister?google=1&needs_password=${isNewUser ? '1' : '0'}&access_token=${encodeURIComponent(session.access_token)}&user_id=${encodeURIComponent(user.id)}`;
    return res.redirect(302, redirectUrl);
  } catch (err) {
    console.error('loginWithGoogleCallback fatal error:', err);
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(302, `${FRONTEND_URL}/?google=0`);
  }
};

/* Profile */
// GET /users/profile
export const getProfile = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Falta token de autorización' });
  }

  const token = authHeader.split(' ')[1];

  // Verifica token con Supabase Auth.
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData?.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  const userId = authData.user.id;

  // Busca los datos del usuario.
  let { data: userData, error: userError } = await supabase
    .from('Users')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (userError) {
    return res.status(500).json({ error: userError.message });
  }

  // Si el usuario aún no existe en la tabla Users, crearlo on-the-fly
  if (!userData) {
    const fallbackName = (
      authData.user.user_metadata?.name || authData.user.email?.split('@')?.[0] || `user_${userId.slice(0, 8)}`
    );
    const insertPayload = { user_id: userId, username: fallbackName, gems: 100, energy: 100, level: 1 };
    const { data: inserted, error: insertErr } = await supabase
      .from('Users')
      .insert([insertPayload])
      .select('*')
      .single();
    if (insertErr) {
      // Si hubo un conflicto por inserción concurrente, reintentar selección
      const { data: selected, error: selectErr } = await supabase
        .from('Users')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (selectErr) {
        return res.status(500).json({ error: selectErr.message });
      }
      userData = selected;
    } else {
      userData = inserted;
    }
  }

  res.status(200).json({
    user: {
      ...userData,
      email: authData.user.email,
      authId: authData.user.id,
    }
  });
};

// POST /users/password { password }
export const setPassword = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Falta token de autorización' });
    }
    const token = authHeader.split(' ')[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const userId = authData.user.id;
    const userEmail = authData.user.email;
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, { password });
    if (updateErr) {
      return res.status(500).json({ error: updateErr.message });
    }

    // Iniciar sesión con email+password para emitir un nuevo access_token inmediato
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password
    });
    if (loginErr) {
      // Si no se pudo iniciar por algún motivo, al menos confirmar el cambio
      return res.status(200).json({ message: 'Contraseña actualizada. Volvé a iniciar sesión con tu nueva contraseña.' });
    }
    return res.status(200).json({ message: 'Contraseña actualizada', user: loginData.user, session: loginData.session });
  } catch (err) {
    console.error('setPassword error:', err);
    return res.status(500).json({ error: 'Error inesperado' });
  }
};
// DELETE /users/:id
export const deleteUser = async (req, res) => {
  const userId = req.user.id; // ya viene del token

  try {
    // 1. Borra de tu tabla Users
    const { error: deleteDataError } = await supabase
      .from('Users')
      .delete()
      .eq('user_id', userId);

    if (deleteDataError) {
      console.error('Error al borrar datos de Users:', deleteDataError);
      return res.status(500).json({ error: deleteDataError.message });
    }

    // 2. Borra al usuario de Supabase Auth
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('Error al borrar usuario en Auth:', deleteAuthError);
      return res.status(500).json({ error: deleteAuthError.message });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  } catch (err) {
    console.error('Error inesperado al eliminar usuario:', err);
    res.status(500).json({ error: 'Error inesperado en el servidor.' });
  }
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