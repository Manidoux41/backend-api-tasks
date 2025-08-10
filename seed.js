// Script de seed pour MongoDB Atlas
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Task = require('./src/models/Task');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  // Nettoyage des collections
  await User.deleteMany({});
  await Task.deleteMany({});

  // Création des utilisateurs
  const adminPassword = await bcrypt.hash('Noah0410!', 10);
  const admin = new User({
    name: 'Administrateur',
    username: 'admin',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
  });
  const user = new User({
    name: 'Utilisateur classique',
    username: 'user',
    email: 'user@example.com',
    password: await bcrypt.hash('userpass', 10),
    role: 'user',
  });
  await admin.save();
  await user.save();

  // Création de 10 tâches pour l'utilisateur classique
  const tasks = [];
  for (let i = 1; i <= 10; i++) {
    tasks.push({
      title: `Tâche ${i}`,
      description: `Description de la tâche ${i}`,
      completed: false,
      userId: user._id,
      dueDate: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // aujourd'hui + i jours
    });
  }
  await Task.insertMany(tasks);

  console.log('✅ Données de test insérées !');
  await mongoose.disconnect();
}

seed().catch(console.error);
