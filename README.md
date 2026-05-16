# 🍄 FungiFinder — Wild Mushroom Identification & Toxicity Detection System
 
> AI-powered web application for wild mushroom identification and toxicity detection with record management, statistical analytics, and emergency guidance — built for Sri Lanka.

## 📋 About
 
Mushroom poisoning is a significant public health concern in Sri Lanka, where traditional foraging practices often lead to misidentification of toxic species. FungiFinder addresses this gap by providing an AI-powered web application that helps users identify wild mushrooms, assess their toxicity level, and make safer decisions.
 
The system combines deep learning image classification with GPS tracking, interactive mapping, analytics dashboards, and an emergency-ready chatbot assistant — all accessible through a modern web interface.
 
---
 
## ✨ Features
 
### Core AI Features
- **AI Mushroom Identification** — Upload mushroom images for real-time species classification using MobileNetV2 CNN trained on 8,611 images across 12 species
- **Three-Tier Toxicity Classification** — Edible, Poisonous, Suspicious with context-sensitive safety warnings
- **Non-Mushroom Detection** — Rejects non-mushroom images using prediction entropy analysis (Shannon entropy + confidence gap)
- **Fake Image Detection** — Detects cartoon/illustration images using color variety, edge pattern, saturation, and background uniformity analysis
- **Responsible AI Disclaimer** — Confirmation modal before identification with accuracy limitations clearly stated
### Data & Analytics
- **Analytics Dashboard** — Interactive charts using Chart.js (toxicity distribution, species bar chart, weekly trends, monthly trends)
- **Date Range Filter** — Filter dashboard data by All Time, Last 7 Days, 30 Days, or 90 Days
- **CSV Export** — Export dashboard statistics for research purposes
- **Records Management** — Store identifications with GPS coordinates, search, filter, sort, grid/list view toggle
### Map & Location
- **Interactive Sighting Map** — GPS-tagged mushroom sightings on Leaflet.js map centered on Sri Lanka
- **Toxicity Filter Toggles** — Show/hide edible, poisonous, suspicious markers on map
- **Color-Coded Markers** — Green (edible), Yellow (suspicious), Red (poisonous)
### User Management & Security
- **JWT Authentication** — Secure login/register with token-based sessions
- **Role-Based Access Control** — Three roles: User, Researcher, Admin
- **Input Validation** — Password strength enforcement, email format validation, XSS sanitization
- **Admin Panel** — User management, role changes, records management, system-wide statistics
### Safety & Support
- **Chatbot Assistant** — Knowledge base covering 9 mushroom genera with emergency guidance
- **Chatbot Feedback System** — Thumbs up/down ratings for response quality tracking
- **Sri Lankan Emergency Contacts** — 119 (Emergency), 1990 (Ambulance), Poison Centre
- **First Aid Instructions** — Step-by-step guidance for suspected mushroom poisoning
- **Error Boundary** — Graceful error handling prevents app crashes
---

## 🏗️ System Architecture
 
```
┌─────────────────────────────────────────────────────────┐
│                    User (Web Browser)                     │
│              Chrome / Firefox / Edge                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Request
┌──────────────────────▼──────────────────────────────────┐
│              React.js Frontend (Port 3000)                │
│  ┌──────────┬───────────┬──────┬─────────┬────────────┐ │
│  │ Identify │ Dashboard │ Map  │ Records │  Chatbot   │ │
│  │          │ (Chart.js)│(Leaf)│         │            │ │
│  └──────────┴───────────┴──────┴─────────┴────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ Axios REST API + JWT Token
┌──────────────────────▼──────────────────────────────────┐
│           Node.js + Express.js Backend (Port 5000)       │
│  ┌────────────┬──────────────┬───────────┬────────────┐ │
│  │ Auth Routes│Identify Route│Admin Route│Record Route│ │
│  │ (JWT/bcrypt)│(Multer upload)│(RBAC)   │(History)   │ │
│  └────────────┴──────┬───────┴───────────┴────────────┘ │
│                      │                                    │
│              ┌───────▼────────┐    ┌──────────────────┐  │
│              │  Flask AI      │    │  MongoDB Atlas    │  │
│              │  Service       │    │  Cloud Database   │  │
│              │  (Port 5001)   │    │  (M0 Free Tier)  │  │
│              │                │    │                   │  │
│              │  MobileNetV2   │    │  ┌─────────────┐ │  │
│              │  + Entropy     │    │  │ users       │ │  │
│              │  + Image QA    │    │  │ identific.  │ │  │
│              │                │    │  └─────────────┘ │  │
│              └────────────────┘    └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```
 
---
 
## 🧠 AI Model Details
 
| Property | Value |
|----------|-------|
| Architecture | MobileNetV2 (Transfer Learning from ImageNet) |
| Input Size | 224 × 224 × 3 (RGB) |
| Training Dataset | 8,611 mushroom images |
| Species Classes | 12 (Agaricus, Amanita, Boletus, Cortinarius, Edible_Fungi, Entoloma, Hygrocybe, Lactarius, Mushrooms, Poisonous_Fungi, Russula, Suillus) |
| Training Accuracy | 80.7% |
| Training Approach | Two-phase: Feature extraction (10 epochs) → Fine-tuning (10 epochs) |
| Model Size | ~14MB (.h5 format) |
| Inference Time | < 3 seconds |
 
### Hybrid Five-Layer Safety Architecture
 
