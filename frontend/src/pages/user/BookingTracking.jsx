import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, Shield, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet icons not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for Live User
const liveIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3710/3710297.png', // Just a placeholder pin
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const BookingTracking = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [timeRemaining, setTimeRemaining] = useState('00:00:00');
  const [isExpired, setIsExpired] = useState(false);

  const [pickupCoords, setPickupCoords] = useState(null); // [lat, lng]
  const [liveCoords, setLiveCoords] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
      
      // Geocode the location text to get coordinates
      if (response.data.vehicle?.location) {
        geocodeLocation(response.data.vehicle.location);
      } else {
        // Fallback default coordinates (e.g. New Delhi)
        setPickupCoords([28.6139, 77.2090]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const geocodeLocation = async (locationText) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`);
      if (res.data && res.data.length > 0) {
        setPickupCoords([parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]);
      } else {
        // Fallback
        setPickupCoords([28.6139, 77.2090]);
      }
    } catch (e) {
      setPickupCoords([28.6139, 77.2090]);
    }
  };

  // Live Timer Logic
  useEffect(() => {
    if (!booking) return;

    const interval = setInterval(() => {
      const start = new Date(booking.startDate).getTime();
      const end = start + (booking.durationHours * 60 * 60 * 1000);
      const now = new Date().getTime();

      if (now > end) {
        setIsExpired(true);
        setTimeRemaining('Expired');
        clearInterval(interval);
      } else if (now < start) {
        setTimeRemaining('Not Started Yet');
      } else {
        const diff = end - now;
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  // GPS Tracking Logic using Phone/Browser Location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLiveCoords([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location", error);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-slate-900 dark:text-white font-bold text-xl pt-20">Loading Tracking Data...</div>;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 pt-20">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{error || 'Booking not found'}</h2>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-3 bg-slate-900 text-white rounded-full font-bold">Go Back</button>
      </div>
    );
  }

  const { vehicle } = booking;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-20 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Live Ride Tracking</h1>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 mt-1">Booking ID: {booking._id}</p>
          </div>
          
          <div className={`px-4 py-2 rounded-full border font-bold text-sm flex items-center ${
            booking.status === 'confirmed' && !isExpired 
              ? 'bg-orange-50 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/30 text-orange-500' 
              : booking.status === 'completed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-500'
              : 'bg-zinc-100 border-zinc-200 text-zinc-500'
          }`}>
            {booking.status === 'confirmed' && !isExpired && <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>}
            {booking.status === 'completed' ? 'Ride Completed' : isExpired ? 'Ride Expired' : 'Ride In Progress'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-[600px] overflow-hidden relative transition-colors duration-300 z-0">
              
              {pickupCoords ? (
                <MapContainer center={liveCoords || pickupCoords} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Pickup Location Marker */}
                  <Marker position={pickupCoords}>
                    <Popup>
                      <strong>Pickup Location</strong><br/>
                      {vehicle.location}
                    </Popup>
                  </Marker>

                  {/* Simulated Live Vehicle Marker (using phone GPS) */}
                  {liveCoords && (
                    <Marker position={liveCoords} icon={liveIcon}>
                      <Popup>
                        <strong>Current Position</strong><br/>
                        (Your Device GPS)
                      </Popup>
                    </Marker>
                  )}

                  {/* Optional: Draw line between pickup and current */}
                  {pickupCoords && liveCoords && (
                    <Polyline positions={[pickupCoords, liveCoords]} color="#f97316" weight={4} dashArray="10, 10" />
                  )}
                </MapContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-100">
                  <span className="font-bold text-slate-500">Loading Map...</span>
                </div>
              )}
              
              {/* Overlay elements */}
              <div className="absolute top-6 left-6 right-6 flex justify-between z-[400] pointer-events-none">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 pointer-events-auto">
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Time Remaining</p>
                  <p className={`text-2xl font-black ${isExpired ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {timeRemaining}
                  </p>
                </div>
                <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg pointer-events-auto cursor-pointer" onClick={() => {
                  if (liveCoords && pickupCoords) {
                    // This is just a UI button, actual map recentering could be implemented here
                    alert(`Distance from pickup: ${Math.round(L.latLng(liveCoords).distanceTo(L.latLng(pickupCoords)))} meters`);
                  }
                }}>
                  <Navigation className="w-6 h-6 text-white dark:text-slate-900" />
                </div>
              </div>
            </div>
          </div>

          {/* Ride Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div 
                  className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-cover bg-center shrink-0"
                  style={{ backgroundImage: vehicle?.imageUrl ? `url(${vehicle.imageUrl})` : 'none' }}
                >
                  {!vehicle?.imageUrl && <span className="text-3xl">🛵</span>}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">{vehicle?.name || 'Unknown Vehicle'}</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total: ₹{booking.totalAmount}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Start Time</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {new Date(booking.startDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Pickup Location</p>
                    <p className="font-bold text-slate-900 dark:text-white">{vehicle?.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
              <h3 className="font-black text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button disabled={booking.status === 'completed'} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50">
                  Extend Ride
                </button>
                <button disabled={booking.status === 'completed'} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50">
                  End Ride & Lock
                </button>
              </div>
            </div>

            <button className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingTracking;
