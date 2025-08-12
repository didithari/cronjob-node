const axios = require("axios");
const fs = require("fs");

// Konfigurasi WhatsApp
const WHATSAPP_API = "https://your-wa-api.com/send"; 
const FROM = "BOT";
const TO = "6289697435234";

// Konfigurasi retry dan delay
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000; // 2 detik delay antar retry
const WA_NOTIFICATION_DELAY_MS = 30000; // 30 detik delay antar notifikasi WA

// Track last WhatsApp notification time untuk mencegah spam
let lastWaNotificationTime = {};

// Load apis.json
let apis;
try {
  const raw = fs.readFileSync("./apis.json", "utf-8");
  apis = JSON.parse(raw);
  console.log(`✅ Loaded APIs: ${apis.length}`);
} catch (err) {
  console.error("❌ Failed to load apis.json:", err.message);
  process.exit(1);
}

// Kirim notifikasi WA jika ada error (dengan delay anti-spam)
async function sendWaAlert(message, apiName) {
  const now = Date.now();
  const lastNotification = lastWaNotificationTime[apiName] || 0;
  
  // Cek apakah sudah cukup lama sejak notifikasi terakhir
  if (now - lastNotification < WA_NOTIFICATION_DELAY_MS) {
    console.log(`⏳ [${apiName}] WhatsApp notification skipped (anti-spam delay active)`);
    return;
  }
  
  try {
    const res = await axios.post(WHATSAPP_API, {
      from: FROM,
      to: TO,
      message: message,
    });
    console.log(`📨 [${apiName}] WA alert sent. Response: ${res.status}`);
    
    // Update waktu notifikasi terakhir
    lastWaNotificationTime[apiName] = now;
  } catch (err) {
    console.error(`❌ [${apiName}] WA alert failed:`, err.message);
  }
}

// Delay utility function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fungsi untuk memanggil API dengan retry mechanism
async function callApiWithRetry(name, url) {
  console.log(`🔄 [${name}] Calling: ${url} at ${new Date().toLocaleTimeString()}`);
  
  let lastError = null;
  
  // Retry loop
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 5000 });
      console.log(`✅ [${name}] SUCCESS: ${url} (${res.status})`);
      return { success: true, name, status: res.status };
      
    } catch (err) {
      const statusCode = err?.response?.status;
      const statusText = err?.response?.statusText;
      const reason = statusCode ? `${statusCode} ${statusText}` : err.message;
      
      lastError = reason;
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        console.log(`⚠️ [${name}] Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed: ${reason}`);
        console.log(`⏳ [${name}] Retrying in ${RETRY_DELAY_MS/1000} seconds...`);
        await delay(RETRY_DELAY_MS);
      } else {
        console.error(`❌ [${name}] All ${MAX_RETRY_ATTEMPTS} attempts failed. Final error: ${reason}`);
        
        // Kirim notifikasi WhatsApp setelah semua retry gagal
        const errorMessage = `🚨 API Error After ${MAX_RETRY_ATTEMPTS} Retries\nName: ${name}\nURL: ${url}\nFinal Error: ${reason}`;
        await sendWaAlert(errorMessage, name);
        
        return { success: false, name, error: reason, attempts: MAX_RETRY_ATTEMPTS };
      }
    }
  }
}

// Fungsi untuk menjalankan API dengan interval tertentu
function runApiWithInterval(name, url, intervalSeconds) {
  console.log(`📅 Starting ${name} with ${intervalSeconds} second interval`);
  
  // Jalankan segera saat start
  callApiWithRetry(name, url);
  
  // Jalankan dengan interval
  setInterval(() => {
    callApiWithRetry(name, url);
  }, intervalSeconds * 1000);
}

// Jalankan semua API dengan interval masing-masing
console.log(`\n🚀 Starting all APIs with their respective intervals...`);
console.log(`🔄 Retry mechanism: ${MAX_RETRY_ATTEMPTS} attempts with ${RETRY_DELAY_MS/1000}s delay`);
console.log(`📱 WhatsApp anti-spam: ${WA_NOTIFICATION_DELAY_MS/1000}s minimum interval\n`);

apis.forEach((api) => {
  // Parse interval dari format "*/X * * * * *" menjadi detik
  const intervalMatch = api.interval.match(/^\*\/(\d+) \* \* \* \* \*$/);
  if (intervalMatch) {
    const intervalSeconds = parseInt(intervalMatch[1]);
    runApiWithInterval(api.name, api.url, intervalSeconds);
  } else {
    console.error(`⛔ Invalid interval format for ${api.name}: ${api.interval}`);
  }
});

// Log status setiap 10 detik
setInterval(() => {
  console.log(`\n📊 Status Update at ${new Date().toLocaleTimeString()}`);
  console.log(`All APIs are running independently with their intervals`);
  console.log(`Retry attempts: ${MAX_RETRY_ATTEMPTS}, Anti-spam delay: ${WA_NOTIFICATION_DELAY_MS/1000}s`);
}, 10000);

console.log(`\n✨ All APIs started successfully!`);
console.log(`Each API will run independently without waiting for others to complete.`);
console.log(`Press Ctrl+C to stop all processes.\n`);
