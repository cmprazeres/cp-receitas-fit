import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail'; 
import { Backoffice } from './components/Backoffice';
import { RecipeEditForm } from './components/RecipeEditForm';
import { Login } from './components/Login';
import { Recipe, Category, ViewState } from './types';
import { generateRecipesFromIngredients, generateRecipeImage } from './services/geminiService';
import { saveRecipes, loadRecipes } from './services/storage';
import { UtensilsCrossed, Sparkles, ChefHat, ArrowRight, Refrigerator, X, Plus, ArrowLeft, Search, ChevronDown } from 'lucide-react';

const CATEGORIES: Category[] = ['Todas', 'Pequeno-Almoço', 'Snacks', 'Pratos Principais', 'Molhos', 'Sobremesas'];

const ADMIN_USER = "admin";
const ADMIN_PASS = "fit2025";

const SEED_RECIPES: Recipe[] = [
    {
        id: "seed-1",
        title: "Bowl de Quinoa e Salmão Braseado",
        description: "Um prato vibrante e equilibrado, rico em ómega-3 e fibras, com um toque cítrico refrescante.",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=1000",
        category: "Pratos Principais",
        time: "25 min",
        difficulty: "Médio",
        macros: { calories: 450, protein: 32, carbs: 40, fat: 18 },
        ingredients: ["150g Salmão fresco", "100g Quinoa cozida", "50g Abacate", "Tomate cherry", "Sumo de limão", "Azeite virgem extra"],
        steps: ["Grelhe o salmão temperado with sal e limão.", "Monte a bowl with a quinoa na base.", "Adicione o abacate fatiado e o tomate.", "Regue with azeite e sirva."],
        isAiGenerated: false
    },
    {
        id: "seed-2",
        title: "Panquecas de Aveia e Banana",
        description: "Pequeno-almoço energético sem açúcares adicionados, perfeito para pré-treino.",
        image: "https://images.unsplash.com/photo-1506084868730-342b1f40ff0e?auto=format&fit=crop&q=80&w=1000",
        category: "Pequeno-Almoço",
        time: "15 min",
        difficulty: "Fácil",
        macros: { calories: 320, protein: 12, carbs: 55, fat: 6 },
        ingredients: ["1 Banana madura", "2 Ovos", "50g Flocos de aveia", "Canela em pó", "Frutos vermelhos para decorar"],
        steps: ["Esmague a banana e misture with os ovos.", "Adicione a aveia e a canela.", "Cozinhe em frigideira antiaderente até dourar dos dois lados."],
        isAiGenerated: false
    },
    {
        id: "seed-3",
        title: "Strogonoff de Frango Light",
        description: "A versão saudável de um clássico, usando iogurte grego para cremosidade.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=1000",
        category: "Pratos Principais",
        time: "30 min",
        difficulty: "Fácil",
        macros: { calories: 380, protein: 45, carbs: 12, fat: 15 },
        ingredients: ["200g Peito de frango", "100g Cogumelos frescos", "1 Iogurte Grego Natural", "Mostarda Dijon", "Polpa de tomate"],
        steps: ["Salteie o frango em cubos.", "Junte os cogumelos e deixe cozinhar.", "Baixe o lume, adicione o iogurte, mostarda e tomate. Não deixe ferver."],
        isAiGenerated: false
    },
    {
        id: "seed-4",
        title: "Salada de Grão e Atum",
        description: "Refeição rápida, fresca e cheia de proteína, ideal para dias quentes.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
        category: "Pratos Principais",
        time: "10 min",
        difficulty: "Fácil",
        macros: { calories: 350, protein: 28, carbs: 35, fat: 10 },
        ingredients: ["1 lata de Atum ao natural", "200g Grão de bico cozido", "Cebola roxa picada", "Salsa fresca", "Ovo cozido"],
        steps: ["Misture o grão, atum e cebola.", "Tempere with azeite e vinagre.", "Adicione o ovo cozido picado e a salsa."],
        isAiGenerated: false
    }
];

