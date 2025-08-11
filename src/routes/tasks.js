const express = require('express');
const Task = require('../models/Task');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Créer une tâche
router.post('/', async (req, res) => {
  console.log('POST /api/tasks', { headers: req.headers, body: req.body });
  try {
    const { title, description, dueDate, priority } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ message: "Le titre et la date d'échéance sont requis" });
    }
    const task = new Task({
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
  userId: req.user._id,
  // by default, a created task is unassigned
  assignedTo: null,
  assignedBy: null
    });
    await task.save();
    res.status(201).json({ message: 'Tâche créée avec succès', task });
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la tâche', error: error.message });
  }
});

// Récupérer toutes les tâches de l'utilisateur (ou toutes les tâches si admin)
router.get('/', async (req, res) => {
  try {
    const { completed, priority, sortBy = 'dueDate' } = req.query;
    
    // Si l'utilisateur est admin, il peut voir toutes les tâches
    let filter = {};
    if (req.user.role !== 'admin') {
      // Un utilisateur standard voit les tâches qui lui sont attribuées ou qu'il a créées
      filter.$or = [
        { assignedTo: req.user._id },
        { userId: req.user._id }
      ];
    }
    
    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) {
      filter.priority = priority;
    }
    
    const tasks = await Task.find(filter).sort({ [sortBy]: 1 });
    res.json({
      message: 'Tâches récupérées avec succès',
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
  }
});

// Récupérer une tâche spécifique par ID
router.get('/:id', async (req, res) => {
  try {
    const baseFilter = { _id: req.params.id };
    let filter;
    if (req.user.role === 'admin') {
      filter = baseFilter; // admin peut voir n'importe quelle tâche
    } else {
      filter = { $and: [
        baseFilter,
        { $or: [ { assignedTo: req.user._id }, { userId: req.user._id } ] }
      ]};
    }
    const task = await Task.findOne(filter);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche récupérée avec succès', task });
  } catch (error) {
    console.error('Erreur lors de la récupération de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la tâche', error: error.message });
  }
});

// Mettre à jour une tâche
router.put('/:id', async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed, assignedTo } = req.body;
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (priority !== undefined) updateData.priority = priority;
    if (completed !== undefined) updateData.completed = completed;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;
    
    // Admins can update any task (including reassign). Users can update only their own/assigned tasks
    let filter;
    if (req.user.role === 'admin') {
      filter = { _id: req.params.id };
      if (assignedTo !== undefined) {
        updateData.assignedBy = req.user._id;
      }
    } else {
      filter = { _id: req.params.id, $or: [ { userId: req.user._id }, { assignedTo: req.user._id } ] };
    }

    const task = await Task.findOneAndUpdate(filter, updateData, { new: true });
    
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    
    res.json({ message: 'Tâche mise à jour avec succès', task });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la tâche', error: error.message });
  }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée' });
    }
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la tâche:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la tâche', error: error.message });
  }
});

module.exports = router;
