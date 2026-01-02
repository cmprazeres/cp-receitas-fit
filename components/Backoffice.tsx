import React, { useState, useRef } from 'react';
import { Recipe } from '../types';
import { Trash2, Edit2, ArrowLeft, GripVertical, UploadCloud, FileText, Image as ImageIcon, Loader2, Plus, ChevronLeft, ChevronRight, Copy, Eye, AlertTriangle, X } from 'lucide-react';
import { parseRecipeFromFile } from '../services/geminiService';

interface BackofficeProps {
  recipes: Recipe[];
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDuplicateRecipe: (recipe: Recipe) => void;
  onPreviewRecipe: (recipe: Recipe) => void;
  onReorderRecipes: (startIndex: number, endIndex: number) => void;
  onAddRecipe: () => void;
  onBack: () => void;
}

export const Backoffice: React.FC<BackofficeProps> = ({ 
    recipes, 
    onUpdateRecipe, 
    onDeleteRecipe, 
    onEditRecipe,
    onDuplicateRecipe,
    onPreviewRecipe,
    onReorderRecipes,
    onAddRecipe,
    onBack 
}) => {
  
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(recipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecipes = recipes.filter(r => !r.isLoading).slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
  };

  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, localIndex: number) => {
    const globalIndex = startIndex + localIndex;
    setDraggedItemIndex(globalIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, localIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, localIndex: number) => {
    e.preventDefault();
    const dropGlobalIndex = startIndex + localIndex;
    if (draggedItemIndex === null || draggedItemIndex === dropGlobalIndex) return;
    onReorderRecipes(draggedItemIndex, dropGlobalIndex);
    setDraggedItemIndex(null);
  };

  const confirmDelete = () => {
    if (recipeToDelete) {
      onDeleteRecipe(recipeToDelete);
      setRecipeToDelete(null);
    }
  };

  const processFiles = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setIsImporting(true);
      const file = files[0];
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Data = e.target?.result as string;
            const newRecipe = await parseRecipeFromFile(base64Data, file.type);
            if (newRecipe) {
                onEditRecipe(newRecipe); 
            } else {
                alert("Não foi possível extrair uma receita deste ficheiro.");
            }
            setIsImporting(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
          console.error(error);
          setIsImporting(false);
      }
      setIsDraggingFile(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-in fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
                <button 
                    onClick={onBack}
                    className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-50 text-slate-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Backoffice</h1>
                    <p className="text-slate-500 text-sm mt-1">Gestão de Receitas e Importação</p>
                </div>
            </div>

            <button 
                onClick={onAddRecipe}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
            >
                <Plus size={20} />
                Nova Receita Manual
            </button>
        </div>

        <div 
            className={`
                mb-8 border-2 border-dashed rounded-2xl p-8 transition-all duration-300 text-center cursor-pointer relative overflow-hidden
                ${isDraggingFile ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' : 'border-slate-300 bg-white hover:bg-slate-50'}
                ${isImporting ? 'pointer-events-none opacity-80' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingFile(false); }}
            onDrop={(e) => { e.preventDefault(); processFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => processFiles(e.target.files)}
                accept="image/*,application/pdf"
            />
            
            {isImporting ? (
                <div className="flex flex-col items-center justify-center py-4 text-emerald-600 animate-pulse">
                    <Loader2 size={48} className="animate-spin mb-4" />
                    <h3 className="text-lg font-bold">A Analisar Ficheiro...</h3>
                    <p className="text-sm opacity-80">A Inteligência Artificial está a extrair a receita.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-2">
                    <div className="flex gap-4 mb-4 text-slate-400">
                        <FileText size={32} />
                        <UploadCloud size={32} className="text-emerald-500" />
                        <ImageIcon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Importar Receita (PDF / Imagem)</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-4">
                        Arraste um ficheiro para aqui ou clique para selecionar. 
                        O sistema irá extrair automaticamente os dados.
                    </p>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200">
                        Suporta: JPG, PNG, PDF
                    </span>
                </div>
            )}
        </div>

        <div className="bg-white rounded-t-2xl border-b border-gray-100 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
                <span className="font-bold text-slate-800">{recipes.length}</span> receitas no total
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Mostrar:</span>
                <select 
                    value={itemsPerPage}
                    onChange={handleLimitChange}
                    className="bg-slate-50 border border-gray-200 rounded-lg text-sm px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>
        </div>

        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 border-t-0 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-4"></th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Imagem</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Título / Descrição</th>
                  <th className="px-6 py-4 font-semibold text-slate-700">Categoria</th>
                  <th className="px-6 py-4 font-semibold text-slate-700 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentRecipes.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-10 text-slate-400">Sem receitas.</td></tr>
                ) : (
                    currentRecipes.map((recipe, index) => {
                        const globalIndex = startIndex + index;
                        const isFeatured = globalIndex === 0 && currentPage === 1;
                        return (
                            <tr 
                                key={recipe.id} 
                                className={`transition-colors group ${draggedItemIndex === globalIndex ? 'bg-emerald-50 opacity-50' : 'hover:bg-slate-50/50 bg-white'}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <td className="px-4 py-4 cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-500 text-center">
                                    <GripVertical size={20} />
                                </td>
                                <td className="px-6 py-4 w-24">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative shadow-sm">
                                        {isFeatured && <div className="absolute top-0 left-0 w-full bg-amber-400 text-white text-[8px] font-bold text-center py-0.5 z-10">SEMANA</div>}
                                        <img src={recipe.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 text-lg">{recipe.title}</div>
                                    <div className="text-slate-500 line-clamp-2 max-w-md">{recipe.description}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 uppercase tracking-tight">
                                        {recipe.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-center">
                                        <button 
                                            onClick={() => onPreviewRecipe(recipe)}
                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm"
                                            title="Ver Preview no Frontend"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onDuplicateRecipe(recipe)}
                                            className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors shadow-sm"
                                            title="Duplicar Receita"
                                        >
                                            <Copy size={18} />
                                        </button>
                                        <button 
                                            onClick={() => onEditRecipe(recipe)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors shadow-sm"
                                            title="Editar"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => setRecipeToDelete(recipe.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="bg-slate-50 p-4 border-t border-gray-200 flex items-center justify-between">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50">
                    <ChevronLeft size={16} /> Anterior
                </button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) ? (
                            <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${currentPage === page ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-slate-600'}`}>{page}</button>
                        ) : (page === 2 || page === totalPages - 1 ? <span key={page}>...</span> : null)
                    ))}
                </div>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 text-sm font-medium text-slate-600 disabled:opacity-50">
                    Próxima <ChevronRight size={16} />
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {recipeToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setRecipeToDelete(null)} />
          <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-red-50 p-6 flex flex-col items-center text-center">
              <div className="bg-red-100 text-red-600 p-3 rounded-full mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Confirmar Eliminação</h3>
              <p className="text-slate-500 text-sm mt-2">Tem a certeza que quer eliminar esta receita? Esta ação não pode ser revertida.</p>
            </div>
            <div className="p-6 flex gap-3">
              <button 
                onClick={() => setRecipeToDelete(null)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                NÃO
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all"
              >
                SIM
              </button>
            </div>
            <button 
              onClick={() => setRecipeToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};