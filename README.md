# ✈️ 3D Global Flight Tracker with Deck.gl + Mapbox

This project shows how to create a real-time animated 3D flight simulation using:

- 🌍 **Mapbox** (via react-map-gl)
- 🛫 **Deck.gl ScenegraphLayer**
- 🔁 Dummy data for 300+ global flights
- 🧭 Heading-based movement with speed & altitude
- 📦 Built with React + Vite

![demo screenshot](https://github.com/louisyoong/react-mapbox-flight-tracker/blob/master/src/assets/screenshoot.png)

---

## 🚀 Features

- 3D airplane model rendered with `ScenegraphLayer`
- 300+ flights flying randomly around the world
- Smooth animation with real-time heading and velocity
- Tooltip shows callsign, country, speed & altitude

---

## 📦 Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vite.dev/)
- [Deck.gl](https://deck.gl/)
- [Mapbox](https://www.mapbox.com/)
- [react-map-gl](https://visgl.github.io/react-map-gl/)

---

## 🛠️ Setup

```bash
git clone https://github.com/your-username/react-mapbox-flight-tracker.git
cd react-mapbox-flight-tracker
npm install
npm run dev

---
🔑 Mapbox Token Required
This project uses Mapbox for the base map. You need your own Mapbox access token to run it.

Step-by-Step to get a token:
Go to https://account.mapbox.com/

Log in or sign up

Copy your Default public token from the Access Tokens section

Create .env file in the project root:
env
Copy
Edit
# .env
VITE_MAPBOX_TOKEN=your_mapbox_token_here

