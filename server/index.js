import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import mdRoutes from './routes/mdRoutes.js';
import managerRoutes from './routes/managerRoutes.js';
import accountantRoutes from './routes/accountantRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import hrRoutes from './routes/hrRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Allow all CORS access
app.use(cors());
app.options('*', cors());

app.use(express.json());

// Test DB connection
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};
testDbConnection();

// API Routes
app.use('/auth', authRoutes);
app.use('/md', mdRoutes);
app.use('/hr', hrRoutes);
app.use('/manager', managerRoutes);
app.use('/employee', employeeRoutes);
app.use('/accountant', accountantRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
