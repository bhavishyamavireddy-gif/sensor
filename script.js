const API_URL = "http://127.0.0.1:5000";

const slider = document.getElementById("lightSlider");
const visibilitySelect = document.getElementById("visibilitySelect");
const sliderValue = document.getElementById("sliderValue");
const intensityValue = document.getElementById("intensityValue");
const brightnessValue = document.getElementById("brightnessValue");
const lightStatus = document.getElementById("lightStatus");
const statusDescription = document.getElementById("statusDescription");
const modelStatus = document.getElementById("modelStatus");
const connectionStatus = document.getElementById("connectionStatus");
const connectionDot = document.getElementById("connectionDot");
const highway = document.getElementById("highway");
const sceneLabel = document.getElementById("sceneLabel");
const decisionReason = document.getElementById("decisionReason");
const errorMessage = document.getElementById("errorMessage");
const dailyUsage = document.getElementById("dailyUsage");
const dailySavings = document.getElementById("dailySavings");
const savingsPercent = document.getElementById("savingsPercent");

let requestNumber = 0;

function updateEnergy(brightness) {
  const baseline = 12;
  const usage = baseline * brightness / 100;
  const saved = baseline - usage;
  dailyUsage.textContent = `${usage.toFixed(1)} kWh`;
  dailySavings.textContent = `${saved.toFixed(1)} kWh`;
  savingsPercent.textContent = `${(saved / baseline * 100).toFixed(0)}%`;
}

function updateHighway(intensity, status, visibility) {
  highway.classList.remove("day", "dim", "night", "lights-on", "dim-lights", "foggy", "rainy");
  if (intensity > 60) highway.classList.add("day");
  else if (intensity > 30) highway.classList.add("dim");
  else highway.classList.add("night");

  if (status === "ON") highway.classList.add("lights-on");
  if (status === "DIM") highway.classList.add("dim-lights");
  if (visibility === "fog") highway.classList.add("foggy");
  if (visibility === "rain") highway.classList.add("rainy");

  sceneLabel.textContent = `LIGHT: ${intensity}% · VISIBILITY: ${visibility.toUpperCase()} · AI: ${status}`;
}

async function predictLighting() {
  const currentRequest = ++requestNumber;
  const intensity = Number(slider.value);
  const visibility = visibilitySelect.value;

  sliderValue.textContent = intensity;
  intensityValue.textContent = intensity;
  errorMessage.textContent = "";
  lightStatus.textContent = "Thinking...";
  statusDescription.textContent = "Requesting Python AI prediction";

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intensity, visibility })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Prediction failed");
    if (currentRequest !== requestNumber) return;

    lightStatus.textContent = result.status;
    brightnessValue.textContent = result.brightness;
    statusDescription.textContent = result.message;
    modelStatus.textContent = "Connected";
    connectionStatus.textContent = "AI Backend Online";
    connectionDot.classList.add("online");
    decisionReason.textContent = `AI decision: ${result.status} at ${result.brightness}% brightness. ${result.message}`;
    updateHighway(intensity, result.status, visibility);
    updateEnergy(result.brightness);
  } catch (error) {
    if (currentRequest !== requestNumber) return;
    modelStatus.textContent = "Offline";
    connectionStatus.textContent = "Backend Offline";
    connectionDot.classList.remove("online");
    lightStatus.textContent = "Unavailable";
    brightnessValue.textContent = "--";
    statusDescription.textContent = "Could not reach Python AI";
    sceneLabel.textContent = "AI BACKEND NOT CONNECTED";
    decisionReason.textContent = "Start the Python Flask backend and refresh the page.";
    errorMessage.textContent = `Connection error: ${error.message}`;
  }
}

slider.addEventListener("input", predictLighting);
visibilitySelect.addEventListener("change", predictLighting);
document.querySelectorAll("[data-intensity]").forEach(button => {
  button.addEventListener("click", () => {
    slider.value = button.dataset.intensity;
    predictLighting();
  });
});

fetch(`${API_URL}/`)
  .then(response => {
    if (!response.ok) throw new Error("Backend unavailable");
    return response.json();
  })
  .then(() => predictLighting())
  .catch(() => {
    connectionStatus.textContent = "Backend Offline";
    modelStatus.textContent = "Offline";
    errorMessage.textContent = "Python backend start chesi page refresh cheyyi.";
  });


// Optional webcam brightness estimation. The video stays in the browser;
// only the resulting intensity number is used for an AI prediction.
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const cameraIntensity = document.getElementById("cameraIntensity");
const cameraStatus = document.getElementById("cameraStatus");
const startCameraButton = document.getElementById("startCamera");
const stopCameraButton = document.getElementById("stopCamera");
const useCameraReadingButton = document.getElementById("useCameraReading");

let cameraStream = null;
let cameraTimer = null;
let latestCameraIntensity = null;

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraStatus.textContent = "Camera API unavailable. Open this page using localhost/Live Server or HTTPS in a supported browser.";
    return;
  }

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
    cameraVideo.srcObject = cameraStream;
    cameraPlaceholder.style.display = "none";
    startCameraButton.disabled = true;
    stopCameraButton.disabled = false;
    useCameraReadingButton.disabled = false;
    cameraStatus.textContent = "Camera active. Point it at the scene you want to estimate.";
    cameraTimer = window.setInterval(sampleCameraBrightness, 800);
  } catch (error) {
    cameraStatus.textContent = `Could not start camera: ${error.message}. Check browser camera permission.`;
  }
}

function sampleCameraBrightness() {
  if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) return;

  const width = 64;
  const height = 48;
  cameraCanvas.width = width;
  cameraCanvas.height = height;

  const context = cameraCanvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(cameraVideo, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;

  let totalLuminance = 0;
  let count = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    // Approximate perceived luminance from RGB.
    totalLuminance += 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    count++;
  }

  // Normalize average pixel brightness to 0-100. This is an image estimate,
  // not a lux reading; exposure and camera settings affect the result.
  latestCameraIntensity = Math.round((totalLuminance / count / 255) * 100);
  cameraIntensity.textContent = latestCameraIntensity;
  cameraStatus.textContent = `Camera active · estimated image brightness ${latestCameraIntensity}%.`;
}

function stopCamera() {
  if (cameraTimer !== null) {
    window.clearInterval(cameraTimer);
    cameraTimer = null;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraVideo.srcObject = null;
  cameraPlaceholder.style.display = "grid";
  startCameraButton.disabled = false;
  stopCameraButton.disabled = true;
  useCameraReadingButton.disabled = true;
  cameraStatus.textContent = "Camera stopped.";
}

startCameraButton.addEventListener("click", startCamera);
stopCameraButton.addEventListener("click", stopCamera);
useCameraReadingButton.addEventListener("click", () => {
  if (latestCameraIntensity === null) {
    cameraStatus.textContent = "Wait until a camera brightness reading appears.";
    return;
  }
  slider.value = latestCameraIntensity;
  predictLighting();
  cameraStatus.textContent = `Using camera-estimated intensity ${latestCameraIntensity}% for AI prediction.`;
});

window.addEventListener("beforeunload", stopCamera);
