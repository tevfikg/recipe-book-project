import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function StepRow({ step, index, onChange, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const update = (field, value) => onChange({ ...step, [field]: value });

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3 bg-gray-50 rounded-xl p-3">
      {/* Drag handle */}
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 mt-2 shrink-0" aria-label="Drag to reorder">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-sm font-bold shrink-0 mt-1">
        {index + 1}
      </div>

      <div className="flex-1 space-y-2">
        <textarea
          value={step.description}
          onChange={e => update('description', e.target.value)}
          placeholder="Describe this step..."
          rows={2}
          className="input resize-none text-sm"
        />
        {step.photo_url && (
          <img src={step.photo_url} alt={`Step ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
        )}
        <input
          type="url"
          value={step.photo_url || ''}
          onChange={e => update('photo_url', e.target.value)}
          placeholder="Step photo URL (optional)"
          className="input text-sm"
        />
      </div>

      <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors p-1 shrink-0 mt-1" aria-label="Remove step">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
