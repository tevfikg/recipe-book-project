import { useState, useCallback } from 'react';
import { getRecipes, getRecipe, createRecipe, updateRecipe, deleteRecipe } from '../lib/api';
import toast from 'react-hot-toast';

export function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchRecipes = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await getRecipes(params);
      setRecipes(data.recipes);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  return { recipes, loading, total, fetchRecipes };
}

export function useRecipe(slug) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecipe = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getRecipe(slug);
      setRecipe(data.recipe);
    } catch (err) {
      setError(err.response?.data?.error || 'Recipe not found');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  return { recipe, loading, error, fetchRecipe };
}
