import React from 'react';
import { Leaf, Settings } from 'lucide-react';

interface HeaderProps {
  onHomeClick: () => void;
  onBackofficeClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onHomeClick,
  onBackofficeClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        
        {/* Logo (Left) */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onHomeClick}>
          <div className="bg-emerald-100 p-3 rounded-2xl group-hover:bg-emerald-200 transition-colors shadow-sm">
            <Leaf className="text-emerald-600 w-8 h-8" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">
              Receitas<span className="text-emerald-600">Fit</span>
            </span>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4">
            <button
                onClick={onBackofficeClick}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-md rounded-full transition-all duration-300 bg-transparent"
                title="Gestão do Site"
            >
                <Settings className="w-6 h-6" />
            </button>
        </div>
      </div>
    </header>
  );
};