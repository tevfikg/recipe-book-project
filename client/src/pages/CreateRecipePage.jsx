import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RecipeForm from '../components/RecipeForm';
import UpgradeModal from '../components/UpgradeModal';
import { createRecipe } from '../lib/api';
import toast from 'react-hot-toast';

export default function CreateRecipePage() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      const { data: result } = await createRecipe(data);
      toast.success('Recipe created!');
      navigate(`/recipe/${result.recipe.slug}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setShowUpgrade(true);
      } else {
        toast.error(err.response?.data?.error || 'Failed to create recipe');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl font-bold text-charcoal mb-8">New Recipe</h1>
      {!dbUser?.is_premium && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3 mb-6">
          Free plan: {/* recipe count shown here ideally */} You can create up to 5 recipes.{' '}
          <button onClick={() => setShowUpgrade(true)} className="underline font-medium">Upgrade for unlimited</button>
        </div>
      )}
      <RecipeForm onSubmit={handleSubmit} submitting={submitting} />
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
