
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, QueueItem, QueueStatus, DbConfig } from './types';
import RegistrationView from './views/RegistrationView';
import DisplayView from './views/DisplayView';
import AdminView from './views/AdminView';
import { LayoutDashboard, Settings, UserPlus, Waves, Cloud, Info, Wifi, WifiOff, ExternalLink, RefreshCw } from 'lucide-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'fluctus_storage_v4';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('REGISTRATION');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumber, setLastNumber] = useState<number>(0);
  const [callingStartedAt, setCallingStartedAt] = useState<number | null>(null);
  const [dbConfig, setDbConfig] = useState<DbConfig | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const channelRef = useRef<any>(null);
  
  // Use a ref to always have access to current state for broadcasting
  const stateRef = useRef({ queue, currentNumber, lastNumber, callingStartedAt });
  useEffect(() => {
    stateRef.current = { queue, currentNumber, lastNumber, callingStartedAt };
  }, [queue, currentNumber, lastNumber, callingStartedAt]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view')?.toUpperCase();
    if (viewParam === 'ADMIN' || viewParam === 'DISPLAY' || viewParam === 'REGISTRATION') {
        setCurrentView(viewParam as ViewType);
    }

    const savedData = localStorage.getItem(STORAGE_KEY);
    let initialConfig: DbConfig | null = null;
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.queue) setQueue(parsed.queue);
        if (parsed.currentNumber !== undefined) setCurrentNumber(parsed.currentNumber);
        if (parsed.lastNumber !== undefined) setLastNumber(parsed.lastNumber);
        if (parsed.callingStartedAt !== undefined) setCallingStartedAt(parsed.callingStartedAt);
        if (parsed.dbConfig) {
          initialConfig = parsed.dbConfig;
          setDbConfig(initialConfig);
        }
      } catch (e) { console.error(e); }
    }
    
    const roomFromUrl = params.get('room');
    if (roomFromUrl && initialConfig) {
        const updatedConfig = { ...initialConfig, roomId: roomFromUrl };
        setDbConfig(updatedConfig);
        setSupabase(createClient(updatedConfig.url, updatedConfig.key));
    } else if (initialConfig) {
        setSupabase(createClient(initialConfig.url, initialConfig.key));
    } else {
        setTimeout(() => setShowGuide(true), 1500);
    }

    setIsInitialized(true);
  }, []);

  const broadcastState = useCallback((payload: any) => {
    if (channelRef.current && connectionStatus === 'CONNECTED') {
        channelRef.current.send({
            type: 'broadcast',
            event: 'queue-update',
            payload
        });
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (!supabase || !dbConfig?.roomId) {
      setConnectionStatus('DISCONNECTED');
      return;
    }

    setConnectionStatus('CONNECTING');
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`room-${dbConfig.roomId}`)
      .on('broadcast', { event: 'queue-update' }, ({ payload }) => {
        if (payload) {
            if (payload.queue !== undefined) setQueue(payload.queue);
            if (payload.currentNumber !== undefined) setCurrentNumber(payload.currentNumber);
            if (payload.lastNumber !== undefined) setLastNumber(payload.lastNumber);
            if (payload.callingStartedAt !== undefined) setCallingStartedAt(payload.callingStartedAt);
            setLastSyncTime(Date.now());
        }
      })
      .on('broadcast', { event: 'request-sync' }, () => {
        channel.send({
            type: 'broadcast',
            event: 'queue-update',
            payload: stateRef.current
        });
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
            setConnectionStatus('CONNECTED');
            setTimeout(() => {
                channel.send({ type: 'broadcast', event: 'request-sync', payload: {} });
            }, 500);
        } else {
            setConnectionStatus('DISCONNECTED');
        }
      });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [supabase, dbConfig?.roomId]);

  useEffect(() => {
    if (isInitialized) {
      const data = { queue, currentNumber, lastNumber, dbConfig, callingStartedAt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [queue, currentNumber, lastNumber, dbConfig, callingStartedAt, isInitialized]);

  const addQueue = useCallback((name: string, phone: string) => {
    const nextNo = lastNumber + 1;
    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      number: nextNo,
      name,
      phone,
      timestamp: Date.now(),
      status: QueueStatus.WAITING
    };
    
    const newQueue = [...queue, newItem];
    setQueue(newQueue);
    setLastNumber(nextNo);
    
    broadcastState({ 
      queue: newQueue, 
      currentNumber, 
      lastNumber: nextNo, 
      callingStartedAt 
    });
    return nextNo;
  }, [queue, lastNumber, currentNumber, callingStartedAt, broadcastState]);

  const updateStatus = useCallback((id: string, status: QueueStatus) => {
    const now = Date.now();
    let newCurrentNumber = currentNumber;
    let newCallingStartedAt = callingStartedAt;

    const newQueue = queue.map(item => {
      if (item.id === id) {
        if (status === QueueStatus.CALLING) {
          newCurrentNumber = item.number;
          newCallingStartedAt = now;
        } else if (item.number === currentNumber && (status === QueueStatus.COMPLETED || status === QueueStatus.SKIPPED)) {
          newCallingStartedAt = null;
        }
        return { ...item, status };
      }
      return item;
    });

    setQueue(newQueue);
    setCurrentNumber(newCurrentNumber);
    setCallingStartedAt(newCallingStartedAt);
    
    broadcastState({ 
      queue: newQueue, 
      currentNumber: newCurrentNumber, 
      lastNumber, 
      callingStartedAt: newCallingStartedAt 
    });
  }, [queue, currentNumber, lastNumber, callingStartedAt, broadcastState]);

  const saveDbConfig = (config: DbConfig | null) => {
    setDbConfig(config);
    if (config) {
      setSupabase(createClient(config.url, config.key));
      setShowGuide(false);
    } else {
      setSupabase(null);
      setConnectionStatus('DISCONNECTED');
    }
  };

  const resetQueue = () => {
    if (window.confirm('Hapus semua data antrian?')) {
      setQueue([]);
      setCurrentNumber(null);
      setLastNumber(0);
      setCallingStartedAt(null);
      broadcastState({ queue: [], currentNumber: null, lastNumber: 0, callingStartedAt: null });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bubble" style={{ left: `${(i * 15) % 100}%`, width: '20px', height: '20px', animationDelay: `${i * 1}s` }} />
        ))}
      </div>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 ocean-glass px-10 py-5 rounded-[2.5rem] shadow-2xl z-50 flex gap-12 items-center border border-white/20 transition-all active:scale-95">
        <button onClick={() => setCurrentView('REGISTRATION')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'REGISTRATION' ? 'text-cyan-400 scale-125' : 'text-white/30 hover:text-white/60'}`}>
          <UserPlus size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest">Register</span>
        </button>
        <button onClick={() => setCurrentView('DISPLAY')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'DISPLAY' ? 'text-cyan-400 scale-125' : 'text-white/30 hover:text-white/60'}`}>
          <LayoutDashboard size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest">Display</span>
        </button>
        <button onClick={() => setCurrentView('ADMIN')} className={`flex flex-col items-center gap-1.5 transition-all ${currentView === 'ADMIN' ? 'text-cyan-400 scale-125' : 'text-white/30 hover:text-white/60'}`}>
          <Settings size={24} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
        </button>
      </nav>

      <header className="relative z-10 p-6 flex justify-between items-center max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
           <Waves className="text-cyan-400" size={32} />
           <h1 className="text-3xl font-black text-white tracking-tighter fluctus-title">FLUCTUS</h1>
        </div>
        <div className="flex gap-2">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest border transition-all duration-500 ${
              connectionStatus === 'CONNECTED' ? 'border-emerald-400 text-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.2)]' :
              connectionStatus === 'CONNECTING' ? 'border-amber-400 text-amber-400 bg-amber-400/10' :
              'border-white/10 text-white/30 bg-white/5'
            }`}>
               {connectionStatus === 'CONNECTED' ? <Wifi size={14} /> : 
                connectionStatus === 'CONNECTING' ? <Cloud size={14} className="animate-pulse" /> : 
                <WifiOff size={14} />}
               
               {connectionStatus === 'CONNECTED' ? `LIVE: ${dbConfig?.roomId}` : 
                connectionStatus === 'CONNECTING' ? 'MENGHUBUNGKAN...' : 
                'OFFLINE MODE'}
            </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-32">
        {!isInitialized ? null : (
            currentView === 'REGISTRATION' ? <RegistrationView onRegister={addQueue} /> :
            currentView === 'DISPLAY' ? <DisplayView queue={queue} currentNumber={currentNumber} callingStartedAt={callingStartedAt} /> :
            <AdminView 
                queue={queue} 
                onUpdateStatus={updateStatus} 
                onReset={resetQueue} 
                dbConfig={dbConfig} 
                onSaveDbConfig={saveDbConfig} 
                callingStartedAt={callingStartedAt}
            />
        )}
      </main>
    </div>
  );
};

export default App;
