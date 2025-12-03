const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// מסלול הקובץ שבו נשמור את המיקום
const LOCATION_FILE = path.join(__dirname, "lastLocation.json");

// מחזיקים רק מיקום אחרון בזיכרון
let lastLocation = null;

/**
 * טוען את המיקום מהקובץ אם הוא קיים
 */
function loadLocationFromFile() {
  if (fs.existsSync(LOCATION_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCATION_FILE, "utf8"));
      lastLocation = data;
      console.log("📂 Loaded last location from file:", lastLocation);
    } catch (e) {
      console.error("⚠ Failed to read location file:", e);
    }
  } else {
    console.log("ℹ No saved location file found.");
  }
}

/**
 * שומר את lastLocation לקובץ
 */
function saveLocationToFile() {
  try {
    fs.writeFileSync(LOCATION_FILE, JSON.stringify(lastLocation, null, 2));
    console.log("💾 Location saved to file.");
  } catch (e) {
    console.error("⚠ Failed to save location:", e);
  }
}

// OwnTracks שולח לכאן
app.post("/", (req, res) => {
  console.log("📍 OwnTracks update received:");
  console.log(JSON.stringify(req.body, null, 2));

  // שומרים רק הודעות מיקום
  if (req.body._type === "location") {
    lastLocation = {
      lat: req.body.lat,
      lon: req.body.lon,
      acc: req.body.acc,
      tst: req.body.tst,
      batt: req.body.batt,
      raw: req.body
    };

    // 🔥 שומר לקובץ
    saveLocationToFile();
  }

  // תשובה תקינה עבור OwnTracks — חובה כדי שלא תהיה שגיאה
  res.json({
    "_type": "ack",
    "status": "ok"
  });
});

// החזרת המיקום האחרון בלבד
app.get("/last", (req, res) => {
  if (!lastLocation) {
    return res.json({ error: "No location received yet" });
  }
  res.json(lastLocation);
});

// בדיקת תקינות
app.get("/", (req, res) => {
  res.send("OwnTracks last-location server is running!");
});

// --- טעינת המיקום מהקובץ בעת מופע השרת ---
loadLocationFromFile();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
