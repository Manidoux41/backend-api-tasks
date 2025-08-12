## Déploiement Backend sur Render

### Étapes pour déployer sur Render.com :

1. **Aller sur https://render.com**
2. **Se connecter avec GitHub**
3. **Créer un nouveau "Web Service"**
4. **Sélectionner le repository GitHub de votre backend**
5. **Configurer le service :**
   - **Name**: `todo-api-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`

6. **Ajouter les variables d'environnement :**
   ```
   MONGO_URI=mongodb+srv://manidoux41:KnQRPcZOOb5T2cGD@cluster0.3bntn.mongodb.net/supabase-api?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

7. **Cliquer sur "Create Web Service"**

### Après le déploiement :

1. Render vous donnera une URL comme : `https://todo-api-backend-xxx.onrender.com`
2. Testez l'API : `https://votre-url.onrender.com/`
3. Vous devriez voir la réponse JSON de l'API

### Mettre à jour l'app mobile :

Modifiez `mobile/constants/api.ts` avec la nouvelle URL Render :
```typescript
export const API_BASE_URL = isDevelopment 
  ? Platform.OS === 'android' 
    ? 'http://10.0.2.2:8080/api'
    : 'http://localhost:8080/api'
  : 'https://votre-url.onrender.com/api';
```

### Avantages de Render :

✅ **Simple** : Configuration en un clic  
✅ **Fiable** : Pas de problèmes de configuration comme Vercel  
✅ **Gratuit** : Plan free avec 750h par mois  
✅ **Auto-redémarrage** : Redémarre automatiquement si l'app plante  
✅ **HTTPS** : SSL automatique  

### URL finale attendue :
Votre API sera accessible à une URL comme :
`https://todo-api-backend-xxxx.onrender.com`
