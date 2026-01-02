import { Recipe } from '../types';

const DB_NAME = 'ReceitasFitDB';
const STORE_NAME = 'recipes';
const DB_VERSION = 1;

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveRecipes = async (recipes: Recipe[]): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      // Clear existing store to sync with current state
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        if (recipes.length === 0) {
            resolve();
            return;
        }
        
        // Filter out loading skeletons before saving
        const recipesToSave = recipes.filter(r => !r.isLoading);
        
        recipesToSave.forEach(recipe => {
             store.put(recipe);
        });
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Storage Save Error:', error);
  }
};

export const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Storage Load Error:', error);
    return [];
  }
};