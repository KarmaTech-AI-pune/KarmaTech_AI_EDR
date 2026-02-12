# Playwright E2E Setup Script for Windows
# Run this script from the frontend directory

Write-Host "🎭 Setting up Playwright E2E Testing..." -ForegroundColor Cyan

# Step 1: Install Playwright
Write-Host "`n📦 Installing Playwright..." -ForegroundColor Yellow
npm install -D @playwright/test

# Step 2: Install browsers
Write-Host "`n🌐 Installing Playwright browsers..." -ForegroundColor Yellow
npx playwright install

# Step 3: Create directory structure
Write-Host "`n📁 Creating E2E directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "e2e/fixtures" | Out-Null
New-Item -ItemType Directory -Force -Path "e2e/pages" | Out-Null
New-Item -ItemType Directory -Force -Path "e2e/tests" | Out-Null
New-Item -ItemType Directory -Force -Path "e2e/utils" | Out-Null

Write-Host "`n✅ Playwright setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review PLAYWRIGHT_SETUP.md for detailed instructions"
Write-Host "2. Create page objects in e2e/pages/"
Write-Host "3. Write tests in e2e/tests/"
Write-Host "4. Run tests with: npm run test:e2e"
Write-Host "`nHappy testing! 🚀" -ForegroundColor Green
