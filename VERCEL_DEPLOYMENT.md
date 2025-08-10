# 🚀 Guide de Déploiement Vercel

## 📋 Prérequis

- ✅ Compte GitHub avec le projet pushé
- ✅ Compte Vercel (gratuit) - [vercel.com](https://vercel.com)
- ✅ MongoDB Atlas configuré et accessible
- ✅ Variables d'environnement prêtes

## 🔗 Étape 1 : Connecter GitHub à Vercel

### 1.1 Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur **"Sign Up"**
3. Choisissez **"Continue with GitHub"**
4. Autorisez Vercel à accéder à votre GitHub

### 1.2 Importer le projet
1. Sur le dashboard Vercel, cliquez **"New Project"**
2. Recherchez votre repository `supabase-api` (ou le nom de votre repo)
3. Cliquez **"Import"** sur le repository backend

## ⚙️ Étape 2 : Configuration du déploiement

### 2.1 Configuration du projet
```
Project Name: task-manager-api (ou votre choix)
Framework Preset: Other
Root Directory: backend/ (IMPORTANT!)
Build Command: npm run vercel-build
Output Directory: (laisser vide)
Install Command: npm install
```

### 2.2 Variables d'environnement
Dans la section **"Environment Variables"**, ajoutez :

```bash
MONGODB_URI = mongodb+srv://votre-username:votre-password@votre-cluster.mongodb.net/votre-database
JWT_SECRET = votre-cle-secrete-jwt-minimum-32-caracteres
JWT_EXPIRES_IN = 7d
NODE_ENV = production
PORT = 3000
```

⚠️ **IMPORTANT** : Utilisez vos vraies valeurs, pas les exemples !

## 🛡️ Étape 3 : Préparer MongoDB Atlas

### 3.1 Configurer l'accès réseau
1. Connectez-vous à [MongoDB Atlas](https://cloud.mongodb.com)
2. Allez dans **Network Access**
3. Cliquez **"Add IP Address"**
4. Sélectionnez **"Allow access from anywhere"** (0.0.0.0/0)
5. Cliquez **"Confirm"**

### 3.2 Vérifier la string de connexion
```bash
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

## 🚀 Étape 4 : Déployer

1. Cliquez **"Deploy"**
2. Attendez la compilation (2-3 minutes)
3. ✅ Votre API est en ligne !

## 🔗 Étape 5 : Tester le déploiement

### 5.1 URL de votre API
Vercel vous donnera une URL comme :
```
https://task-manager-api-abc123.vercel.app
```

### 5.2 Test de base
```bash
# Test de santé
curl https://votre-url-vercel.vercel.app/api/

# Test d'inscription
curl -X POST https://votre-url-vercel.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "name": "Test User"
  }'
```

## 📱 Étape 6 : Mettre à jour l'app mobile

Dans votre projet mobile, mettez à jour `mobile/constants/api.ts` :

```typescript
export const API_BASE_URL = 'https://votre-url-vercel.vercel.app/api';
```

## 🔄 Redéploiement automatique

✅ **Avantage Vercel** : Chaque push sur GitHub redéploie automatiquement !

```bash
# Dans votre dossier backend local
git add .
git commit -m "Update API configuration"
git push origin main

# Vercel redéploie automatiquement !
```

## 🛠️ Dépannage

### ❌ Erreur 500 - Internal Server Error
1. Vérifiez les variables d'environnement
2. Vérifiez la connexion MongoDB
3. Consultez les logs Vercel

### ❌ Erreur de connexion MongoDB
1. Vérifiez l'IP whitelist (0.0.0.0/0)
2. Vérifiez username/password MongoDB
3. Vérifiez le nom de la database

### ❌ Routes non trouvées
1. Vérifiez le fichier `vercel.json`
2. Vérifiez que Root Directory = `backend/`

## 📊 Monitoring

### Logs Vercel
1. Dashboard Vercel > Votre projet
2. Onglet **"Functions"**
3. Cliquez sur une fonction pour voir les logs

### Performance
- Functions tab : Temps d'exécution
- Analytics tab : Statistiques d'usage

## 🎯 URLs importantes

- **API Production** : `https://votre-projet.vercel.app/api`
- **Dashboard Vercel** : [vercel.com/dashboard](https://vercel.com/dashboard)
- **Documentation** : `https://votre-projet.vercel.app/api` (retourne info API)

## ✅ Checklist finale

- [ ] Repository GitHub poussé
- [ ] Compte Vercel créé et connecté
- [ ] Projet importé avec Root Directory = `backend/`
- [ ] Variables d'environnement configurées
- [ ] MongoDB Atlas accessible (IP 0.0.0.0/0)
- [ ] Déploiement réussi
- [ ] Tests API fonctionnels
- [ ] App mobile mise à jour avec nouvelle URL

---

🎉 **Félicitations ! Votre API est maintenant accessible publiquement sur Vercel !**

📱 N'oubliez pas de mettre à jour l'URL dans votre application mobile pour qu'elle pointe vers votre nouvelle API en production.
