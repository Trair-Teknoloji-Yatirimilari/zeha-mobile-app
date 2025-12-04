# Zeha - Global Yapay Zeka Asistanı 🌍✨

Zeha, tüm dillerde akıllı sohbet yapabilen global bir AI asistanıdır. ChatGPT benzeri genel amaçlı yapay zeka platformu olarak tasarlanmış olup, **Kids Mode** özelliği ile çocuklar için ekstra güvenlik katmanı sağlar.

## 🚀 Özellikler

### Kids Chat (Çocuk Sohbeti)
- ✅ **AI Sohbet**: Zeha AI ile doğal dilde sohbet
- ✅ **Çoklu Mesaj Türü**: Text, emoji, resim ve sesli mesaj desteği
- ✅ **Real-time Streaming**: SSE ile anlık AI yanıtları
- ✅ **Gizli Mod Sistemi**: 
  - Öğretmen Modu
  - Ödev Yardımı
  - Eğlence
  - Destek
  - Genel Sohbet
- ✅ **Yaş Gruplarına Özel**: 4-6, 7-9, 10-12, 13-15 yaş grupları
- ✅ **Otomatik Güvenlik Filtreleme**

### Parent Dashboard (Ebeveyn Kontrol Paneli)
- ✅ **Risk/Güvenlik Uyarıları**: Kritik, yüksek, orta, düşük seviye uyarılar
- ✅ **Psikolojik Sağlık Analizi**: Çocukların ruh halini takip
- ✅ **İstatistikler**: Çocuk sayısı, uyarı sayısı, olumlu ruh hali
- ✅ **Mesaj İçeriği Gizliliği**: Ebeveynler mesajları okuyamaz (gizlilik)

### Time Settings (Zaman Ayarları)
- ✅ **Günlük Mesaj Limiti**: Yaşa göre 20-200 mesaj/gün
- ✅ **Uyku Saati Kısıtlaması**: 21:00-07:00 arası engelleme
- ✅ **Okul Saati**: İsteğe bağlı okul saatlerinde kısıtlama
- ✅ **Çocuğa Özel Ayarlar**: Her çocuk için ayrı ayarlar

### Email Alerts
- ✅ **Kritik Tehdit**: Anında email
- ✅ **Yüksek Risk**: Email uyarısı
- ✅ **Psikolojik Endişe**: Email bildirimi
- ✅ **Resend API** entegrasyonu

### Encryption & Security
- ✅ **AES-256 Şifreleme**: Tüm mesajlar server-side şifreli
- ✅ **Token-based Authentication**: Güvenli oturum yönetimi
- ✅ **Expo SecureStore**: Token'lar güvenli depolanır

## 🏗️ Teknoloji Stack

