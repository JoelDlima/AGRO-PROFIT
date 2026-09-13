# 📱 AgroProfit Android APK Build Guide

This guide explains how to build the Android APK for AgroProfit using Capacitor.

---

## ✅ What Was Added (No Breaking Changes)

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration |
| `android/` folder | Native Android project |
| `colors.xml` | AgroProfit brand colors |
| New npm scripts | `cap:sync`, `cap:open`, `cap:build` |

**No existing files were modified** except adding npm scripts to package.json.

---

## 🚀 Quick APK Generation (Using Live URL)

Since your app is already deployed at `https://agro-profit-pro.vercel.app/`, the current configuration loads the **live website** inside the Android WebView. This is the fastest way to get an APK.

### Step 1: Open in Android Studio

```bash
npx cap open android
```

### Step 2: Build APK in Android Studio

1. Wait for Gradle sync to complete (bottom progress bar)
2. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build to complete
4. Click **"locate"** in the notification popup, or find it at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Step 3: Install on Device

- Transfer `app-debug.apk` to your phone
- Enable "Install from unknown sources" if prompted
- Install and run

---

## 📦 Offline APK (Bundle Web Assets)

If you want the app to work **offline** (without internet for the main UI), you need to bundle the web assets.

### Step 1: Modify capacitor.config.ts

Comment out the `server.url` line:

```typescript
const config: CapacitorConfig = {
  appId: 'com.agroprofit.app',
  appName: 'AgroProfit',
  webDir: 'dist',
  // server: {
  //   url: 'https://agro-profit-pro.vercel.app',
  //   cleartext: true
  // },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  // ... rest of config
};
```

### Step 2: Build and Sync

```bash
npm run build
npx cap sync android
```

### Step 3: Build APK

```bash
npx cap open android
```

Then Build → Build APK(s) in Android Studio.

---

## 🔑 Google OAuth in APK

Google OAuth will **still work** because:

1. The app loads from `https://agro-profit-pro.vercel.app`
2. OAuth redirects stay on the same domain
3. Supabase handles the auth flow within the WebView

**Important**: If you bundle web assets (offline mode), you'll need to configure deep linking for OAuth callbacks.

---

## 📝 NPM Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run cap:sync` | Sync web assets to Android |
| `npm run cap:open` | Open project in Android Studio |
| `npm run cap:build` | Build web + sync to Android |

---

## 🎨 Customizing App Icon

Replace the launcher icons in:
```
android/app/src/main/res/mipmap-*/ic_launcher.png
android/app/src/main/res/mipmap-*/ic_launcher_round.png
```

Sizes needed:
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

You can use Android Studio's **Image Asset Studio**:
1. Right-click `res` folder → New → Image Asset
2. Select your logo file
3. Generate all sizes automatically

---

## 🐛 Common Errors & Fixes

### Error: "Gradle sync failed"
```
Solution: File → Sync Project with Gradle Files
```

### Error: "SDK location not found"
```
Solution: Create local.properties in android/ with:
sdk.dir=C\:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### Error: "JAVA_HOME is not set"
```
Solution: Set JAVA_HOME environment variable to your JDK path
(Android Studio includes JDK at: C:\Program Files\Android\Android Studio\jbr)
```

### Error: "WebView not loading"
```
Solution: Ensure device has internet connection
Check that cleartext traffic is allowed in capacitor.config.ts
```

### Error: "App crashes on launch"
```
Solution: Check logcat in Android Studio for errors
Run: npx cap sync android to ensure assets are synced
```

---

## 🏗️ Production APK (Signed)

For Play Store release:

1. **Build → Generate Signed Bundle / APK**
2. Create new keystore (save it securely!)
3. Fill in key details
4. Select "release" build variant
5. APK will be at: `android/app/release/app-release.apk`

---

## 📁 Project Structure After Capacitor

```
agro-profit-pro/
├── android/                    # NEW: Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/  # Bundled web assets
│   │   │   ├── res/            # Android resources
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   └── gradle/
├── capacitor.config.ts         # NEW: Capacitor config
├── dist/                       # Web build output
├── src/                        # React source (unchanged)
└── package.json               # Updated with cap scripts
```

---

## ✅ Verification Checklist

- [ ] `npx cap open android` opens Android Studio
- [ ] Gradle sync completes without errors
- [ ] Build APK succeeds
- [ ] APK installs on device
- [ ] App loads agro-profit-pro.vercel.app
- [ ] Google login works
- [ ] All pages navigate correctly

---

## 🔄 Updating the App

When you deploy updates to Vercel:

**If using live URL (current config)**: No APK rebuild needed! Users get updates automatically.

**If using bundled assets**: 
```bash
npm run build
npx cap sync android
# Then rebuild APK in Android Studio
```

---

## 📞 Support

If you encounter issues:
1. Check Android Studio's Logcat for errors
2. Verify internet connectivity
3. Ensure Android Studio SDK is up to date
