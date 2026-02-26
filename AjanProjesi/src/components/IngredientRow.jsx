const UNITS = ['g', 'kg', 'ml', 'L', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'piece', 'slice', 'pinch'];

export default function IngredientRow({ ingredient, onChange, onRemove, index }) {
  const update = (field, value) => onChange({ ...ingredient, [field]: value });

  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <span className="text-gray-400 text-sm w-6 text-center shrink-0">{index + 1}</span>
      <input
        type="text"
        value={ingredient.name}
        onChange={e => update('name', e.target.value)}
        placeholder="Ingredient name"
        className="input flex-1 text-sm"
      />
      <input
        type="number"
        value={ingredient.quantity}
        onChange={e => update('quantity', e.target.value)}
        placeholder="Qty"
        min="0"
        step="0.01"
        className="input w-20 text-sm"
      />
      <select
        value={ingredient.unit}
        onChange={e => update('unit', e.target.value)}
        className="input w-24 text-sm"
      >
        <option value="">Unit</option>
        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
      </select>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0"
        aria-label="Remove ingredient"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