```
Layer 1: CNN Classification (MobileNetV2 + Transfer Learning)
    ↓
Layer 2: Non-Mushroom Detection (Prediction Entropy Analysis)
    ↓
Layer 3: Fake Image Detection (Image Quality Analysis)
    ↓
Layer 4: Rule-Based Toxicity Mapping (Edible / Poisonous / Suspicious)
    ↓
Layer 5: Confidence-Based Safety Warnings
```
 
### Version-Wise Model Evaluation
 
| Version | Description | Accuracy | F1-Score |
|---------|------------|----------|----------|
| V1 | Base (No Augmentation, Phase 1 Only) | 72.03% | 71.66% |
| V2 | With Data Augmentation (Phase 1) | 67.09% | 66.54% |
| V3 | Augmentation + Fine-tuning (Final) | 78.72% | 78.52% |
 
---
 
## 🛠️ Tech Stack
 
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React.js 19 | Single-page application UI |
| Frontend | Chart.js | Dashboard data visualization |
| Frontend | Leaflet.js | Interactive sightings map |
| Frontend | Axios | HTTP client for API calls |
| Backend | Node.js + Express.js 5 | REST API server |
| Backend | Mongoose | MongoDB ODM |
| Backend | jsonwebtoken | JWT authentication |
| Backend | bcryptjs | Password hashing (12 salt rounds) |
| Backend | Multer | Image file upload handling |
| AI Service | Python + Flask | AI prediction microservice |
| AI Service | TensorFlow / Keras | MobileNetV2 deep learning model |
| AI Service | Pillow + NumPy | Image preprocessing |
| Database | MongoDB Atlas | Cloud NoSQL database (M0 Free Tier) |
| Training | Google Colab | GPU-accelerated model training |
| Testing | Postman | REST API endpoint testing |
| Version Control | Git + GitHub | Source code management |
 
---
## 📁 Project Structure
 
```
Fungi-finder/
├── frontend/                   # React.js frontend application
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js       # Navigation with role-based links
│   │   │   ├── Navbar.css
│   │   │   ├── ErrorBoundary.js # Graceful error handling
│   │   │   └── ErrorBoundary.css
│   │   ├── pages/
│   │   │   ├── Home.js         # Landing page with features
│   │   │   ├── Identify.js     # Image upload + AI identification
│   │   │   ├── Dashboard.js    # Analytics with Chart.js
│   │   │   ├── Map.js          # Leaflet.js sighting map
│   │   │   ├── History.js      # Records with search/filter/sort
│   │   │   ├── Chatbot.js      # AI assistant with feedback
│   │   │   ├── AdminPanel.js   # Admin management panel
│   │   │   ├── Login.js        # User login
│   │   │   └── Register.js     # User registration
│   │   ├── App.js              # Main app with routing + ErrorBoundary
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css           # Global styles + CSS variables
│   └── package.json
│
├── backend/                    # Node.js + Express.js API server
│   ├── models/
│   │   ├── User.js             # User schema (name, email, password, role)
│   │   └── Identification.js   # Identification schema (species, toxicity, GPS)
│   ├── routes/
│   │   ├── auth.js             # Register/Login with input validation
│   │   ├── identify.js         # Image upload, AI proxy, CRUD operations
│   │   ├── records.js          # User records, map data, statistics
│   │   └── admin.js            # Admin dashboard, user/record management
│   ├── middleware/
│   │   └── auth.js             # JWT verification middleware
│   ├── app/ml/models/
│   │   ├── mushroom_model.h5   # Trained MobileNetV2 model
│   │   └── class_names.json    # Species classes + accuracy metadata
│   ├── uploads/                # Stored mushroom images
│   ├── server.js               # Express server entry point
│   ├── create-admin.js         # Admin account creation utility
│   ├── seedMapData.js          # Sample Sri Lanka sighting data (20 records)
│   ├── .env                    # Environment variables
│   └── package.json
│
├── ai-service/                 # Flask AI prediction microservice
│   ├── app.py                  # Basic Flask prediction server
│   └── .gitignore
│
├── training/                   # Model training pipeline
│   ├── train_model.py          # Full training script (dataset download → model export)
│   ├── run_ai_service.py       # Enhanced Flask server (entropy + image QA)
│   ├── combined_data/          # Training images (12 species folders)
│   └── data/                   # Raw downloaded datasets
│
├── .gitignore
├── .gitattributes
└── README.md
```
 
---
 
## 🚀 Installation & Setup
 
### Prerequisites
 
- Node.js v18+
- Python 3.9+
- MongoDB Atlas account (free M0 tier)
- Git
### 1. Clone the Repository
 
```bash
git clone https://github.com/Viyathmaranlini/Fungi-finder.git
cd Fungi-finder
```
 
### 2. Backend Setup
 
```bash
cd backend
npm install
```
 
Create `.env` file in the backend folder:
 
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_secret_key_here
```
 
```bash
node server.js
```
 ### Default Admin Account

To create an admin account, run:
```bash
node create-admin.js
```

Admin credentials:
- Email: admin@mushroom.com
- Password: Admin@123
Start the backend server:
 
 
### 3. AI Service Setup
 
```bash
cd ai-service
pip install tensorflow flask flask-cors pillow numpy
python app.py
```
### 4. Frontend Setup
 
```bash
cd frontend
npm install
npm start
```
 
### 5. Access the Application
 
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service | http://localhost:5001 |
 
---
