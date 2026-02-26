import { useNavigate } from 'react-router-dom';
import { createCheckout } from '../lib/api';
import toast from 'react-hot-toast';

export default function UpgradeModal({ onClose }) {
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    try {
      const { data } = await createCheckout();
      window.location.href = data.url;
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl text-center" onClick={e => e.stopPropagation()}>
        <div className="text-5xl mb-4">✨</div>
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Go Premium</h2>
        <p className="text-gray-500 text-sm mb-6">
          You've reached the 5-recipe limit on the free plan.<br />
          Upgrade to create unlimited recipes and get a premium badge.
        </p>

        <div className="bg-cream rounded-xl p-4 mb-6 text-left space-y-2">
          {['Unlimited recipe creation', 'Premium badge on profile', 'Priority support'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-charcoal">
              <span className="text-terracotta">✓</span> {f}
            </div>
          ))}
        </div>

        <p className="text-3xl font-bold text-charcoal mb-1">$29<span className="text-base font-normal text-gray-500">/year</span></p>
        <p className="text-xs text-gray-400 mb-6">≈ $2.42/month · Cancel anytime</p>

        <button onClick={handleUpgrade} className="w-full btn-primary mb-3">
          Upgrade Now
        </button>
        <button onClick={() => { onClose(); navigate('/pricing'); }} className="w-full btn-secondary text-sm">
          Learn more
        </button>
        <button onClick={onClose} className="mt-3 text-xs text-gray-400 hover:text-gray-600">
          Maybe later
        </button>
      </div>
    </div>
  );
}
