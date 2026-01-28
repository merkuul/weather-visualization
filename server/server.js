const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Храним выбранный город
let currentCity = "Hannover";

// Отдать текущий город (для p5-сайта)
app.get("/city", (req, res) => {
  res.json({ city: currentCity });
});

// Принять новый город (от контроллера)
app.post("/city", (req, res) => {
  const { city } = req.body;
  if (city) {
    currentCity = city;
    console.log("Город обновлён:", currentCity);
  }
  res.json({ status: "ok", city: currentCity });
});

// Раздаём сайты
app.use("/controller", express.static(path.join(__dirname, "../public-controller")));
app.use("/screen", express.static(path.join(__dirname, "../public-screen")));

// Главная страница (чтобы Railway не ругался)
app.get("/", (req, res) => {
  res.send("Server is running. Use /controller or /screen");
});

// Порт для Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
