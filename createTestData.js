const mongoose = require('mongoose');

// Connexion directe avec l'URI
const MONGO_URI = 'mongodb+srv://superflyman90:hLk54KGcDiTEFuzx@cluster0.cqhpco3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Schémas simplifiés
const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  dueDate: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String,
  name: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);
const User = mongoose.model('User', UserSchema);

async function createTestData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver ou créer un admin
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        email: 'admin@test.com',
        password: '$2b$10$hashedpassword', // Mot de passe hashé fictif
        name: 'Administrateur',
        role: 'admin'
      });
      console.log('👑 Admin créé:', admin.name);
    } else {
      console.log('👑 Admin trouvé:', admin.name);
    }

    // Créer quelques utilisateurs de test
    const users = [];
    for (let i = 1; i <= 3; i++) {
      const existingUser = await User.findOne({ username: `user${i}` });
      if (!existingUser) {
        const user = await User.create({
          username: `user${i}`,
          email: `user${i}@test.com`,
          password: '$2b$10$hashedpassword',
          name: `Utilisateur ${i}`,
          role: 'user'
        });
        users.push(user);
        console.log(`👤 Utilisateur créé: ${user.name}`);
      } else {
        users.push(existingUser);
        console.log(`👤 Utilisateur trouvé: ${existingUser.name}`);
      }
    }

    // Supprimer les anciennes tâches de test
    await Task.deleteMany({ title: { $regex: /^Tâche de test/ } });
    console.log('🗑️ Anciennes tâches de test supprimées');

    // Créer des tâches de test non attribuées
    const testTasks = [
      {
        title: "Tâche de test 1 - Révision code",
        description: "Réviser le code de l'application mobile",
        priority: "high",
        status: "pending",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: admin._id,
        // assignedTo: null (non attribuée)
      },
      {
        title: "Tâche de test 2 - Documentation",
        description: "Mettre à jour la documentation",
        priority: "medium",
        status: "pending",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: admin._id,
        // assignedTo: null (non attribuée)
      },
      {
        title: "Tâche de test 3 - Tests",
        description: "Écrire des tests unitaires",
        priority: "high",
        status: "pending",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: admin._id,
        // assignedTo: null (non attribuée)
      }
    ];

    const createdTasks = await Task.insertMany(testTasks);
    console.log(`✅ ${createdTasks.length} tâches de test créées !`);

    createdTasks.forEach(task => {
      console.log(`   📋 ${task.title} (${task.priority}) - ID: ${task._id}`);
    });

    // Vérifier le total
    const totalTasks = await Task.countDocuments();
    const totalUsers = await User.countDocuments();
    const unassignedTasks = await Task.countDocuments({ assignedTo: { $exists: false } });

    console.log(`\n📊 Résumé:`);
    console.log(`   👥 Utilisateurs total: ${totalUsers}`);
    console.log(`   📋 Tâches total: ${totalTasks}`);
    console.log(`   🎯 Tâches non attribuées: ${unassignedTasks}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Déconnecté de MongoDB');
  }
}

createTestData();
