const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// קובץ השמירה הקבועה (Render שומר אותו לנצח)
const DATA_FILE = "/var/data/location.json";

// טעינת המיקום מהדיסק
function loadLocationFromDisk() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading location file:", e);
    return null;
  }
}

// שמירת המיקום לדיסק
function saveLocationToDisk(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("📦 Saved location to disk:", data);
  } catch (e) {
    console.error("Error saving location:", e);
  }
}

// -------------------------
// המיקום האחרון בזיכרון
// -------------------------
let lastLocation = loadLocationFromDisk(); // נטען את מה שיש כבר

// OwnTracks שולח לפה
app.post("/", (req, res) => {
  console.log("📍 OwnTracks update received:");
  console.log(JSON.stringify(req.body, null, 2));

  // מקבלים רק הודעות מסוג LOCATION
  if (req.body._type === "location") {
    lastLocation = {
      lat: req.body.lat,
      lon: req.body.lon,
      acc: req.body.acc,
      tst: req.body.tst,
      batt: req.body.batt,
      raw: req.body
    };

    // שמירה לדיסק
    saveLocationToDisk(lastLocation);
  }

  // מחזירים ACK כמו במקור
  res.json({
    "_type": "ack",
    "status": "ok"
  });
});

// החזרת המיקום האחרון
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
