const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 8080;

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

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de gestion des tâches - Authentification et Tasks', 
    version: '1.0.0',
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
      }
    }
  });
});

// Route pour les endpoints non trouvés
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint non trouvé' });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur globale:', error);
  res.status(500).json({ 
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'production' ? {} : error.message
  });
});

app.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`📍 URL: http://localhost:${port}`);
  console.log(`📚 Documentation: http://localhost:${port}`);
});

module.exports = app;
