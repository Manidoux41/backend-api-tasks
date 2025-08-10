// Script pour afficher les utilisateurs et tâches insérés
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Task = require('./src/models/Task');

async function showData() {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find();
  const tasks = await Task.find().populate('userId', 'username email');

  console.log('Utilisateurs :');
  users.forEach(u => {
    console.log(`- ${u.role} | ${u.username} | ${u.email} | ${u.name}`);
  });

  console.log('\nTâches :');
  tasks.forEach(t => {
    console.log(`- ${t.title} | ${t.description} | Pour: ${t.userId ? t.userId.username : 'N/A'} | Échéance: ${t.dueDate.toISOString().slice(0,10)}`);
  });

  await mongoose.disconnect();
}

showData().catch(console.error);
