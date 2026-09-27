# 🌿 Fimiku — Full-Stack E-Commerce Platform

A production-ready, full-stack e-commerce application for **Fimiku** — a premium baby brand specializing in safe, soft, and certified food-grade silicone teething, feeding, and bath essentials.

---

## 🏗️ System Architecture

```text
[ Next.js 14 Frontend (Storefront / App Router / Tailwind CSS) ]
                        │
                        ▼ (REST APIs / JSON / JWT)
[ Django 5.x REST Framework Backend ]
       │                │                │
       ▼                ▼                ▼
[ MongoDB Atlas ]  [ Google Gemini AI ]  [ Razorpay Gateway ]
 (Collections)     (Product Assistant)   (Payment Engine)
```

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Lucide React, Axios
- **Backend**: Python 3.10+, Django 5.x, Django REST Framework, SimpleJWT, CORS Headers
- **Database**: MongoDB (via `django-mongodb-backend` or MongoDB Atlas URI) / SQLite dev fallback
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `@google/genai`)
- **Payments**: Razorpay (Sandbox / Production mode)

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Django + DRF)

```powershell
# Navigate to backend folder
cd backend

# Create & activate virtual environment
py -m venv venv
venv\Scripts\activate      # On Windows (or: source venv/bin/activate on Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
copy .env.example .env    # On Windows (or: cp .env.example .env on Linux/Mac)

# Run database migrations
python manage.py makemigrations store
python manage.py migrate

# Seed catalog with food-grade silicone baby products
python seed_data.py

# Start Django backend server
python manage.py runserver 8000
```
Backend API will be live at: `http://localhost:8000/api/`

---

### 2. Frontend Setup (Next.js)

```powershell
# In a new terminal, navigate to frontend folder
cd frontend

# Install Node dependencies
npm install

# Copy environment variables
copy .env.local.example .env.local   # On Windows

# Start Next.js development server
npm run dev
```
Frontend Storefront will be live at: `http://localhost:3000`

---

## 📦 Key Endpoints

- `GET /api/products/` — List all products with search & category filters
- `GET /api/products/<id>/` — Product details with reviews
- `GET /api/categories/` — List active categories
- `GET /api/cart/` & `POST /api/cart/` — Session & user persistent cart
- `POST /api/payment/create-order/` — Create Razorpay order
- `POST /api/payment/verify/` — Verify Razorpay signature & update inventory
- `POST /api/ai/assistant/` — Gemini-powered catalog-grounded baby product advisor
