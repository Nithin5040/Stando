
'use client'

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet';

// Fix for default icon path issue with webpack
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41]
});

const agentIcon = L.divIcon({
    html: `<div class="h-6 w-6 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});



export default function AgentMap({ agents, center }) {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={icon}>
        <Popup>Your selected location</Popup>
      </Marker>
      {agents.map(agent => (
        <Marker key={agent.id} position={[agent.location.lat, agent.location.lng]} icon={agentIcon}>
           <Tooltip>
            {agent.name} ({agent.eta})
           </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
