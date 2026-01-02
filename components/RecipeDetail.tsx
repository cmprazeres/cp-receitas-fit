import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Flame, Award, ChefHat, Utensils, Activity, Users } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
}

const scaleIngredient = (ingredient: string, factor: number): string => {
  if (factor === 1) return ingredient;
  return ingredient.replace(/(\d+([.,]\d+)?|\d+\/\d+)/g, (match) => {
    if (match.includes('/')) {
      const [num, den] = match.split('/').map(Number);
      const val = (num / den) * factor;
      return Number.isInteger(val) ? val.toString() : val.toFixed(1).replace('.0', '');
    }
    const num = parseFloat(match.replace(',', '.'));
    const scaled = num * factor;
    return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1).replace('.0', '');
  });
};

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe, onBack }) => {
  const [servings, setServings] = useState(1);

  // SEO: Inserir Schema JSON-LD dinamicamente
  useEffect(() => {
    const scriptId = 'recipe-json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org/",
      "@type": "Recipe",
      "name": recipe.title,
      "image": [recipe.image],
      "description": recipe.description,
      "author": {
        "@type": "Organization",
        "name": "Receitas Fit AI"
      },
      "prepTime": "PT10M", // Estimativa base
      "totalTime": "PT30M",
      "recipeCategory": recipe.category,
      "recipeYield": `${servings} porções`,
      "nutrition": {
        "@type": "NutritionInformation",
        "calories": `${recipe.macros.calories} calories`,
        "proteinContent": `${recipe.macros.protein}g`,
        "carbohydrateContent": `${recipe.macros.carbs}g`,
        "fatContent": `${recipe.macros.fat}g`
      },
      "recipeIngredient": recipe.ingredients,
      "recipeInstructions": recipe.steps.map((step, idx) => ({
        "@type": "HowToStep",
        "text": step,
        "position": idx + 1
      }))
    };

    script.text = JSON.stringify(structuredData);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    };
  }, [recipe, servings]);

  const handlePortionChange = (newPortion: number) => {
    setServings(newPortion);
  };

  const scaledIngredients = recipe.ingredients.map(ing => scaleIngredient(ing, servings));

  return (
    <article className="min-h-screen bg-white animate-in slide-in-from-right duration-300">
      
      {/* Hero Image / Banner */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
         <img 
          src={recipe.image} 
          alt={`Imagem de ${recipe.title}`} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <button 
          onClick={onBack}
          aria-label="Voltar para a lista de receitas"
          className="absolute top-6 left-6 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 group"
        >
          <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
           <div className="max-w-7xl mx-auto">
             <span className="inline-block px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold tracking-wider uppercase mb-3 shadow-lg shadow-emerald-900/20">
                {recipe.category}
             </span>
             <h1 className="text-3xl md:text-5xl font-bold mb-4 shadow-sm leading-tight">{recipe.title}</h1>
             <p className="text-lg text-slate-200 max-w-2xl font-light mb-8">{recipe.description}</p>
             
             {/* Portion Control */}
             <div className="inline-flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 pr-6 rounded-2xl">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-100">
                    <Users size={20} />
                    <span className="font-semibold text-sm uppercase tracking-wide">Porções</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {[1, 2, 4, 6].map((num) => (
                        <button
                            key={num}
                            onClick={() => handlePortionChange(num)}
                            aria-label={`Ver para ${num} pessoas`}
                            className={`
                                relative w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all duration-200
                                ${servings === num 
                                    ? 'bg-white text-emerald-600 shadow-lg scale-110 z-10' 
                                    : 'bg-transparent text-slate-300 hover:bg-white/10 hover:text-white'}
                            `}
                        >
                            {num}
                        </button>
                    ))}
                    <span className="text-slate-400 text-sm font-medium ml-1">pessoas</span>
                </div>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <Clock className="text-emerald-500 mb-2" size={24} />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Tempo</span>
                        <span className="text-lg font-bold text-slate-800">{recipe.time}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <Flame className="text-orange-500 mb-2" size={24} />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Calorias (pax)</span>
                        <span className="text-lg font-bold text-slate-800">{recipe.macros.calories}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <Award className="text-purple-500 mb-2" size={24} />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Dificuldade</span>
                        <span className="text-lg font-bold text-slate-800">{recipe.difficulty}</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                        <Activity className="text-blue-500 mb-2" size={24} />
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Proteína (pax)</span>
                        <span className="text-lg font-bold text-slate-800">{recipe.macros.protein}g</span>
                    </div>
                </div>

                <section>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                        <ChefHat size={28} className="text-emerald-500" />
                        Modo de Preparação
                    </h2>
                    <div className="space-y-6">
                        {recipe.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-6 group">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-lg shadow-sm">
                                    {idx + 1}
                                </div>
                                <p className="text-slate-600 leading-relaxed pt-2 text-lg">
                                    {step}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3 mb-6">
                            <Utensils size={24} className="text-emerald-500" />
                            Ingredientes
                        </h3>
                        <ul className="space-y-4">
                            {scaledIngredients.map((ing, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-slate-600 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                    <span className="font-medium">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-lg font-bold text-slate-200 uppercase tracking-widest mb-6">Informação Nutricional</h3>
                    <div className="space-y-4">
                         <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                            <span className="text-slate-400">Proteína</span>
                            <span className="text-xl font-bold">{recipe.macros.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                            <span className="text-slate-400">Hidratos</span>
                            <span className="text-xl font-bold">{recipe.macros.carbs}g</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-slate-400">Gorduras</span>
                            <span className="text-xl font-bold">{recipe.macros.fat}g</span>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
      </div>
    </article>
  );
};