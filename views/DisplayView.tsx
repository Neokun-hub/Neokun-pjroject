
import React, { useEffect, useState } from 'react';
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

  const nextUp = queue
    .filter(item => item.status === QueueStatus.WAITING)
    .sort((a, b) => a.number - b.number)
    .slice(0, 5);

  useEffect(() => {
    if (callingStartedAt) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - callingStartedAt) / 1000);
        const remaining = Math.max(0, COUNTDOWN_SECONDS - elapsed);
        setTimeLeft(remaining);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [callingStartedAt]);

  useEffect(() => {
    if (currentNumber !== null) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2500);
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, context.currentTime);
        gain.gain.setValueAtTime(0.1, context.currentTime);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
        
        setTimeout(() => {
          oscillator.frequency.setValueAtTime(880, context.currentTime);
          const o2 = context.createOscillator();
          const g2 = context.createGain();
          o2.connect(g2);
          g2.connect(context.destination);
          o2.type = 'sine';
          o2.frequency.setValueAtTime(880, context.currentTime);
          g2.gain.setValueAtTime(0.1, context.currentTime);
          o2.start();
          o2.stop(context.currentTime + 0.3);
        }, 300);
      } catch (e) {}
      return () => clearTimeout(timer);
    }
  }, [currentNumber]);

  const isWarning = timeLeft !== null && timeLeft <= 10 && timeLeft > 0;
  const isExpired = timeLeft === 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in zoom-in duration-1000">
      <div className="lg:col-span-2 space-y-8">
        <div className={`ocean-glass rounded-[4rem] p-16 shadow-2xl text-center border-2 transition-all duration-700 relative overflow-hidden ${
          isWarning ? 'border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]' : 
          isAnimating ? 'border-cyan-400 ring-8 ring-cyan-400/40 scale-105' : 
          'border-white/20'
        }`}>
          
          {/* Background effects */}
          <div className={`absolute -top-20 -left-20 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 ${isWarning ? 'bg-rose-500/20 animate-pulse' : 'bg-cyan-400/10'}`}></div>
          <div className={`absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] rounded-full transition-colors duration-1000 ${isWarning ? 'bg-rose-500/20 animate-pulse' : 'bg-blue-400/10'}`}></div>

          <div className={`relative flex items-center justify-center gap-4 mb-6 transition-colors ${isWarning ? 'text-rose-400' : 'text-cyan-300'}`}>
            <Megaphone className={isAnimating || isWarning ? 'animate-bounce' : ''} size={36} />
            <h3 className="text-2xl font-black uppercase tracking-[0.3em]">{isExpired ? 'WAKTU HABIS' : 'DI PANGGIL'}</h3>
          </div>
          
          <div className="relative inline-block">
            <div className={`text-[16rem] leading-none font-black transition-all duration-500 ${
              isWarning ? 'text-rose-500 scale-110 drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]' : 
              isAnimating ? 'text-cyan-300 scale-110' : 
              'text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}>
              {currentNumber !== null ? (currentNumber < 10 ? `0${currentNumber}` : currentNumber) : '--'}
            </div>
            {(isAnimating || isWarning) && (
               <div className={`absolute inset-0 blur-[60px] rounded-full animate-pulse ${isWarning ? 'bg-rose-500/40' : 'bg-cyan-400/30'}`} />
            )}
          </div>

          {/* Countdown Display */}
          {timeLeft !== null && (
            <div className={`mt-4 mb-2 flex flex-col items-center animate-in slide-in-from-top-4 duration-500`}>
                <div className={`flex items-center gap-3 px-8 py-3 rounded-2xl border-2 font-black text-4xl tracking-tighter transition-all ${
                  isWarning ? 'bg-rose-500 text-white border-white animate-pulse' : 'bg-white/10 text-cyan-400 border-white/20'
                }`}>
                    <Clock size={28} className={isWarning ? 'animate-spin' : ''} />
                    {formatTime(timeLeft)}
                </div>
                {isWarning && (
                  <div className="mt-4 flex items-center gap-2 text-rose-500 font-black animate-bounce uppercase tracking-widest text-sm">
                    <AlertTriangle size={18} /> SEGERA KE BOOTH SEKARANG!
                  </div>
                )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-center gap-3">
             <Sparkles className={`animate-spin ${isWarning ? 'text-rose-500' : 'text-cyan-400'}`} size={24} />
             <div className={`font-black text-3xl uppercase tracking-widest italic transition-colors ${isWarning ? 'text-rose-400' : 'text-cyan-200/80'}`}>
              {currentNumber ? (isExpired ? 'Segera Merapat!' : 'Silakan Menuju Booth') : 'Standby...'}
            </div>
             <Sparkles className={`animate-spin ${isWarning ? 'text-rose-500' : 'text-cyan-400'}`} size={24} />
          </div>
        </div>

        <div className="ocean-glass rounded-3xl p-6 flex justify-between items-center border border-white/10">
          <p className="text-cyan-100/40 font-bold uppercase tracking-widest text-sm">Fluctus Booth ID: 001-OCEAN</p>
          <div className="flex gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isWarning ? 'bg-rose-500' : 'bg-cyan-500'}`}></div>
            <div className={`w-3 h-3 rounded-full animate-pulse delay-150 ${isWarning ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
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
            {nextUp.length > 0 ? (
              nextUp.map((item, idx) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 shadow-lg animate-in slide-in-from-right duration-500"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  <div className="flex items-center gap-5">
                    <span className="w-12 h-12 flex items-center justify-center bg-cyan-400 text-sky-950 font-black text-xl rounded-2xl shadow-cyan-400/20 shadow-lg">
                      {item.number}
                    </span>
                    <span className="font-black text-lg text-white truncate max-w-[140px]">
                      {item.name}
                    </span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-cyan-400/50 animate-ping"></div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 text-sky-100/20">
                <Users className="mx-auto mb-4 opacity-20" size={64} />
                <p className="font-black uppercase tracking-widest">Kosong</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-cyan-200/50 font-black uppercase tracking-[0.3em]">
              Sisa Antrian: {queue.filter(i => i.status === QueueStatus.WAITING).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayView;
