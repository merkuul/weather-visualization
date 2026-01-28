let RES_SCALE = 3;
let BASE_W = 270;
let BASE_H = 480;

let qrImg;
let bg1 = null;
let bg2 = null;

// API
let city = "Hannover";
let apiKey = "e387bcd0c57d81c9b511da94b99cc26a";

// ==============================
// Weather
// ==============================
let currentTemp = "--";
let hourWeatherTypes = new Array(12).fill("Clouds");

// ==============================
// icons
// ==============================
let segments = 12;
let iconImages = {};
let iconFade = 0;
let iconMaxFade = 1;

let startTime;
let elapsed;

const weatherColors = {
  Clear: [173, 216, 230],
  Sunny: [255, 255, 0],
  Rain: [0, 0, 139],
  Snow: [135, 206, 235],
  Clouds: [255, 255, 255]
};

// ==============================
// helpers
// ==============================
function cityToFileName(name) {
  return name
    .toLowerCase()
    .replace("ü", "ue")
    .replace("ö", "oe")
    .replace("ä", "ae")
    .replace("ß", "ss");
}

// ==============================
// preload
// ==============================
function preload() {
  qrImg = loadImage("QR.png");

  let types = ["clear", "cloud", "rain", "snow", "sun"];
  for (let t of types) {
    iconImages[t] = loadImage(`icons/${t}.png`);
  }

  loadCityImages(city);
}

function loadCityImages(cityName) {
  let fileCity = cityToFileName(cityName);
  bg1 = loadImage(`img/${fileCity}bg.png`);
  bg2 = loadImage(`img/${fileCity}bg2.png`);
}

// ==============================
// server sync
// ==============================
async function getCityFromServer() {
  try {
    const res = await fetch("/city");
    const data = await res.json();
    if (data.city && data.city !== city) {
      city = data.city;
      loadCityImages(city);
      fetchWeather(city);
      startTime = millis();
      iconFade = 0;
      console.log("Город обновлён:", city);
    }
  } catch (e) {
    console.log("нет связи с сервером");
  }
}

// ==============================
// weather API
// ==============================
async function fetchWeather(cityName) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    currentTemp = Math.round(data.list[0].main.temp);

    for (let i = 0; i < 12; i++) {
      hourWeatherTypes[i] = data.list[i].weather[0].main;
    }
  } catch (e) {
    console.error("Weather error:", e);
  }
}

// ==============================
// setup
// ==============================
function setup() {
  createCanvas(BASE_W * RES_SCALE, BASE_H * RES_SCALE);
  angleMode(DEGREES);
  textFont("Segoe UI");
  startTime = millis();

  fetchWeather(city);
  setInterval(getCityFromServer, 2000);
}

// ==============================
// draw
// ==============================
function draw() {
  elapsed = millis() - startTime;

  let bgFadeStart = 5000;
  let bgFadeDur = 2000;
  let bgAlpha = constrain((elapsed - bgFadeStart) / bgFadeDur, 0, 1);

  if (bg1) image(bg1, 0, 0, width, height);
  if (bg2) {
    push();
    tint(255, 255 * bgAlpha);
    image(bg2, 0, 0, width, height);
    pop();
  }
  tint(255);

  let baseColor = weatherColors[hourWeatherTypes[0]] || [255, 255, 255];

  let fadeText = constrain(elapsed / 2000, 0, 1);
  push();
  resetMatrix();
  fill(...baseColor, 255 * fadeText);
  textAlign(CENTER, CENTER);
  textSize(34);
  text("Aktuelles Wetter", width / 2, height * 0.02);
  textSize(40);
  text(city, width / 2, height * 0.08);
  textSize(48);
  text(currentTemp + "°C", width / 2, height * 0.14);
  pop();

  let iconStartTime = 5000;
  if (elapsed >= iconStartTime) {
    iconFade += 0.005;
    iconFade = constrain(iconFade, 0, iconMaxFade);

    push();
    translate(width / 2, height / 2 + 60);
    let angleStep = 360 / segments;
    let radius = min(width, height) * 0.36;

    for (let s = 0; s < segments; s++) {
      let a = s * angleStep - 90;
      let x = cos(a) * radius;
      let y = sin(a) * radius;

      let pulse = 0.97 + 0.05 * sin(elapsed * 0.1 + s);

      let type = hourWeatherTypes[s].toLowerCase();
      let img = iconImages[type] || iconImages["cloud"];

      push();
      translate(x, y);
      scale(pulse);
      tint(255, 255 * iconFade);
      imageMode(CENTER);
      image(img, 0, 0, 200, 200);
      pop();
    }
    pop();
  }

  if (elapsed >= iconStartTime) {
    drawClockOverlay(iconFade);
  }

  let qrStart = 15000;
  let qrDuration = 5000;
  if (elapsed >= qrStart && elapsed <= qrStart + qrDuration) {
    let t = constrain((elapsed - qrStart) / qrDuration, 0, 1);
    let easedT = easeOutQuad(t);
    let pulse = 1 + 0.05 * sin(elapsed * 0.001 * TWO_PI);

    push();
    translate(width / 2, height * 0.88);
    scale(pulse);
    imageMode(CENTER);
    tint(...baseColor, 255 * easedT);
    image(qrImg, 0, 0, 140, 140);
    pop();
  } else if (elapsed > qrStart + qrDuration) {
    push();
    translate(width / 2, height * 0.88);
    imageMode(CENTER);
    tint(...baseColor, 255);
    image(qrImg, 0, 0, 140, 140);
    pop();
  }

  if (elapsed > 25000) {
    startTime = millis();
    iconFade = 0;
  }
}

// ==============================
function drawClockOverlay(fade = 1) {
  push();
  translate(width / 2, height / 2 + 60);
  textAlign(CENTER, CENTER);
  textSize(26);
  let clockRadius = min(width, height) * 0.21;

  fill(255, 255 * fade);
  let marks = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  for (let i = 0; i < marks.length; i++) {
    let angle = map(i, 0, 12, -90, 270);
    text(marks[i], cos(angle) * clockRadius * 0.95, sin(angle) * clockRadius * 0.95);
  }

  let hr = hour() % 12;
  let mn = minute();
  let sc = second();

  stroke(255, 255 * fade);
  strokeWeight(8);
  let hrAngle = map(hr + mn / 60, 0, 12, -90, 270);
  line(0, 0, cos(hrAngle) * clockRadius * 0.6, sin(hrAngle) * clockRadius * 0.6);

  strokeWeight(6);
  let mnAngle = map(mn + sc / 60, 0, 60, -90, 270);
  line(0, 0, cos(mnAngle) * clockRadius * 0.8, sin(mnAngle) * clockRadius * 0.8);

  stroke(255, 0, 0, 255 * fade);
  strokeWeight(3);
  let scAngle = map(sc, 0, 60, -90, 270);
  line(0, 0, cos(scAngle) * clockRadius * 0.9, sin(scAngle) * clockRadius * 0.9);
  pop();
}

function easeOutQuad(t) {
  return t * (2 - t);
}
