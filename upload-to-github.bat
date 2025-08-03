@echo off
echo ========================================
echo Uploading to GitHub - Step by Step
echo ========================================

echo.
echo Step 1: Opening GitHub in browser...
start https://github.com/new

echo.
echo Step 2: Please follow these steps:
echo 1. Sign in to GitHub (if not already signed in)
echo 2. Repository name: personal-journal-app
echo 3. Make it Public
echo 4. DO NOT initialize with README, .gitignore, or license
echo 5. Click "Create repository"
echo.
echo Step 3: After creating the repository, come back here and press any key...
pause

echo.
echo Step 4: Installing Git if needed...
winget install Git.Git --accept-source-agreements --accept-package-agreements

echo.
echo Step 5: Waiting for Git installation...
timeout /t 10 /nobreak

echo.
echo Step 6: Initializing Git repository...
git init

echo.
echo Step 7: Adding all files...
git add .

echo.
echo Step 8: Creating initial commit...
git commit -m "Initial commit: React personal journal app"

echo.
echo Step 9: Setting up remote and pushing...
echo Please replace YOUR_USERNAME with your actual GitHub username below:
set /p username="Enter your GitHub username: "
git branch -M main
git remote add origin https://github.com/%username%/personal-journal-app.git
git push -u origin main

echo.
echo ========================================
echo Upload complete! 
echo Your repository is at: https://github.com/%username%/personal-journal-app
echo ========================================
pause 