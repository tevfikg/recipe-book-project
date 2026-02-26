import { useAuth } from '../hooks/useAuth';
import { useBookmarks } from '../hooks/useBookmarks';
import { useNavigate } from 'react-router-dom';

export default function BookmarkButton({ recipeId }) {
  const { user } = useAuth();
  const { bookmarkedIds, toggleBookmark } = useBookmarks();
  const navigate = useNavigate();

  const isBookmarked = bookmarkedIds.has(recipeId);

  const handleClick = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    toggleBookmark(recipeId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      className={`p-1.5 rounded-lg transition-colors ${isBookmarked ? 'text-terracotta' : 'text-gray-400 hover:text-terracotta'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  );
}
