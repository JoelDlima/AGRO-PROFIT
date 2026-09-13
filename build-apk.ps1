Write-Host "🌾 Building AgroProfit Pro Android APK..." -ForegroundColor Green

Write-Host "`n1. Building web frontend assets..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Web build failed"; exit 1 }

Write-Host "`n2. Syncing Capacitor Android assets..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) { Write-Error "Capacitor sync failed"; exit 1 }

Write-Host "`n3. Compiling Android APK with Gradle..." -ForegroundColor Cyan
Push-Location android
.\gradlew.bat assembleDebug
$gradleStatus = $LASTEXITCODE
Pop-Location

if ($gradleStatus -ne 0) { Write-Error "Gradle APK build failed"; exit 1 }

Write-Host "`n4. Copying generated APK to apk/ folder..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path apk | Out-Null
Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" -Destination "apk\AgroProfit-v1.2.0.apk" -Force

$apk = Get-Item "apk\AgroProfit-v1.2.0.apk"
$sizeMb = [math]::Round($apk.Length / 1MB, 2)
Write-Host "`n✅ APK successfully built and ready!" -ForegroundColor Green
Write-Host "📁 Location: $($apk.FullName)" -ForegroundColor Yellow
Write-Host "📦 Size: $sizeMb MB" -ForegroundColor Yellow
