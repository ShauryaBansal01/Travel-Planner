"use client";

import { Location } from "@/app/generated/prisma";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  itineraries: Location[];
}

export default function Map({ itineraries }: MapProps) {
  const center: [number, number] =
    itineraries.length > 0
      ? [itineraries[0].lat, itineraries[0].lng]
      : [0, 0];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-100">
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {itineraries.map((location, key) => (
          <Marker
            key={key}
            position={[location.lat, location.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="font-semibold text-gray-800">
                {location.locationTitle}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}