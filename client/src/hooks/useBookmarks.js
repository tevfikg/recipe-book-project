import { useState, useCallback } from 'react';
import { getBookmarks, addBookmark, removeBookmark } from '../lib/api';
import toast from 'react-hot-toast';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBookmarks();
      setBookmarks(data.bookmarks);
      setBookmarkedIds(new Set(data.bookmarks.map(b => b.recipes?.id)));
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleBookmark = useCallback(async (recipeId) => {
    const isBookmarked = bookmarkedIds.has(recipeId);
    try {
      if (isBookmarked) {
        await removeBookmark(recipeId);
        setBookmarkedIds(prev => { const next = new Set(prev); next.delete(recipeId); return next; });
        toast.success('Bookmark removed');
      } else {
        await addBookmark(recipeId);
        setBookmarkedIds(prev => new Set([...prev, recipeId]));
        toast.success('Recipe bookmarked');
      }
    } catch (err) {
      toast.error('Failed to update bookmark');
    }
  }, [bookmarkedIds]);

  return { bookmarks, bookmarkedIds, loading, fetchBookmarks, toggleBookmark };
}
