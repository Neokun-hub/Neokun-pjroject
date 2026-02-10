
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, QueueItem, QueueStatus } from './types';
import RegistrationView from './views/RegistrationView';
import DisplayView from './views/DisplayView';
import AdminView from './views/AdminView';
import { LayoutDashboard, Settings, UserPlus, Waves } from 'lucide-react';

const STORAGE_KEY = 'fluctus_queue_data';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('REGISTRATION');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [lastNumber, setLastNumber] = useState<number>(0);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setQueue(parsed.queue || []);
      setCurrentNumber(parsed.currentNumber || null);
      setLastNumber(parsed.lastNumber || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      queue,
      currentNumber,
      lastNumber
    }));
    window.dispatchEvent(new Event('storage'));
  }, [queue, currentNumber, lastNumber]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setQueue(parsed.queue || []);
        setCurrentNumber(parsed.currentNumber || null);
        setLastNumber(parsed.lastNumber || 0);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addQueue = useCallback((name: string, phone: string) => {
    const newNo = lastNumber + 1;
    const newItem: QueueItem = {
      id: crypto.randomUUID(),
      number: newNo,
      name,
      phone,
      timestamp: Date.now(),
      status: QueueStatus.WAITING
    };
    setQueue(prev => [...prev, newItem]);
    setLastNumber(newNo);
    return newNo;
  }, [lastNumber]);

  const updateStatus = useCallback((id: string, status: QueueStatus) => {
    setQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status } : item
    ));
    
    if (status === QueueStatus.CALLING) {
      const item = queue.find(i => i.id === id);
      if (item) setCurrentNumber(item.number);
    }
  }, [queue]);

  const resetQueue = useCallback(() => {
    if (window.confirm('Hapus semua data antrian?')) {
      setQueue([]);
      setCurrentNumber(null);
      setLastNumber(0);
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'REGISTRATION': return <RegistrationView onRegister={addQueue} />;
      case 'DISPLAY': return <DisplayView queue={queue} currentNumber={currentNumber} />;
      case 'ADMIN': return <AdminView queue={queue} onUpdateStatus={updateStatus} onReset={resetQueue} />;
      default: return <RegistrationView onRegister={addQueue} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="bubble" 
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 30 + 5}px`,
              height: `${Math.random() * 30 + 5}px`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 8 + 7}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 ocean-glass px-8 py-4 rounded-full shadow-2xl z-50 flex gap-10 items-center">
        <button 
          onClick={() => setCurrentView('REGISTRATION')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'REGISTRATION' ? 'text-cyan-300 scale-125' : 'text-sky-100/50 hover:text-cyan-200'}`}
        >
          <UserPlus size={24} strokeWidth={currentView === 'REGISTRATION' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Register</span>
        </button>
        <button 
          onClick={() => setCurrentView('DISPLAY')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'DISPLAY' ? 'text-cyan-300 scale-125' : 'text-sky-100/50 hover:text-cyan-200'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'DISPLAY' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">TV Display</span>
        </button>
        <button 
          onClick={() => setCurrentView('ADMIN')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'ADMIN' ? 'text-cyan-300 scale-125' : 'text-sky-100/50 hover:text-cyan-200'}`}
        >
          <Settings size={24} strokeWidth={currentView === 'ADMIN' ? 3 : 2} />
          <span className="text-[9px] font-black uppercase tracking-widest">Control</span>
        </button>
      </nav>

      {/* Header */}
      <header className="relative z-10 p-8 flex flex-col items-center">
        <div className="flex items-center gap-3">
           <Waves className="text-cyan-400 animate-pulse" size={40} />
           <h1 className="text-5xl font-black text-white tracking-tighter fluctus-title drop-shadow-lg">FLUCTUS</h1>
        </div>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2 opacity-50"></div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 pb-32">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
