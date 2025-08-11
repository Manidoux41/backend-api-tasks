const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = async (req, res, next) => {
  try {
    const user = req.user; // Utiliser req.user au lieu de chercher dans la DB
    
    // Vérification temporaire : permettre à n'importe qui de créer le premier admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('🔓 Aucun admin trouvé, accès temporaire accordé pour créer le premier admin');
      return next();
    }
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé. Droits administrateur requis.' });
    }
    next();
  } catch (error) {
    console.error('Erreur dans isAdmin:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// GET /api/admin/users - Obtenir tous les utilisateurs
router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/users - Créer un nouvel utilisateur (admin uniquement)
router.post('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, username, role = 'user' } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email ou nom d\'utilisateur existe déjà' });
    }

    // Hacher le mot de passe
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
      role: role // Permettre de définir le rôle
    });

    await user.save();

    // Retourner l'utilisateur créé (sans le mot de passe)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: 'Utilisateur créé avec succès',
      user: userResponse 
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/stats - Obtenir les statistiques globales
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = await Task.countDocuments({ completed: false });
    
    // Tâches par priorité
    const highPriorityTasks = await Task.countDocuments({ priority: 'high' });
    const mediumPriorityTasks = await Task.countDocuments({ priority: 'medium' });
    const lowPriorityTasks = await Task.countDocuments({ priority: 'low' });
    
    // Tâches en retard
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      completed: false
    });
    
    // Tâches créées aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasksCreatedToday = await Task.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // Utilisateurs actifs (qui ont des tâches)
    const activeUsers = await Task.distinct('userId').then(userIds => userIds.length);
    
    res.json({
      stats: {
        totalUsers,
        totalTasks,
        completedTasks,
        pendingTasks,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
        overdueTasks,
        tasksCreatedToday,
        activeUsers,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/admin/tasks - Obtenir toutes les tâches de tous les utilisateurs
router.get('/tasks', authenticate, isAdmin, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('userId', 'name email username')
      .sort({ createdAt: -1 });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/admin/tasks - Créer une tâche pour un utilisateur spécifique
router.post('/tasks', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, description, dueDate, priority, userId } = req.body;

    // Vérifier que l'utilisateur cible existe
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      userId,
      completed: false
    });

    await task.save();
    
    // Peupler les informations utilisateur pour la réponse
    await task.populate('userId', 'name email username');
    
    res.status(201).json({ 
      task,
      message: `Tâche créée avec succès pour ${targetUser.name}` 
    });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/admin/tasks/:id - Modifier une tâche (n'importe laquelle)
router.put('/tasks/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, completed, userId } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Si userId est fourni, vérifier que l'utilisateur existe
    if (userId && userId !== task.userId.toString()) {
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Utilisateur cible non trouvé' });
      }
    }

    // Mettre à jour les champs fournis
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (completed !== undefined) task.completed = completed;
    if (userId !== undefined) task.userId = userId;

    await task.save();
    await task.populate('userId', 'name email username');

    res.json({ 
      task,
      message: 'Tâche mise à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/tasks/:id - Supprimer une tâche (n'importe laquelle)
router.delete('/tasks/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/admin/users/:id/role - Modifier le rôle d'un utilisateur
router.put('/users/:id/role', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide. Utilisez "admin" ou "user".' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Empêcher un admin de se retirer ses propres droits
    if (id === req.userId && role === 'user') {
      return res.status(400).json({ message: 'Vous ne pouvez pas retirer vos propres droits administrateur' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: `Rôle de ${user.name} modifié en ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la modification du rôle:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/admin/tasks/:id/assign - Attribuer une tâche existante à un utilisateur
router.put('/tasks/:id/assign', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    // Vérifier que la tâche existe
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }

    // Vérifier que l'utilisateur destinataire existe
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) {
      return res.status(404).json({ message: 'Utilisateur destinataire non trouvé' });
    }

    // Attribuer la tâche
    task.assignedTo = assignedTo;
    task.assignedBy = req.user._id;
    await task.save();

    console.log(`✅ Tâche "${task.title}" attribuée à ${targetUser.name} par ${req.user.name}`);

    res.json({
      message: `Tâche attribuée à ${targetUser.name}`,
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
  priority: task.priority,
  completed: task.completed,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
        assignedBy: task.assignedBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'attribution de la tâche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/admin/tasks/:id/assign - Retirer l'attribution d'une tâche
router.delete('/tasks/:id/assign', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    task.assignedTo = null;
    task.assignedBy = null;
    await task.save();
    res.json({ message: 'Attribution retirée', task });
  } catch (error) {
    console.error('Erreur lors du retrait de l\'attribution:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
