# Air Traffic Control (ATC) Simulation

## Overview
This project simulates an **Air Traffic Control (ATC)** system as a full-stack web application.  
It showcases **core Operating System concepts** such as:
- Scheduling (priority-based: Emergency > VIP > Normal)
- Resource management (runways, taxiways, gates)
- Synchronization and concurrency
- Real-time event handling with WebSockets  

The system manages flight operations (landing, taxiing, docking, departure) while providing a **modern, interactive dashboard** for visualization.

---

## Features
- **Flight Management**: Add, edit, and delete flights
- **Real-time Dashboard**: Live updates via WebSockets
- **Priority Scheduling**: Emergency flights are handled first
- **Exclusive Resource Control**: Runways, taxiways, and gates
- **Event Logging**: Track landing, docking, departures, and transitions
- **Simulation Control**: Start/Stop simulation
- **Modern Frontend UI**: Built with React + TailwindCSS

---

## Tech Stack
### Frontend
- React + Vite
- TailwindCSS
- Socket.IO-client
- Axios

### Backend
- Node.js + Express
- Socket.IO
- Priority Queue-based Scheduler
- JSON storage for flight definitions
