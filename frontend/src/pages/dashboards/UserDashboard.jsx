import { useState, useEffect } from 'react';
import { User, MapPin, History, LayoutDashboard, Wallet, CreditCard, Settings, ChevronRight, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : { name: 'User', role: 'user' };
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'profile':
        return <ProfileTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'wallet':
        return <WalletTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-28 pb-20 selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-28 transition-colors duration-300">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-black text-xl">
                  {initials}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white">{user.name}</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{user.role} Account</p>
                </div>
              </div>

              <nav className="space-y-2">
                <SidebarItem 
                  icon={<LayoutDashboard />} label="Overview" 
                  active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} 
                />
                <SidebarItem 
                  icon={<User />} label="Profile & KYC" 
                  active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} 
                />
                <SidebarItem 
                  icon={<History />} label="My Bookings" 
                  active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} 
                />
                <SidebarItem 
                  icon={<Wallet />} label="Wallet & Credits" 
                  active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} 
                />
                <SidebarItem 
                  icon={<Settings />} label="Settings" 
                  active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} 
                />
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="w-full lg:w-3/4">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-components for Tabs

const OverviewTab = () => (
  <div className="space-y-8 animate-fade-in-up">
    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Dashboard Overview</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <DashboardCard title="Active Rentals" icon={<MapPin className="text-orange-500" />} value="0" />
      <DashboardCard title="Past Bookings" icon={<History className="text-orange-500" />} value="12" />
      <DashboardCard title="Wallet Balance" icon={<CreditCard className="text-orange-500" />} value="₹450" />
    </div>

    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Explore Vehicles</h2>
      <p className="text-slate-500 dark:text-zinc-400 font-medium mb-6">Groq AI is analyzing the best vehicles near you...</p>
      <div className="h-64 bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-center transition-colors duration-300">
        <span className="text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-sm">Vehicle Map / List</span>
      </div>
    </div>
  </div>
);

