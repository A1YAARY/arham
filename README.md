# Arham Fintech - Internal Operations Portal & BSE Simulator

Complete repository containing **Part A (Mock BSE Exchange API)** and **Part B (Internal Operations Portal)** for Arham Fintech Private Limited.

---

## 🚀 Quickstart & Running Instructions

### 1. Backend Setup (Part A Simulator + Part B Portal API)

```bash
cd backend
npm install
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Part A Mock BSE Feed**: `http://localhost:5000/api/bse`
- **Part B Operations API**: `http://localhost:5000/api/portal`

### 2. Frontend Setup (Part B Internal Web Portal)

```bash
cd frontend
npm install
npm run dev
```
- **Internal Portal Dashboard**: `http://localhost:3000`

---

## 🏛 Architecture & Design Highlights

- **Architecture Details**: Read the full 1-page architecture design and 100x scaling strategy in [ARCHITECTURE.md](file:///Users/harshpoojary/Developer/arham/ARCHITECTURE.md).
- **Sub-Second Screen Loads**: All screens load in < 50ms from local DB cache regardless of BSE Exchange availability.
- **Real-Time Push Updates**: Socket.IO WebSockets update open screens dynamically as new BSE data chunks arrive.
- **Fault-Tolerant Ingestion**: Retries chunked pulls with exponential backoff and idempotent SQL upserts against simulated 20% drops and 30s connection limits.
