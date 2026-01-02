
export type Category = 'Todas' | 'Pequeno-Almoço' | 'Snacks' | 'Pratos Principais' | 'Molhos' | 'Sobremesas';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string; // URL or Base64
  category: Category;
  time: string; // e.g., "30 min"
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  macros: Macros;
  ingredients: string[];
  steps: string[];
  isAiGenerated?: boolean;
  isImageLoading?: boolean;
  isLoading?: boolean; 
}

export type ViewState = 'home' | 'detail' | 'backoffice' | 'backoffice-edit' | 'ai-results' | 'login';

export interface GenerateRecipeResponse {
  recipes: Recipe[];
}
