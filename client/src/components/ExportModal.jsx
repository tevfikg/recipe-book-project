import toast from 'react-hot-toast';
import { getRecipePDFUrl } from '../lib/api';

export default function ExportModal({ recipe, servings, onClose }) {
  const shareUrl = `${window.location.origin}/recipe/${recipe.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleDownloadPDF = () => {
    const url = getRecipePDFUrl(recipe.id, servings);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-serif text-xl font-bold text-charcoal mb-1">Export Recipe</h2>
        <p className="text-sm text-gray-500 mb-6">Share or download "{recipe.title}"</p>

        <div className="space-y-3">
          <button onClick={handleDownloadPDF} className="w-full btn-primary flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </button>

          <div className="flex gap-2">
            <input
              readOnly
              value={shareUrl}
              className="input flex-1 text-sm text-gray-500 bg-gray-50"
            />
            <button onClick={handleCopyLink} className="btn-secondary shrink-0 text-sm">
              Copy
            </button>
          </div>
        </div>

        <button onClick={onClose} className="mt-4 w-full text-sm text-gray-500 hover:text-charcoal transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