const App = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todas');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [visibleRecipesCount, setVisibleRecipesCount] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<ViewState>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const loadInitialRecipes = async () => {
      const savedRecipes: Recipe[] = await loadRecipes();
      if (savedRecipes.length === 0) {
          setRecipes(SEED_RECIPES);
          saveRecipes(SEED_RECIPES);
      } else {
          setRecipes(savedRecipes);
      }
    };
    loadInitialRecipes();
  }, []);

  // SEO: Update Title Dinamicamente
  useEffect(() => {
    if (view === 'detail' && selectedRecipe) {
      document.title = `${selectedRecipe.title} | Receitas Fit AI`;
    } else if (view === 'backoffice') {
      document.title = `Admin Dashboard | Receitas Fit AI`;
    } else {
      document.title = `Receitas Fit AI - Nutrição Inteligente e Pratos Saudáveis`;
    }
  }, [view, selectedRecipe]);

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAuthenticated(true);
      setView('backoffice');
      return true;
    }
    return false;
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    setRecipes(prev => {
        const exists = prev.some(r => r.id === updated.id);
        const newRecipes = exists ? prev.map(r => r.id === updated.id ? updated : r) : [updated, ...prev];
        saveRecipes(newRecipes);
        return newRecipes;
    });
    if (view === 'backoffice-edit') {
        setView('backoffice');
        setEditingRecipe(null);
    }
  };

  const handleDuplicateRecipe = (recipe: Recipe) => {
    const duplicate: Recipe = {
        ...recipe,
        id: crypto.randomUUID(),
        title: `${recipe.title} (Cópia)`,
    };
    setRecipes(prev => {
        const newRecipes = [duplicate, ...prev];
        saveRecipes(newRecipes);
        return newRecipes;
    });
  };

  const handlePreviewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => {
        const newRecipes = prev.filter(r => r.id !== id);
        saveRecipes(newRecipes);
        return newRecipes;
    });
  };

  const handleReorderRecipes = (startIndex: number, endIndex: number) => {
    setRecipes(prev => {
        const result = [...prev];
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        saveRecipes(result);
        return result;
    });
  };

  const handleCreateRecipe = () => {
    const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        image: "",
        category: "Pratos Principais",
        time: "",
        difficulty: "Fácil",
        macros: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        ingredients: [],
        steps: [],
        isAiGenerated: false
    };
    setEditingRecipe(newRecipe);
    setView('backoffice-edit');
  };

  const filteredRecipes = recipes.filter(recipe => {
    if (recipe.isLoading) return true;
    const matchesCategory = selectedCategory === 'Todas' || recipe.category === selectedCategory;
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const displayedRecipes = filteredRecipes.slice(0, visibleRecipesCount);
  const handleLoadMore = () => setVisibleRecipesCount(prev => prev + 6);

  const navigateToHome = () => {
      setView('home');
      setSelectedRecipe(null);
      setEditingRecipe(null);
      setSearchQuery('');
  };

  const navigateToBackoffice = () => {
      if (isAuthenticated) { setView('backoffice'); } else { setView('login'); }
      window.scrollTo(0, 0);
  };

  const navigateToEdit = (recipe: Recipe) => {
      setEditingRecipe(recipe);
      setView('backoffice-edit');
      window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header onHomeClick={navigateToHome} onBackofficeClick={navigateToBackoffice} />
      {view === 'home' && (
        <>
            <section className="relative bg-slate-900 h-[500px] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2000&auto=format&fit=crop" alt="Cozinha saudável e nutritiva" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/60" />
                <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">Nutrição Inteligente,<br/>Sabor Autêntico.</h1>
                    <p className="text-lg md:text-xl text-slate-200 max-w-2xl font-light mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">Descubra receitas saudáveis criadas por especialistas e potencie a sua dieta.</p>
                    <button onClick={() => document.getElementById('filters')?.scrollIntoView({behavior: 'smooth'})} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 flex items-center gap-2">Explorar Receitas <ArrowRight size={20} /></button>
                </div>
            </section>
            
            <nav id="filters" className="bg-white border-b border-gray-100 sticky top-20 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar" role="tablist">
                        {CATEGORIES.map(category => (
                        <button 
                          key={category} 
                          role="tab"
                          aria-selected={selectedCategory === category}
                          onClick={() => setSelectedCategory(category)} 
                          className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all ${selectedCategory === category ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {category}
                        </button>
                        ))}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-8" aria-label="Lista de receitas">
                    {displayedRecipes.map((recipe, index) => (
                      <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onClick={(r) => { setSelectedRecipe(r); setView('detail'); }} 
                        isFeatured={index === 0 && selectedCategory === 'Todas'} 
                      />
                    ))}
                </div>
                {filteredRecipes.length > visibleRecipesCount && (
                    <div className="flex justify-center mb-16">
                        <button onClick={handleLoadMore} className="group flex flex-col items-center gap-2 text-slate-400 hover:text-emerald-600">
                          <span className="text-sm font-bold uppercase tracking-widest">Carregar mais receitas</span>
                          <ChevronDown className="w-6 h-6 animate-bounce" />
                        </button>
                    </div>
                )}
            </main>
        </>
      )}
      {view === 'login' && <Login onLogin={handleLogin} onBack={navigateToHome} />}
      {view === 'detail' && selectedRecipe && <RecipeDetail recipe={selectedRecipe} onBack={navigateToHome} />}
      {view === 'backoffice' && isAuthenticated && (
        <Backoffice 
          recipes={recipes} 
          onUpdateRecipe={handleUpdateRecipe} 
          onDeleteRecipe={handleDeleteRecipe} 
          onEditRecipe={navigateToEdit} 
          onDuplicateRecipe={handleDuplicateRecipe} 
          onPreviewRecipe={handlePreviewRecipe} 
          onReorderRecipes={handleReorderRecipes} 
          onAddRecipe={handleCreateRecipe} 
          onBack={navigateToHome} 
        />
      )}
      {view === 'backoffice-edit' && isAuthenticated && editingRecipe && <RecipeEditForm recipe={editingRecipe} onSave={handleUpdateRecipe} onCancel={navigateToBackoffice} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);