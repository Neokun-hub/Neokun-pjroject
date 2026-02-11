
import React, { useEffect, useState, useMemo } from 'react';
import { QueueItem, QueueStatus } from '../types';
import { Megaphone, Users, Sparkles, Clock, AlertTriangle } from 'lucide-react';

interface DisplayViewProps {
  queue: QueueItem[];
  currentNumber: number | null;
  callingStartedAt: number | null;
}

const COUNTDOWN_SECONDS = 120; // 2 minutes

const DisplayView: React.FC<DisplayViewProps> = ({ queue, currentNumber, callingStartedAt }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const nextUp = useMemo(() => queue
    .filter(item => item.status === QueueStatus.WAITING)
    .sort((a, b) => a.number - b.number)
    .slice(0, 5), [queue]);

  useEffect(() => {
    if (callingStartedAt && currentNumber !== null) {
      const updateTimer = () => {
        const startTime = Number(callingStartedAt);
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, COUNTDOWN_SECONDS - elapsed);
        setTimeLeft(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [callingStartedAt, currentNumber]);

  useEffect(() => {
    if (currentNumber !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [currentNumber]);

  const isWarning = timeLeft !== null && timeLeft <= 10 && timeLeft > 0;
  const isExpired = timeLeft === 0 && callingStartedAt !== null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in zoom-in duration-1000">
      <div className="lg:col-span-2 space-y-8">
        <div className={`ocean-glass rounded-[4rem] p-16 shadow-2xl text-center border-2 transition-all duration-700 relative overflow-hidden ${
          isWarning ? 'border-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.5)] bg-rose-500/5' : 
          isAnimating ? 'border-cyan-400 ring-8 ring-cyan-400/40 scale-105' : 
          'border-white/20'
        }`}>
          
          <div className={`absolute -top-20 -left-20 w-80 h-80 blur-[120px] rounded-full transition-colors duration-1000 ${isWarning ? 'bg-rose-500/30 animate-pulse' : 'bg-cyan-400/10'}`}></div>
          <div className={`absolute -bottom-20 -right-20 w-80 h-80 blur-[120px] rounded-full transition-colors duration-1000 ${isWarning ? 'bg-rose-500/30 animate-pulse' : 'bg-blue-400/10'}`}></div>

          <div className={`relative flex items-center justify-center gap-4 mb-6 transition-colors ${isWarning ? 'text-rose-400' : 'text-cyan-300'}`}>
            <Megaphone className={isAnimating || isWarning ? 'animate-bounce' : ''} size={36} />
            <h3 className="text-2xl font-black uppercase tracking-[0.3em]">{isExpired ? 'WAKTU HABIS!' : 'SEDANG DIPANGGIL'}</h3>
          </div>
          
          <div className="relative inline-block mb-4">
            <div className={`text-[18rem] leading-[0.8] font-black transition-all duration-500 ${
              isWarning ? 'text-rose-500 scale-110 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]' : 
              isAnimating ? 'text-cyan-300 scale-110' : 
              'text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]'
            }`}>
              {currentNumber !== null ? (currentNumber < 10 ? `0${currentNumber}` : currentNumber) : '--'}
            </div>
          </div>

          {/* TIMER AREA */}
          {currentNumber !== null && (
            <div className={`mt-10 mb-2 flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700`}>
                <div className="text-[10px] font-black tracking-[0.4em] text-white/30 uppercase mb-3">Sisa Waktu Menuju Booth</div>
                <div className={`flex items-center gap-4 px-12 py-5 rounded-[2rem] border-4 font-black text-6xl tracking-tighter transition-all shadow-2xl ${
                  isWarning ? 'bg-rose-600 text-white border-white animate-pulse scale-110' : 
                  isExpired ? 'bg-white/5 text-rose-400 border-rose-500/30' :
                  'bg-white/10 text-cyan-400 border-white/20'
                }`}>
                    <Clock size={40} className={isWarning ? 'animate-spin' : ''} />
                    {timeLeft !== null ? formatTime(timeLeft) : '02:00'}
                </div>
                
                {isWarning && (
                  <div className="mt-6 flex items-center gap-3 text-rose-500 font-black animate-bounce uppercase tracking-widest text-lg">
                    <AlertTriangle size={24} /> SEGERA KE BOOTH SEKARANG!
                  </div>
                )}
            </div>
          )}

          <div className="mt-12 flex items-center justify-center gap-4">
             <Sparkles className={`animate-spin-slow ${isWarning ? 'text-rose-500' : 'text-cyan-400'}`} size={24} />
             <div className={`font-black text-3xl uppercase tracking-widest italic transition-colors ${isWarning ? 'text-rose-400' : 'text-cyan-200/80'}`}>
              {currentNumber ? (isExpired ? 'Hubungi Petugas' : 'Silakan Menuju Booth') : 'Menunggu Antrian...'}
            </div>
             <Sparkles className={`animate-spin-slow ${isWarning ? 'text-rose-500' : 'text-cyan-400'}`} size={24} />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="ocean-glass rounded-[3rem] p-8 shadow-2xl border border-white/10 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 text-white border-b border-white/10 pb-6">
            <Users size={28} className="text-cyan-400" />
            <h3 className="text-xl font-black uppercase tracking-[0.2em]">Next In Line</h3>
          </div>
          <div className="space-y-5 flex-1">
            {nextUp.length > 0 ? nextUp.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 shadow-lg animate-in slide-in-from-right duration-500" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex items-center gap-5">
                  <span className="w-12 h-12 flex items-center justify-center bg-cyan-400 text-sky-950 font-black text-xl rounded-2xl">{item.number}</span>
                  <span className="font-black text-lg text-white truncate max-w-[140px]">{item.name}</span>
                </div>
              </div>
            )) : <div className="text-center py-24 text-sky-100/20"><p className="font-black uppercase tracking-widest">Kosong</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayView;
