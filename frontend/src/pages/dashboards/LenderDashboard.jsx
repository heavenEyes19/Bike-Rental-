import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bike, DollarSign, Activity, Settings, Plus, MapPin, CheckCircle, XCircle, Navigation } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Click-to-pin helper inside Leaflet map
const MapClickPicker = ({ onPick }) => {
  useMapEvents({ click(e) { onPick([e.latlng.lat, e.latlng.lng]); } });
  return null;
};

// Fly map to coords on load
const FlyTo = ({ center }) => {
  const map = useMap();
  useEffect(() => { if (center) map.flyTo(center, 15, { duration: 1 }); }, [center]);
  return null;
};

const LenderDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stats
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeRentals, setActiveRentals] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [vehiclesRes, requestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/vehicles/vendor/my-vehicles', config),
        axios.get('http://localhost:5000/api/bookings/vendor/requests', config)
      ]);

      setVehicles(vehiclesRes.data);
      setRequests(requestsRes.data);

      // Calculate stats
      let earnings = 0;
      let active = 0;
      requestsRes.data.forEach(req => {
        if (req.status === 'completed') earnings += req.totalAmount;
        if (req.status === 'confirmed') active++;
      });
      setTotalEarnings(earnings);
      setActiveRentals(active);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData(); // Refresh data
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 pt-28 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 sticky top-28 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white px-4 mb-6 pt-2">Vendor Panel</h2>
            <nav className="space-y-2">
              <SidebarItem icon={<Activity />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <SidebarItem icon={<Bike />} label="My Vehicles" active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} />
              <SidebarItem icon={<Settings />} label="Booking Requests" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-500 font-bold rounded-2xl">{error}</div>}
          {loading ? (
             <div className="text-slate-500 font-bold">Loading your dashboard...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab 
                  vehiclesCount={vehicles.length} 
                  totalEarnings={totalEarnings} 
                  activeRentals={activeRentals} 
                />
              )}
              {activeTab === 'vehicles' && (
                <VehiclesTab vehicles={vehicles} refreshData={fetchData} />
              )}
              {activeTab === 'requests' && (
                <RequestsTab requests={requests} onUpdateStatus={handleUpdateBookingStatus} refreshData={fetchData} />
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

// --- Tabs Components ---

const OverviewTab = ({ vehiclesCount, totalEarnings, activeRentals }) => (
  <div className="space-y-8 animate-fade-in-up">
    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Dashboard Overview</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <DashboardCard title="Total Vehicles" icon={<Bike className="text-orange-500" />} value={vehiclesCount} />
      <DashboardCard title="Total Earnings" icon={<DollarSign className="text-orange-500" />} value={`₹${totalEarnings}`} />
      <DashboardCard title="Active Rentals" icon={<Activity className="text-orange-500" />} value={activeRentals} />
    </div>
    
    <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-20">
        <Activity className="w-32 h-32" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Grow Your Fleet</h2>
      <p className="font-medium opacity-90 mb-6 max-w-md">Adding more vehicles increases your visibility and potential earnings on BikeRentLelo. Electric Scooters are currently in high demand!</p>
      <button className="bg-white text-orange-600 font-bold px-6 py-3 rounded-full hover:bg-orange-50 transition-colors">
        Learn Best Practices
      </button>
    </div>
  </div>
);

const VehiclesTab = ({ vehicles, refreshData }) => {
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleAvailability = async (vehicle) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/vehicles/${vehicle._id}`, 
        { isAvailable: !vehicle.isAvailable },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refreshData();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Fleet</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-orange-500 dark:hover:bg-orange-500 transition-colors shadow-lg"
        >
          <Plus size={20} />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.length === 0 ? (
          <div className="col-span-full p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center">
             <span className="text-5xl mb-4 block">🛵</span>
             <p className="text-slate-500 font-bold text-lg">You haven't added any vehicles yet.</p>
          </div>
        ) : (
          vehicles.map(vehicle => (
            <div key={vehicle._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col transition-colors duration-300">
              <div 
                className="h-48 bg-zinc-100 dark:bg-zinc-800 bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: vehicle.imageUrl ? `url(${vehicle.imageUrl})` : 'none' }}
              >
                {!vehicle.imageUrl && <Bike size={48} className="text-zinc-300" />}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white">{vehicle.name}</h3>
                  <span className="font-black text-orange-500">₹{vehicle.pricePerHour}/hr</span>
                </div>
                <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 mb-6">{vehicle.type} • {vehicle.location}</p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${vehicle.isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                      {vehicle.isAvailable ? 'Available' : 'Offline'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleAvailability(vehicle)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddVehicleModal onClose={() => setShowAddModal(false)} onAdd={() => { setShowAddModal(false); refreshData(); }} />
      )}
    </div>
  );
};

const RequestsTab = ({ requests, onUpdateStatus, refreshData }) => {
  const [confirmLocationReq, setConfirmLocationReq] = useState(null);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Booking Requests</h1>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        {requests.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-4">📥</span>
            <p className="text-slate-500 font-bold text-lg">No booking requests yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-cover bg-center shrink-0"
                    style={{ backgroundImage: req.vehicle?.imageUrl ? `url(http://localhost:5000${req.vehicle.imageUrl})` : 'none' }}
                  >
                    {!req.vehicle?.imageUrl && <span className="text-3xl">🛵</span>}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{req.vehicle?.name || 'Unknown Vehicle'}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                      Booked by: <span className="font-bold text-slate-700 dark:text-zinc-300">{req.user?.name}</span> ({req.user?.phone || 'No phone'})
                    </p>
                    <p className="text-xs font-bold text-slate-400 mt-1">
                      {new Date(req.startDate).toLocaleString()} • {req.durationHours} Hours
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-black text-slate-900 dark:text-white text-xl">₹{req.totalAmount}</p>
                  {req.status === 'confirmed' && (
                    <div className="flex space-x-2">
                      <button onClick={() => onUpdateStatus(req._id, 'completed')} className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 font-bold rounded-lg text-sm transition-colors">Mark Completed</button>
                      <button onClick={() => onUpdateStatus(req._id, 'cancelled')} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 font-bold rounded-lg text-sm transition-colors">Cancel</button>
                    </div>
                  )}
                  {req.status === 'completed' && (
                    <button
                      onClick={() => setConfirmLocationReq(req)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      <Navigation className="w-4 h-4" /> Update Vehicle Location
                    </button>
                  )}
                  {req.status !== 'confirmed' && req.status !== 'completed' && (
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider ${
                      req.status === 'pending' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>{req.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmLocationReq && (
        <LocationConfirmModal
          booking={confirmLocationReq}
          onClose={() => setConfirmLocationReq(null)}
          onConfirm={() => { setConfirmLocationReq(null); refreshData(); }}
        />
      )}
    </div>
  );
};


// --- Add Vehicle Modal ---

const AddVehicleModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '', type: 'Electric Scooter', pricePerHour: '', pricePerDay: '', location: '', range: '', description: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pinCoords, setPinCoords] = useState(null); // [lat, lng] from map click
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India default
  const [gpsLoading, setGpsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const requestGPS = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.latitude, pos.coords.longitude];
        setMapCenter(c);
        setPinCoords(c);
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleLocationSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.data?.length > 0) {
        const { lat, lon } = res.data[0];
        const c = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(c);
        setPinCoords(c);
      } else {
        setSearchError('Location not found. Try a more specific search.');
      }
    } catch {
      setSearchError('Search failed. Check your connection.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinCoords) { alert('Please pin the vehicle location on the map.'); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      let imageUrl = '';
      if (file) {
        const uploadData = new FormData();
        uploadData.append('image', file);
        const uploadRes = await axios.post('http://localhost:5000/api/vehicles/upload', uploadData, {
          headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      await axios.post('http://localhost:5000/api/vehicles', {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
        pricePerDay: Number(formData.pricePerDay),
        imageUrl,
        locationCoordinates: { lat: pinCoords[0], lng: pinCoords[1] },
      }, config);

      onAdd();
    } catch (err) {
      console.error(err);
      alert('Failed to add vehicle');
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Add New Vehicle</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><XCircle /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Vehicle Name</label>
              <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Ola S1 Pro" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Type</label>
              <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="Electric Scooter">Electric Scooter</option>
                <option value="Motorbike">Motorbike</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Price Per Hour (₹)</label>
              <input required type="number" value={formData.pricePerHour} onChange={(e) => setFormData({...formData, pricePerHour: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Price Per Day (₹)</label>
              <input required type="number" value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Location</label>
              <input required type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Connaught Place" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Range / Tank Capacity</label>
              <input required type="text" value={formData.range} onChange={(e) => setFormData({...formData, range: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 120km" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" rows="3" placeholder="Describe the condition, rules, etc."></textarea>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">Vehicle Image</label>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-500/20 dark:file:text-orange-500 transition-colors" />
          </div>

          {/* Map Picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-zinc-300">📍 Pin Vehicle Location on Map <span className="text-red-500">*</span></label>
              <button type="button" onClick={requestGPS} className="text-xs font-bold text-orange-500 hover:underline flex items-center gap-1">
                {gpsLoading ? 'Getting GPS...' : '🎯 Use My GPS'}
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleLocationSearch())}
                  placeholder="Search area, landmark, city..."
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleLocationSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-4 py-2.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>
            {searchError && <p className="text-xs font-bold text-red-500 mb-2">{searchError}</p>}

            <div className="rounded-2xl overflow-hidden border-2 border-dashed border-zinc-300 dark:border-zinc-700" style={{ height: 280 }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <FlyTo center={mapCenter} />
                <MapClickPicker onPick={(c) => setPinCoords(c)} />
                {pinCoords && <Marker position={pinCoords} />}
              </MapContainer>
            </div>
            {pinCoords ? (
              <p className="text-xs font-bold text-emerald-500 mt-2">✅ Pinned: {pinCoords[0].toFixed(5)}, {pinCoords[1].toFixed(5)}</p>
            ) : (
              <p className="text-xs font-bold text-slate-400 mt-2">Search or click anywhere on the map to drop the pin</p>
            )}
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-colors shadow-lg disabled:opacity-50">
            {loading ? 'Adding Vehicle...' : 'List Vehicle'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};


// --- Location Confirm Modal (shown after ride completion) ---

const LocationConfirmModal = ({ booking, onClose, onConfirm }) => {
  const lastLoc = booking.lastKnownLocation;
  const initialCoords = lastLoc?.lat ? [lastLoc.lat, lastLoc.lng] : [20.5937, 78.9629];
  const [pinCoords, setPinCoords] = useState(initialCoords);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/vehicles/${booking.vehicle?._id}`,
        { locationCoordinates: { lat: pinCoords[0], lng: pinCoords[1] } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onConfirm();
    } catch (err) {
      console.error(err);
      alert('Failed to update vehicle location');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">📍 Confirm Vehicle Location</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
              Rider's last GPS position shown. Adjust if needed, then confirm.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
            <XCircle className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Mini map */}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 mb-4" style={{ height: 280 }}>
          <MapContainer center={pinCoords} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <MapClickPicker onPick={(c) => setPinCoords(c)} />
            <Marker position={pinCoords} />
          </MapContainer>
        </div>

        <p className="text-xs font-bold text-slate-400 mb-4 text-center">
          Click the map to re-pin the exact vehicle location
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-400 mb-0.5">Latitude</p>
            <p className="font-black text-slate-900 dark:text-white text-sm">{pinCoords[0].toFixed(5)}</p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl text-center">
            <p className="text-xs font-bold text-slate-400 mb-0.5">Longitude</p>
            <p className="font-black text-slate-900 dark:text-white text-sm">{pinCoords[1].toFixed(5)}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={saving} className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {saving ? 'Saving...' : 'Confirm Location'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


// --- UI Helpers ---

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 font-bold ${
      active 
      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' 
      : 'text-slate-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{label}</span>
    </div>
  </button>
);

const DashboardCard = ({ title, icon, value }) => (
  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center space-x-6 transition-colors duration-300">
    <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl transition-colors duration-300">{icon}</div>
    <div>
      <h3 className="text-slate-500 dark:text-zinc-400 text-sm font-bold tracking-wider uppercase mb-1">{title}</h3>
      <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default LenderDashboard;
