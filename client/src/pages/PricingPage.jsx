import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createCheckout } from '../lib/api';
import toast from 'react-hot-toast';

const FREE_FEATURES = ['Up to 5 recipes', 'Browse all public recipes', 'Unlimited bookmarks', 'PDF export & shareable links'];
const PREMIUM_FEATURES = ['Unlimited recipe creation', 'All Free features', 'Premium badge on profile', 'Priority support'];

export default function PricingPage() {
  const { user, dbUser } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const { data } = await createCheckout();
      window.location.href = data.url;
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-serif text-5xl font-bold text-charcoal mb-3">Simple Pricing</h1>
        <p className="text-gray-500 text-lg">Start free. Upgrade when you're ready.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="card p-8">
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">Free</h2>
          <p className="text-gray-500 text-sm mb-6">For casual home cooks</p>
          <p className="text-4xl font-bold text-charcoal mb-6">$0</p>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span> {f}
              </li>
            ))}
          </ul>
          {!user ? (
            <button onClick={() => navigate('/login')} className="w-full btn-secondary">Get Started Free</button>
          ) : (
            <div className="w-full text-center text-sm text-gray-500 py-2">Current plan</div>
          )}
        </div>

        {/* Premium */}
        <div className="card p-8 border-2 border-terracotta relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs font-bold px-4 py-1 rounded-full">
            BEST VALUE
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal mb-1">Premium</h2>
          <p className="text-gray-500 text-sm mb-6">For serious food enthusiasts</p>
          <p className="mb-1">
            <span className="text-4xl font-bold text-charcoal">$29</span>
            <span className="text-gray-500 text-sm">/year</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">≈ $2.42/month · Cancel anytime</p>
          <ul className="space-y-3 mb-8">
            {PREMIUM_FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-terracotta">✓</span> {f}
              </li>
            ))}
          </ul>
          {dbUser?.is_premium ? (
            <div className="w-full text-center text-sm font-medium text-terracotta py-2">✨ You're Premium!</div>
          ) : (
            <button onClick={handleUpgrade} className="w-full btn-primary">Upgrade Now</button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        Payments securely processed by Stripe. Cancel anytime from your profile settings.
      </p>
    </div>
  );
}
