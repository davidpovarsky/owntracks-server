const fs = require("fs");
const express = require("express");
const app = express();

app.use(express.json());

// Render persistent storage
const DATA_FILE = "/var/data/location.json";

// Load location from disk
function loadLocation() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading location file:", e);
    return null;
  }
}

// Save location to disk
function saveLocation(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("Location saved:", data);
  } catch (e) {
    console.error("Error saving location file:", e);
  }
}

// OwnTracks POST endpoint
app.post("/pub", (req, res) => {
  try {
    const payload = req.body;

    if (!payload || !payload.lat || !payload.lon) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const location = {
      lat: payload.lat,
      lon: payload.lon,
      tst: payload.tst || Math.floor(Date.now() / 1000)
    };

    saveLocation(location);

    res.json({ status: "ok" });

  } catch (e) {
    console.error("Error in /pub:", e);
    res.status(500).json({ error: "Server error" });
  }
});

// GET last known location
app.get("/last", (req, res) => {
  const loc = loadLocation();
  if (!loc) return res.json({ error: "No location received yet" });
  res.json(loc);
});

// Debug endpoint
app.get("/status", (req, res) => {
  const loc = loadLocation();
  res.json({
    hasLocation: !!loc,
    lastLocation: loc || null,
    serverTime: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
