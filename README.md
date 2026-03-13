## Fungi-finder 🍄
AI-powered web application for wild mushroom identification and toxicity detection with record management and statistical software.

## About

The system helps users in Sri Lanka identify wild mushrooms, assess their toxicity level (edible, poisonous, or suspicious), and provides safety warnings and emergency guidance. It combines deep learning image classification with GPS tracking, interactive mapping, analytics dashboards, and an emergency-ready chatbot assistant.

## Features

- **AI Mushroom Identification** — Upload mushroom images for real-time species classification using MobileNetV2 CNN trained on 8,611 images across 12 species classes
- **Toxicity Classification** — Three-tier system: Edible, Poisonous, Suspicious with context-sensitive safety warnings
- **Non-Mushroom Detection** — Rejects non-mushroom images using prediction entropy analysis
- **Fake Image Detection** — Detects cartoon/illustration images using color variety, edge pattern, and saturation analysis
- **Analytics Dashboard** — Interactive charts using Chart.js (toxicity pie chart, species bar chart, weekly trends line chart)
- **Interactive Map** — GPS-tagged mushroom sightings on Leaflet.js map with toxicity filter toggles
- **Records Management** — Store identifications with GPS coordinates, view personal history, delete records
- **Admin Panel** — User management, role changes, records management, system statistics
- **Chatbot Assistant** — Mushroom knowledge base covering 9 genera with Sri Lankan emergency contacts and first aid instructions
- **Authentication** — JWT-based login/register with role-based access control (User, Researcher, Admin)
- **CSV Export** — Export dashboard statistics for research use

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend | React.js | Single-page application UI |
| Frontend | Chart.js | Dashboard data visualization |
| Frontend | Leaflet.js | Interactive sightings map |
| Frontend | Axios | HTTP client for API calls |
| Backend | Node.js + Express.js | REST API server |
| Backend | Mongoose | MongoDB ODM |
| Backend | jsonwebtoken | JWT authentication |
| Backend | bcryptjs | Password hashing |
| Backend | Multer | Image file upload handling |
| AI Service | Python + Flask | AI prediction API |
| AI Service | TensorFlow / Keras | MobileNetV2 deep learning model |
| AI Service | Pillow | Image preprocessing |
| Database | MongoDB Atlas | Cloud NoSQL database |
| Training | Google Colab | GPU-accelerated model training |


## Project Structure
 
```
mushroom-safety-system/
├── frontend/               # React.js frontend application
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app with routing
│   │   └── App.css         # Global styles
│   └── package.json
│
├── backend/                # Node.js + Express.js API server
│   ├── models/             # Mongoose schemas (User, Identification)
│   ├── routes/             # API route handlers (auth, identify, admin)
│   ├── middleware/         # JWT auth and role-based access middleware
│   ├── uploads/            # Stored mushroom images
│   ├── server.js           # Main server entry point
│   └── .env                # Environment variables (not committed)
│
├── ai-service/             # Flask AI prediction service
│   ├── run_ai_service.py   # Flask server with prediction endpoint
│   ├── model.h5            # Trained MobileNetV2 model (not committed)
│   └── class_names.json    # Species class mapping
│
└── training/               # Model training scripts
    └── train_model.ipynb   # Google Colab training notebook
```
## Prerequisites
 
- Node.js v18+
- Python 3.9+
- MongoDB Atlas account
