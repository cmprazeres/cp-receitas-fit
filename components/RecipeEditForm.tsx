
import React, { useState, useRef } from 'react';
import { Recipe, Category, Macros } from '../types';
import { Save, ArrowLeft, Upload, Trash2, Plus, GripVertical, Image as ImageIcon } from 'lucide-react';

interface RecipeEditFormProps {
  recipe: Recipe;
  onSave: (updatedRecipe: Recipe) => void;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['Pequeno-Almoço', 'Snacks', 'Pratos Principais', 'Molhos', 'Sobremesas'];
const DIFFICULTIES = ['Fácil', 'Médio', 'Difícil'];

export const RecipeEditForm: React.FC<RecipeEditFormProps> = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Recipe>({ ...recipe });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof Recipe, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMacroChange = (field: keyof Macros, value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      macros: { ...prev.macros, [field]: numValue }
    }));
  };

  // Image Handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
      setFormData(prev => ({ ...prev, image: '' }));
  };

  // List Handling (Ingredients/Steps)
  const handleArrayChange = (field: 'ingredients' | 'steps', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addItem = (field: 'ingredients' | 'steps') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeItem = (field: 'ingredients' | 'steps', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-in slide-in-from-right">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onCancel}
                    className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-slate-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-slate-800">Editar Receita</h1>
            </div>
            <button 
                onClick={() => onSave(formData)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
                <Save size={18} />
                Guardar Alterações
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Basic Info Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                    <h2 className="font-bold text-slate-700 border-b border-gray-100 pb-2 mb-4">Informação Básica</h2>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título da Receita</label>
                        <input 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descrição Curta</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria</label>
                            <select 
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dificuldade</label>
                            <select 
                                value={formData.difficulty}
                                onChange={(e) => handleChange('difficulty', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                            >
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tempo de Preparação</label>
                        <input 
                            type="text" 
                            value={formData.time}
                            onChange={(e) => handleChange('time', e.target.value)}
                            placeholder="ex: 30 min"
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Lists */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h2 className="font-bold text-slate-700">Ingredientes</h2>
                        <button onClick={() => addItem('ingredients')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-2">
                        {formData.ingredients.map((ing, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input 
                                    value={ing}
                                    onChange={(e) => handleArrayChange('ingredients', idx, e.target.value)}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <button onClick={() => removeItem('ingredients', idx)} className="text-red-400 hover:text-red-600 px-1"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                     <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h2 className="font-bold text-slate-700">Modo de Preparação</h2>
                        <button onClick={() => addItem('steps')} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-2">
                        {formData.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                                <span className="mt-2 text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
                                <textarea 
                                    value={step}
                                    rows={2}
                                    onChange={(e) => handleArrayChange('steps', idx, e.target.value)}
                                    className="flex-1 bg-white border border-gray-200 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                                />
                                <button onClick={() => removeItem('steps', idx)} className="text-red-400 hover:text-red-600 mt-2 px-1"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Right Column - Image & Macros */}
            <div className="space-y-6">
                
                {/* Image Upload */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-slate-700 border-b border-gray-100 pb-2 mb-4">Imagem de Capa</h2>
                    
                    <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden relative group mb-4 border-2 border-dashed border-gray-300">
                        {formData.image ? (
                            <>
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button onClick={handleRemoveImage} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"><Trash2 size={18} /></button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <ImageIcon size={32} className="mb-2" />
                                <span className="text-xs">Sem imagem</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="block w-full cursor-pointer bg-slate-50 hover:bg-slate-100 text-slate-600 py-2 px-4 rounded-lg border border-slate-200 text-center font-medium transition-colors text-sm flex items-center justify-center gap-2">
                            <Upload size={16} /> Carregar Imagem
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                        </label>
                        
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 text-xs font-bold">URL</span>
                            <input 
                                type="text"
                                placeholder="ou cole um link..."
                                value={formData.image}
                                onChange={(e) => handleChange('image', e.target.value)}
                                className="w-full bg-white pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Macros */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="font-bold text-slate-700 border-b border-gray-100 pb-2 mb-4">Macronutrientes</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Calorias</label>
                            <input 
                                type="number" 
                                value={formData.macros.calories}
                                onChange={(e) => handleMacroChange('calories', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proteína (g)</label>
                            <input 
                                type="number" 
                                value={formData.macros.protein}
                                onChange={(e) => handleMacroChange('protein', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hidratos (g)</label>
                            <input 
                                type="number" 
                                value={formData.macros.carbs}
                                onChange={(e) => handleMacroChange('carbs', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gordura (g)</label>
                            <input 
                                type="number" 
                                value={formData.macros.fat}
                                onChange={(e) => handleMacroChange('fat', e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
