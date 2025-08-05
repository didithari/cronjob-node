const axios = require("axios");
const cron = require("node-cron");
const fs = require("fs");

// Konfigurasi WhatsApp
const WHATSAPP_API = "https://your-wa-api.com/send"; 
const FROM = "BOT";
const TO = "6289697435234";

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

// Fungsi untuk memanggil API
function callApi(name, url) {
  console.log(`🔄 [${name}] Trying: ${url}`);
  axios.get(url, { timeout: 5000 })
    .then((res) => {
      console.log(`✅ [${name}] SUCCESS: ${url} (${res.status})`);
    })
    .catch((err) => {
      const statusCode = err?.response?.status;
      const statusText = err?.response?.statusText;
      const reason = statusCode ? `${statusCode} ${statusText}` : err.message;

      console.error(`❌ [${name}] ERROR: ${url} - ${reason}`);
      sendWaAlert(`⚠️ API Error\nName: ${name}\nURL: ${url}\nReason: ${reason}`);
    });
}

// Jadwalkan tiap API dengan cron masing-masing
apis.forEach((api) => {
  if (!cron.validate(api.interval)) {
    console.error(`⛔ Invalid cron for ${api.name} (${api.url}): ${api.interval}`);
    return;
  }

  cron.schedule(api.interval, () => {
    console.log(`\n⏱️ [${new Date().toLocaleTimeString()}] Calling: ${api.name}`);
    callApi(api.name, api.url); // tidak pakai await → non-blocking
  });

  console.log(`📆 Scheduled ${api.name} every "${api.interval}"`);
});
