const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import des routes depuis le dossier src
const authRoutes = require('../src/routes/auth');
const taskRoutes = require('../src/routes/tasks');
const adminRoutes = require('../src/routes/admin');

const app = express();

// Middlewares de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ Erreur de connexion à MongoDB:', error.message);
    console.log('💡 Suggestions de résolution:');
    console.log('  1. Vérifiez votre connexion internet');
    console.log('  2. Ajoutez votre IP à la whitelist MongoDB Atlas');
    console.log('  3. Vérifiez que l\'URL de connexion est correcte');
    console.log('  4. Ou utilisez MongoDB local avec: mongodb://localhost:27017/supabase-api');
    console.log('⚠️  Le serveur continuera sans base de données - certaines fonctionnalités ne fonctionneront pas');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// Route de health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route de test d'API
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'API endpoints are accessible',
    version: '1.1.2',
    timestamp: new Date().toISOString()
  });
});

// Route de test
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'API de gestion des tâches - Backend fonctionnel', 
    version: '1.1.2',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    database: 'Connected to MongoDB Atlas',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      tasks: {
        create: 'POST /api/tasks',
        getAll: 'GET /api/tasks',
        getById: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        getByDate: 'GET /api/tasks/by-date/:date',
        markComplete: 'PATCH /api/tasks/:id/complete'
      },
      admin: {
        users: 'GET /api/admin/users',
        stats: 'GET /api/admin/stats',
        assignTask: 'PUT /api/admin/tasks/:id/assign',
        unassignTask: 'DELETE /api/admin/tasks/:id/assign'
      }
    }
  });
});

// Route pour les endpoints non trouvés
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Endpoint non trouvé',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'production' ? {} : error.message
  });
});

// Export pour Vercel (pas de app.listen)
module.exports = app;
