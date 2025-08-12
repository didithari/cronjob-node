# Cronjob Node - Independent API Runner

Sistem ini menjalankan multiple API secara independen tanpa menunggu API lain selesai, sesuai dengan interval waktu yang ditentukan.

## Fitur

- **API 1**: Dipanggil setiap 1 detik
- **API 2**: Dipanggil setiap 2 detik  
- **API 3**: Dipanggil setiap 1 detik
- **API 4**: Dipanggil setiap 1 detik (dengan URL invalid untuk testing)
- Setiap API berjalan independen tanpa blocking
- **Retry mechanism**: 3 kali percobaan sebelum notifikasi WhatsApp
- **WhatsApp limit**: Maksimal 2 notifikasi per API sampai restart
- Notifikasi WhatsApp otomatis jika semua retry gagal (dengan batasan)
- Log real-time untuk monitoring

## Cara Kerja

1. **Saat startup**: Semua API langsung dipanggil
2. **Interval berjalan**: Setiap API dipanggil ulang sesuai intervalnya tanpa menunggu yang lain selesai
3. **Non-blocking**: API calls berjalan secara asynchronous
4. **Retry system**: Jika API gagal, akan dicoba 3 kali dengan delay 2 detik
5. **WhatsApp alert**: Hanya dikirim setelah semua retry gagal (maksimal 2 kali per API)
6. **Notification limit**: Setelah 2 notifikasi, tidak akan kirim lagi sampai restart

## Konfigurasi

### APIs (`apis.json`)
```json
[
  {
    "name": "API 1",
    "url": "https://jsonplaceholder.typicode.com/todos/1",
    "interval": "*/1 * * * * *"
  },
  {
    "name": "API 2", 
    "url": "https://jsonplaceholder.typicode.com/todos/2",
    "interval": "*/2 * * * * *"
  },
  {
    "name": "API 3",
    "url": "https://jsonplaceholder.typicode.com/todos/3",
    "interval": "*/1 * * * * *"
  },
  {
    "name": "API 4",
    "url": "https://jsonplaceholder.typicode.com/todos/invalid",
    "interval": "*/1 * * * * *"
  }
]
```

### WhatsApp Alert
Update konfigurasi di `index.js`:
```javascript
const WHATSAPP_API = "https://your-wa-api.com/send"; 
const FROM = "BOT";
const TO = "6289697435234";
```

### Retry & Notification Settings
```javascript
const MAX_RETRY_ATTEMPTS = 3;           // Jumlah retry sebelum alert
const RETRY_DELAY_MS = 2000;            // Delay 2 detik antar retry
const MAX_WA_NOTIFICATIONS = 2;         // Maksimal 2 notifikasi WhatsApp per API
```

## Install & Run

```bash
# Install dependencies
npm install

# Jalankan aplikasi
node index.js
```

## Output Log

```
✅ Loaded APIs: 4

🚀 Starting all APIs with their respective intervals...
🔄 Retry mechanism: 3 attempts with 2s delay
📱 WhatsApp notifications: Maximum 2 per API until restart

📅 Starting API 1 with 1 second interval
📅 Starting API 2 with 2 second interval
📅 Starting API 3 with 1 second interval
📅 Starting API 4 with 1 second interval

✨ All APIs started successfully!
Each API will run independently without waiting for others to complete.
WhatsApp notifications limited to 2 per API until restart.
Press Ctrl+C to stop all processes.

🔄 [API 1] Calling: https://jsonplaceholder.typicode.com/todos/1 at 10:30:15
✅ [API 1] SUCCESS: https://jsonplaceholder.typicode.com/todos/1 (200)

🔄 [API 4] Calling: https://jsonplaceholder.typicode.com/todos/invalid at 10:30:15
⚠️ [API 4] Attempt 1/3 failed: 404 Not Found
⏳ [API 4] Retrying in 2 seconds...
⚠️ [API 4] Attempt 2/3 failed: 404 Not Found
⏳ [API 4] Retrying in 2 seconds...
❌ [API 4] All 3 attempts failed. Final error: 404 Not Found
📨 [API 4] WA alert sent (1/2). Response: 200

📊 Status Update at 10:30:25
All APIs are running independently with their intervals
Retry attempts: 3, Max WA notifications: 2 per API
📱 [API 4]: 1/2 notifications sent (1 remaining)
```

## Fitur Retry & Notification Limit

### Retry Mechanism
- **3 kali percobaan** sebelum mengirim notifikasi WhatsApp
- **Delay 2 detik** antar setiap retry
- Log detail untuk setiap percobaan yang gagal

### WhatsApp Notification Limit
- **Maksimal 2 notifikasi** per API sampai aplikasi di-restart
- Mencegah spam notifikasi jika API terus-menerus error
- Counter terpisah untuk setiap API
- Setelah limit tercapai, tidak akan kirim notifikasi lagi

### Contoh Skenario
1. API 4 gagal → Retry 1 (2s delay)
2. API 4 gagal lagi → Retry 2 (2s delay)  
3. API 4 gagal lagi → Retry 3 (2s delay)
4. Semua retry gagal → Kirim WhatsApp notification #1 (1/2)
5. API 4 gagal lagi → Kirim WhatsApp notification #2 (2/2)
6. API 4 gagal lagi → Skip notifikasi (limit tercapai)
7. **Tidak akan kirim notifikasi lagi sampai restart aplikasi**

## Status Monitoring

Sistem akan menampilkan status notifikasi setiap 10 detik:
```
📊 Status Update at 10:30:35
All APIs are running independently with their intervals
Retry attempts: 3, Max WA notifications: 2 per API
📱 [API 4]: 2/2 notifications sent (0 remaining)
```

## Perbedaan dengan Versi Sebelumnya

- **Sebelumnya**: Anti-spam delay 30 detik antar notifikasi
- **Sekarang**: Limit maksimal 2 notifikasi per API sampai restart
- **Keuntungan**: Lebih efisien, tidak ada notifikasi berlebihan
- **Reset**: Counter notifikasi reset otomatis saat restart aplikasi

## Troubleshooting

- Pastikan URL API dapat diakses
- Update konfigurasi WhatsApp API jika diperlukan
- Check log untuk melihat status setiap API call
- Monitor notification counter dan remaining limits
- Restart aplikasi jika ingin reset counter notifikasi 