const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/", (req, res) => {
  console.log("📍 OwnTracks update received:");
  console.log(req.body);

  res.json({ status: "ok", received: req.body });
});

app.get("/", (req, res) => {
  res.send("OwnTracks server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});
