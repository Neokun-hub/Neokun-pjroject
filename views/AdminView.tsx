
import React, { useMemo } from 'react';
import { QueueItem, QueueStatus } from '../types';
import { Phone, Check, RefreshCw, Trash2, ArrowRightCircle, Bell, MessageCircle } from 'lucide-react';

interface AdminViewProps {
  queue: QueueItem[];
  onUpdateStatus: (id: string, status: QueueStatus) => void;
  onReset: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ queue, onUpdateStatus, onReset }) => {
  const waitingList = useMemo(() => 
    queue.filter(i => i.status === QueueStatus.WAITING).sort((a, b) => a.number - b.number)
  , [queue]);

  const activeList = useMemo(() => 
    queue.filter(i => i.status === QueueStatus.CALLING).sort((a, b) => b.timestamp - a.timestamp)
  , [queue]);

  const completedList = useMemo(() => 
    queue.filter(i => i.status === QueueStatus.COMPLETED).sort((a, b) => b.timestamp - a.timestamp).slice(0, 15)
  , [queue]);

  const sendWhatsApp = (item: QueueItem) => {
    const message = encodeURIComponent(
      `🌊 Halo *${item.name}*!\n\nNomer antrian *${item.number}* dipanggil! ✨\nSilakan segera ke Photobooth FLUCTUS ya.\n\n_Capture the glow, keep the flow!_`
    );
    const url = `https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(url, '_blank');
  };

  const callNext = () => {
    if (waitingList.length > 0) {
      onUpdateStatus(waitingList[0].id, QueueStatus.CALLING);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 ocean-glass p-8 rounded-[2.5rem] border border-white/20 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white">Operator Command Center</h2>
          <p className="text-cyan-200/60 text-sm font-medium">Monitoring and controlling the flow.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={callNext}
            disabled={waitingList.length === 0}
            className="flex items-center gap-3 px-8 py-4 bg-cyan-400 hover:bg-cyan-300 text-sky-950 font-black rounded-2xl disabled:opacity-30 disabled:grayscale transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
          >
            PANGGIL BERIKUTNYA <ArrowRightCircle size={20} />
          </button>
          <button 
            onClick={onReset}
            className="p-4 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500/20 transition-all"
            title="Reset All Data"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h3 className="flex items-center gap-3 text-cyan-300 font-black uppercase tracking-[0.2em] text-sm ml-2">
            <Bell size={20} /> SEDANG AKTIF
          </h3>
          {activeList.length > 0 ? (
            activeList.map(item => (
              <div key={item.id} className="bg-gradient-to-br from-cyan-400 to-blue-500 text-sky-950 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -translate-y-12 translate-x-12 blur-3xl group-hover:scale-125 transition-transform" />
                
                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-8">
                    <span className="text-8xl font-black">{item.number}</span>
                    <div>
                      <h4 className="text-2xl font-black">{item.name}</h4>
                      <div className="flex items-center gap-2 text-sky-900/60 font-bold">
                        <Phone size={14} /> {item.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => sendWhatsApp(item)}
                      className="flex items-center justify-center gap-2 bg-sky-950 text-cyan-400 px-6 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <MessageCircle size={18} /> WA
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(item.id, QueueStatus.COMPLETED)}
                      className="flex items-center justify-center gap-2 bg-white text-sky-900 px-6 py-3 rounded-2xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                      <Check size={18} /> SELESAI
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="ocean-glass rounded-[3rem] p-16 text-center text-cyan-200/20 border-2 border-dashed border-white/10">
              <p className="font-black text-xl uppercase tracking-widest">Tidak ada antrian aktif</p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h3 className="flex items-center gap-3 text-cyan-300 font-black uppercase tracking-[0.2em] text-sm ml-2">
            <RefreshCw size={20} /> DAFTAR TUNGGU ({waitingList.length})
          </h3>
          <div className="ocean-glass rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl max-h-[600px] overflow-y-auto">
            {waitingList.length > 0 ? (
              <table className="w-full text-left">
                <thead className="bg-white/5 sticky top-0 backdrop-blur-xl z-20">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black text-cyan-400 uppercase tracking-widest">No</th>
                    <th className="px-8 py-5 text-xs font-black text-cyan-400 uppercase tracking-widest">Detail</th>
                    <th className="px-8 py-5 text-xs font-black text-cyan-400 uppercase tracking-widest text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {waitingList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-all group">
                      <td className="px-8 py-6">
                        <span className="w-10 h-10 flex items-center justify-center bg-white/5 text-cyan-400 font-black rounded-xl border border-white/10 group-hover:bg-cyan-400 group-hover:text-sky-950 transition-all">
                          {item.number}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-white text-lg">{item.name}</div>
                        <div className="text-xs text-cyan-200/40 font-bold">{item.phone}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => onUpdateStatus(item.id, QueueStatus.CALLING)}
                          className="bg-cyan-400/10 hover:bg-cyan-400 hover:text-sky-950 p-3 rounded-xl transition-all text-cyan-400"
                          title="Panggil Sekarang"
                        >
                          <ArrowRightCircle size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-20 text-center text-cyan-200/20 italic font-black uppercase tracking-widest">
                Antrian Kosong
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-6 pb-12">
        <h3 className="text-cyan-300 font-black uppercase tracking-[0.2em] text-sm ml-2">History Terakhir</h3>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
           {completedList.map(item => (
             <div key={item.id} className="flex-shrink-0 ocean-glass p-6 rounded-[2rem] border border-white/5 w-56 hover:border-cyan-400/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-2xl font-black text-white/20 group-hover:text-cyan-400 transition-colors">#{item.number}</span>
                  <div className="p-1 bg-green-500/20 rounded-full"><Check size={14} className="text-green-400" /></div>
                </div>
                <div className="font-black text-white truncate text-lg">{item.name}</div>
                <div className="text-[10px] text-cyan-200/30 font-bold mt-1">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
             </div>
           ))}
           {completedList.length === 0 && (
             <div className="text-cyan-200/10 text-sm font-black italic py-4 uppercase tracking-widest">Belum ada history</div>
           )}
        </div>
      </section>
    </div>
  );
};

export default AdminView;
