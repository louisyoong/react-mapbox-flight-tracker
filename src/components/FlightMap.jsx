import React, { useCallback, useEffect, useRef, useState } from "react";
import Map from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { generateFlights } from "../data/flights"; // your dummy data generator

const MODEL_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scenegraph-layer/airplane.glb";
const REFRESH_INTERVAL = 1000 / 30; // 30 FPS

const INITIAL_VIEW_STATE = {
  latitude: 10,
  longitude: 110,
  zoom: 4,
  bearing: 0,
  pitch: 0,
};

const ANIMATIONS = {
  "*": { speed: 1 },
};

export default function FlightMap() {
  const [flights, setFlights] = useState([]);
  const flightData = useRef([]);

  useEffect(() => {
    const data = generateFlights();
    flightData.current = data;
    setFlights(data);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      flightData.current = flightData.current.map((flight) => {
        const R = 6371; // Earth radius in km
        const dist = ((flight.speed * REFRESH_INTERVAL) / 3600000) * 20; // move further
        const angleRad = (flight.heading * Math.PI) / 180;

        const dx =
          (dist / (111.32 * Math.cos((flight.position[1] * Math.PI) / 180))) *
          Math.sin(angleRad);
        const dy = (dist / 110.574) * Math.cos(angleRad);

        const newLng = flight.position[0] + dx;
        const newLat = flight.position[1] + dy;

        return {
          ...flight,
          position: [newLng, newLat, 10000], // constant altitude
        };
      });
      setFlights([...flightData.current]);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const layer = new ScenegraphLayer({
    id: "airplane-layer",
    data: flights,
    scenegraph: MODEL_URL,
    _animations: ANIMATIONS,
    sizeScale: 800,
    pickable: true,
    getPosition: (d) => d.position,
    getOrientation: (d) => {
      const pitch = 0;
      const yaw = -d.heading;
      return [pitch, yaw, 90];
    },
    getScale: [1, 1, 1],
    transitions: {
      getPosition: {
        duration: REFRESH_INTERVAL,
        easing: (t) => t * t * (3 - 2 * t),
      },
    },
  });

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={[layer]}
      getTooltip={({ object }) =>
        object &&
        `✈️ ${object.callsign}
Country: ${object.originCountry}
Speed: ${Math.round(object.speed)} km/h
Altitude: ${Math.round(object.position[2])} m`
      }
    >
      <Map
        reuseMaps
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken=""
      />
    </DeckGL>
  );
}
