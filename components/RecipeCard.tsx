import React from 'react';
import { Clock, Flame, BarChart, Loader2, Crown } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: (recipe: Recipe) => void;
  isFeatured?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick, isFeatured }) => {
  // Skeleton Loading State
  if (recipe.isLoading) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
        <div className="h-48 bg-slate-200" />
        <div className="p-5 flex flex-col flex-grow space-y-3">
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          
          <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">
             <div className="h-4 bg-slate-200 rounded w-1/4" />
             <div className="h-4 bg-slate-200 rounded w-1/4" />
             <div className="h-4 bg-slate-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(recipe)}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border flex flex-col h-full relative
        ${isFeatured ? 'border-amber-200 ring-2 ring-amber-100' : 'border-gray-100'}
      `}
    >
      
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 bg-amber-400 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-sm flex items-center gap-1 uppercase tracking-wider">
          <Crown size={12} fill="currentColor" />
          Receita da Semana
        </div>
      )}

      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Loading Overlay */}
        {recipe.isImageLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] z-10">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-2 shadow-sm" />
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider bg-white/80 px-2 py-1 rounded-full">Gerando Foto IA...</span>
          </div>
        )}

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-emerald-600 shadow-sm uppercase tracking-wider z-20">
          {recipe.category}
        </div>
        {recipe.isAiGenerated && (
          <div className="absolute top-2 left-2 bg-purple-100/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-purple-700 shadow-sm flex items-center gap-1 z-20">
             ✨ AI
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>
        
        <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
          {recipe.description}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Clock size={14} className="text-emerald-500" />
            {recipe.time}
          </div>
          <div className="flex items-center gap-1">
            <Flame size={14} className="text-orange-500" />
            {recipe.macros.calories} kcal
          </div>
          <div className="flex items-center gap-1">
            <BarChart size={14} className="text-blue-500" />
            {recipe.difficulty}
          </div>
        </div>
        
        {/* Macro Pill Preview */}
        <div className="mt-3 flex gap-2">
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-600">P: {recipe.macros.protein}g</span>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-600">C: {recipe.macros.carbs}g</span>
            <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full text-slate-600">G: {recipe.macros.fat}g</span>
        </div>
      </div>
    </div>
  );
};