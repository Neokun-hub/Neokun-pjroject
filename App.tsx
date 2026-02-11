
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ViewType, QueueItem, QueueStatus } from './types';
import RegistrationView from './views/RegistrationView';
import DisplayView from './views/DisplayView';
import AdminView from './views/AdminView';
import { LayoutDashboard, Settings, UserPlus, Waves } from 'lucide-react';

const STORAGE_KEY = 'fluctus_storage_v3';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('REGISTRATION');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumber, setLastNumber] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Load - Hanya berjalan satu kali saat start
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.queue) setQueue(parsed.queue);
        if (parsed.currentNumber !== undefined) setCurrentNumber(parsed.currentNumber);
        if (parsed.lastNumber !== undefined) setLastNumber(parsed.lastNumber);
        console.log("Data loaded from storage:", parsed);
      } catch (e) {
        console.error("Failed to load storage:", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Auto Save - Hanya berjalan jika inisialisasi selesai
  useEffect(() => {
    if (isInitialized) {
      const dataToSave = JSON.stringify({
        queue,
        currentNumber,
        lastNumber
      });
      localStorage.setItem(STORAGE_KEY, dataToSave);
      
      // Kirim event agar tab lain (seperti Display TV) terupdate otomatis
      window.dispatchEvent(new Event('storage'));
    }
  }, [queue, currentNumber, lastNumber, isInitialized]);

  // 3. Multi-tab Sync - Menjaga data tetap sama di semua tab browser
  useEffect(() => {
    const handleStorage = (e: StorageEvent | Event) => {
      // Jika event berasal dari tab lain atau dispatch manual
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Hanya update jika berbeda untuk menghindari infinite loop
          setQueue(prev => JSON.stringify(prev) !== JSON.stringify(parsed.queue) ? parsed.queue : prev);
          setCurrentNumber(parsed.currentNumber);
          setLastNumber(parsed.lastNumber);
        } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addQueue = useCallback((name: string, phone: string) => {
    const nextNo = lastNumber + 1;
    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
      const newQueue = prev.map(item => 
        item.id === id ? { ...item, status } : item
      );
      
      // Jika statusnya dipanggil (CALLING), update nomor sekarang
      if (status === QueueStatus.CALLING) {
        const callingItem = newQueue.find(i => i.id === id);
        if (callingItem) {
          setCurrentNumber(callingItem.number);
        }
      }
      
      return newQueue;
    });
  }, []);

  const resetQueue = useCallback(() => {
    if (window.confirm('PERINGATAN: Hapus permanen semua data antrian?')) {
      setQueue([]);
      setCurrentNumber(null);
      setLastNumber(0);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const renderView = () => {
    if (!isInitialized) return null;
    
    switch (currentView) {
      case 'REGISTRATION': return <RegistrationView onRegister={addQueue} />;
      case 'DISPLAY': return <DisplayView queue={queue} currentNumber={currentNumber} />;
      case 'ADMIN': return <AdminView queue={queue} onUpdateStatus={updateStatus} onReset={resetQueue} />;
      default: return <RegistrationView onRegister={addQueue} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className="bubble" 
            style={{
              left: `${(i * 13) % 100}%`,
              width: `${(i % 3) * 15 + 10}px`,
              height: `${(i % 3) * 15 + 10}px`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${12 + (i % 8)}s`
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 ocean-glass px-8 py-4 rounded-full shadow-2xl z-50 flex gap-10 items-center">
        <button 
          onClick={() => setCurrentView('REGISTRATION')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'REGISTRATION' ? 'text-cyan-300 scale-125' : 'text-white/40 hover:text-cyan-200'}`}
        >
          <UserPlus size={24} strokeWidth={currentView === 'REGISTRATION' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Register</span>
        </button>
        <button 
          onClick={() => setCurrentView('DISPLAY')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'DISPLAY' ? 'text-cyan-300 scale-125' : 'text-white/40 hover:text-cyan-200'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'DISPLAY' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Display</span>
        </button>
        <button 
          onClick={() => setCurrentView('ADMIN')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'ADMIN' ? 'text-cyan-300 scale-125' : 'text-white/40 hover:text-cyan-200'}`}
        >
          <Settings size={24} strokeWidth={currentView === 'ADMIN' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
        </button>
      </nav>

      {/* Header */}
      <header className="relative z-10 p-8 flex flex-col items-center">
        <div className="flex items-center gap-3">
           <Waves className="text-cyan-400 animate-pulse" size={40} />
           <h1 className="text-5xl font-black text-white tracking-tighter fluctus-title drop-shadow-2xl">FLUCTUS</h1>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2 opacity-30"></div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-32">
        {isInitialized ? renderView() : (
           <div className="flex items-center justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
