import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRecipes, getTags } from '../lib/api';
import RecipeCard from '../components/RecipeCard';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const tag = searchParams.get('tag') || '';
  const difficulty = searchParams.get('difficulty') || '';
  const cuisine = searchParams.get('cuisine') || '';

  useEffect(() => {
    getTags().then(({ data }) => setTags(data.tags || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    getRecipes({ search, tag, difficulty, cuisine, page: 1 })
      .then(({ data }) => { setRecipes(data.recipes); setTotal(data.total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, tag, difficulty, cuisine]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoading(true);
    getRecipes({ search, tag, difficulty, cuisine, page: nextPage })
      .then(({ data }) => { setRecipes(p => [...p, ...data.recipes]); setPage(nextPage); })
      .finally(() => setLoading(false));
  };

  const setFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-charcoal mb-8">Browse Recipes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Search by name, ingredient..."
          value={search}
          onChange={e => setFilter('search', e.target.value)}
          className="input max-w-xs"
        />
        <select value={difficulty} onChange={e => setFilter('difficulty', e.target.value)} className="input w-36">
          <option value="">All Levels</option>
          {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>
        <select value={tag} onChange={e => setFilter('tag', e.target.value)} className="input w-40">
          <option value="">All Tags</option>
          {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Cuisine..."
          value={cuisine}
          onChange={e => setFilter('cuisine', e.target.value)}
          className="input w-36"
        />
        {(search || tag || difficulty || cuisine) && (
          <button onClick={() => setSearchParams({})} className="text-sm text-terracotta hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} recipe{total !== 1 ? 's' : ''} found</p>

      {loading && recipes.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-3">🔍</div>
          <p>No recipes found. Try different filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipes.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
          {recipes.length < total && (
            <div className="text-center mt-10">
              <button onClick={loadMore} disabled={loading} className="btn-secondary">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
