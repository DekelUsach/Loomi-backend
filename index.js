import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import textRoutes from './routes/textRoutes.js';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
dotenv.config();
const app = express();

app.use(express.json());
app.use('/users', userRoutes);
app.use('/texts', textRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
