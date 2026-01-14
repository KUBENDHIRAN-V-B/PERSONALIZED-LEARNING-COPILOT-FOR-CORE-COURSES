# 🚀 GitHub Pages Deployment Guide

## Quick Deploy

Your project is now configured for GitHub Pages deployment!

### Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository: https://github.com/KUBENDHIRAN-V-B/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - The workflow will automatically deploy on every push

3. **Access Your Site:**
   - URL: `https://kubendhiran-v-b.github.io/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES/`
   - Wait 2-3 minutes for first deployment

### Manual Deployment (Alternative)

```bash
cd frontend
npm run deploy
```

This will build and deploy directly to the `gh-pages` branch.

## What Was Configured

✅ Added `gh-pages` package to frontend
✅ Added `homepage` field to package.json
✅ Created GitHub Actions workflow (`.github/workflows/deploy.yml`)
✅ Configured automatic deployment on push to main/master

## Troubleshooting

### Build Fails
- Check GitHub Actions logs in the **Actions** tab
- Ensure all dependencies are in package.json
- ESLint warnings are already configured to not fail builds

### 404 Error
- Verify GitHub Pages is enabled in repository settings
- Check the correct branch is selected (should be GitHub Actions)
- Wait a few minutes after first deployment

### API Keys
- Users will need to add their own API keys in the app
- Keys are stored locally in browser (not in deployment)

## Features Available

✅ Full frontend application
✅ 35+ courses (CS & ECE)
✅ AI chat interface (requires user API keys)
✅ Custom quiz system
✅ Study timer & analytics
✅ Responsive design

## Next Steps

1. Push your code to GitHub
2. Enable GitHub Pages in repository settings
3. Share your live URL with users
4. Users add their own AI API keys to use chat features

---

**Live URL:** https://kubendhiran-v-b.github.io/PERSONALIZED-LEARNING-COPILOT-FOR-CORE-COURSES/