### Frontend (React Native)
- **Framework**: Expo (React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **API Client**: Axios + React Query
- **Chat UI**: React Native Gifted Chat
- **UI Components**: 
  - React Native core components
  - Expo Vector Icons
  - Safe Area Context
- **Media**:
  - expo-image-picker (Resim seçimi)
  - expo-av (Sesli mesaj)
  - expo-speech (Text-to-speech)

### Backend API
- **URL**: https://zeha.trairx.com/api
- **Database**: MongoDB (Uzak sunucu)
- **AI Orkestra**:
  - OpenAI GPT-4o (Karmaşık sorular)
  - OpenAI GPT-3.5 Turbo (Basit sorular)
  - Claude (Anthropic) - Yedek
  - tc-milli-gpt - Fine-tuned model
  - SERP API - Web search

## 📱 Kullanıcı Tipleri

1. **Kids (Çocuk)**: 4-15 yaş arası kullanıcılar
2. **Parent (Ebeveyn)**: Maksimum 2 çocuk takip edebilir
3. **Adult (Yetişkin)**: 16+ yaş kullanıcılar

## 🎨 UI/UX Özellikleri

- ✅ **Dark Mode**: Modern koyu tema
- ✅ **Mobile-First**: Thumb-friendly tasarım
- ✅ **Responsive**: Tüm ekran boyutlarına uyumlu
- ✅ **Native Feel**: iOS ve Android optimizasyonu
- ✅ **Smooth Animations**: React Native Reanimated
- ✅ **Turkish Language**: Tam Türkçe dil desteği

## 📁 Proje Yapısı

```
/app/frontend/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Auth ekranları
│   │   ├── welcome.tsx          # Hoş geldin ekranı
│   │   ├── login.tsx            # Giriş ekranı
│   │   └── register.tsx         # Kayıt ekranı
│   ├── (tabs)/                   # Tab navigation
│   │   ├── chat.tsx             # Kids chat ekranı
│   │   ├── profile.tsx          # Profil ekranı
│   │   ├── dashboard.tsx        # Parent dashboard
│   │   ├── kids.tsx             # Çocuk yönetimi
│   │   └── settings.tsx         # Time settings
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
├── lib/
│   ├── api/                      # API katmanı
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── dashboard.ts
│   │   └── settings.ts
│   └── store/                    # State management
│       ├── authStore.ts
│       └── chatStore.ts
├── types/
│   └── index.ts                 # TypeScript types
└── package.json
```

## 🔐 Authentication Flow

1. **Welcome Screen**: İlk açılış ekranı
2. **Login/Register**: Email + Şifre ile giriş
3. **Role Selection**: Kids/Parent/Adult seçimi
4. **Main App**: Role'e göre farklı tab navigation

## 🌟 Öne Çıkan Özellikler

### Real-time Streaming (SSE)
```typescript
chatApi.streamMessage(
  { content, mode, type },
  onChunk: (chunk) => { /* Her chunk için */ },
  onComplete: (message) => { /* Tamamlandığında */ },
  onError: (error) => { /* Hata durumu */ }
);
```

### Gizli Mod Sistemi
- **Öğretmen**: Eğitimsel sorular
- **Ödev**: Ödev yardımı
- **Eğlence**: Oyun ve eğlence
- **Destek**: Psikolojik destek
- **Genel**: Normal sohbet

### Time Settings
- Günlük mesaj limiti kontrolü
- Uyku saati engelleme
- Okul saati opsiyonel kısıtlama
- Her çocuk için ayrı ayarlar

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- Yarn veya npm
- Expo Go app (mobil test için)

### Kurulum
```bash
cd /app/frontend
yarn install
```

### Çalıştırma
```bash
# Development
yarn start

# iOS
yarn ios

# Android
yarn android
```

### Preview URL
- **Web**: https://zeha-chat-app.preview.emergentagent.com
- **QR Code**: Expo Go ile mobil test

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş
- `POST /api/auth/register` - Kayıt
- `GET /api/auth/me` - Kullanıcı bilgisi

### Chat
- `POST /api/chat/message` - Mesaj gönder
- `GET /api/chat/history` - Geçmiş mesajlar
- `POST /api/chat/stream` - Real-time streaming

### Parent Dashboard
- `GET /api/parent/dashboard` - Dashboard verisi
- `GET /api/parent/alerts` - Risk uyarıları

### Settings
- `GET /api/settings/time/:kidId` - Zaman ayarları
- `POST /api/settings/time` - Ayarları güncelle

## 🎯 Gelecek Özellikler

- [ ] Bildirimler (Push Notifications)
- [ ] Çocuk ekleme/çıkarma
- [ ] Detaylı analiz grafikleri
- [ ] Offline mode
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] iOS/Android native builds

## 📱 Platform Desteği

- ✅ iOS (Expo Go + Native)
- ✅ Android (Expo Go + Native)
- ✅ Web (Preview mode)

## 🔒 Güvenlik

- AES-256 encryption
- Token-based auth
- Secure storage (Expo SecureStore)
- HTTPS only
- Input validation
- Rate limiting (backend)

## 📄 Lisans

Bu proje Emergent AI tarafından geliştirilmiştir.

## 🙏 Teşekkürler

- **Backend API**: https://zeha.trairx.com/api
- **AI Models**: OpenAI, Anthropic, tc-milli-gpt
- **UI Framework**: React Native, Expo

---

**Geliştirici Notu**: Bu uygulama çocukların güvenliği için tasarlanmıştır. Tüm mesajlar şifrelenir ve ebeveynler sadece analiz verilerini görebilir, mesaj içeriklerini okuyamaz.
