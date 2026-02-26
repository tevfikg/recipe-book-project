import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UpgradeModal from './UpgradeModal';

export default function Navbar() {
  const { user, dbUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/browse?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🍴</span>
            <span className="font-serif font-bold text-xl text-charcoal">RecipeVault</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="input pr-10"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-terracotta">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 ml-auto">
            <Link to="/browse" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-terracotta transition-colors">Browse</Link>

            {user ? (
              <>
                {!dbUser?.is_premium && (
                  <button onClick={() => setShowUpgrade(true)} className="hidden sm:block btn-primary text-sm py-1.5 px-3">
                    Upgrade ✨
                  </button>
                )}
                <Link to="/recipe/new" className="btn-primary text-sm py-1.5 px-3">+ New</Link>

                {/* Avatar dropdown */}
                <div className="relative">
                  <button onClick={() => setMenuOpen(p => !p)} className="flex items-center">
                    <img
                      src={dbUser?.avatar_url || `https://ui-avatars.com/api/?name=${dbUser?.display_name}&background=C2614F&color=fff`}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-terracotta/30"
                    />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link to="/profile/me" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal hover:bg-cream">My Profile</Link>
                      <Link to="/pricing" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-charcoal hover:bg-cream">Pricing</Link>
                      <hr className="my-1" />
                      <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Sign Out</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
