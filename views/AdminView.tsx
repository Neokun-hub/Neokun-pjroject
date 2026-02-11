
import React, { useMemo, useState, useEffect } from 'react';
import { QueueItem, QueueStatus, DbConfig } from '../types';
import { Phone, Check, Trash2, ArrowRightCircle, MessageCircle, Database, Share2, X, Info, Clock } from 'lucide-react';
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
  
  const [tempUrl, setTempUrl] = useState(dbConfig?.url || '');
  const [tempKey, setTempKey] = useState(dbConfig?.key || '');
  const [tempRoom, setTempRoom] = useState(dbConfig?.roomId || `room-${Math.random().toString(36).substr(2, 5)}`);

  const waitingList = useMemo(() => queue.filter(i => i.status === QueueStatus.WAITING).sort((a, b) => a.number - b.number), [queue]);
  const activeList = useMemo(() => queue.filter(i => i.status === QueueStatus.CALLING).sort((a, b) => b.timestamp - a.timestamp), [queue]);

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
    if (showQrModal) {
        const url = `${window.location.origin}${window.location.pathname}?room=${dbConfig?.roomId || 'local'}`;
        QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0c4a6e', light: '#ffffff' } })
            .then(setQrDataUrl)
            .catch(console.error);
    }
  }, [showQrModal, dbConfig]);

  const handleSaveDb = () => {
    if (!tempUrl || !tempKey) {
        onSaveDbConfig(null);
    } else {
        onSaveDbConfig({ url: tempUrl, key: tempKey, roomId: tempRoom });
    }
    setShowDbModal(false);
  };

  const sendWhatsApp = (item: QueueItem) => {
    const msg = encodeURIComponent(`🌊 Halo *${item.name}*!\n\nNomer antrian *${item.number}* dipanggil! ✨\nSilakan segera ke Photobooth ya.`);
    window.open(`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="ocean-glass p-6 rounded-[2rem] flex flex-wrap items-center justify-between gap-4 border border-white/20">
        <div className="flex gap-3">
            <button onClick={() => setShowDbModal(true)} className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-widest transition-all">
                <Database size={16} className="text-cyan-400" /> DATABASE
            </button>
            <button onClick={() => setShowQrModal(true)} className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold tracking-widest transition-all">
                <Share2 size={16} className="text-cyan-400" /> SHARE QR
            </button>
        </div>
        <div className="flex gap-3">
          <button onClick={() => waitingList[0] && onUpdateStatus(waitingList[0].id, QueueStatus.CALLING)} disabled={waitingList.length === 0} className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-sky-950 font-black rounded-xl disabled:opacity-30 transition-all text-sm uppercase">
            CALL NEXT
          </button>
          <button onClick={onReset} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20"><Trash2 size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active List */}
        <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase ml-2">Calling Now</h3>
            {activeList.map(item => (
                <div key={item.id} className="relative bg-gradient-to-br from-cyan-400 to-blue-500 text-sky-950 p-6 rounded-[2rem] shadow-xl flex justify-between items-center overflow-hidden">
                    {/* Timer progress bar bg */}
                    {timeLeft !== null && (
                      <div 
                        className="absolute bottom-0 left-0 h-1.5 bg-sky-950/20 transition-all duration-1000" 
                        style={{ width: `${(timeLeft / COUNTDOWN_SECONDS) * 100}%` }}
                      />
                    )}

                    <div className="flex items-center gap-6">
                        <span className="text-6xl font-black">{item.number}</span>
                        <div>
                            <div className="font-black text-xl">{item.name}</div>
                            <div className="text-sky-900/60 font-bold text-sm mb-1">{item.phone}</div>
                            {timeLeft !== null && (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-sky-950/20 ${timeLeft <= 10 ? 'bg-rose-500 text-white animate-pulse border-none' : 'bg-sky-950/10'}`}>
                                    <Clock size={12} /> {formatTime(timeLeft)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button onClick={() => sendWhatsApp(item)} title="Kirim WA" className="p-3 bg-sky-950 text-cyan-400 rounded-xl hover:scale-105 transition-all"><MessageCircle size={20} /></button>
                        <button onClick={() => onUpdateStatus(item.id, QueueStatus.COMPLETED)} title="Selesai" className="p-3 bg-white text-sky-950 rounded-xl hover:scale-105 transition-all"><Check size={20} /></button>
                    </div>
                </div>
            ))}
            {activeList.length === 0 && <div className="ocean-glass p-12 text-center rounded-[2rem] text-white/20 font-black uppercase tracking-widest">No Active Call</div>}
        </div>

        {/* Wait List */}
        <div className="space-y-4">
            <h3 className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase ml-2">Waiting ({waitingList.length})</h3>
            <div className="ocean-glass rounded-[2rem] overflow-hidden border border-white/10 max-h-[400px] overflow-y-auto scrollbar-hide">
                {waitingList.map(item => (
                    <div key={item.id} className="p-4 flex justify-between items-center border-b border-white/5 hover:bg-white/5">
                        <div className="flex items-center gap-4">
                            <span className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg font-black text-cyan-400">{item.number}</span>
                            <div>
                                <div className="font-bold text-sm">{item.name}</div>
                                <div className="text-[10px] text-white/40">{item.phone}</div>
                            </div>
                        </div>
                        <button onClick={() => onUpdateStatus(item.id, QueueStatus.CALLING)} className="p-2 text-cyan-400 hover:bg-cyan-400 hover:text-sky-900 rounded-lg transition-all"><ArrowRightCircle size={18} /></button>
                    </div>
                ))}
                {waitingList.length === 0 && <div className="p-12 text-center text-white/10 font-black">Empty</div>}
            </div>
        </div>
      </div>

      {/* Database Modal */}
      {showDbModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sky-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="ocean-glass w-full max-w-md p-8 rounded-[2.5rem] border border-white/20 shadow-2xl space-y-6">
                  <div className="flex justify-between items-center">
                      <h2 className="text-xl font-black tracking-widest text-cyan-400">DATABASE SETUP</h2>
                      <button onClick={() => setShowDbModal(false)}><X size={24} /></button>
                  </div>
                  <div className="p-4 bg-cyan-400/10 rounded-2xl border border-cyan-400/20 text-[11px] text-cyan-200 leading-relaxed flex gap-3">
                      <Info size={24} className="shrink-0" />
                      <div>
                        Masukkan detail <b>Supabase</b> Anda untuk mengaktifkan sinkronisasi antar perangkat. 
                        Data akan otomatis terupdate di HP pengunjung & TV.
                      </div>
                  </div>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Supabase URL</label>
                          <input value={tempUrl} onChange={e => setTempUrl(e.target.value)} placeholder="https://xyz.supabase.co" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Anon Key</label>
                          <input type="password" value={tempKey} onChange={e => setTempKey(e.target.value)} placeholder="your-anon-key" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-white/50 uppercase ml-1">Room Name</label>
                          <input value={tempRoom} onChange={e => setTempRoom(e.target.value)} placeholder="wedding-booth" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-cyan-400 text-sm" />
                      </div>
                  </div>
                  <button onClick={handleSaveDb} className="w-full py-4 bg-cyan-400 text-sky-950 font-black rounded-xl hover:bg-cyan-300 transition-all">SIMPAN & CONNECT</button>
              </div>
          </div>
      )}

      {/* QR Modal */}
      {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-sky-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="ocean-glass w-full max-w-sm p-8 rounded-[3rem] border border-white/20 shadow-2xl text-center space-y-6">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">Share Registration</span>
                      <button onClick={() => setShowQrModal(false)}><X size={24} /></button>
                  </div>
                  <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl">
                      {qrDataUrl ? <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" /> : <div className="w-64 h-64 flex items-center justify-center text-sky-900 font-bold">Generating...</div>}
                  </div>
                  <div className="space-y-2">
                      <p className="text-sm font-bold text-white">Scan untuk Daftar Antrian</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Room ID: {dbConfig?.roomId || 'LOCAL'}</p>
                  </div>
                  <button onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?room=${dbConfig?.roomId || 'local'}`;
                      navigator.clipboard.writeText(url);
                      alert('Link disalin!');
                  }} className="w-full py-3 bg-white/5 text-white text-xs font-black rounded-xl border border-white/10 hover:bg-white/10 transition-all">SALIN LINK</button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminView;
