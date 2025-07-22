import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Fix untuk ikon marker default yang rusak di React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// ====================================================================
// Komponen Inti Baru: Menggabungkan Logika Pencarian dan Klik
// ====================================================================
function MapController({ onLocationChange }) {
  const [position, setPosition] = useState(null);
  const map = useMap();

  // Efek untuk menambahkan kontrol pencarian saat peta siap
  useEffect(() => {
    // PENINGKATAN #1: Fokuskan pencarian ke area Riau
    const riauBoundingBox = [
      100.0, // Longitude minimum
      -1.0,  // Latitude minimum
      104.0, // Longitude maksimum
      3.0    // Latitude maksimum
    ];

    const provider = new OpenStreetMapProvider({
      params: {
        viewbox: riauBoundingBox.join(','), // Prioritaskan hasil di dalam kotak ini
        bounded: 1, // Batasi hasil hanya di dalam viewbox
      },
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false, // Kita akan kelola marker-nya sendiri
      autoClose: true,
      searchLabel: 'Cari alamat atau nama tempat...',
    });

    // PENINGKATAN #2: Event listener saat hasil pencarian dipilih
    const onSearchResult = (result) => {
      const newPos = { lat: result.location.y, lng: result.location.x };
      setPosition(newPos);
      onLocationChange(newPos);
      map.flyTo(newPos, 17); // Zoom ke lokasi yang dipilih
    };

    map.addControl(searchControl);
    map.on('geosearch/showlocation', onSearchResult); // Dengarkan event

    // Fungsi cleanup
    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', onSearchResult);
    };
  }, [map, onLocationChange]);

  // Event handler untuk klik manual di peta
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi Usaha Anda</Popup>
    </Marker>
  );
}


function MapPicker({ onLocationChange }) {
  const initialCenter = [0.5071, 101.4478]; // Pekanbaru

  return (
    <MapContainer center={initialCenter} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Gunakan komponen controller yang sudah ditingkatkan */}
      <MapController onLocationChange={onLocationChange} />
    </MapContainer>
  );
}

export default MapPicker;