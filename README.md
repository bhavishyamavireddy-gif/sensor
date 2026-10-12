# SunSense AI — Smart Highway Lighting Optimizer

A hardware-free software prototype using a virtual light sensor, a Random Forest model, a Flask API, and a browser dashboard.

## Features
- Virtual ambient-light intensity slider (0–100%)
- Machine-learning prediction: OFF / DIM / ON
- Demo visibility choices: clear, rain, fog
- Demo policy: rain/fog keeps lights ON for visibility; clear weather follows ambient light
- Highway visualization and illustrative energy estimates
- Responsive dashboard

## Important limitations
- The sensor is simulated in software; no physical sensor is connected.
- Training data is synthetic and generated from an example policy. The model demonstrates an ML workflow, not validated real-world intelligence.
- Weather/visibility choices are manual demo inputs, not live weather detection.
- Energy values are illustrative estimates, not measured savings.
- This prototype does not control a real streetlight. Real deployment requires physical sensors, a controller, properly rated isolated drivers, safety review, and professional testing.

## Windows / VS Code setup

### 1. Install dependencies
Open the project folder `SunSenseAI` in VS Code. In Terminal > New Terminal, run:

```powershell
python -m pip install -r requirements.txt
```

### 2. Train the model
Run this from the main `SunSenseAI` folder:

```powershell
python .\ai_backend\train_ai.py
```

This creates `ai_backend/sunsense_model.pkl`.

### 3. Start the backend
In the same terminal, run:

```powershell
python .\ai_backend\app.py
```

Keep this terminal open. The API runs at `http://127.0.0.1:5000`.

### 4. Open the website
Open `index.html` with VS Code Live Server. If Live Server is not installed, use VS Code Extensions to install **Live Server**, then right-click `index.html` and choose **Open with Live Server**.

### 5. Test
- Light 10%, clear visibility → ON / 100%
- Light 45%, clear visibility → DIM / 50%
- Light 90%, clear visibility → OFF / 0%
- Choose Rain or Fog → ON / 100% in this demo policy

If the dashboard says Backend Offline, make sure Step 3's terminal is still running and refresh the page.

## Project structure

```text
SunSenseAI/
├── index.html
├── style.css
├── script.js
├── requirements.txt
├── README.md
└── ai_backend/
    ├── train_ai.py
    ├── app.py
    └── sunsense_model.pkl  # created after training
```


## Optional webcam brightness feature
- Open the website using VS Code Live Server (`localhost`) or HTTPS.
- Click **Start camera** and grant camera permission.
- The browser calculates an approximate average image brightness locally.
- Click **Use camera reading** to send the percentage to the Python AI model.
- Camera frames are processed in the browser; they are not uploaded to Flask.
- This is not a calibrated LDR/lux sensor. Auto-exposure, scene composition, and lighting can affect the estimate. It does not detect weather reliably and is not a real streetlight controller.
