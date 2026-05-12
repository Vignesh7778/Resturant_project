import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AnimatedPage, { FadeIn } from '../components/AnimatedPage';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineUsers } from 'react-icons/hi';
import { motion } from 'framer-motion';

// Mock visual floor plan coordinates for tables
const floorPlan = [
  { x: 10, y: 15, size: 'small' }, { x: 30, y: 15, size: 'small' }, { x: 70, y: 15, size: 'large' },
  { x: 10, y: 45, size: 'medium' }, { x: 40, y: 45, size: 'medium' }, { x: 70, y: 45, size: 'medium' },
  { x: 20, y: 75, size: 'large' }, { x: 60, y: 75, size: 'large' }
];

export default function BookingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [allTables, setAllTables] = useState([]);
  const [form, setForm] = useState({ date: '', time: '', guests: 2 });
  const [availableTables, setAvailableTables] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    API.get(`/restaurants/${id}`).then(({ data }) => {
      setRestaurant(data.restaurant);
      setAllTables(data.tables);
    }).catch(() => toast.error('Restaurant not found'));
  }, [id]);

  const checkAvailability = async () => {
    if (!form.date || !form.time) { toast.error('Select date and time'); return; }
    const today = new Date().toISOString().split('T')[0];
    if (form.date < today) { toast.error('Cannot book in the past'); return; }
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/available-tables', {
        params: { restaurant_id: id, booking_date: form.date, booking_time: form.time, guests: form.guests }
      });
      setAvailableTables(data.tables.map(t => t.id));
      if (data.tables.length === 0) toast.error('No tables available for this slot');
      else toast.success('Floor plan updated');
    } catch (err) { toast.error('Failed to check availability'); }
    finally { setLoading(false); setSelectedTable(null); }
  };

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!selectedTable) { toast.error('Select a table first'); return; }
    setLoading(true);
    try {
      await API.post('/bookings', {
        table_id: selectedTable, booking_date: form.date, booking_time: form.time, guests: parseInt(form.guests),
      });
      toast.success('Reservation Confirmed');
      navigate('/my-bookings');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setLoading(false); }
  };

  if (!restaurant) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"/></div>;

  return (
    <AnimatedPage className="pb-24">
      {/* Header */}
      <div className="relative h-[40vh] min-h-[300px] flex items-end pb-12 px-6">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center z-[-2]" />
        <div className="absolute inset-0 bg-luxury-950/80 z-[-1]" />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-950 via-luxury-950/50 to-transparent z-[-1]" />
        
        <div className="max-w-6xl mx-auto w-full">
          <FadeIn>
            <p className="text-gold-400 font-semibold text-xs uppercase tracking-[0.2em] mb-3">Reserve Your Experience</p>
            <h1 className="font-display text-5xl md:text-6xl text-white mb-4">{restaurant.name}</h1>
            <p className="text-stone-400 max-w-2xl font-light">{restaurant.description}</p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left: Configuration */}
          <div className="lg:col-span-4 space-y-8">
            <FadeIn delay={0.1}>
              <div className="glass-panel p-8 rounded-3xl">
                <h3 className="text-white font-display text-2xl mb-6 pb-4 border-b border-white/5">The Details</h3>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Date</label>
                    <div className="relative">
                      <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="date" value={form.date} onChange={e => { setForm({...form, date: e.target.value}); setAvailableTables(null); }}
                        className="luxury-input luxury-input-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Time</label>
                    <div className="relative">
                      <HiOutlineClock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="time" value={form.time} onChange={e => { setForm({...form, time: e.target.value}); setAvailableTables(null); }}
                        className="luxury-input luxury-input-icon" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500 mb-2">Guests</label>
                    <div className="relative">
                      <HiOutlineUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                      <input type="number" min="1" max="20" placeholder="Number of guests" value={form.guests} onChange={e => { setForm({...form, guests: e.target.value}); setAvailableTables(null); }}
                        className="luxury-input luxury-input-icon" />
                    </div>
                  </div>
                </div>

                <button onClick={checkAvailability} disabled={loading}
                  className="w-full py-4 border border-gold-500/30 bg-gold-500/10 text-gold-400 font-semibold tracking-widest uppercase text-xs rounded-xl hover:bg-gold-500 hover:text-luxury-950 transition-all cursor-pointer">
                  {loading && !availableTables ? 'Checking...' : 'Check Floor Plan'}
                </button>
              </div>
            </FadeIn>

            {/* Summary */}
            {selectedTable && (
              <FadeIn delay={0.2}>
                <div className="glass-panel p-8 rounded-3xl border-gold-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-2xl rounded-full" />
                  <h3 className="text-white font-display text-xl mb-4">Reservation Summary</h3>
                  <div className="space-y-2 mb-8 text-sm text-stone-300 font-light">
                    <p className="flex justify-between"><span>Date</span> <span className="text-white font-medium">{form.date}</span></p>
                    <p className="flex justify-between"><span>Time</span> <span className="text-white font-medium">{form.time}</span></p>
                    <p className="flex justify-between"><span>Party</span> <span className="text-white font-medium">{form.guests} Guests</span></p>
                    <p className="flex justify-between pt-2 border-t border-white/10 mt-2">
                      <span>Selection</span> <span className="text-gold-400 font-bold">Table {allTables.find(t=>t.id===selectedTable)?.table_number}</span>
                    </p>
                  </div>
                  <button onClick={handleBook} disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-gold-600 to-gold-400 text-luxury-950 font-bold tracking-widest uppercase text-xs rounded-xl hover:from-gold-500 hover:to-gold-300 transition-all shadow-[0_0_15px_rgba(214,167,84,0.2)]">
                    {loading ? 'Processing...' : 'Confirm Request'}
                  </button>
                </div>
              </FadeIn>
            )}
          </div>

          {/* Right: Live Floor Plan */}
          <div className="lg:col-span-8">
            <FadeIn delay={0.3}>
              <div className="glass-panel p-8 rounded-3xl h-full min-h-[500px] flex flex-col">
                <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-4">
                  <h3 className="text-white font-display text-2xl">Floor Plan</h3>
                  <div className="flex gap-4 text-xs font-medium tracking-wider uppercase">
                    <span className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Available</span>
                    <span className="flex items-center gap-2 text-stone-500"><span className="w-2 h-2 rounded-full bg-stone-700" /> Unavailable</span>
                    <span className="flex items-center gap-2 text-gold-400"><span className="w-2 h-2 rounded-full bg-gold-500 shadow-[0_0_8px_#d6a754]" /> Selected</span>
                  </div>
                </div>

                {!availableTables ? (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <p className="text-stone-500 font-light max-w-sm">Enter your preferred date and time to view live table availability.</p>
                  </div>
                ) : (
                  <div className="relative flex-1 border border-white/5 rounded-2xl bg-luxury-950/50 p-6 overflow-hidden">
                    {/* Simulated dining floor grid */}
                    <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                    
                    {allTables.map((t, i) => {
                      const pos = floorPlan[i % floorPlan.length];
                      const isAvailable = availableTables.includes(t.id);
                      const isSelected = selectedTable === t.id;
                      
                      let baseClass = "absolute rounded-full flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-md ";
                      if (isSelected) {
                        baseClass += "bg-gold-500/20 border-2 border-gold-500 text-gold-300 shadow-[0_0_20px_rgba(214,167,84,0.4)] z-10 scale-110";
                      } else if (isAvailable) {
                        baseClass += "bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                      } else {
                        baseClass += "bg-stone-900/50 border border-stone-800 text-stone-600 cursor-not-allowed";
                      }

                      const sizeClass = pos.size === 'small' ? 'w-16 h-16' : pos.size === 'medium' ? 'w-20 h-20' : 'w-24 h-24';

                      return (
                        <button key={t.id} disabled={!isAvailable} onClick={() => setSelectedTable(t.id)}
                          className={`${baseClass} ${sizeClass}`}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
                          <span className="font-display font-bold text-lg leading-none">{t.table_number}</span>
                          <span className="text-[9px] uppercase tracking-widest mt-1 opacity-70">{t.capacity} Seats</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </FadeIn>
          </div>

        </div>
      </div>
    </AnimatedPage>
  );
}
