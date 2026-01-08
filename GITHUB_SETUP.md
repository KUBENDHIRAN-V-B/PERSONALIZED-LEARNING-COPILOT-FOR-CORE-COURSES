# GitHub Setup Instructions

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `personalized-learning-copilot`
3. Do NOT initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

## Step 2: Initialize Git and Push

Run these commands in the project root directory:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Personalized Learning Copilot with AI tutoring, mastery tracking, and study timer"

# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/personalized-learning-copilot.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

Visit `https://github.com/YOUR_USERNAME/personalized-learning-copilot` to see your repository.

## Important Notes

- Replace `YOUR_USERNAME` with your actual GitHub username
- Make sure you have Git installed: https://git-scm.com/
- Ensure `.env` files are in `.gitignore` (they are) - never commit API keys
- The `.gitignore` file excludes `node_modules/` to keep the repo size small

## Future Commits

After the initial push, use these commands for updates:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## Branching (Optional)

For feature development:

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push branch
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```
