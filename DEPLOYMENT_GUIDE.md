# API TODO - Déploiement Backend

## Déploiement sur Render

1. Aller sur [render.com](https://render.com)
2. Se connecter avec GitHub
3. Créer un nouveau "Web Service"
4. Connecter le repository GitHub
5. Configurer :
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Node Version**: 18

## Variables d'environnement à ajouter sur Render :

- `MONGO_URI`: `mongodb+srv://manidoux41:KnQRPcZOOb5T2cGD@cluster0.3bntn.mongodb.net/supabase-api?retryWrites=true&w=majority&appName=Cluster0`
- `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production`
- `JWT_EXPIRES_IN`: `7d`
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render utilise ce port)

## Alternative : Déploiement direct

Si vous voulez éviter les plateformes cloud, vous pouvez :

1. Utiliser ngrok pour exposer l'API locale
2. Héberger sur un VPS simple
3. Utiliser Heroku (bien que payant maintenant)
