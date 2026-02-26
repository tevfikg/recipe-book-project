import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';

const DIFFICULTY_COLORS = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-amber-600 bg-amber-50',
  hard: 'text-red-600 bg-red-50',
};

export default function RecipeCard({ recipe, showBookmark = true }) {
  const tags = recipe.recipe_tags?.map(rt => rt.tags?.name).filter(Boolean) || [];

  return (
    <div className="card group hover:shadow-md transition-shadow duration-200">
      <Link to={`/recipe/${recipe.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {recipe.cover_photo_url ? (
            <img
              src={recipe.cover_photo_url}
              alt={recipe.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
          )}
          {recipe.difficulty && (
            <span className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full capitalize ${DIFFICULTY_COLORS[recipe.difficulty] || ''}`}>
              {recipe.difficulty}
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/recipe/${recipe.slug}`}>
            <h3 className="font-serif font-semibold text-lg leading-tight text-charcoal hover:text-terracotta transition-colors line-clamp-2">
              {recipe.title}
            </h3>
          </Link>
          {showBookmark && <BookmarkButton recipeId={recipe.id} />}
        </div>

        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          {recipe.users && (
            <div className="flex items-center gap-1.5">
              <img
                src={recipe.users.avatar_url || `https://ui-avatars.com/api/?name=${recipe.users.display_name}&size=24&background=C2614F&color=fff`}
                alt={recipe.users.display_name}
                className="w-5 h-5 rounded-full"
              />
              <span>{recipe.users.display_name}</span>
            </div>
          )}
          {recipe.cooking_time_minutes && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
              </svg>
              {recipe.cooking_time_minutes} min
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-cream text-terracotta px-2 py-0.5 rounded-full border border-terracotta/20">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
