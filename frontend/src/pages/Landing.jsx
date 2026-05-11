import { Star, Shield, Zap, Map, ChevronRight, Battery, MapPin, CheckCircle, Navigation, Key, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white font-sans selection:bg-orange-100 selection:text-orange-900 transition-colors duration-300">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="w-full md:w-1/2 pr-0 md:pr-12 mb-16 md:mb-0">
          <div className="inline-flex items-center space-x-2 text-orange-500 font-semibold text-sm mb-6 uppercase tracking-wider">
            <span className="w-8 h-px bg-orange-500"></span>
            <span>Seamless Mobility</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white mb-6">
            Rent a <br />Ride, <br />
            <span className="text-orange-500">Instantly.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-zinc-400 mb-10 max-w-md font-medium leading-relaxed">
            Your daily commute made simple, eco-friendly, and ultra-fast. Unlock a scooter or bike near you in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-colors text-center shadow-lg hover:shadow-orange-500/25">
              Start Riding
            </Link>
            <Link to="/register?role=lender" className="w-full sm:w-auto px-8 py-4 font-bold text-slate-900 dark:text-white bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full hover:border-slate-900 dark:hover:border-zinc-500 transition-colors text-center shadow-sm">
              Become a Lender
            </Link>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          {/* Mock Card */}
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl shadow-slate-200/50 dark:shadow-black/50 relative transition-colors duration-300">
            <div className="absolute -top-4 -right-4 bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-xl flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-500 fill-current" />
              <span className="font-bold text-sm dark:text-white">AI Optimised</span>
            </div>
            
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 flex justify-center items-center mb-6 shadow-sm h-48 border border-zinc-100 dark:border-zinc-700">
              <span className="text-8xl">🛵</span>
            </div>
            
            <h3 className="text-2xl font-black mb-4 dark:text-white">Book Activa 5G</h3>
            
            <div className="flex gap-3 mb-6">
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-zinc-300">
                <Battery className="w-4 h-4 text-emerald-500" />
                <span>80% Range</span>
              </div>
              <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-zinc-300">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>1.2km away</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-8">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold uppercase tracking-wider mb-1">Current Rate</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-black dark:text-white">₹49</span>
                  <span className="text-slate-500 dark:text-zinc-400 font-semibold ml-1">/hr</span>
                </div>
              </div>
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-colors">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-16 border-y border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="container mx-auto px-6 flex flex-wrap justify-between items-center gap-8 text-center">
          <div className="flex-1 min-w-[150px]">
            <h4 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">12,000+</h4>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Active Users</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <h4 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">800+</h4>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">EV Rides</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <h4 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">50+</h4>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Live Cities</p>
          </div>
          <div className="flex-1 min-w-[150px]">
            <h4 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 flex items-center justify-center">4.9<Star className="w-8 h-8 text-yellow-400 fill-current ml-2 -mt-1"/></h4>
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Average Rating</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 container mx-auto px-6">
        <div className="inline-flex items-center space-x-2 text-orange-500 font-semibold text-xs mb-4 uppercase tracking-wider">
          <span>Our Features</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-4 max-w-md">
          Not just rentals.<br/>Smarter rides.
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 font-medium mb-16 max-w-lg">Everything you need for a seamless mobility experience, packed into one minimal app.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          <FeatureItem 
            icon={<Zap className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="AI Powered Matchmaking"
            desc="Groq AI analyzes your history and live demand to instantly suggest the perfect vehicle near you."
          />
          <FeatureItem 
            icon={<CheckCircle className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="Zero-Friction Unlock"
            desc="Locate your ride, scan the QR code via the app, and unlock it instantly. No keys needed."
          />
          <FeatureItem 
            icon={<Shield className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="Insured & Verified"
            desc="All rides are fully insured, and every lender undergoes strict KYC verification for your safety."
          />
          <FeatureItem 
            icon={<Map className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="Smart Routing"
            desc="Built-in navigation calculates the fastest, most scenic, and battery-optimized routes for your journey."
          />
          <FeatureItem 
            icon={<Battery className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="EV Fleet First"
            desc="A completely green initiative. Choose from high-speed electric scooters and pedal-assist e-bikes."
          />
          <FeatureItem 
            icon={<User className="w-5 h-5 text-slate-900 dark:text-white" />}
            title="Peer-to-Peer"
            desc="Have an idle bike? List it on our platform securely and start earning passive income instantly."
          />
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900 py-32 border-y border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="inline-flex items-center space-x-2 text-orange-500 font-semibold text-xs mb-4 uppercase tracking-wider">
            <span>How it works</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-20 max-w-lg">
            Go from zero to riding in 4 steps.
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StepItem number="01" title="Create Account" desc="Sign up securely using your email and pass the 2FA verification." />
            <StepItem number="02" title="Find a Ride" desc="Open the map to find nearby available AI-recommended vehicles." />
            <StepItem number="03" title="Tap & Unlock" desc="Book via the app and tap the unlock button when you arrive." />
            <StepItem number="04" title="Ride & Return" desc="Enjoy your trip and drop it off at any designated green zone." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white dark:bg-zinc-950 py-32">
        <div className="container mx-auto px-6">
          <div className="inline-flex items-center space-x-2 text-orange-500 font-semibold text-xs mb-4 uppercase tracking-wider">
            <span>Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-16">
            Loved by thousands daily.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="This app is a lifesaver. I skip the metro traffic every morning and pick up an EV scooter right outside my apartment."
              name="Rahul Sharma"
              role="Daily Commuter"
            />
            <TestimonialCard 
              quote="The AI routing feature is incredible. It somehow always knows the exact small alleyways to skip the main road traffic."
              name="Priya Patel"
              role="Student"
            />
            <TestimonialCard 
              quote="I listed my spare electric bike on BikeRentLelo and it's making me passive income every single weekend securely."
              name="Amit Kumar"
              role="Vehicle Lender"
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-900 container mx-auto px-6 text-center border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="w-12 h-1 bg-orange-500 mx-auto mb-10"></div>
        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-10">
          Your next ride is <br/> 30 seconds away.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto px-10 py-5 font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-colors shadow-xl">
            Create Free Account
          </Link>
          <Link to="/login" className="w-full sm:w-auto px-10 py-5 font-bold text-slate-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:border-slate-900 dark:hover:border-zinc-500 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">BikeRent<span className="text-orange-500">Lelo</span></span>
          </div>
          <div className="flex space-x-6 text-sm font-semibold text-slate-500 dark:text-zinc-400">
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-slate-400 dark:text-zinc-600 text-sm font-medium mt-6 md:mt-0">
            © 2026 BikeRentLelo Platform.
          </p>
        </div>
      </footer>

    </div>
  );
};

const FeatureItem = ({ icon, title, desc }) => (
  <div className="group border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6 transition-colors duration-300">
    <div className="mb-4 text-slate-900 dark:text-white">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed mb-4">{desc}</p>
    <a href="#" className="text-orange-500 font-bold text-sm uppercase tracking-wider flex items-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
      Know More <ChevronRight className="w-4 h-4 ml-1" />
    </a>
  </div>
);

const StepItem = ({ number, title, desc }) => (
  <div>
    <h3 className="text-5xl font-black text-zinc-200 dark:text-zinc-800 mb-4 transition-colors duration-300">{number}</h3>
    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h4>
    <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const TestimonialCard = ({ quote, name, role }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2rem] shadow-sm transition-colors duration-300">
    <div className="flex text-orange-500 mb-6">
      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
    </div>
    <p className="text-slate-700 dark:text-zinc-300 font-medium text-lg leading-relaxed mb-8">"{quote}"</p>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center font-bold">
        {name.charAt(0)}
      </div>
      <div>
        <h5 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h5>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{role}</p>
      </div>
    </div>
  </div>
);

export default Landing;
