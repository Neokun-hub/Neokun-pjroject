
import React, { useMemo, useState, useEffect } from 'react';
import { QueueItem, QueueStatus, DbConfig } from '../types';
import { Phone, Check, Trash2, ArrowRightCircle, MessageCircle, Database, Share2, X, Info, Clock, Bell, BellOff, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface AdminViewProps {
  queue: QueueItem[];
  onUpdateStatus: (id: string, status: QueueStatus) => void;
  onReset: () => void;
  dbConfig: DbConfig | null;
  onSaveDbConfig: (config: DbConfig | null) => void;
  callingStartedAt: number | null;
}

const COUNTDOWN_SECONDS = 120;

const AdminView: React.FC<AdminViewProps> = ({ queue, onUpdateStatus, onReset, dbConfig, onSaveDbConfig, callingStartedAt }) => {
  const [showDbModal, setShowDbModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [autoNotify, setAutoNotify] = useState(false);
  
  const [tempUrl, setTempUrl] = useState(dbConfig?.url || '');
  const [tempKey, setTempKey] = useState(dbConfig?.key || '');
  const [tempRoom, setTempRoom] = useState(dbConfig?.roomId || '');

  const waitingList = useMemo(() => queue.filter(i => i.status === QueueStatus.WAITING).sort((a, b) => a.number - b.number), [queue]);
  const activeList = useMemo(() => queue.filter(i => i.status === QueueStatus.CALLING).sort((a, b) => b.timestamp - a.timestamp), [queue]);

  useEffect(() => {
    if (callingStartedAt) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - Number(callingStartedAt)) / 1000);
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
    if (showQrModal) {
        const url = `${window.location.origin}${window.location.pathname}?room=${dbConfig?.roomId || 'local'}`;
        QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0c4a6e', light: '#ffffff' } })
            .then(setQrDataUrl)
            .catch(console.error);
    }
  }, [showQrModal, dbConfig]);

  const sendWhatsApp = (item: QueueItem) => {
    const cleanPhone = item.phone.replace(/[^0-9]/g, '');
    // Formatting number: ensure it starts with country code (default 62 if starts with 0)
    const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    
    const msg = encodeURIComponent(`🌊 Halo *${item.name}*!\n\nNomer antrian *${item.number}* dipanggil! ✨\nSilakan segera ke Photobooth ya.`);
    
    // Using api.whatsapp.com which is often more reliable than wa.me on desktops
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${msg}`;
    window.open(waUrl, '_blank');
  };

  const handleCallNext = () => {
    if (waitingList.length > 0) {
      const nextItem = waitingList[0];
      onUpdateStatus(nextItem.id, QueueStatus.CALLING);
      
      if (autoNotify) {
        // Short delay to let the UI update first
        setTimeout(() => sendWhatsApp(nextItem), 600);
      }
    }
  };

  const handleSaveDb = () => {
    if (!tempUrl || !tempKey) {
        onSaveDbConfig(null);
    } else {
        onSaveDbConfig({ url: tempUrl, key: tempKey, roomId: tempRoom });
    }
    setShowDbModal(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8">
      {/* Alert Info for WhatsApp limitation */}
      <div className="bg-amber-400/10 border border-amber-400/30 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
        <Info className="text-amber-400 shrink-0 mt-0.5" size={18} />
        <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
          <strong className="text-amber-400">INFO WHATSAPP:</strong> Karena kebijakan keamanan WhatsApp, sistem hanya bisa menyiapkan pesan otomatis. Anda tetap harus menekan tombol <span className="underline decoration-amber-400">Kirim/Send</span> di aplikasi WhatsApp setelah jendela terbuka.
        </p>
      </div>

      <div className="ocean-glass p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 border border-white/20">
        <div className="flex gap-3">
            <button onClick={() => setShowDbModal(true)} className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-widest transition-all">
                <Database size={16} className="text-cyan-400" /> DATABASE
            </button>
            <button 
              onClick={() => setAutoNotify(!autoNotify)} 
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border ${
                autoNotify ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(52,211,153,0.2)]' : 'bg-white/5 text-white/30 border-white/10'
              }`}
            >
                {autoNotify ? <Bell size={14} className="animate-bounce" /> : <BellOff size={14} />}
                AUTO WA: {autoNotify ? 'ON' : 'OFF'}
            </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleCallNext} 
            disabled={waitingList.length === 0} 
            className="px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-sky-950 font-black rounded-xl disabled:opacity-30 transition-all text-sm uppercase shadow-lg shadow-cyan-400/20 active:scale-95 flex items-center gap-2"
          >
            CALL NEXT <ArrowRightCircle size={18} />
          </button>
          <button onClick={onReset} className="p-4 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors"><Trash2 size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase ml-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div> Calling Now
            </h3>
            {activeList.map(item => (
                <div key={item.id} className="relative bg-gradient-to-br from-cyan-400 to-blue-500 text-sky-950 p-6 rounded-[2rem] shadow-xl flex justify-between items-center overflow-hidden animate-in zoom-in duration-300">
                    {timeLeft !== null && (
                      <div className="absolute bottom-0 left-0 h-1.5 bg-sky-950/20 transition-all duration-1000" style={{ width: `${(timeLeft / COUNTDOWN_SECONDS) * 100}%` }} />
                    )}
                    <div className="flex items-center gap-6">
                        <span className="text-6xl font-black">{item.number < 10 ? `0${item.number}` : item.number}</span>
                        <div>
                            <div className="font-black text-xl">{item.name}</div>
                            <div className="text-[10px] font-bold opacity-60 mb-1">{item.phone}</div>
                            {timeLeft !== null && (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${timeLeft <= 10 ? 'bg-rose-500 text-white animate-pulse border-none shadow-lg shadow-rose-500/40' : 'bg-sky-950/10 border-sky-950/20'}`}>
                                    <Clock size={12} /> {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 relative z-10">
                        <button onClick={() => sendWhatsApp(item)} title="Kirim WA" className="p-3 bg-sky-950 text-cyan-400 rounded-xl hover:scale-110 transition-all shadow-lg active:scale-90 flex items-center justify-center">
                          <MessageCircle size={20} />
                        </button>
                        <button onClick={() => onUpdateStatus(item.id, QueueStatus.COMPLETED)} title="Selesai" className="p-3 bg-white text-sky-950 rounded-xl hover:scale-110 transition-all shadow-lg active:scale-90 flex items-center justify-center">
                          <Check size={20} />
                        </button>
                    </div>
                </div>
            ))}
            {activeList.length === 0 && (
              <div className="p-12 text-center ocean-glass rounded-[2rem] border-dashed border-2 border-white/5 opacity-30">
                <p className="font-black text-xs uppercase tracking-widest">Tidak ada panggilan aktif</p>
              </div>
            )}
        </div>

        <div className="space-y-4">
            <div className="flex justify-between items-center ml-2">
              <h3 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase">Waiting List</h3>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">{waitingList.length} ANTRIAN</span>
            </div>
            <div className="ocean-glass rounded-[2rem] overflow-hidden border border-white/10 max-h-[400px] overflow-y-auto scrollbar-hide shadow-inner">
                {waitingList.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg font-black text-cyan-400">{item.number}</span>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{item.name}</span>
                              <span className="text-[9px] text-white/30 font-bold tracking-tighter">{item.phone}</span>
                            </div>
                        </div>
                        <button onClick={() => onUpdateStatus(item.id, QueueStatus.CALLING)} className="p-2 text-cyan-400 hover:bg-cyan-400 hover:text-sky-900 rounded-lg transition-all"><ArrowRightCircle size={20} /></button>
                    </div>
                ))}
                {waitingList.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-white/20 font-black text-xs uppercase tracking-widest italic">Belum ada antrian</p>
                  </div>
                )}
            </div>
        </div>
      </div>

      {showDbModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sky-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="ocean-glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-6">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black tracking-widest text-cyan-400">DATABASE SETUP</h2>
                      <button onClick={() => setShowDbModal(false)} className="hover:rotate-90 transition-transform"><X size={24} /></button>
                  </div>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Supabase URL</label>
                          <input value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://xyz.supabase.co" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Anon Key</label>
                          <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="your-anon-key" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm font-bold" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Room Name</label>
                          <input value={tempRoom} onChange={e => setTempRoom(e.target.value)} placeholder="wedding-booth" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm font-bold" />
                      </div>
                  </div>
                  <button onClick={handleSaveDb} className="w-full py-4 bg-cyan-400 text-sky-950 font-black rounded-xl hover:bg-cyan-300 transition-all shadow-xl shadow-cyan-400/20 active:scale-95">SIMPAN & CONNECT</button>
              </div>
          </div>
      )}

      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sky-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="ocean-glass w-full max-w-sm p-8 rounded-[2.5rem] border border-white/20 shadow-2xl text-center space-y-6">
             <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-black tracking-widest text-cyan-400">QR CODE</h2>
                <button onClick={() => setShowQrModal(false)}><X size={24} /></button>
             </div>
             <div className="bg-white p-6 rounded-3xl inline-block shadow-2xl">
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-full h-auto" />}
             </div>
             <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Scan untuk pendaftaran pengunjung</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
