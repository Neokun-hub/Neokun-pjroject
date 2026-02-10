
import React, { useState } from 'react';
import { User, Phone, Send, CheckCircle2, Ticket } from 'lucide-react';

interface RegistrationViewProps {
  onRegister: (name: string, phone: string) => number;
}

const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [lastRegistered, setLastRegistered] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const num = onRegister(name, phone);
    setLastRegistered(num);
    setName('');
    setPhone('');
    setTimeout(() => setLastRegistered(null), 15000);
  };

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="ocean-glass rounded-[2.5rem] p-10 shadow-3xl overflow-hidden relative border border-white/20">
        
        {lastRegistered ? (
          <div className="text-center py-6 animate-in zoom-in duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-400/20 rounded-full mb-6 border border-cyan-400/30">
              <CheckCircle2 className="text-cyan-400" size={40} />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Sukses Terdaftar!</h2>
            <p className="text-cyan-200/70 mb-8 font-medium italic">Simpan nomor antrianmu</p>
            
            <div className="relative bg-white text-sky-900 p-8 rounded-3xl shadow-2xl mb-10 group cursor-pointer hover:rotate-1 transition-transform">
              <div className="absolute top-1/2 -left-4 w-8 h-8 bg-sky-900 rounded-full -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-4 w-8 h-8 bg-sky-900 rounded-full -translate-y-1/2"></div>
              <div className="border-2 border-dashed border-sky-200 p-6 rounded-2xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-400 mb-2">Queue Ticket</p>
                <div className="text-8xl font-black leading-none mb-2">
                  {lastRegistered < 10 ? `0${lastRegistered}` : lastRegistered}
                </div>
                <p className="font-bold text-sm uppercase tracking-widest text-sky-800/50">Fluctus Photobooth</p>
              </div>
            </div>

            <button 
              onClick={() => setLastRegistered(null)}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-sky-950 font-black rounded-2xl transition-all shadow-lg active:scale-95"
            >
              DAFTAR LAGI
            </button>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <div className="inline-block p-3 bg-cyan-400/10 rounded-2xl mb-4 border border-cyan-400/20">
                <Ticket className="text-cyan-400" size={32} />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">Ambil Antrian</h2>
              <p className="text-cyan-200/60 font-medium text-sm">Capture your flowing moments.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-cyan-200 font-bold text-xs uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-focus-within:text-white transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-400 focus:bg-white/10 outline-none transition-all placeholder:text-sky-300/30 font-bold text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-cyan-200 font-bold text-xs uppercase tracking-widest ml-1">WhatsApp</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 group-focus-within:text-white transition-colors" size={20} />
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-cyan-400 focus:bg-white/10 outline-none transition-all placeholder:text-sky-300/30 font-bold text-white"
                  />
                </div>
                <p className="text-[10px] text-cyan-200/40 ml-1 font-medium tracking-wide">* Notifikasi otomatis akan dikirim ke WA Anda</p>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-sky-950 font-black text-xl rounded-2xl hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all active:scale-[0.98]"
              >
                SUBMIT <Send size={20} strokeWidth={3} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationView;
