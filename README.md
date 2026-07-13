# 🩺 MediCare EMR - Desktop Patient Record System

MediCare EMR is a native, offline-first Electronic Medical Records (EMR) application built specifically for private clinic practitioners. Designed to replace traditional paper-based charting, it provides a secure environment for patient registry tracking, clinical consultation notes, electronic prescriptions with built-in drug allergy checks, sick leave certificate logs, and scheduled appointments.

---

## 🌟 Key Product Features

### 👤 Patient Registry & Profile Management
- Detailed demographics registry (NIC/Passport, DOB, Blood Group, Habits).
- Dynamic age calculation and vital sign trackers (Height, Weight) with **auto-computed BMI metrics**.
- Historical consultation timeline with base64 clinical file/document uploader (Lab Reports, X-Rays).

### 🩺 Clinical Consultations
- Logs details for chief complaints, Present Illness history (HPI), physical exam notes, and diagnosis.
- Complete clinical plan tracker linked to individual patient profiles.

### 💊 E-Prescription Generator & Allergy Safety
- Scans patient profiles for drug allergies on input and raises alert prompts.
- Generates official prescription layouts showing clinic details and the doctor's scanned signature.
- Direct paper-printing layouts with custom CSS stylesheets.

### 📜 Certified Sick Leaves
- Form-driven medical certificate manager to issue rest periods and recovery remarks.
- Renders signed official sick leave slips ready for high-fidelity printing.

### 📅 Visual Appointments Calendar
- Interactive monthly grid displaying patient bookings.
- Filter controls to sort daily check-in states (Scheduled, Completed, Cancelled).

### 📊 Reports Dashboard & Offline Backups
- Dynamic demographics calculator presenting age group charts.
- CSV export utilities for Patients registry, Consultation logs, and General metrics.
- Import/Export manual database backups as localized `.json` files.

---

## 🛠️ Technology Stack
- **Frontend Framework:** React + Vite (TypeScript)
- **Styling Engine:** Tailwind CSS v4
- **Desktop Shell:** Electron (Node.js API wrapper)
- **Database Engine:** Offline-first Mock Relational Service inside browser `localStorage`
- **Application Packager:** `electron-builder`

---

## ⚙️ Development & Build Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server (Web App)
Runs the Vite server on port `3000`:
```bash
npm run dev
```

### 3. Run Desktop Application (Electron)

#### Production Bundle Mode (Loads offline dist files)
```bash
npm run build
npm run electron
```

#### Hot-Reload Developer Mode (Concurrently launches Vite + Electron window)
```bash
npm run electron-dev
```

### 4. Build Windows EXE Package
Packages the desktop shell into a single executable `.exe` installer under the `release/` folder:
```bash
npm run build
npm run dist
```
