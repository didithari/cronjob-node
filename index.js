const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

// Konfigurasi WhatsApp
const WHATSAPP_API = "https://your-wa-api.com/send"; 
const FROM = "BOT";
const TO = "6289697435234";

// Queue untuk API calls
let apiQueue = [];
let isProcessing = false;

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

// Kirim notifikasi WA jika ada error
async function sendWaAlert(message) {
  try {
    const res = await axios.post(WHATSAPP_API, {
      from: FROM,
      to: TO,
      message: message,
    });
    console.log(`📨 WA alert sent. Response: ${res.status}`);
  } catch (err) {
    console.error("❌ WA alert failed:", err.message);
  }
}

// Fungsi untuk memanggil API dengan Promise
async function callApi(name, url) {
  console.log(`🔄 [${name}] Trying: ${url}`);
  
  try {
    const res = await axios.get(url, { timeout: 5000 });
    console.log(`✅ [${name}] SUCCESS: ${url} (${res.status})`);
    return { success: true, name, status: res.status };
  } catch (err) {
    const statusCode = err?.response?.status;
    const statusText = err?.response?.statusText;
    const reason = statusCode ? `${statusCode} ${statusText}` : err.message;

    console.error(`❌ [${name}] ERROR: ${url} - ${reason}`);
    await sendWaAlert(`⚠️ API Error\nName: ${name}\nURL: ${url}\nReason: ${reason}`);
    return { success: false, name, error: reason };
  }
}

// Fungsi untuk memproses queue
async function processQueue() {
  if (isProcessing || apiQueue.length === 0) {
    return;
  }

  isProcessing = true;
  console.log(`\n📋 Processing queue (${apiQueue.length} items)`);

  while (apiQueue.length > 0) {
    const apiCall = apiQueue.shift();
    console.log(`\n⏱️ [${new Date().toLocaleTimeString()}] Processing: ${apiCall.name}`);
    
    const result = await callApi(apiCall.name, apiCall.url);
    console.log(`🏁 [${apiCall.name}] Completed with ${result.success ? 'SUCCESS' : 'ERROR'}`);
    
    // Optional: delay kecil antara API calls
    if (apiQueue.length > 0) {
      console.log(`⏳ Waiting 1 second before next API call...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  isProcessing = false;
  console.log(`✅ Queue processing completed`);
}

// Fungsi untuk menambahkan API ke queue
function addToQueue(name, url) {
  apiQueue.push({ name, url });
  console.log(`📥 Added ${name} to queue (Queue size: ${apiQueue.length})`);
  
  // Trigger queue processing jika belum sedang diproses
  if (!isProcessing) {
    processQueue();
  }
}

// Jadwalkan tiap API dengan cron masing-masing
apis.forEach((api) => {
  if (!cron.validate(api.interval)) {
    console.error(`⛔ Invalid cron for ${api.name} (${api.url}): ${api.interval}`);
    return;
  }

  cron.schedule(api.interval, () => {
    console.log(`\n⏱️ [${new Date().toLocaleTimeString()}] Scheduled: ${api.name}`);
    addToQueue(api.name, api.url);
  });

  console.log(`📆 Scheduled ${api.name} every "${api.interval}"`);
});

// Log status queue setiap 30 detik
setInterval(() => {
  if (apiQueue.length > 0 || isProcessing) {
    console.log(`📊 Queue Status - Size: ${apiQueue.length}, Processing: ${isProcessing}`);
  }
}, 30000);
