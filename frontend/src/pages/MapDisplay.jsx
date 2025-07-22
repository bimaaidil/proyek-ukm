import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix untuk ikon default
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Komponen untuk mengontrol posisi peta secara dinamis
function MapViewUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);

  return null;
}

// Komponen MapDisplay utama
function MapDisplay({ ukms, center, zoom }) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: "500px", width: "100%", borderRadius: "8px", zIndex: 0 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Mapping marker untuk setiap UKM */}
      {ukms.map(ukm => (
        ukm.latitude && ukm.longitude && (
          <Marker key={ukm.id} position={[ukm.latitude, ukm.longitude]}>
            <Popup>
              <b>{ukm.nama_usaha}</b><br />
              {ukm.nama_pemilik}<br />
              {ukm.alamat}
              <hr style={{margin: '8px 0'}} />
              <a 
                href={`https://www.google.com/maps?q=${ukm.latitude},${ukm.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Buka di Google Maps
              </a>
            </Popup>
          </Marker>
        )
      ))}

      <MapViewUpdater center={center} zoom={zoom} />
    </MapContainer>
  );
}

export default MapDisplay;