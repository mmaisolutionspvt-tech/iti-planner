import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRoute, 
  faGasPump, 
  faClock, 
  faRoad, 
  faSearch, 
  faPlus, 
  faTrash, 
  faSpinner, 
  faLocationDot 
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { searchPlaces, getPlaceDetails } from '../../services/places';
import { getRoute } from '../../services/routing';

// Custom pin marker icon for map stops
const stopPinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #121619;
    color: #D4B15A;
    border: 2px solid #D4B15A;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 11px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Helper component to auto-recenter map view to fit route bounds
function MapBoundsFitter({ polylineCoords, stops }) {
  const map = useMap();

  useEffect(() => {
    if (polylineCoords && polylineCoords.length > 0) {
      const bounds = L.latLngBounds(polylineCoords);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (stops && stops.length > 0) {
      const validStops = stops.filter(s => s.lat && s.lng);
      if (validStops.length > 0) {
        const bounds = L.latLngBounds(validStops.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [map, polylineCoords, stops]);

  return null;
}

export default function RouteMapPanel({ initialStops = [], onStopsChange = null }) {
  const [stops, setStops] = useState(initialStops);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Sync initialStops if props change
  useEffect(() => {
    if (initialStops && initialStops.length > 0) {
      const formatted = initialStops.map((s, idx) => ({
        id: s.id || s.placeId || `stop_${idx}`,
        name: s.name || s.title || s.displayName || `Stop ${idx + 1}`,
        lat: Number(s.lat || s.latitude || 20.5937),
        lng: Number(s.lng || s.longitude || 78.9629),
        address: s.address || s.formattedAddress || ''
      }));
      setStops(formatted);
    }
  }, [initialStops]);

  // Debounced places search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPlaces(searchQuery);
        setSuggestions(results);
      } catch (err) {
        console.error("Search error in component:", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle selecting a place suggestion from autocomplete
  const handleSelectSuggestion = async (suggestion) => {
    setSearching(true);
    setSearchQuery('');
    setSuggestions([]);

    try {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        const newStop = {
          id: details.id || details.placeId || `stop_${Date.now()}`,
          name: details.displayName || details.name,
          lat: Number(details.lat),
          lng: Number(details.lng),
          address: details.formattedAddress || details.address || ''
        };

        const updated = [...stops, newStop];
        setStops(updated);
        if (onStopsChange) onStopsChange(updated);
        toast.success(`Added ${newStop.name} to route stops`);
      }
    } catch (err) {
      console.error("Failed to add place details:", err);
      toast.error("Could not add selected place");
    } finally {
      setSearching(false);
    }
  };

  // Remove stop
  const handleRemoveStop = (id) => {
    const updated = stops.filter(s => s.id !== id);
    setStops(updated);
    if (onStopsChange) onStopsChange(updated);
    setRouteInfo(null);
  };

  // Calculate driving route using OpenRouteService with Haversine fallback
  const handleCalculateRoute = async () => {
    const validStops = stops.filter(s => s.lat && s.lng);
    if (validStops.length < 2) {
      toast.info("Please add at least 2 stops to calculate a driving route");
      return;
    }

    setLoadingRoute(true);
    try {
      // ORS expects [[lng, lat], ...]
      const coords = validStops.map(s => [s.lng, s.lat]);
      const res = await getRoute(coords);
      if (res) {
        setRouteInfo(res);
        toast.success(`Route calculated! Total distance: ${res.distanceKm} km`);
      }
    } catch (err) {
      console.error("Route calculation error:", err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const centerLat = stops.length > 0 && stops[0].lat ? stops[0].lat : 22.3511;
  const centerLng = stops.length > 0 && stops[0].lng ? stops[0].lng : 78.6677;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-[#D4B15A] uppercase tracking-widest bg-[#D4B15A]/10 px-3 py-1 rounded-full border border-[#D4B15A]/20">
            🗺️ OpenRouteService + Google Places
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faRoute} className="text-[#D4B15A]" />
            <span>Interactive Driving Route & Distance</span>
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Search places, add stops, and calculate accurate driving time, distance, and fuel cost.
          </p>
        </div>

        <button
          onClick={handleCalculateRoute}
          disabled={loadingRoute || stops.length < 2}
          className="bg-[#121619] hover:bg-[#1e2429] text-[#D4B15A] disabled:bg-gray-300 disabled:text-gray-500 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-md cursor-pointer shrink-0"
        >
          {loadingRoute ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faRoad} />}
          <span>Calculate Driving Route</span>
        </button>
      </div>

      {/* Add Stop / Autocomplete Search */}
      <div className="relative mb-6">
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Add a stop (Search places, cities, attractions via Google Places API)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#D4B15A] focus:bg-white transition-all font-medium"
          />
          {searching && (
            <FontAwesomeIcon icon={faSpinner} spin className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4B15A]" />
          )}
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((item, i) => (
              <button
                key={item.placeId || i}
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-3 hover:bg-amber-50 border-b border-gray-50 last:border-none flex items-center justify-between transition-colors text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <FontAwesomeIcon icon={faLocationDot} className="text-[#D4B15A] shrink-0" />
                  <span className="font-semibold text-gray-800">{item.text || item.displayName}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {item.source === 'google' ? 'Google' : 'Offline'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Route Metrics Summary Cards */}
      {routeInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
              <FontAwesomeIcon icon={faRoad} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Distance</p>
              <p className="text-xl font-extrabold text-amber-950">{routeInfo.distanceKm} km</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Estimated Time</p>
              <p className="text-xl font-extrabold text-blue-950">{routeInfo.durationDisplay}</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
              <FontAwesomeIcon icon={faGasPump} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Est. Fuel Cost</p>
              <p className="text-xl font-extrabold text-emerald-950">₹{routeInfo.fuelCostInr}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stops Sequence Pills */}
      {stops.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {stops.map((stop, idx) => (
            <div 
              key={stop.id || idx}
              className="bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-800"
            >
              <span className="w-4 h-4 rounded-full bg-[#121619] text-[#D4B15A] flex items-center justify-center text-[10px] font-bold">
                {idx + 1}
              </span>
              <span>{stop.name}</span>
              <button 
                onClick={() => handleRemoveStop(stop.id)}
                className="text-gray-400 hover:text-red-500 ml-1 transition-colors"
                title="Remove stop"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Leaflet Map Rendering Polyline Route */}
      <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={6}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Polyline Driving Route */}
          {routeInfo?.polylineCoords && routeInfo.polylineCoords.length > 0 && (
            <Polyline
              positions={routeInfo.polylineCoords}
              color="#D4B15A"
              weight={5}
              opacity={0.8}
            />
          )}

          {/* Markers for stops */}
          {stops.map((s, idx) => (
            <Marker key={s.id || idx} position={[s.lat, s.lng]} icon={stopPinIcon}>
              <Popup>
                <div className="p-1 text-center">
                  <p className="font-bold text-xs text-gray-900">Stop #{idx + 1}: {s.name}</p>
                  {s.address && <p className="text-[11px] text-gray-500 mt-0.5">{s.address}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Fit map bounds dynamically */}
          <MapBoundsFitter polylineCoords={routeInfo?.polylineCoords} stops={stops} />
        </MapContainer>
      </div>

    </div>
  );
}
