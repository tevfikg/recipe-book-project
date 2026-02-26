import { useState, useEffect } from 'react';
import { getTags } from '../lib/api';

export default function TagSelector({ selected = [], onChange }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    getTags().then(({ data }) => setTags(data.tags || []));
  }, []);

  const toggle = (id) => {
    onChange(selected.includes(id)
      ? selected.filter(t => t !== id)
      : [...selected, id]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => {
        const active = selected.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`text-sm px-3 py-1 rounded-full border transition-all ${
              active
                ? 'bg-terracotta text-white border-terracotta'
                : 'bg-white text-gray-600 border-gray-200 hover:border-terracotta hover:text-terracotta'
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
