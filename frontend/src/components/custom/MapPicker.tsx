import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lng: number, lat: number, address?: string) => void;
    initialLng?: number;
    initialLat?: number;
}

// Component to handle map clicks
function LocationMarker({
    position,
    setPosition,
    onLocationSelect,
}: {
    position: [number, number] | null;
    setPosition: (pos: [number, number]) => void;
    onLocationSelect: (lng: number, lat: number, address?: string) => void;
}) {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            reverseGeocode(lat, lng, onLocationSelect);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

// Reverse geocoding using Nominatim (OpenStreetMap)
async function reverseGeocode(
    lat: number,
    lng: number,
    callback: (lng: number, lat: number, address?: string) => void
) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const address = data.display_name || "Unknown location";
        callback(lng, lat, address);
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        callback(lng, lat);
    }
}

export const MapPicker = ({ onLocationSelect, initialLng, initialLat }: MapPickerProps) => {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );
    const [address, setAddress] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const mapRef = useRef<L.Map | null>(null);

    // Get user's current location on mount
    useEffect(() => {
        if (!initialLat && !initialLng && navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setPosition([lat, lng]);
                    reverseGeocode(lat, lng, (lng, lat, addr) => {
                        setAddress(addr || "");
                        onLocationSelect(lng, lat, addr);
                    });
                    setLoading(false);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    // Default to a central location if geolocation fails
                    const defaultLat = 20.5937;
                    const defaultLng = 78.9629; // Center of India
                    setPosition([defaultLat, defaultLng]);
                    setLoading(false);
                }
            );
        }
    }, [initialLat, initialLng, onLocationSelect]);

    const handlePositionChange = (lng: number, lat: number, addr?: string) => {
        setAddress(addr || "");
        onLocationSelect(lng, lat, addr);
    };

    // Default center if no position is set
    const center: [number, number] = position || [20.5937, 78.9629];

    return (
        <div className="space-y-3">
            <div className="h-96 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-lg">
                {loading ? (
                    <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <p className="text-gray-500">Loading map...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker
                            position={position}
                            setPosition={setPosition}
                            onLocationSelect={handlePositionChange}
                        />
                    </MapContainer>
                )}
            </div>

            {address && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Selected Location:
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{address}</p>
                </div>
            )}

            {position && (
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium">Latitude:</span> {position[0].toFixed(6)}
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span className="font-medium">Longitude:</span> {position[1].toFixed(6)}
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click anywhere on the map to select a location
            </p>
        </div>
    );
};
