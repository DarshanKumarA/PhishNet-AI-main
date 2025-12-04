# 🛡️ PhishNet AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack AI-powered URL detection ecosystem that identifies phishing, malware, and defacement attacks in real-time using machine learning and heuristic analysis.

### 🏆 Achievements
* **🥇 Winner:** Project Exhibition 2025-26, Dept of AI & DS, KSSEM.
* **🥉 3rd Place:** IEEE National Level Project Exhibition at CMRIT.

---

##  About The Project

PhishNet AI addresses the growing threat of zero-day phishing attacks where traditional blacklist-based defenses fail. This application aggregates threat intelligence using a hybrid engine that combines Machine Learning probabilities with heuristic checks.

**The core strength of PhishNet AI lies in its browser extension**, which acts as a proactive shield. Unlike passive scanners, the extension analyzes every tab you visit in real-time, ensuring users are protected **before** they interact with malicious content. All data is synced locally, guaranteeing privacy and persistence across browsing sessions.

##  Key Features

* ✅ **Real-Time ML Prediction:** Instantly classifies URLs as Benign, Phishing, Malware, or Defacement.
* ✅ **Hybrid Analysis Engine:** Combines Machine Learning probabilities with heuristic checks (IP detection, suspicious TLDs).
* ✅ **Proactive Browser Extension:** A powerful Chrome extension that automatically scans active tabs in the background, offering zero-click protection without disrupting workflow.
* ✅ **Visual Analytics Dashboard:** Interactive charts and probability breakdowns to understand threat levels.
* ✅ **Local Storage Persistence:** Scan history is automatically synced to local storage without server overhead.
* ✅ **Full-Stack Architecture:** Decoupled architecture with a Python backend and a React frontend.
* ✅ **Responsive Design:** Works seamlessly across desktop and mobile browsers.

##  Tech Stack

This project was built using a modern full-stack architecture within a monorepo.

* **Frontend:**
    * [React](https://reactjs.org/) (with Vite)
    * [Tailwind CSS](https://tailwindcss.com/)
    * [Recharts](https://recharts.org/) for Data Visualization
    * Axios for API Calls

* **Backend:**
    * [Python](https://www.python.org/)
    * [FastAPI](https://fastapi.tiangolo.com/)
    * [Scikit-Learn](https://scikit-learn.org/) for Model Inference
    * [Uvicorn](https://www.uvicorn.org/) for Server
    * `pickle` for Model Serialization

* **APIs & Tools:**
    * Chrome Extensions API (Manifest V3)
    * Local Storage API

* **Deployment:**
    * Frontend: **Vercel**
    * Backend: **Render**
    * CI/CD pipeline managed from a single GitHub monorepo.

##  Getting Started (Local Setup)

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18 or later)
* Python (v3.8 or later)
* Git

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/DarshanKumarA/PhishNet-AI-main.git](https://github.com/DarshanKumarA/PhishNet-AI-main.git)
    cd PhishNet-AI-main
    ```

2.  **Setup the Backend (`/backend`):**
    * Navigate to the backend directory:
        ```sh
        cd backend
        ```
    * Install Python dependencies:
        ```sh
        pip install -r requirements.txt
        ```
    * Start the server:
        ```sh
        uvicorn main:app --reload
        ```

3.  **Setup the Frontend (`/frontend`):**
    * From the root directory, navigate to the frontend directory:
        ```sh
        cd frontend
        ```
    * Install NPM packages:
        ```sh
        npm install
        ```
    * Start the client:
        ```sh
        npm run dev
        ```

4.  **Setup the Extension (`/extension`):**
    * Open Chrome and navigate to `chrome://extensions`.
    * Enable **Developer Mode**.
    * Click **Load Unpacked** and select the `/extension` folder.

## 🔑 Environment Variables

You will need to configure environment variables for the frontend to run.

**1. Frontend (`/frontend/.env`):**
```sh
VITE_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
