import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import IngredientRow from './IngredientRow';
import StepRow from './StepRow';
import TagSelector from './TagSelector';

const DIFFICULTIES = ['easy', 'medium', 'hard'];

const emptyIngredient = () => ({ id: Date.now() + Math.random(), name: '', quantity: '', unit: '' });
const emptyStep = () => ({ id: Date.now() + Math.random(), description: '', photo_url: '' });

export default function RecipeForm({ initialData = {}, onSubmit, submitting }) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(initialData.cover_photo_url || '');
  const [cuisine, setCuisine] = useState(initialData.cuisine || '');
  const [difficulty, setDifficulty] = useState(initialData.difficulty || '');
  const [cookingTime, setCookingTime] = useState(initialData.cooking_time_minutes || '');
  const [baseServings, setBaseServings] = useState(initialData.base_servings || 4);
  const [isPublic, setIsPublic] = useState(initialData.is_public !== false);
  const [tags, setTags] = useState(initialData.tags || []);
  const [ingredients, setIngredients] = useState(
    initialData.ingredients?.length ? initialData.ingredients.map(i => ({ ...i, id: i.id || Date.now() + Math.random() })) : [emptyIngredient()]
  );
  const [steps, setSteps] = useState(
    initialData.steps?.length ? initialData.steps.map(s => ({ ...s, id: s.id || Date.now() + Math.random() })) : [emptyStep()]
  );

  const handleIngredientChange = (index, updated) => {
    setIngredients(prev => prev.map((ing, i) => i === index ? updated : ing));
  };
  const addIngredient = () => setIngredients(prev => [...prev, emptyIngredient()]);
  const removeIngredient = (index) => setIngredients(prev => prev.filter((_, i) => i !== index));

  const handleStepChange = (index, updated) => {
    setSteps(prev => prev.map((step, i) => i === index ? updated : step));
  };
  const addStep = () => setSteps(prev => [...prev, emptyStep()]);
  const removeStep = (index) => setSteps(prev => prev.filter((_, i) => i !== index));

  const handleStepDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex(s => s.id === active.id);
      const newIndex = steps.findIndex(s => s.id === over.id);
      setSteps(arrayMove(steps, oldIndex, newIndex));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description, cover_photo_url: coverPhotoUrl, cuisine, difficulty,
               cooking_time_minutes: cookingTime ? Number(cookingTime) : null,
               base_servings: Number(baseServings), is_public: isPublic,
               tags, ingredients, steps });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="card p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="input" placeholder="e.g. Classic Spaghetti Carbonara" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="input resize-none" placeholder="Describe your recipe..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Photo URL *</label>
          <input type="url" value={coverPhotoUrl} onChange={e => setCoverPhotoUrl(e.target.value)} className="input" placeholder="https://..." />
          {coverPhotoUrl && <img src={coverPhotoUrl} alt="Cover preview" className="mt-2 w-full h-40 object-cover rounded-lg" />}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
            <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)} className="input" placeholder="e.g. Italian" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input">
              <option value="">Select difficulty</option>
              {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (minutes)</label>
            <input type="number" value={cookingTime} onChange={e => setCookingTime(e.target.value)} min={1} className="input" placeholder="30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Base Servings *</label>
            <input type="number" value={baseServings} onChange={e => setBaseServings(e.target.value)} required min={1} className="input" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags / Categories</label>
          <TagSelector selected={tags} onChange={setTags} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Visibility</label>
          <button
            type="button"
            onClick={() => setIsPublic(p => !p)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isPublic ? 'bg-terracotta' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'left-7' : 'left-1'}`} />
          </button>
          <span className="text-sm text-gray-500">{isPublic ? 'Public' : 'Private'}</span>
        </div>
      </section>

      {/* Ingredients */}
      <section className="card p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Ingredients</h2>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <IngredientRow key={ing.id} ingredient={ing} index={i}
              onChange={(updated) => handleIngredientChange(i, updated)}
              onRemove={() => removeIngredient(i)} />
          ))}
        </div>
        <button type="button" onClick={addIngredient} className="btn-secondary text-sm w-full">
          + Add Ingredient
        </button>
      </section>

      {/* Steps */}
      <section className="card p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Instructions</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
          <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <StepRow key={step.id} step={step} index={i}
                  onChange={(updated) => handleStepChange(i, updated)}
                  onRemove={() => removeStep(i)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <button type="button" onClick={addStep} className="btn-secondary text-sm w-full">
          + Add Step
        </button>
      </section>

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <button type="submit" disabled={submitting} className="btn-primary min-w-32">
          {submitting ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </form>
  );
}
