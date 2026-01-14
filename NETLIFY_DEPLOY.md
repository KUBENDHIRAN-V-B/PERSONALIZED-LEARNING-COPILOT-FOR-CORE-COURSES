# Netlify Deployment Guide

## Your Netlify Site
URL: https://comforting-llama-9549ad.netlify.app

## Option 1: Deploy via Netlify Dashboard (Easiest)

1. Go to https://app.netlify.com
2. Login to your account
3. Find your site "comforting-llama-9549ad"
4. Click "Deploys" tab
5. Click "Trigger deploy" → "Deploy site"
6. Netlify will automatically pull from your GitHub repo and build

## Option 2: Deploy via Drag & Drop

1. Build the frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Go to https://app.netlify.com
3. Find your site "comforting-llama-9549ad"
4. Click "Deploys" tab
5. Drag and drop the `frontend/build` folder to the deploy area

## Option 3: Deploy via CLI (If installed)

```bash
# Login to Netlify
netlify login

# Link to your site
netlify link

# Deploy
netlify deploy --prod
```

## Important: Environment Variables

Make sure to set these in Netlify Dashboard → Site settings → Environment variables:

### Backend Variables (if using Netlify Functions)
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key
- `GOOGLE_API_KEY` - Your Gemini API key
- `GROQ_API_KEY` - Your Groq API key (optional)
- `NODE_ENV` - Set to "production"

### Frontend Variables
- `REACT_APP_API_URL` - Your backend API URL

## Automatic Deployment

Your site is already connected to GitHub. Every time you push to the main branch, Netlify will automatically:
1. Pull the latest code
2. Run `npm run build` in the frontend folder
3. Deploy the build folder

## Check Build Status

Go to: https://app.netlify.com/sites/comforting-llama-9549ad/deploys

You should see your latest deployment building or completed.
