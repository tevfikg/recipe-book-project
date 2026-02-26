export default function ServingScaler({ servings, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-cream rounded-xl px-4 py-2 border border-gray-200 w-fit">
      <span className="text-sm font-medium text-gray-600">Servings:</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, servings - 1))}
          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-charcoal hover:border-terracotta hover:text-terracotta transition-colors text-lg leading-none"
        >−</button>
        <input
          type="number"
          value={servings}
          min={1}
          onChange={e => onChange(Math.max(1, Number(e.target.value)))}
          className="w-12 text-center font-semibold text-charcoal bg-transparent border-none outline-none text-lg"
        />
        <button
          onClick={() => onChange(servings + 1)}
          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-charcoal hover:border-terracotta hover:text-terracotta transition-colors text-lg leading-none"
        >+</button>
      </div>
    </div>
  );
}
