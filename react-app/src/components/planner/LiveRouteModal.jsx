import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faUtensils, faBed, faMapLocationDot, faSpinner, faStar
} from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import { getRoute } from '../../services/routing';
import { searchPlaces, getPlaceDetails, geocodeCity } from '../../services/places';
import { haversineDistance } from '../../utils/haversine';

const hotelIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px;
    height: 28px;
    background: #0284c7;
    color: #fff;
    border: 2px solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">🏨</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const restIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: #ef4444;
    color: #fff;
    border: 2px solid #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">🍽️</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

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

function MapBoundsFitter({ boundsItems }) {
  const map = useMap();
  useEffect(() => {
    if (boundsItems && boundsItems.length > 0) {
      const bounds = L.latLngBounds(boundsItems);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, boundsItems]);
  return null;
}

export default function LiveRouteModal({ isOpen, onClose, fromCity, destinations }) {
  const [routeInfo, setRouteInfo] = useState(null);
  const [stops, setStops] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [findingRest, setFindingRest] = useState(false);
  const [activeHotelId, setActiveHotelId] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  
  const cities = [fromCity, ...destinations.split(',').map(s => s.trim()).filter(Boolean)];
  
  useEffect(() => {
    if (isOpen) {
      loadMapData();
    }
  }, [isOpen]);

  const loadMapData = async () => {
    setLoading(true);
    try {
      // 1. Geocode stops
      const geocodedStops = [];
      for (const city of cities) {
        if (!city) continue;
        const coords = await geocodeCity(city);
        if (coords) {
          geocodedStops.push({ name: city, lat: coords.lat, lng: coords.lng });
        }
      }
      setStops(geocodedStops);

      if (geocodedStops.length > 0) {
        setMapCenter([geocodedStops[0].lat, geocodedStops[0].lng]);
      }

      // 2. Fetch driving route
      let routeData = null;
      if (geocodedStops.length >= 2) {
        const coords = geocodedStops.map(s => [s.lng, s.lat]);
        routeData = await getRoute(coords);
        if (routeData) {
          setRouteInfo(routeData);
        }
      }

      // 3. Fetch databases concurrently
      const [hRes, rRes] = await Promise.all([
        fetch('/data/hotels.json').then(r => r.json()).catch(() => []),
        fetch(`/data/swiggy.json?v=${Date.now()}`).then(r => r.json()).catch(() => [])
      ]);

      const destCities = destinations.split(',').map(s => s.trim().toLowerCase());

      // Find hotels directly in destination cities
      const destHotels = hRes.filter(h => {
        const hCity = (h.city || '').toLowerCase();
        return destCities.includes(hCity);
      });

      // Find destination restaurants automatically using coordinates (within 15km)
      const destRests = rRes.filter(r => {
        const lat = Number(r.Latitude);
        const lng = Number(r.Longitude);
        if (!lat || !lng) return false;
        // Check if close to any stop (including origin)
        for (let i = 0; i < geocodedStops.length; i++) {
          if (haversineDistance(lat, lng, geocodedStops[i].lat, geocodedStops[i].lng) <= 15) {
            return true;
          }
        }
        return false;
      });

      const sortedDestRests = destRests
        .sort((a, b) => (parseFloat(b['Avg ratings']) || 0) - (parseFloat(a['Avg ratings']) || 0))
        .slice(0, 15)
        .map(r => ({
          ...r,
          id: r.ID || r.Restaurant,
          lat: Number(r.Latitude),
          lng: Number(r.Longitude)
        }));

      // Filter hotels & restaurants along the way (midway)
      if (routeData?.polylineCoords && routeData.polylineCoords.length > 0) {
        const polyline = routeData.polylineCoords;
        // Sample polyline to optimize haversine checks
        const sampledPolyline = [];
        const step = Math.max(1, Math.floor(polyline.length / 45));
        for (let i = 0; i < polyline.length; i += step) {
          sampledPolyline.push(polyline[i]);
        }
        if (!sampledPolyline.includes(polyline[polyline.length - 1])) {
          sampledPolyline.push(polyline[polyline.length - 1]);
        }

        // Check if a point is close to origin or destinations
        const isNearOriginOrDest = (lat, lng) => {
          if (geocodedStops.length === 0) return false;
          // Check origin
          const dOrigin = haversineDistance(lat, lng, geocodedStops[0].lat, geocodedStops[0].lng);
          if (dOrigin < 50) return true;
          // Check destinations
          for (let i = 1; i < geocodedStops.length; i++) {
            const dDest = haversineDistance(lat, lng, geocodedStops[i].lat, geocodedStops[i].lng);
            if (dDest < 50) return true;
          }
          return false;
        };

        // Check if a point is close to the polyline route
        const isNearPolyline = (lat, lng, maxDistKm = 30) => {
          for (const pt of sampledPolyline) {
            const d = haversineDistance(lat, lng, pt[0], pt[1]);
            if (d <= maxDistKm) return true;
          }
          return false;
        };

        // Filter midway hotels
        const midwayHotels = hRes.filter(h => {
          const lat = Number(h.latitude);
          const lng = Number(h.longitude);
          if (!lat || !lng) return false;
          return !isNearOriginOrDest(lat, lng) && isNearPolyline(lat, lng, 30);
        });

        // Filter midway restaurants from Swiggy
        const midwayRests = rRes.filter(r => {
          const lat = Number(r.Latitude);
          const lng = Number(r.Longitude);
          if (!lat || !lng) return false;
          return !isNearOriginOrDest(lat, lng) && isNearPolyline(lat, lng, 30);
        });

        // Merge destination hotels and midway hotels (cap at 15 dest + 15 midway)
        const sortedMidwayHotels = midwayHotels.sort((a, b) => (b.hotel_stars || 0) - (a.hotel_stars || 0));
        setHotels([
          ...destHotels.slice(0, 15),
          ...sortedMidwayHotels.slice(0, 15)
        ]);

        // Map midway restaurants (cap at 15, sorted by rating)
        const sortedMidwayRests = midwayRests
          .sort((a, b) => (parseFloat(b['Avg ratings']) || 0) - (parseFloat(a['Avg ratings']) || 0))
          .slice(0, 15)
          .map(r => ({
            ...r,
            id: r.ID || r.Restaurant,
            lat: Number(r.Latitude),
            lng: Number(r.Longitude)
          }));
        
        setRestaurants([...sortedDestRests, ...sortedMidwayRests]);
      } else {
        // Fallback if routing polyline calculation fails
        setHotels(destHotels.slice(0, 20));
        setRestaurants(sortedDestRests);
      }

    } catch (error) {
      console.error("Error loading live route data", error);
      toast.error("Failed to load map data.");
    } finally {
      setLoading(false);
    }
  };

  const handleFindRestaurants = async (hotel) => {
    if (findingRest) return;
    setFindingRest(true);
    setActiveHotelId(hotel.id);
    
    try {
      const res = await fetch(`/data/swiggy.json?v=${Date.now()}`);
      const allRests = await res.json();
      
      const hotelLat = Number(hotel.latitude || hotel.lat);
      const hotelLng = Number(hotel.longitude || hotel.lng);

      if (!hotelLat || !hotelLng) {
        throw new Error("Hotel does not have coordinates.");
      }

      // 1. Search locally within 10km radius from Swiggy database
      const localRests = allRests
        .filter(r => {
          const rLat = Number(r.Latitude);
          const rLng = Number(r.Longitude);
          if (!rLat || !rLng) return false;
          return haversineDistance(hotelLat, hotelLng, rLat, rLng) <= 10;
        })
        .sort((a, b) => (parseFloat(b['Avg ratings']) || 0) - (parseFloat(a['Avg ratings']) || 0))
        .slice(0, 5)
        .map(r => ({
          ...r,
          id: r.ID || r.Restaurant,
          lat: Number(r.Latitude),
          lng: Number(r.Longitude)
        }));

      if (localRests.length > 0) {
        setRestaurants(prev => [...prev, ...localRests.filter(lr => !prev.some(p => p.id === lr.id))]);
        toast.success(`Found ${localRests.length} top-rated restaurants near ${hotel.property_name}`);
      } else {
        // 2. Fallback to Google Places Text Search near hotel coordinates
        toast.info("Searching Google for restaurants near hotel...");
        const query = `restaurants near ${hotel.property_name} ${hotel.city || ''}`;
        const searchRes = await searchPlaces(query);
        if (searchRes && searchRes.length > 0) {
          const plottedRestaurants = [];
          for (const item of searchRes.slice(0, 3)) {
            const details = await getPlaceDetails(item.placeId);
            if (details && details.lat && details.lng) {
              plottedRestaurants.push({
                Restaurant: details.displayName || details.name,
                'Food type': 'Dining',
                'Avg ratings': details.rating || 4.5,
                Price: '500',
                id: details.id,
                lat: details.lat,
                lng: details.lng
              });
            }
          }
          if (plottedRestaurants.length > 0) {
            setRestaurants(prev => [...prev, ...plottedRestaurants.filter(pr => !prev.some(p => p.id === pr.id))]);
            toast.success(`Found ${plottedRestaurants.length} restaurants via Google`);
          } else {
            toast.warn("No restaurants found near this location.");
          }
        } else {
          toast.warn("No restaurants found near this location.");
        }
      }

    } catch (err) {
      console.error("Error finding restaurants:", err);
      toast.error("Error finding nearby restaurants.");
    } finally {
      setFindingRest(false);
      setActiveHotelId(null);
    }
  };

  if (!isOpen) return null;

  const boundsItems = [];
  if (routeInfo?.polylineCoords) boundsItems.push(...routeInfo.polylineCoords);
  if (!routeInfo && stops.length > 0) boundsItems.push(...stops.map(s => [s.lat, s.lng]));

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                <FontAwesomeIcon icon={faMapLocationDot} className="text-[#D4B15A]" />
                Live Route & Exploration
              </h2>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <p className="text-xs text-gray-500">
                  From {fromCity} to {destinations}. Explore hotels and restaurants along the way.
                </p>
                {routeInfo && (
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-700 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg">
                    <span className="flex items-center gap-1">🛣️ {routeInfo.distanceKm} km</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1">⏱️ {routeInfo.durationDisplay}</span>
                    {routeInfo.fuelCostInr > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1">⛽ Est. ₹{routeInfo.fuelCostInr}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Map Body */}
          <div className="flex-grow relative bg-gray-100">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 backdrop-blur-sm">
                <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-[#D4B15A] mb-4" />
                <p className="text-gray-600 font-medium">Calculating route & plotting hotels...</p>
              </div>
            ) : (
              <MapContainer
                center={mapCenter}
                zoom={6}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Polyline Route */}
                {routeInfo?.polylineCoords && routeInfo.polylineCoords.length > 0 && (
                  <Polyline
                    positions={routeInfo.polylineCoords}
                    color="#121619"
                    weight={5}
                    opacity={0.8}
                    dashArray="10, 10"
                  />
                )}

                {/* Main Stops */}
                {stops.map((s, idx) => (
                  <Marker key={s.name + idx} position={[s.lat, s.lng]} icon={stopPinIcon}>
                    <Popup>
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">Stop {idx + 1}</div>
                    </Popup>
                  </Marker>
                ))}

                {/* Hotels */}
                {hotels.map((h, idx) => (
                  <Marker key={h.id || idx} position={[h.latitude, h.longitude]} icon={hotelIcon}>
                    <Popup className="custom-popup">
                      <div className="p-1 max-w-[200px]">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-1">{h.property_name}</h4>
                        <div className="flex items-center gap-1 text-xs text-amber-500 mb-2">
                          <FontAwesomeIcon icon={faStar} />
                          <span className="font-bold text-gray-700">{h.hotel_stars} Stars</span>
                          <span className="text-gray-400">| ₹{h.price_per_night_inr}</span>
                        </div>
                        
                        <button
                          onClick={() => handleFindRestaurants(h)}
                          disabled={findingRest && activeHotelId === h.id}
                          className="w-full bg-[#D4B15A] hover:bg-[#c19b48] text-white disabled:bg-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 mt-2 shadow-sm"
                        >
                          {findingRest && activeHotelId === h.id ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                          ) : (
                            <FontAwesomeIcon icon={faUtensils} />
                          )}
                          Find Restaurants
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Swiggy Restaurants */}
                {restaurants.map((r, idx) => (
                  <Marker key={r.id || idx} position={[r.lat, r.lng]} icon={restIcon}>
                    <Popup>
                      <div className="p-1">
                        <h4 className="font-bold text-gray-900 text-sm">{r.Restaurant}</h4>
                        <p className="text-xs text-gray-500">{r['Food type']}</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1 font-bold">
                          <FontAwesomeIcon icon={faStar} />
                          <span>{r['Avg ratings']}</span>
                          <span className="text-gray-400 font-normal">| ₹{r.Price} for two</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                <MapBoundsFitter boundsItems={boundsItems} />
              </MapContainer>
            )}
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; padding: 4px; }
            .custom-popup .leaflet-popup-content { margin: 8px 10px; }
          `}} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
