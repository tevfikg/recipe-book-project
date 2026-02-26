import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import ServingScaler from '../components/ServingScaler';
import ExportModal from '../components/ExportModal';
import toast from 'react-hot-toast';

const DIFFICULTY_COLORS = { easy: 'text-green-600', medium: 'text-amber-600', hard: 'text-red-600' };

export default function RecipeDetailPage() {
  const { slug } = useParams();
  const { user, dbUser } = useAuth();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [servings, setServings] = useState(null);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecipe(slug)
      .then(({ data }) => {
        setRecipe(data.recipe);
        setServings(data.recipe.base_servings);
      })
      .catch(err => setError(err.response?.data?.error || 'Recipe not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const scaleFactor = recipe ? servings / recipe.base_servings : 1;

  const scaledQty = (qty) => {
    const scaled = qty * scaleFactor;
    return Number.isInteger(scaled) ? scaled : Math.round(scaled * 100) / 100;
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    await deleteRecipe(recipe.id);
    toast.success('Recipe deleted');
    navigate('/profile/me');
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-2/3" />
      <div className="h-72 bg-gray-200 rounded-2xl" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-3">😔</div>
      <h2 className="font-serif text-2xl font-bold mb-2">{error}</h2>
      <Link to="/browse" className="btn-primary mt-4 inline-block">Browse Recipes</Link>
    </div>
  );

  const isOwner = user?.id === recipe.user_id;
  const tags = recipe.recipe_tags?.map(rt => rt.tags?.name).filter(Boolean) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Cover */}
      {recipe.cover_photo_url && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
          <img src={recipe.cover_photo_url} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="font-serif text-4xl font-bold text-charcoal leading-tight">{recipe.title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          {isOwner && (
            <>
              <Link to={`/recipe/${slug}/edit`} className="btn-secondary text-sm">Edit</Link>
              <button onClick={handleDelete} className="text-sm text-red-500 hover:text-red-700 px-2">Delete</button>
            </>
          )}
          <button
            onClick={() => user ? toggleBookmark(recipe.id) : navigate('/login')}
            className={`p-2 rounded-lg transition-colors ${bookmarkedIds.has(recipe.id) ? 'text-terracotta' : 'text-gray-400 hover:text-terracotta'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill={bookmarkedIds.has(recipe.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-2">
          <img src={recipe.users?.avatar_url || `https://ui-avatars.com/api/?name=${recipe.users?.display_name}&background=C2614F&color=fff`} alt="" className="w-6 h-6 rounded-full" />
          <Link to={`/profile/${recipe.users?.display_name}`} className="hover:text-terracotta">{recipe.users?.display_name}</Link>
        </div>
        {recipe.difficulty && <span className={`font-medium capitalize ${DIFFICULTY_COLORS[recipe.difficulty]}`}>{recipe.difficulty}</span>}
        {recipe.cooking_time_minutes && <span>⏱ {recipe.cooking_time_minutes} min</span>}
        {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map(t => (
            <span key={t} className="text-xs bg-cream text-terracotta px-3 py-1 rounded-full border border-terracotta/20">{t}</span>
          ))}
        </div>
      )}

      <p className="text-gray-600 leading-relaxed mb-8">{recipe.description}</p>

      {/* Export bar */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setShowExport(true)} className="btn-primary text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <ServingScaler servings={servings} onChange={setServings} />
      </div>

      {/* Ingredients */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients?.map(ing => (
            <li key={ing.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
              {ing.photo_url && <img src={ing.photo_url} alt={ing.name} className="w-10 h-10 rounded-lg object-cover" />}
              <span className="text-gray-600 font-medium">{scaledQty(ing.quantity)} {ing.unit}</span>
              <span className="text-charcoal">{ing.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-6">Instructions</h2>
        <div className="space-y-8">
          {recipe.steps?.map(step => (
            <div key={step.id} className="flex gap-4">
              <div className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                {step.step_number}
              </div>
              <div className="flex-1">
                <p className="text-charcoal leading-relaxed">{step.description}</p>
                {step.photo_url && (
                  <img src={step.photo_url} alt={`Step ${step.step_number}`} className="mt-3 rounded-xl w-full max-h-64 object-cover" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showExport && <ExportModal recipe={recipe} servings={servings} onClose={() => setShowExport(false)} />}
    </div>
  );
}
