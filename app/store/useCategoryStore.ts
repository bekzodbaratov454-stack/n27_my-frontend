import { create } from 'zustand';

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryStore {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
  setCategories: (categories: Category[]) => void;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  addCategory: (category) =>
    set((state) => ({
      categories: [...state.categories, category],
    })),
  updateCategory: (updatedCategory) =>
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === updatedCategory.id ? updatedCategory : cat
      ),
    })),
  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    })),
  setCategories: (categories) => set({ categories }),
}));
