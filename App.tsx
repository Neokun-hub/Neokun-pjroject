
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, QueueItem, QueueStatus, DbConfig } from './types';
import RegistrationView from './views/RegistrationView';
import DisplayView from './views/DisplayView';
import AdminView from './views/AdminView';
import { LayoutDashboard, Settings, UserPlus, Waves, Cloud, CloudOff } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'fluctus_storage_v4';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('REGISTRATION');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumber, setLastNumber] = useState<number>(0);
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.queue) setQueue(parsed.queue);
        if (parsed.currentNumber !== undefined) setCurrentNumber(parsed.currentNumber);
        if (parsed.lastNumber !== undefined) setLastNumber(parsed.lastNumber);
        if (parsed.dbConfig) {
            setDbConfig(parsed.dbConfig);
            // Inisialisasi Supabase jika ada config
            const client = createClient(parsed.dbConfig.url, parsed.dbConfig.key);
            setSupabase(client);
        }
      } catch (e) { console.error(e); }
    }
    
    // Check URL for Room ID (to allow easy sharing)
    const params = new URLSearchParams(window.location.search);
    const room = params.get('room');
    if (room && !dbConfig) {
        // Jika ada room di URL tapi belum ada config, kita bisa simpan roomId-nya
        // (Namun tetap butuh URL & Key Supabase dari Admin pertama kali)
    }

    setIsInitialized(true);
  }, []);

  // 2. Real-time Subscription (Supabase)
  useEffect(() => {
    if (!supabase || !dbConfig?.roomId) return;

    const channel = supabase
      .channel(`room-${dbConfig.roomId}`)
      .on('broadcast', { event: 'queue-update' }, ({ payload }) => {
        setQueue(payload.queue);
        setCurrentNumber(payload.currentNumber);
        setLastNumber(payload.lastNumber);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, dbConfig]);

  // 3. Local Auto Save & Broadcast
  useEffect(() => {
    if (isInitialized) {
      const data = { queue, currentNumber, lastNumber, dbConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      
      // Jika online, kirim ke perangkat lain
      if (supabase && dbConfig?.roomId) {
        supabase.channel(`room-${dbConfig.roomId}`).send({
          type: 'broadcast',
          event: 'queue-update',
          payload: { queue, currentNumber, lastNumber }
        });
      }
      
      window.dispatchEvent(new Event('storage'));
    }
  }, [queue, currentNumber, lastNumber, dbConfig, isInitialized, supabase]);

  const addQueue = useCallback((name: string, phone: string) => {
    const nextNo = lastNumber + 1;
    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      number: nextNo,
      name,
      phone,
      timestamp: Date.now(),
      status: QueueStatus.WAITING
    };
    setQueue(prev => [...prev, newItem]);
    setLastNumber(nextNo);
    return nextNo;
  }, [lastNumber]);

  const updateStatus = useCallback((id: string, status: QueueStatus) => {
    setQueue(prev => {
      const newQueue = prev.map(item => item.id === id ? { ...item, status } : item);
      if (status === QueueStatus.CALLING) {
        const item = newQueue.find(i => i.id === id);
        if (item) setCurrentNumber(item.number);
      }
      return newQueue;
    });
  }, []);

  const saveDbConfig = (config: DbConfig | null) => {
    setDbConfig(config);
    if (config) {
      setSupabase(createClient(config.url, config.key));
    } else {
      setSupabase(null);
    }
  };

  const resetQueue = () => {
    if (window.confirm('Reset data?')) {
      setQueue([]);
      setCurrentNumber(null);
      setLastNumber(0);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bubble" style={{ left: `${(i * 15) % 100}%`, width: '20px', height: '20px', animationDelay: `${i * 1}s` }} />
        ))}
      </div>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 ocean-glass px-8 py-4 rounded-full shadow-2xl z-50 flex gap-10 items-center">
        <button onClick={() => setCurrentView('REGISTRATION')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'REGISTRATION' ? 'text-cyan-300 scale-125' : 'text-white/40'}`}>
          <UserPlus size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Register</span>
        </button>
        <button onClick={() => setCurrentView('DISPLAY')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'DISPLAY' ? 'text-cyan-300 scale-125' : 'text-white/40'}`}>
          <LayoutDashboard size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Display</span>
        </button>
        <button onClick={() => setCurrentView('ADMIN')} className={`flex flex-col items-center gap-1 transition-all ${currentView === 'ADMIN' ? 'text-cyan-300 scale-125' : 'text-white/40'}`}>
          <Settings size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest">Admin</span>
        </button>
      </nav>

      <header className="relative z-10 p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
           <Waves className="text-cyan-400" size={32} />
           <h1 className="text-3xl font-black text-white tracking-tighter fluctus-title">FLUCTUS</h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest border ${supabase ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10' : 'border-white/10 text-white/30'}`}>
           {supabase ? <Cloud size={14} /> : <CloudOff size={14} />}
           {supabase ? 'ONLINE SYNC' : 'LOCAL MODE'}
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-32">
        {!isInitialized ? null : (
            currentView === 'REGISTRATION' ? <RegistrationView onRegister={addQueue} /> :
            currentView === 'DISPLAY' ? <DisplayView queue={queue} currentNumber={currentNumber} /> :
            <AdminView 
                queue={queue} 
                onUpdateStatus={updateStatus} 
                onReset={resetQueue} 
                dbConfig={dbConfig} 
                onSaveDbConfig={saveDbConfig} 
            />
        )}
      </main>
    </div>
  );
};

export default App;
