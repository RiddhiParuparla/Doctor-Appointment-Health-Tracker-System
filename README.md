# 🏥 HealthTrack: Doctor Appointment & Health Tracker System

A professional-grade, full-stack hospital management and health monitoring platform. Built for elite healthcare delivery with a focus on security, analytics, and patient care.

## 🌟 Key Features

### 👤 Patient Portal
- **Smart Booking**: Browse doctors by specialization and book available time slots.
- **Vitals Tracking**: Log blood pressure, sugar levels, and weight.
- **Visual Trends**: Interactive health history charts (Chart.js).
- **History Vault**: Access and download digital prescriptions and reports.

### 🩺 Doctor Portal
- **Consultation Queue**: Real-time management of pending, approved, and rejected appointments.
- **Clinical Review**: Access patient health history before consultations.
- **Digital Prescriptions**: Generate medicines lists and notes with report upload support.

### 🔐 Admin Intelligence
- **System Analytics**: View total patients, doctors, and appointment momentum (Daily stats).
- **Database Control**: Search and manage users and healthcare specialists.

### 🛡️ Core Security & Logic
- **Bcrypt Hashing**: Industry-standard password security.
- **JWT Protection**: Secure, role-based session management.
- **Rate Limiting**: Integrated protection against DDoS and account brute-forcing.
- **Risk Indicators**: Automated color-coded alerts (Red/Yellow/Green) based on vital thresholds.

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS, Chart.js, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Middlewares**: Helmet, Morgan, Express-Validator, Multer, Express-Rate-Limit.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```
Start the server:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 📁 Repository Structure
```text
HealthTrack/
├── server/      # Node/Express API with MVC Pattern
└── client/      # React Frontend with Tailwind & Vite
```
---
*Elevating healthcare through intelligent tracking.*
