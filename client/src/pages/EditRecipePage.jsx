import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, updateRecipe } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import RecipeForm from '../components/RecipeForm';
import toast from 'react-hot-toast';

export default function EditRecipePage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getRecipe(slug)
      .then(({ data }) => {
        if (data.recipe.user_id !== user?.id) {
          toast.error('You can only edit your own recipes');
          navigate('/');
          return;
        }
        // Normalize for form
        const r = data.recipe;
        setRecipe({
          ...r,
          tags: r.recipe_tags?.map(rt => rt.tags?.id).filter(Boolean) || [],
        });
      })
      .catch(() => { toast.error('Recipe not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [slug, user]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: result } = await updateRecipe(recipe.id, data);
      toast.success('Recipe updated!');
      navigate(`/recipe/${result.recipe.slug}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update recipe');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-charcoal mb-8">Edit Recipe</h1>
      {recipe && <RecipeForm initialData={recipe} onSubmit={handleSubmit} submitting={submitting} />}
    </div>
  );
}
