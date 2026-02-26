import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: '/api',
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Recipes ──────────────────────────────────────────────────────────────────
export const getRecipes = (params) => api.get('/recipes', { params });
export const getRecipe = (slug) => api.get(`/recipes/${slug}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);
export const getRecipePDFUrl = (id, servings) =>
  `/api/recipes/${id}/export/pdf${servings ? `?servings=${servings}` : ''}`;

// ─── Users ───────────────────────────────────────────────────────────────────
export const getUserProfile = (username) => api.get(`/users/${username}`);
export const getMyProfile = () => api.get('/users/me/profile');
export const updateMyProfile = (data) => api.put('/users/me', data);

// ─── Bookmarks ────────────────────────────────────────────────────────────────
export const getBookmarks = () => api.get('/bookmarks');
export const addBookmark = (recipeId) => api.post(`/bookmarks/${recipeId}`);
export const removeBookmark = (recipeId) => api.delete(`/bookmarks/${recipeId}`);

// ─── Tags ─────────────────────────────────────────────────────────────────────
export const getTags = () => api.get('/tags');

// ─── Stripe ───────────────────────────────────────────────────────────────────
export const createCheckout = () => api.post('/stripe/create-checkout');
export const cancelSubscription = () => api.post('/stripe/cancel');

// ─── Auth ────────────────────────────────────────────────────────────────────
export const syncUser = () => api.post('/auth/sync-user', {}, { baseURL: '/' });

export default api;
