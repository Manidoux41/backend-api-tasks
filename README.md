# 🚀 Backend API - Gestionnaire de Tâches

## 📖 Description

API REST complète pour la gestion de tâches avec authentification JWT. Construite avec Node.js, Express et MongoDB.

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB Atlas** - Base de données NoSQL
- **JWT** - Authentification sécurisée
- **bcrypt** - Hachage des mots de passe
- **CORS** - Gestion des requêtes cross-origin

## ⚙️ Installation

### 1. Installer les dépendances
```bash
cd backend
npm install
```

### 2. Configuration environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos vraies valeurs
nano .env
```

### 3. Variables d'environnement (.env)
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
PORT=8080
NODE_ENV=development
```

### 4. Démarrage
```bash
# Développement (avec nodemon)
npm run dev

# Production
npm start
```

## 🌐 URL de base
```
http://localhost:8080/api
```

## 🔑 Authentification

L'API utilise JWT (JSON Web Token). Après connexion, incluez le token dans l'en-tête :
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📚 Endpoints

### 🔐 Authentification

#### Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com", 
  "password": "motdepasse123",
  "name": "John Doe"
}
```

**Réponse :**
```json
{
  "message": "Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a9b2c1234567890abcde",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "motdepasse123"
}
```

**Réponse :**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f8a9b2c1234567890abcde",
    "username": "johndoe",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### 📋 Gestion des Tâches

> **Note :** Toutes les routes de tâches nécessitent un token d'authentification.

#### Créer une tâche
```http
POST /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Terminer le projet",
  "description": "Finaliser les dernières fonctionnalités",
  "dueDate": "2025-08-15",
  "priority": "high"
}
```

**Réponse :**
```json
{
  "message": "Tâche créée avec succès",
  "task": {
    "_id": "64f8b1c5d1234567890abcdf",
    "title": "Terminer le projet",
    "description": "Finaliser les dernières fonctionnalités",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "priority": "high",
    "completed": false,
    "userId": "64f8a9b2c1234567890abcde",
    "createdAt": "2025-08-10T10:30:00.000Z",
    "updatedAt": "2025-08-10T10:30:00.000Z"
  }
}
```

#### Récupérer toutes les tâches
```http
GET /api/tasks
Authorization: Bearer YOUR_JWT_TOKEN
```

**Paramètres optionnels :**
- `completed=true/false` - Filtrer par statut
- `priority=low/medium/high` - Filtrer par priorité
- `sortBy=dueDate/createdAt/priority` - Trier les résultats

**Exemple :**
```http
GET /api/tasks?completed=false&priority=high&sortBy=dueDate
```

**Réponse :**
```json
{
  "message": "Tâches récupérées avec succès",
  "count": 2,
  "tasks": [
    {
      "_id": "64f8b1c5d1234567890abcdf",
      "title": "Terminer le projet",
      "description": "Finaliser les dernières fonctionnalités",
      "dueDate": "2025-08-15T00:00:00.000Z",
      "priority": "high",
      "completed": false,
      "userId": "64f8a9b2c1234567890abcde",
      "createdAt": "2025-08-10T10:30:00.000Z",
      "updatedAt": "2025-08-10T10:30:00.000Z"
    }
  ]
}
```

#### Récupérer une tâche spécifique
```http
GET /api/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse :**
```json
{
  "message": "Tâche récupérée avec succès",
  "task": {
    "_id": "64f8b1c5d1234567890abcdf",
    "title": "Terminer le projet",
    "description": "Finaliser les dernières fonctionnalités",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "priority": "high",
    "completed": false,
    "userId": "64f8a9b2c1234567890abcde",
    "createdAt": "2025-08-10T10:30:00.000Z",
    "updatedAt": "2025-08-10T10:30:00.000Z"
  }
}
```

#### Mettre à jour une tâche
```http
PUT /api/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Projet terminé",
  "completed": true,
  "priority": "medium"
}
```

**Réponse :**
```json
{
  "message": "Tâche mise à jour avec succès",
  "task": {
    "_id": "64f8b1c5d1234567890abcdf",
    "title": "Projet terminé",
    "description": "Finaliser les dernières fonctionnalités",
    "dueDate": "2025-08-15T00:00:00.000Z",
    "priority": "medium",
    "completed": true,
    "userId": "64f8a9b2c1234567890abcde",
    "createdAt": "2025-08-10T10:30:00.000Z",
    "updatedAt": "2025-08-10T11:45:00.000Z"
  }
}
```

#### Supprimer une tâche
```http
DELETE /api/tasks/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Réponse :**
```json
{
  "message": "Tâche supprimée avec succès"
}
```

## 📊 Codes de statut HTTP

| Code | Description |
|------|-------------|
| 200 | ✅ Succès |
| 201 | ✅ Créé avec succès |
| 400 | ❌ Requête incorrecte |
| 401 | ❌ Non autorisé |
| 404 | ❌ Non trouvé |
| 500 | ❌ Erreur serveur |

## 🧪 Test avec cURL

### Inscription
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Créer une tâche (remplacer YOUR_TOKEN)
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Task",
    "description": "Une tâche de test",
    "dueDate": "2025-08-20",
    "priority": "medium"
  }'
```

### Récupérer les tâches
```bash
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛡️ Sécurité

- **Mots de passe** : Hachés avec bcrypt
- **JWT** : Tokens sécurisés avec expiration
- **CORS** : Configuration pour le frontend
- **Validation** : Données d'entrée validées
- **MongoDB** : Requêtes sécurisées contre l'injection

## 🔧 Scripts npm

```bash
# Démarrage en développement
npm run dev

# Démarrage en production  
npm start

# Seeding de données de test
npm run seed

# Affichage des données
npm run show-data
```

## 📂 Structure du projet

```
backend/
├── src/
│   ├── index.js          # Point d'entrée
│   ├── middleware/
│   │   └── auth.js       # Middleware d'authentification
│   ├── models/
│   │   ├── User.js       # Modèle utilisateur
│   │   └── Task.js       # Modèle tâche
│   └── routes/
│       ├── auth.js       # Routes d'authentification
│       └── tasks.js      # Routes des tâches
├── .env.example          # Template configuration
├── package.json
└── README.md
```

## 🚀 Déploiement

### Variables d'environnement production
```bash
MONGODB_URI=mongodb+srv://prod-user:secure-password@prod-cluster.mongodb.net/prod-db
JWT_SECRET=production-super-secret-jwt-key-minimum-32-characters
PORT=8080
NODE_ENV=production
```

### Commandes de déploiement
```bash
# Installation
npm install --production

# Démarrage
npm start
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs du serveur
2. Consultez `MONGODB_TROUBLESHOOTING.md`
3. Vérifiez la configuration `.env`

---

## 🎯 Exemple d'utilisation complète

```bash
# 1. Inscription
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@test.com","password":"demo123","name":"Demo User"}' | \
  jq -r '.token')

# 2. Créer une tâche
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Ma première tâche",
    "description": "Description de la tâche",
    "dueDate": "2025-08-20",
    "priority": "high"
  }'

# 3. Récupérer les tâches
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Votre API est maintenant prête à être utilisée !**
