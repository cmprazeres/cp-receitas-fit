import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RECIPE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    recipes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING }, 
          time: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          macros: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
          },
          ingredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
  },
};

export const generateRecipeImage = async (recipeTitle: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `Uma foto profissional, apetitosa e de alta resolução de culinária para um site de receitas: ${recipeTitle}. Iluminação de estúdio, foco nítido, empratamento moderno e saudável, estilo minimalista e clean.`,
          },
        ],
      },
      config: {
        imageConfig: {
            aspectRatio: "4:3",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return `https://picsum.photos/800/600?random=${Math.random()}`;
  } catch (error) {
    console.error("Error generating image:", error);
    return `https://picsum.photos/800/600?random=${Math.random()}`;
  }
};

export const generateRecipesFromIngredients = async (ingredients: string): Promise<Recipe[]> => {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Com base estritamente nestes ingredientes disponíveis: "${ingredients}" (e básicos de despensa como azeite, sal, pimenta), cria 4 receitas Fit / Saudáveis. Devem ser receitas completas e criativas. Usa Português de Portugal.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: RECIPE_SCHEMA,
      },
    });
    
    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    if (!parsed.recipes || !Array.isArray(parsed.recipes)) return [];

    return parsed.recipes.map((r: any) => ({
      id: crypto.randomUUID(),
      title: r.title || "Nova Receita",
      description: r.description || "Descrição indisponível",
      image: "", 
      category: r.category || "Todas",
      time: r.time || "30 min",
      difficulty: r.difficulty || "Fácil",
      macros: r.macros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ingredients: r.ingredients || [],
      steps: r.steps || [],
      isAiGenerated: true,
      isImageLoading: false,
      isLoading: false
    }));
  } catch (e) {
      console.error(e);
      return [];
  }
}

export const parseRecipeFromFile = async (base64Data: string, mimeType: string): Promise<Recipe | null> => {
    try {
        // Remove data URL prefix if present for the API call
        const base64Content = base64Data.split(',')[1];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Content,
                            mimeType: mimeType
                        }
                    },
                    {
                        text: "Analisa esta imagem/documento. Extrai a receita completa em formato JSON estruturado. Se houver imagem do prato, ignora a extração da imagem em si, foca-te no texto. Se o documento contiver várias, extrai apenas a primeira principal. Usa Português de Portugal."
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: RECIPE_SCHEMA,
            }
        });

        const jsonText = response.text;
        if (!jsonText) return null;

        const parsed = JSON.parse(jsonText);
        // The schema returns an array 'recipes', we take the first one
        if (!parsed.recipes || !Array.isArray(parsed.recipes) || parsed.recipes.length === 0) return null;

        const r = parsed.recipes[0];
        
        // If the uploaded file was an image, we can try to use it as the recipe image
        // Otherwise we leave it empty for the backend to generate or user to upload
        const initialImage = mimeType.startsWith('image/') ? base64Data : "";

        return {
            id: crypto.randomUUID(),
            title: r.title || "Receita Importada",
            description: r.description || "Importada via ficheiro",
            image: initialImage,
            category: r.category || "Todas",
            time: r.time || "30 min",
            difficulty: r.difficulty || "Médio",
            macros: r.macros || { calories: 0, protein: 0, carbs: 0, fat: 0 },
            ingredients: r.ingredients || [],
            steps: r.steps || [],
            isAiGenerated: true,
            isImageLoading: false,
            isLoading: false
        };

    } catch (e) {
        console.error("Error parsing recipe from file:", e);
        return null;
    }
};