const ProfileTab = () => {
  const [profile, setProfile] = useState(null);
  const [kycFile, setKycFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
        setEditData({ name: res.data.name || '', phone: res.data.phone || '' });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || 'Failed to load profile');
      }
    };
    fetchProfile();
  }, []);

  const handleUpload = async () => {
    if (!kycFile) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('kycDocument', kycFile);

      const res = await axios.post('http://localhost:5000/api/users/kyc/upload', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile({ ...profile, kycStatus: res.data.kycStatus, kycDocumentUrl: res.data.kycDocumentUrl });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/users/profile', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setIsEditing(false);
      
      // Also update localStorage user object so the sidebar/navbar updates
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        user.name = res.data.name;
        localStorage.setItem('user', JSON.stringify(user));
        // Force a reload or rely on react state for deep integration later
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="text-red-500 font-bold p-8 bg-red-50 rounded-2xl border border-red-200">Error: {error}</div>;
  if (!profile) return <div className="text-slate-500 dark:text-zinc-400 font-bold">Loading profile...</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Profile & KYC</h1>
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="text-orange-500 font-bold text-sm hover:underline">Edit</button>
          ) : (
            <div className="flex space-x-3">
              <button onClick={() => { setIsEditing(false); setEditData({ name: profile.name, phone: profile.phone || '' }); }} className="text-slate-500 font-bold text-sm hover:underline">Cancel</button>
              <button onClick={handleSaveProfile} disabled={saving} className="text-orange-500 font-bold text-sm hover:underline">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-medium text-slate-500 dark:text-zinc-400">
          <div>
            <p className="uppercase tracking-wider text-xs mb-1">Full Name</p>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-slate-900 dark:text-white font-bold text-lg">{profile.name}</p>
            )}
          </div>
          <div>
            <p className="uppercase tracking-wider text-xs mb-1">Email</p>
            <p className="text-slate-900 dark:text-white font-bold text-lg opacity-70 cursor-not-allowed">{profile.email}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-xs mb-1">Phone Number</p>
            {isEditing ? (
              <input 
                type="text" 
                value={editData.phone} 
                onChange={(e) => setEditData({...editData, phone: e.target.value})} 
                placeholder="Not provided"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-slate-900 dark:text-white font-bold text-lg">{profile.phone || 'Not provided'}</p>
            )}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Identity Verification</h2>
          <div className={`p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${
            profile.kycStatus === 'verified' 
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' 
            : profile.kycStatus === 'submitted'
            ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
            : 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30'
          }`}>
            <div>
              <p className={`font-bold ${
                profile.kycStatus === 'verified' ? 'text-emerald-600 dark:text-emerald-400'
                : profile.kycStatus === 'submitted' ? 'text-blue-600 dark:text-blue-400'
                : 'text-orange-600 dark:text-orange-400'
              }`}>
                KYC Status: <span className="uppercase">{profile.kycStatus}</span>
              </p>
              <p className="text-sm font-medium opacity-80 mt-1 text-slate-600 dark:text-zinc-400">
                {profile.kycStatus === 'verified' ? 'Your identity is verified. You can now rent vehicles.'
                : profile.kycStatus === 'submitted' ? 'Your document is under review by an admin.'
                : 'Please submit Driving License id to unlock rentals.'}
              </p>
            </div>
            
            {(profile.kycStatus === 'pending' || profile.kycStatus === 'rejected') && (
              <div className="flex flex-col space-y-2 w-full md:w-auto">
                <input 
                  type="file" 
                  onChange={(e) => setKycFile(e.target.files[0])}
                  className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-500/20 dark:file:text-orange-500 dark:hover:file:bg-orange-500/30 transition-colors"
                  accept="image/*,.pdf"
                />
                <button 
                  onClick={handleUpload}
                  disabled={!kycFile || uploading}
                  className="px-6 py-2 bg-orange-500 text-white font-bold rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  {uploading ? 'Submitting...' : 'Submit Driving License id'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookingsTab = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">My Bookings</h1>
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors duration-300">
        {loading ? (
          <p className="text-slate-500 font-bold">Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500 font-bold">{error}</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl block mb-4">🛵</span>
            <p className="text-slate-500 font-bold text-lg">You haven't booked any vehicles yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-zinc-100 dark:border-zinc-800 rounded-2xl gap-4">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-zinc-700 bg-cover bg-center shrink-0"
                    style={{ backgroundImage: booking.vehicle?.imageUrl ? `url(http://localhost:5000${booking.vehicle.imageUrl})` : 'none' }}
                  >
                    {!booking.vehicle?.imageUrl && <span className="text-3xl">🛵</span>}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{booking.vehicle?.name || 'Unknown Vehicle'}</h3>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                      {new Date(booking.createdAt).toLocaleDateString()} • {booking.durationHours} Hours
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="text-left sm:text-right">
                    <p className="font-black text-slate-900 dark:text-white text-xl">₹{booking.totalAmount}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg mt-1 uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' :
                      booking.status === 'pending' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => navigate(`/track/${booking._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm whitespace-nowrap"
                    >
                      <Navigation className="w-4 h-4" /> Track Ride
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/track/${booking._id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm whitespace-nowrap"
                    >
                      🔁 Replay Route
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WalletTab = () => (
  <div className="space-y-8 animate-fade-in-up">
    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Wallet & Credits</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-900 dark:bg-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Wallet className="w-32 h-32 text-white dark:text-slate-900" />
        </div>
        <p className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest text-sm mb-2">Available Balance</p>
        <p className="text-5xl font-black text-white dark:text-slate-900 mb-8">₹450.00</p>
        <button className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white transition-colors">
          Add Funds
        </button>
      </div>
    </div>
  </div>
);

// UI Helpers

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 font-bold ${
      active 
      ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' 
      : 'text-slate-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span>{label}</span>
    </div>
    {active && <ChevronRight className="w-4 h-4" />}
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

export default UserDashboard;
