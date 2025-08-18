import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import textRoutes from './routes/textRoutes.js';
import energyRoutes from './routes/energyRoutes.js';
import ragRoutes from './routes/ragRoutes.js';
import gemsRoutes from './routes/gemsRoutes.js';
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
dotenv.config();
const app = express();
import cors from 'cors';
const corsOptions = {
  origin: ['http://localhost:5173'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/users', userRoutes);
app.use('/texts', textRoutes);
app.use('/energy', energyRoutes)
app.use('/gems', gemsRoutes)
app.use('/rag', ragRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
