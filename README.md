# Cronjob Node - API Monitoring dengan WhatsApp Alert

Sebuah aplikasi Node.js yang memonitor API secara berkala menggunakan cron jobs dan mengirim notifikasi WhatsApp ketika API mengalami error.

## 🚀 Fitur

- **API Monitoring**: Memonitor multiple API secara bersamaan
- **Cron Scheduling**: Menggunakan node-cron untuk penjadwalan yang fleksibel
- **WhatsApp Alert**: Kirim notifikasi otomatis ke WhatsApp ketika API error
- **Configurable**: Konfigurasi API melalui file JSON
- **Real-time Logging**: Log aktivitas monitoring secara real-time

## 📋 Prerequisites

Sebelum menjalankan aplikasi ini, pastikan Anda memiliki:

- **Node.js** (versi 14 atau lebih baru)
- **npm** (Node Package Manager)
- **WhatsApp API** (untuk fitur alert)

## 🛠️ Installation

### 1. Clone atau Download Project

```bash
# Jika menggunakan git
git clone <repository-url>
cd cronjob-node

# Atau download dan extract file ZIP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi WhatsApp API

Edit file `index.js` dan sesuaikan konfigurasi WhatsApp:

```javascript
// Konfigurasi WhatsApp
const WHATSAPP_API = "https://your-wa-api.com/send"; // Ganti dengan API WhatsApp Anda
const FROM = "BOT"; // Nama pengirim
const TO = "6289697435234"; // Nomor WhatsApp tujuan (format: 628xxx)
```

### 4. Konfigurasi API yang akan dimonitor

Edit file `apis.json` untuk menambahkan API yang ingin dimonitor:

```json
[
  {
    "name": "API Todo 1",
    "url": "https://jsonplaceholder.typicode.com/todos/1",
    "interval": "*/1 * * * * *"
  },
  {
    "name": "API Todo 2", 
    "url": "https://jsonplaceholder.typicode.com/todos/2",
    "interval": "*/2 * * * * *"
  }
]
```

## 🚀 Cara Menjalankan

### Development Mode

```bash
node index.js
```

### Production Mode (dengan PM2)

```bash
# Install PM2 secara global
npm install -g pm2

# Jalankan aplikasi
pm2 start index.js --name "api-monitor"

# Cek status
pm2 status

# Lihat log
pm2 logs api-monitor
```

## ⚙️ Konfigurasi

### Format Cron Expression

Aplikasi menggunakan format cron dengan 6 field: `second minute hour day month weekday`

Contoh:
- `*/1 * * * * *` = Setiap 1 detik
- `*/30 * * * * *` = Setiap 30 detik  
- `0 */5 * * * *` = Setiap 5 menit
- `0 0 */1 * * *` = Setiap 1 jam

### Struktur File apis.json

```json
[
  {
    "name": "Nama API",           // Nama untuk identifikasi
    "url": "https://api-url.com", // URL API yang akan dimonitor
    "interval": "*/1 * * * * *"   // Cron expression untuk interval
  }
]
```

## 📊 Monitoring

Aplikasi akan menampilkan log real-time:

```
✅ Loaded APIs: 3
📆 Scheduled API Todo 1 every "*/1 * * * * *"
📆 Scheduled API Todo 2 every "*/2 * * * * *"
📆 Scheduled API Invalid Test every "*/5 * * * * *"

⏱️ [14:30:15] Calling: API Todo 1
🔄 [API Todo 1] Trying: https://jsonplaceholder.typicode.com/todos/1
✅ [API Todo 1] SUCCESS: https://jsonplaceholder.typicode.com/todos/1 (200)

⏱️ [14:30:16] Calling: API Todo 2
🔄 [API Todo 2] Trying: https://jsonplaceholder.typicode.com/todos/2
✅ [API Todo 2] SUCCESS: https://jsonplaceholder.typicode.com/todos/2 (200)
```

## 🔔 WhatsApp Alert

Ketika API mengalami error, aplikasi akan mengirim notifikasi WhatsApp dengan format:

```
⚠️ API Error
Name: [Nama API]
URL: [URL API]
Reason: [Alasan Error]
```

## 📁 Struktur Project

```
cronjob-node/
├── index.js          # File utama aplikasi
├── apis.json         # Konfigurasi API yang dimonitor
├── package.json      # Dependencies dan metadata
├── package-lock.json # Lock file untuk dependencies
└── README.md         # Dokumentasi ini
```

## 🛡️ Troubleshooting

### Error: "Failed to load apis.json"
- Pastikan file `apis.json` ada di root directory
- Periksa format JSON apakah valid

### Error: "Invalid cron expression"
- Periksa format cron expression di `apis.json`
- Gunakan validator online untuk memastikan format benar

### WhatsApp Alert tidak terkirim
- Periksa konfigurasi WhatsApp API di `index.js`
- Pastikan URL API WhatsApp benar dan dapat diakses
- Periksa nomor tujuan apakah format benar (628xxx)

### API Timeout
- Aplikasi menggunakan timeout 5 detik untuk setiap request
- Jika API lambat, pertimbangkan untuk menambah timeout atau mengubah interval

## 🤝 Contributing

1. Fork project ini
2. Buat branch untuk fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini menggunakan license MIT. Lihat file `LICENSE` untuk detail lebih lanjut.

## 📞 Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini atau hubungi developer.

---

**Happy Monitoring! 🚀** 