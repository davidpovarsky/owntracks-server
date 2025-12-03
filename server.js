
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// מחזיקים רק מיקום אחרון בזיכרון
let lastLocation = null;

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
