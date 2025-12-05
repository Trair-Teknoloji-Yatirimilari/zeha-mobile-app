# 🚀 Zeha - Production Build & Deployment Guide

## 📋 Önkoşullar

✅ Tamamlandı:
- [x] React Native 0.81.5 upgrade
- [x] SDK 54 dependencies güncel
- [x] app.json production config
- [x] eas.json oluşturuldu
- [x] Assets hazır (icon, splash)
- [x] Backend production URL: https://zeha.trairx.com/api

## 🛠️ EAS Build Adımları

### 1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```

### 2. EAS Login
```bash
eas login
# Expo hesabınızla giriş yapın
```

### 3. Proje Build Yapılandırması
```bash
cd /app/frontend
eas build:configure
```

### 4. Production Build Oluşturma

**Her iki platform için:**
```bash
eas build --platform all --profile production
```

**Sadece iOS:**
```bash
eas build --platform ios --profile production
```

**Sadece Android:**
```bash
eas build --platform android --profile production
```

**Build süresi:** ~20-30 dakika

---

## 📱 Store Submission

### Apple App Store

**Gereksinimler:**
- Apple Developer hesabı ($99/yıl)
- App Store Connect'te app oluşturulmuş olmalı

**Submission:**
```bash
eas submit --platform ios --profile production
```

**Manuel gerekli bilgiler:**
- Apple ID
- App-specific password
- ASC App ID

### Google Play Store

**Gereksinimler:**
- Google Play Console hesabı ($25 one-time)
- Play Console'da app oluşturulmuş olmalı

**Submission:**
```bash
eas submit --platform android --profile production
```

**Manuel gerekli bilgiler:**
- Service Account JSON (opsiyonel)
- Veya manuel APK/AAB upload

---

## 📦 Build Profilleri

### Development Build
```bash
eas build --platform all --profile development
```
- Development client için
- Debug özellikleri aktif
- Internal testing

### Preview Build
```bash
eas build --platform all --profile preview
```
- TestFlight / Internal Testing için
- Production benzeri ama test için

### Production Build
```bash
eas build --platform all --profile production
```
- Store submission için
- Optimize edilmiş
- Tam production config

---

## 🔧 Sorun Giderme

### Build Hataları

**"Credentials not found"**
```bash
eas credentials
```
iOS certificates ve provisioning profiles'ı kontrol edin.

**"Build failed"**
```bash
eas build --platform ios --profile production --clear-cache
```

### Submission Hataları

**Apple: "Invalid Bundle ID"**
- App Store Connect'te bundle ID'nin doğru olduğunu kontrol edin
- `com.trairx.zeha` kullanılmalı

**Google: "Upload failed"**
- Service account permissions kontrol edin
- Veya manuel upload yapın

---

## 📊 Build Status

Build durumunu kontrol:
```bash
eas build:list
```

Online dashboard:
https://expo.dev/accounts/[your-account]/projects/zeha-ai-assistant/builds

---

## 🎯 Sonraki Adımlar

1. ✅ EAS build tamamlandı mı?
2. Store'lara submit edildi mi?
3. Review sürecinde mi?
4. Yayında mı?

Her adımı takip edin ve gerekirse support@zeha.trairx.com'a ulaşın.
