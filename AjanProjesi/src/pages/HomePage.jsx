import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../lib/api';
import RecipeCard from '../components/RecipeCard';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, dbUser } = useAuth();
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipes({ limit: 8, page: 1 })
      .then(({ data }) => setRecent(data.recipes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-cream via-orange-50 to-cream py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-charcoal leading-tight mb-4">
            Your Recipes,<br />
            <span className="text-terracotta">Beautifully Organized</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
            Create, manage, and share your favorite recipes with photos, step-by-step instructions, and beautiful PDF exports.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/browse" className="btn-primary text-base px-7 py-3">Browse Recipes</Link>
            <Link to="/recipe/new" className="btn-secondary text-base px-7 py-3">+ Create Recipe</Link>
          </div>
        </div>
      </section>

      {/* Free tier banner — shown to logged-in non-premium users */}
      {user && dbUser && !dbUser.is_premium && (
        <div className="bg-orange-50 border-b border-orange-200 py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-orange-800">
              <span className="font-semibold">Free plan:</span> You can store up to{' '}
              <span className="font-semibold">5 recipes</span> and{' '}
              <span className="font-semibold">100 MB</span> of total storage.
            </p>
            <Link to="/pricing" className="text-sm font-semibold text-terracotta hover:underline whitespace-nowrap">
              Upgrade for unlimited →
            </Link>
          </div>
        </div>
      )}

      {/* Features */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { icon: '📸', title: 'Photo-rich Recipes', desc: 'Add photos to every step and ingredient.' },
            { icon: '📄', title: 'PDF Export', desc: 'Download any recipe as a beautifully formatted PDF.' },
            { icon: '🔗', title: 'Shareable Links', desc: 'Share your recipes with a unique permanent link.' },
          ].map(f => (
            <div key={f.title}>
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-serif text-lg font-semibold text-charcoal mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Recipes */}
      <section className="py-14 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-3xl font-bold text-charcoal">Recently Added</h2>
          <Link to="/browse" className="text-sm text-terracotta hover:underline">View all →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recent.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🍽️</div>
            <p>No recipes yet. Be the first to create one!</p>
            <Link to="/recipe/new" className="btn-primary mt-4 inline-block">Create Recipe</Link>
          </div>
        )}
      </section>
    </div>
  );
}
