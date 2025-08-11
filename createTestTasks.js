const mongoose = require('mongoose');
require('dotenv').config();

// Modèles
const Task = require('./src/models/Task');
const User = require('./src/models/User');

const testTasks = [
  {
    title: "Révision du code client mobile",
    description: "Vérifier et optimiser le code de l'application mobile",
    priority: "high",
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
  },
  {
    title: "Mise à jour de la documentation API",
    description: "Documenter les nouvelles routes et endpoints",
    priority: "medium",
    status: "pending",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
  },
  {
    title: "Tests d'intégration",
    description: "Écrire et exécuter les tests d'intégration pour les nouvelles fonctionnalités",
    priority: "high",
    status: "pending",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
  },
  {
    title: "Optimisation des performances",
    description: "Analyser et améliorer les performances de l'application",
    priority: "medium",
    status: "pending",
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Dans 10 jours
  },
  {
    title: "Formation utilisateurs",
    description: "Préparer et organiser une session de formation pour les nouveaux utilisateurs",
    priority: "low",
    status: "pending",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
  }
];

async function createTestTasks() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver un admin pour créer les tâches
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Aucun admin trouvé. Créez d\'abord un compte admin.');
      process.exit(1);
    }

    console.log(`👑 Admin trouvé: ${admin.name} (${admin.email})`);

    // Supprimer les anciennes tâches de test
    await Task.deleteMany({ title: { $in: testTasks.map(t => t.title) } });
    console.log('🗑️ Anciennes tâches de test supprimées');

    // Créer les nouvelles tâches
    const tasksToCreate = testTasks.map(task => ({
      ...task,
      userId: admin._id, // Créées par l'admin
      createdBy: admin._id,
    }));

    const createdTasks = await Task.insertMany(tasksToCreate);
    console.log(`✅ ${createdTasks.length} tâches de test créées avec succès !`);

    createdTasks.forEach(task => {
      console.log(`   📋 ${task.title} (${task.priority})`);
    });

    console.log('\n🎯 Ces tâches peuvent maintenant être attribuées à d\'autres utilisateurs via l\'interface admin.');

  } catch (error) {
    console.error('❌ Erreur lors de la création des tâches de test:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

createTestTasks();
