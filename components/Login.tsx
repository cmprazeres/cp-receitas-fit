import React, { useState } from 'react';
import { Lock, User, LogIn, ArrowLeft, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: string, pass: string) => boolean;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-emerald-600 p-8 text-white text-center">
            <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold">Acesso Restrito</h2>
            <p className="text-emerald-100 text-sm mt-1">Identifique-se para gerir o site</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              Credenciais incorretas. Tente novamente.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Utilizador</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            Entrar no Painel
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onBack}
            className="w-full text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 py-2 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Site
          </button>
        </form>
      </div>
    </div>
  );
};