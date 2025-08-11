const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier les champs requis
    if (!email || !password || !name || !username) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = new User({
      email,
      password: hashedPassword,
      name,
      username
    });

    await user.save();

    // Générer le token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    console.log('POST /login reçu avec body :', req.body);
    const { usernameOrEmail, password, email, username } = req.body;
    
    // Support pour les anciens formats (email/username) et nouveau format (usernameOrEmail)
    const loginField = usernameOrEmail || email || username;
    
    if (!loginField || !password) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis' });
    }
    
    // Chercher l'utilisateur par email OU username
    const user = await User.findOne({
      $or: [
        { email: loginField },
        { username: loginField }
      ]
    });
    
    if (!user) {
      console.log('Aucun utilisateur trouvé pour:', loginField);
      return res.status(400).json({ message: 'Identifiant ou mot de passe incorrect' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour l\'utilisateur', loginField);
      return res.status(400).json({ message: 'Identifiant ou mot de passe incorrect' });
    }
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    const response = {
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role // Ajouter le rôle dans la réponse
      }
    };
    console.log('Réponse envoyée à /login :', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
